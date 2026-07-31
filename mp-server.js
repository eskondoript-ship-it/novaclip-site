/* NovaClip — multiplayer relay for Strike Arena
   ============================================================================
   A room server. Players connect over a WebSocket, join a room by code, and the
   server forwards everyone's position, shots and kills to everyone else.

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

   ROOMS
     A room is a code like NOVA-7K2P. Anyone with the code joins that match; no
     code means the public room "OPEN". Rooms appear when the first player joins
     and disappear when the last one leaves.
   ============================================================================ */

const MAX_PLAYERS = 12;              // per room
const MAX_ROOMS = 200;
const MSG_PER_SEC = 40;              // a 20Hz client sends ~20 plus events
const MAX_MSG_BYTES = 2048;
const IDLE_MS = 45000;               // no traffic for this long and you are dropped

/** @type {Map<string, Map<string, any>>} roomCode -> (id -> player) */
const rooms = new Map();

const now = () => Date.now();
const cleanRoom = (v) => {
  const s = String(v || 'OPEN').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12);
  return s || 'OPEN';
};
const cleanName = (v) =>
  String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 16) || 'Player';
const num = (v, lo, hi) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : 0;
};

function send(ws, obj) {
  try { if (ws.readyState === 1) ws.send(JSON.stringify(obj)); } catch (e) { /* gone */ }
}
function broadcast(room, obj, exceptId) {
  const players = rooms.get(room);
  if (!players) return;
  const msg = JSON.stringify(obj);
  for (const [id, p] of players) {
    if (id === exceptId) continue;
    try { if (p.ws.readyState === 1) p.ws.send(msg); } catch (e) { /* gone */ }
  }
}
function roster(room) {
  const players = rooms.get(room);
  if (!players) return [];
  return [...players.values()].map(p => ({ id: p.id, name: p.name, team: p.team, kills: p.kills }));
}

function leave(player) {
  const players = rooms.get(player.room);
  if (!players) return;
  players.delete(player.id);
  if (players.size === 0) rooms.delete(player.room);
  else {
    broadcast(player.room, { t: 'left', id: player.id });
    broadcast(player.room, { t: 'roster', players: roster(player.room) });
  }
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
    /* position + pose, the message that arrives 20 times a second. Kept short on
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
      const victim = (rooms.get(player.room) || new Map()).get(String(m.id || ''));
      if (!victim) break;
      send(victim.ws, { t: 'hit', from: player.id, dmg: num(m.dmg, 0, 200) });
      break;
    }
    case 'died': {
      const killer = (rooms.get(player.room) || new Map()).get(String(m.by || ''));
      if (killer) killer.kills++;
      broadcast(player.room, { t: 'died', id: player.id, by: killer ? killer.id : null });
      broadcast(player.room, { t: 'roster', players: roster(player.room) });
      break;
    }
    case 'chat': {
      const text = String(m.text || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 120);
      if (text) broadcast(player.room, { t: 'chat', id: player.id, name: player.name, text });
      break;
    }
    case 'ping': send(player.ws, { t: 'pong', at: m.at }); break;
  }
}

function onConnect(ws, url) {
  const room = cleanRoom(url.searchParams.get('room'));
  const name = cleanName(url.searchParams.get('name'));

  if (!rooms.has(room)) {
    if (rooms.size >= MAX_ROOMS) { send(ws, { t: 'error', why: 'server full' }); ws.close(); return; }
    rooms.set(room, new Map());
  }
  const players = rooms.get(room);
  if (players.size >= MAX_PLAYERS) { send(ws, { t: 'error', why: 'room full' }); ws.close(); return; }

  const id = Math.random().toString(36).slice(2, 10);
  // teams stay even as people arrive
  const cts = [...players.values()].filter(p => p.team === 'ct').length;
  const team = cts * 2 <= players.size ? 'ct' : 't';

  const player = { id, ws, room, name, team, kills: 0, x: 0, y: 1.7, z: 0, yaw: 0,
                   anim: 'idle', hp: 100, weap: '', veh: '', seen: now(), windowStart: now(), count: 0 };
  players.set(id, player);

  send(ws, { t: 'welcome', id, room, team, players: roster(room) });
  broadcast(room, { t: 'joined', id, name, team }, id);
  broadcast(room, { t: 'roster', players: roster(room) });

  ws.addEventListener('message', (e) => handleMessage(player, e.data));
  ws.addEventListener('close', () => leave(player));
  ws.addEventListener('error', () => leave(player));
}

// drop connections that stopped talking, so a closed laptop lid does not leave a
// ghost standing in the room forever
setInterval(() => {
  const t = now();
  for (const [code, players] of rooms) {
    for (const [id, p] of players) {
      if (t - p.seen > IDLE_MS) { try { p.ws.close(); } catch (e) {} leave(p); }
    }
    if (players.size === 0) rooms.delete(code);
  }
}, 10000);

Deno.serve((req) => {
  const url = new URL(req.url);

  // a plain GET is someone checking the server is alive, or a room listing
  if (req.headers.get('upgrade') !== 'websocket') {
    if (url.pathname === '/rooms') {
      const list = [...rooms.entries()].map(([code, p]) => ({ room: code, players: p.size }));
      return new Response(JSON.stringify(list), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    /* charset matters: without it a browser reads the em dash as Latin-1 and
       prints "relay â€”". Text responses are UTF-8, so say so. */
    return new Response('NovaClip multiplayer relay - ' + rooms.size + ' room(s) open', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  socket.addEventListener('open', () => onConnect(socket, url));
  return response;
});
