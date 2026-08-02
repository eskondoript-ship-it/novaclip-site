/* NovaClip — multiplayer relay for Strike Arena
   ============================================================================
   A room server. Players connect over a WebSocket, join a room, and the server
   forwards everyone's position, shots and kills to everyone else.

   TWO WAYS TO GET INTO A MATCH
     RANDOM PLAYERS   the client connects with ?quick=1&map=arena and the server
                      decides where to put it: the fullest public room that is
                      on the same map and still has space, or a fresh one. That
                      is the whole of matchmaking — no queue, no waiting screen,
                      you are in the match before the loading bar finishes.
     A CODE           the client connects with ?room=NOVA-7K2P. Rooms opened by
                      code are PRIVATE: matchmaking never routes a stranger into
                      one, so a code you send a friend stays a game with your
                      friend.

     Matching on map matters. Two people in the same room on different maps see
     each other standing in mid-air and shooting through walls that only one of
     them has, so a room is pinned to the map its first player arrived on.

   WHERE TO RUN IT — and why not Cloudflare
     The accounts/leaderboard Worker cannot do this. A Worker handles one request
     and exits; a match needs a process that stays alive holding the room. This
     file is written for Deno Deploy, which is free, keeps WebSockets open, and
     takes a single file with no build step:

       1. deno.com/deploy -> New Project -> "Deploy from URL" / drag this file in
       2. it gives you https://<name>.deno.dev
       3. put that in game.html:   const NC_MP_URL = 'wss://<name>.deno.dev';
          (wss://, not https:// — it is a socket, not a page)

     It also runs unchanged on anything that speaks Deno or Node with a WS
     shim: Fly.io, Render, Railway, a Raspberry Pi on your desk.

   WHAT IS AND IS NOT AUTHORITATIVE
     The server is a relay, not a referee. Each client owns its own position, and
     a shooter tells the server who it hit. That is how small browser shooters
     are built: it is simple, it survives lag, and the cost is that a modified
     client can lie about hits. For a friends-and-classmates game that is the
     right trade. What the server DOES enforce is shape and rate: message types
     it knows, sizes it accepts, a cap on messages per second, room size, and
     names it will print. If you ever want it to referee properly, the hit test
     has to move here and clients have to send inputs instead of results — a much
     bigger job, and a different game architecture.

   HTTP SIDE (for the lobby, not the match)
     GET /            plain-text health line
     GET /rooms       public rooms only: [{ room, map, players }]
     GET /find?map=   what quick-join would pick right now, plus the totals the
                      lobby prints as "N players online". It reserves nothing:
                      between this call and the socket a room can fill, which is
                      exactly why the real choice happens at connect time.
   ============================================================================ */

const MAX_PLAYERS = 12;              // per room
const MAX_ROOMS = 200;
const MSG_PER_SEC = 40;              // a 15Hz client sends ~15 plus events
const MAX_MSG_BYTES = 2048;
const IDLE_MS = 45000;               // no traffic for this long and you are dropped

/** @type {Map<string, {code:string,map:string,pub:boolean,players:Map<string,any>,born:number}>} */
const rooms = new Map();

const now = () => Date.now();
const stripCtrl = (v) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '');
// empty string means "no code given" — the caller decides that means quick-join
const cleanRoom = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 14);
const cleanMapId = (v) => String(v || 'arena').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 16) || 'arena';
const cleanName = (v) => stripCtrl(v).trim().slice(0, 16) || 'Player';
const num = (v, lo, hi) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : 0;
};

function send(ws, obj) {
  try { if (ws.readyState === 1) ws.send(JSON.stringify(obj)); } catch (e) { /* gone */ }
}
function broadcast(code, obj, exceptId) {
  const room = rooms.get(code);
  if (!room) return;
  const msg = JSON.stringify(obj);
  for (const [id, p] of room.players) {
    if (id === exceptId) continue;
    try { if (p.ws.readyState === 1) p.ws.send(msg); } catch (e) { /* gone */ }
  }
}
function roster(code) {
  const room = rooms.get(code);
  if (!room) return [];
  return [...room.players.values()].map(p => ({ id: p.id, name: p.name, team: p.team, kills: p.kills }));
}

function leave(player) {
  const room = rooms.get(player.room);
  if (!room) return;
  room.players.delete(player.id);
  if (room.players.size === 0) rooms.delete(player.room);
  else {
    broadcast(player.room, { t: 'left', id: player.id });
    broadcast(player.room, { t: 'roster', players: roster(player.room) });
  }
}

/* ---------------------------------------------------------------------------
   MATCHMAKING
   Fullest room first, not emptiest. Spreading players evenly across rooms is
   the obvious implementation and the wrong one: it gives ten people ten rooms
   of one. Filling the busiest room that still has space means the second player
   to arrive lands on the first, and a new match only ever opens when every
   existing one is full.
--------------------------------------------------------------------------- */
function pickPublicRoom(mapId) {
  let best = null;
  for (const room of rooms.values()) {
    if (!room.pub || room.map !== mapId) continue;
    if (room.players.size >= MAX_PLAYERS) continue;
    if (!best || room.players.size > best.players.size) best = room;
  }
  if (best) return best.code;
  // nothing with space: name a new one after the map, lowest free number
  for (let n = 1; n <= MAX_ROOMS; n++) {
    const code = 'PUB-' + mapId.toUpperCase().slice(0, 6) + '-' + n;
    if (!rooms.has(code)) return code;
  }
  return null;
}

function publicCounts(mapId) {
  let players = 0, matches = 0, onMap = 0, matchesOnMap = 0;
  for (const room of rooms.values()) {
    if (!room.pub) continue;
    players += room.players.size; matches++;
    if (room.map === mapId) { onMap += room.players.size; matchesOnMap++; }
  }
  return { players, matches, onMap, matchesOnMap };
}

function handleMessage(player, raw) {
  if (typeof raw !== 'string' || raw.length > MAX_MSG_BYTES) return;

  // rate limit per player, so one bad client cannot drown a room
  const t = now();
  if (t - player.windowStart > 1000) { player.windowStart = t; player.count = 0; }
  if (++player.count > MSG_PER_SEC) return;
  player.seen = t;

  let m;
  try { m = JSON.parse(raw); } catch (e) { return; }
  if (!m || typeof m !== 'object') return;

  switch (m.t) {
    /* position + pose, the message that arrives 15 times a second. Kept short on
       purpose: every byte here is multiplied by players squared. */
    case 'p': {
      player.x = num(m.x, -400, 400);
      player.y = num(m.y, -50, 200);
      player.z = num(m.z, -400, 400);
      player.yaw = num(m.yaw, -7, 7);
      player.anim = String(m.anim || 'idle').slice(0, 12);
      player.hp = num(m.hp, 0, 999);
      player.weap = String(m.weap || '').slice(0, 12);
      player.veh = m.veh ? String(m.veh).slice(0, 8) : '';
      broadcast(player.room, {
        t: 'p', id: player.id, x: player.x, y: player.y, z: player.z,
        yaw: player.yaw, anim: player.anim, hp: player.hp, weap: player.weap, veh: player.veh
      }, player.id);
      break;
    }
    // someone fired: a line to draw at the other end
    case 'shot': {
      broadcast(player.room, { t: 'shot', id: player.id,
        x: num(m.x, -400, 400), y: num(m.y, -50, 200), z: num(m.z, -400, 400),
        ex: num(m.ex, -400, 400), ey: num(m.ey, -50, 200), ez: num(m.ez, -400, 400),
        weap: String(m.weap || '').slice(0, 12) }, player.id);
      break;
    }
    /* a hit the shooter claims. The victim's client decides what it does with
       it — that keeps damage in one place and stops two clients disagreeing
       about who is alive. */
    case 'hit': {
      const room = rooms.get(player.room);
      const victim = room && room.players.get(String(m.id || ''));
      if (!victim) break;
      send(victim.ws, { t: 'hit', from: player.id, dmg: num(m.dmg, 0, 200) });
      break;
    }
    case 'died': {
      const room = rooms.get(player.room);
      const killer = room && room.players.get(String(m.by || ''));
      if (killer) killer.kills++;
      broadcast(player.room, { t: 'died', id: player.id, by: killer ? killer.id : null });
      broadcast(player.room, { t: 'roster', players: roster(player.room) });
      break;
    }
    case 'chat': {
      const text = stripCtrl(m.text).trim().slice(0, 120);
      if (text) broadcast(player.room, { t: 'chat', id: player.id, name: player.name, text });
      break;
    }
    case 'ping': send(player.ws, { t: 'pong', at: m.at }); break;
  }
}

function onConnect(ws, url) {
  const asked = cleanRoom(url.searchParams.get('room'));
  const quick = url.searchParams.get('quick') === '1' || !asked;
  const mapId = cleanMapId(url.searchParams.get('map'));
  const name = cleanName(url.searchParams.get('name'));

  const code = quick ? pickPublicRoom(mapId) : asked;
  if (!code) { send(ws, { t: 'error', why: 'server full' }); ws.close(); return; }

  if (!rooms.has(code)) {
    if (rooms.size >= MAX_ROOMS) { send(ws, { t: 'error', why: 'server full' }); ws.close(); return; }
    // a room opened by code is private for its whole life; only quick-join opens public ones
    rooms.set(code, { code, map: mapId, pub: quick, players: new Map(), born: now() });
  }
  const room = rooms.get(code);

  /* Joining a code for a map you are not on puts you in a match you cannot see:
     players floating in the air, shots through walls only one side has. Say so
     rather than letting them in to fall through the floor. */
  if (!quick && room.map !== mapId) {
    send(ws, { t: 'error', why: 'that room is playing ' + room.map + ' - switch to that map to join' });
    ws.close(); return;
  }
  if (room.players.size >= MAX_PLAYERS) { send(ws, { t: 'error', why: 'room full' }); ws.close(); return; }

  const id = Math.random().toString(36).slice(2, 10);
  // teams stay even as people arrive
  const cts = [...room.players.values()].filter(p => p.team === 'ct').length;
  const team = cts * 2 <= room.players.size ? 'ct' : 't';

  const player = { id, ws, room: code, name, team, kills: 0, x: 0, y: 1.7, z: 0, yaw: 0,
                   anim: 'idle', hp: 100, weap: '', veh: '', seen: now(), windowStart: now(), count: 0 };
  room.players.set(id, player);

  send(ws, { t: 'welcome', id, room: code, team, map: room.map, pub: room.pub, players: roster(code) });
  broadcast(code, { t: 'joined', id, name, team }, id);
  broadcast(code, { t: 'roster', players: roster(code) });

  ws.addEventListener('message', (e) => handleMessage(player, e.data));
  ws.addEventListener('close', () => leave(player));
  ws.addEventListener('error', () => leave(player));
}

// drop connections that stopped talking, so a closed laptop lid does not leave a
// ghost standing in the room forever
setInterval(() => {
  const t = now();
  for (const [code, room] of rooms) {
    for (const [id, p] of room.players) {
      if (t - p.seen > IDLE_MS) { try { p.ws.close(); } catch (e) {} leave(p); }
    }
    if (room.players.size === 0) rooms.delete(code);
  }
}, 10000);

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*'
};

Deno.serve((req) => {
  const url = new URL(req.url);

  // a plain GET is the lobby asking what is going on, or someone checking it is alive
  if (req.headers.get('upgrade') !== 'websocket') {
    if (url.pathname === '/rooms') {
      const list = [];
      for (const room of rooms.values()) {
        if (room.pub) list.push({ room: room.code, map: room.map, players: room.players.size });
      }
      list.sort((a, b) => b.players - a.players);
      return new Response(JSON.stringify(list), { headers: JSON_HEADERS });
    }
    if (url.pathname === '/find') {
      const mapId = cleanMapId(url.searchParams.get('map'));
      const code = pickPublicRoom(mapId);
      const room = code ? rooms.get(code) : null;
      const counts = publicCounts(mapId);
      return new Response(JSON.stringify({
        room: code, map: mapId,
        waiting: room ? room.players.size : 0,   // 0 means you would open a fresh match
        players: counts.players, matches: counts.matches,
        onMap: counts.onMap, matchesOnMap: counts.matchesOnMap
      }), { headers: JSON_HEADERS });
    }
    let players = 0;
    for (const room of rooms.values()) players += room.players.size;
    /* charset matters: without it a browser reads punctuation as Latin-1 and
       prints mojibake. Text responses are UTF-8, so say so. */
    return new Response('NovaClip multiplayer relay - ' + rooms.size + ' room(s), ' + players + ' player(s)', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.addEventListener('open', () => onConnect(socket, url));
  return response;
});
