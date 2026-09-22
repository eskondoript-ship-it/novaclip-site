/* ============================================================================
   NOVACLIP SERVICE WORKER
   ============================================================================
   Here so NovaClip can be installed — from the browser, and through PWABuilder
   for the Microsoft Store. It is written to be dull on purpose. This site has
   a video editor holding somebody's unsaved project, two live APIs, and
   seventy sound files that play through <audio>; a clever cache is a good way
   to break all three. Reliability first, offline second.

   WHAT IT WILL NOT TOUCH, AND WHY

   Anything that is not a GET. A POST is a thing happening, not a thing to
   keep.

   Anything on another origin. The AI worker, the leaderboard worker, fonts,
   map tiles, the pose model — all of it goes straight to the network, never
   into a cache. That rules out ever serving a stale answer from an API, and
   it means no session or account response can be written to disk here.

   Anything with a Range header. Audio and video are fetched in pieces; a
   cached 206 handed back later is a file that will not play. The sound effects
   and every video in the editor go through this path.

   Anything under /api/. There is nothing there today. There will be one day,
   and by then nobody will remember to come back and add this line.

   HOW THE REST IS SERVED

   Pages: network first. Online, you always get the page that is on the server
   — a stale page is how somebody ends up looking at last week's editor. The
   cached copy is the fallback for when the network is not there, and
   offline.html is the fallback for a page that has never been visited.

   Scripts and styles: network first as well, for the same reason. They pair
   with the HTML, and serving a fresh page beside a script from three deploys
   ago is worse than being a little slower.

   Images and fonts: the cached copy immediately, with a fresh one fetched in
   the background for next time. They are large, they change rarely, and one
   visit behind on a picture costs nobody anything.

   UPDATES

   No skipWaiting on its own. A new worker taking over a page that is already
   open would swap the files under a running editor. It takes over the next
   time the site is opened with nothing else running, which is the boring,
   safe moment. Bump CACHE below to retire everything cached by the old one.
   ============================================================================ */

/* Bump this to invalidate everything the previous version cached. */
/* Bumped whenever what is cached changes shape. v1 shipped before the sticker
   library, the effect previews, the RTL fixes and the new rail — and because
   nothing ever retired it, returning visitors kept being served the old files
   from it. A new name means activate() deletes the old cache outright. */
/* v3 adds the two skins and the two typefaces they are drawn in. A page that
   comes back from the cache in its own colours but with the fallback font is
   a visibly different page, so the fonts belong in the shell beside them. */
/* v4 adds photos.js, and retires a cache full of the pre-phone stylesheets.
   nova.js and jarvis.js are served network-first so they refresh themselves,
   but a returning visitor who goes offline before that happens would get the
   old rail and the old top bar back — which is the whole of the phone work
   undone. A new name is one line and rules that out. */
/* v5 adds the Studio's NexusStream skin and panels. The stylesheet is the
   reason for the bump rather than the script: a returning visitor offline
   would be served the cached analytics.html, which now asks for a stylesheet
   the old cache has never heard of, and a dashboard with the skin's markup
   and none of its CSS is worse than either version on its own. */
/* v6 adds the clip checker and the profile page's crypto helper. */
/* v7 adds avatar.js, and retires a cache holding the old profile page —
   which now asks for a script the v6 cache has never heard of, and would
   come back offline with a picker that does not exist. */
/* v8 adds trends-nav.js. */
/* v9 adds Hype Lab — hype.html and hype.js. The bump matters more than usual
   here: a returning visitor would otherwise get the new rail from the network,
   follow the new Hype Lab link, and land on a page the v8 cache has no entry
   for. */
/* v10: nova.js lost the site-wide typefaces it was injecting, and
   studio-nexus.js/.css gained the Optimize grid. Both are cached shell files,
   so without the bump a returning visitor keeps the old pair — headings still
   in the serif that was removed, and a Studio whose new tab points at a panel
   its cached script does not know how to fill. */
/* v11: trends-nav.js gained the in-app Scripts, Thumbnails and Studio panels,
   and hype.html gained the sidebar layout it was missing. Both are cached
   shell files. Without the bump a returning visitor keeps a rail whose items
   still navigate out of the app, and a Hype Lab whose content sits 872px below
   the fold. */
/* v12: Hype Lab moved into the Trend Spotter as an embedded frame. hype.html
   gained its embed mode and trends-nav.js gained the panel that holds it, and
   both are cached shell files — a returning visitor on v11 would get a rail
   that still navigates away from the app. */
/* v13: Video Ideas became a panel too, so the whole Trend Spotter rail is now
   in-app. trends-nav.js is a cached shell file and the old copy still shows the
   signpost screen. */
/* v14: leaderboard.js now accepts nc_username as a board name and asks for one
   when there is none. It is a cached shell file, and the bump matters here more
   than most: the old copy is the one that drops a score silently, so a
   returning visitor would keep the exact bug this fixes — and would keep it on
   all four game pages, since they share this one file. */
/* v15 adds photo-fx.js — the photo editor's effects library, levels and curves,
   and its five new tools. New file in the shell, so the cache has to be retired
   for it to be fetched at all. */
/* v16 adds media-probe.js. New file in the shell, and the editor asks for it
   before its own bundle — a returning visitor served the v15 cache would get an
   editor.html that requests a script the cache has never heard of. */
/* v17: the logo was redrawn in the site's own colours, both skins gained a
   light mode, and theme-bridge.js is new. logo.svg, the two theme stylesheets
   and the bridge are all cached shell files — without the bump a returning
   visitor keeps the teal mark and a black page inside a white rail, which is
   the exact pair of things this release fixes. */
/* v18: the Gen Z toggle in the top bar took its colours from three literals and
   was unreadable in light mode — 1.78:1 on the half you are being asked to
   click. It reads the palette now. nova.js is a cached shell file, so without
   the bump a returning visitor keeps the unreadable one on every page. */
/* v19 adds nova-guide.js. New file in the shell, and twenty-two pages now ask
   for it — a returning visitor on v18 would get the pages that reference it and
   no file to answer with, which is a help button that does nothing. */
/* v20: shield.html had the rail markup and none of the rail's CSS, so the rail
   laid out in normal flow and pushed the page 872px down — a blank screen with a
   rail on it. Both that page and parent.html carry the fix in their own markup,
   and both are cached, so without the bump a returning visitor keeps the blank
   page and the parent email that forgets itself. */
/* v21: the comment safety scanner read zero comments and printed a green
   "nothing harmful found" over the top of it. parent.html is a cached shell
   file, so without the bump a returning parent keeps a scanner that reports an
   all-clear it has no evidence for — which is the whole reason to bump. */
/* v22: the scanner's diagnostics said the connection was refused, and the
   reason was the scope — youtube.readonly reads the channel but is refused on
   every comment endpoint. analytics.html now asks for youtube.force-ssl too and
   parent.html names that as the cause. Both are cached shell files. */
/* v23: getting the Family Shield stops asking a parent to do a developer's
   chores — the install page builds a ZIP of just the extension and the shield
   announces its own ID, so nothing is copied by hand. shield.html and
   parent.html are both cached, and shield.html also gains Nova. */
/* v24: the AI Editor page's plan is now carried out on the timeline instead of
   printed as a list to work through by hand. Two new shell files, and both
   editor.html and publish.html reference them — a returning visitor on v23
   would get the pages and no files to answer with. */
/* v25: Nova is a character now. The guide's scan used to fly the assistant
   PILL into the middle of the screen; nova-mascot.js draws her instead, and the
   pill is left where the reader put it. The Publish page is the AI Editor —
   renamed in the rail, the tab title, the guide and all twenty languages.
   New shell file, twenty-three pages reference it, and nova.js carries the
   rename, so a returning visitor on v24 would get the old name and no mascot. */
/* v26: the AI Editor did not edit, because the CLIP never crossed. The plan
   went from one page to the other and the video stayed behind as a local
   variable, so the timeline was empty and the panel said "import your clip
   first" — a feature that appeared to do nothing. The clip now travels in
   IndexedDB, the result plays as soon as it lands, and the finished edit is
   handed over ready to post. publish.html and the two ai-edit files are all
   cached. */
/* v27: two more boards. Reaction gains the fastest single go beside the
   median, and the target game gains accuracy beside points — a number it has
   always counted and never posted. reaction.html, aim.html and leaderboard.js
   are all cached, and leaderboard.js carries the message that explains a board
   the deployed worker has not heard of yet. */
/* v28: the two new boards sit beside their originals instead of under them —
   a game with two boards is asking one question twice, and stacked the second
   one is below the fold. Both boards also carry their own name now; the header
   said "Leaderboard" on both, which side by side is worse than one board.
   leaderboard.js, reaction.html and aim.html are all cached. */
/* v29: the rail and the assistants. Progress left the rail (its two halves now
   live on pricing.html and the new history.html), History and Categories
   joined it, and jarvis.js and nova-guide.js are deleted — an old cache
   holding either would still serve pages that no longer exist, and this bump
   is what retires them. Two assistants were replaced by one: the n8n chat
   widget and the Nova voice pill are both removed, and nova-ask.js asks a
   single typed question three seconds in. categories.js is the one copy of
   the category list, shared by the first-run dialog and categories.html. */
/* v49: three things, all reported from the live site.

   The 656px of nothing at the foot of the home page was not empty space — it
   was the Creator Community section, 600px of heading, post form and comment
   list, sitting after </footer> and outside the #main.content wrapper
   altogether. Being down there it never qualified for the .reveal observer, so
   it stayed at opacity 0 and read as a gap. Moved inside the column, above the
   footer, where it was meant to be.

   The rail said "categories" twice: a Categories row in the You group, and the
   card in the foot that shows which category you are on. The row goes and the
   card stays — the card is the better control because it answers the question
   as well as changing it, and both pointed at the same page.

   And publish.html's Plan button opened with a bare `if (!file) return`.
   Pressing it with no clip in did nothing whatsoever — no message, no
   movement. Every other guard in that handler says what is missing; the first
   one anybody hits was the only silent one. It speaks now.

   index.html, nova.js and publish.html are all cached. */
/* v59: the app's own drawer is back on phones.

   Asked for after v58 routed around it. The burger that opens it lives in
   this page's .nc-topbar, which nova.js hides as a duplicate second header —
   true everywhere else, and not here, where that bar is also the only handle
   on the app's navigation. It shows again below 900px, sticking at 52px under
   the site bar rather than at 0 where it would slide beneath it, and without
   its points pill: two coin counts two pixels apart showing different numbers
   was the real complaint behind the rule, and the site bar keeps that job.

   fixRail worked on the FIRST .nc-sidebar, and on a phone there are two — the
   hidden desktop rail and the drawer, which borrows the class. So the drawer
   would have opened with the bundle's own rows, none of the three added here,
   and two rows still pointing where they used to. It runs over every rail now.

   And a row in the drawer closes it behind you. They are plain anchors to a
   hash, so the app's router never sees them and the state holding the drawer
   open was never told — tap Scripts and the panel opened underneath a menu
   still covering it. The bundle's own backdrop carries the close handler, so
   this presses that rather than reaching into React's state.

   trends.html and trends-nav.js. Both cached. */
/* v60: the Trend Spotter scan is this repo's now, and the Studio speaks the
   site's language.

   The bundled Trend Spotter had a niche box and a Scan button. Measured in a
   browser: typing a niche and pressing it made no request to anything,
   rendered no card, printed no error, and stored nothing. Two complaints came
   straight out of that one dead button — results that were "about another
   niche" (there were no results, so the page kept whatever was on it) and the
   Advanced Certificate's "Run a Trend Spotter scan" counter sitting at 0 after
   a dozen scans. A button that does nothing cannot count.

   So /trends is a panel in trends-nav.js now, beside the other eight, and the
   scan asks with { search: true } — search grounding on, deliberately. Without
   it a model answers about the world as it was when it was trained, which for
   a question with the word "trending" in it is the one answer guaranteed to be
   wrong. The niche is named three times in the prompt (as a quoted string, as
   a rule, and as a refusal condition) because drifting off it was the
   complaint. What it read is printed under the cards: a trend you cannot check
   is a rumour. logSkill('trend_scan') fires on an answer that arrived, not on
   the press — a scan that failed is not a scan.

   And the Studio's AI output is translated, not just its labels. Somebody
   reading the site in Farsi asked for the Studio in Farsi, and the trends are
   the Studio. The JSON keys stay English or the parser stops matching.

   trends-nav.js and nova.js. Both cached. */
/* v61: History records the whole site, pages come back where you left them,
   the Studio hero lede is centred, and the certificates ask for more.

   HISTORY WAS EMPTY BECAUSE ONLY ONE PAGE EVER WROTE TO IT. saveHist() was
   called from ai.html and nowhere else, so somebody who had spent an afternoon
   on the Studio, the Coder and the puppet found a page that said "no chats
   yet". The Coder, the animator and the Studio's three AI panels write to it
   now, the entry carries a time as a third element (parent.html reads x[0] and
   .length, so it does not notice), and the list is one column newest-first
   with the answer under the question instead of three questions per subject
   and nothing else. It also has a Clear button, which a page holding a record
   of what somebody asked should always have had.

   COMING BACK LANDS WHERE YOU LEFT. The browser restores scroll for its own
   Back button and cannot do it for a link, and every "back to the site" link
   here is an ordinary link — so the position is kept per path in
   sessionStorage, which dies with the tab. A #hash outranks it, a first visit
   is not restored, and the first wheel, touch or keypress stands it down.

   THE STUDIO HERO LEDE. Its own rule asks for margin:12px auto 0, and
   body.nova p{margin:0} is (0,1,2) against that rule's (0,1,0), so the auto
   margins never resolved and a 620px block sat hard left in a 976px hero with
   its text centred inside it. Fixed on specificity, in trends.html.

   THE CERTIFICATES ASK FOR MORE, AND CAN. Six skill ids carried all three
   tiers while six others were logged by real pages into a ledger nothing read
   — and three of those six had no Q_KEY, so a requirement built on them would
   have rendered as a blank row with a number after it. The keys exist now, in
   all twenty languages, and the tiers use them.

   nova.js, history.html, trends.html, coder.html, animator.js, trends-nav.js.
   All cached. */
/* v62: Video Ideas and Scripts rebuilt, and Hype Lab gets the whole screen.

   THE SHAPE PICKER NEVER REACHED THE MODEL. It offered six words — POV, To
   camera, List — and dropped the chosen one into the prompt as a bare label
   on its own line. A model reads "POV" the way you read it shouted across a
   room: it knows roughly what you mean and feels free to land somewhere
   adjacent, which is why four of six came back as ordinary talking-head
   videos with "POV:" typed at the front of the title. There are fifteen
   shapes now and each carries a sentence saying what it actually is; that
   sentence goes to the model, the label goes on the screen, and the format is
   named as a definition, as a rule over all of them, and as a condition for
   leaving one out.

   The forms went from three controls to six and five. That was asked for and
   it is also the fix: "six ideas about skateboarding" has a thousand right
   answers and a model handed a thousand right answers picks the blandest.
   Length, energy, what they can actually film with, and how it opens and ends
   each cut that down to something the answer has to commit to.

   SCRIPTS ASKS FOR BEATS. It used to ask for three labelled paragraphs and
   drop them in a textarea — an essay about a video rather than something
   anybody could stand up and film, with no idea what is on screen while the
   words are said and a "30-second script" that ran fifty. Each beat now
   carries a length, the words out loud and what the camera is looking at,
   the panel adds the seconds up, and it says out loud whether the draft fits
   the length that was asked for. The textarea stays, holding the same script
   as plain text, because Copy, Download and the hand-off to the AI Editor all
   read it.

   Both panels are laid out for the screen they are on: an auto-fit option
   grid that is three across on a laptop and one on a phone, and results in
   cards rather than a single column with 600px of empty space beside it.

   And Hype Lab is full:true, like the Editor, the AI Editor and Photo. It is
   a player with a retention curve under it, and it was the last tool still
   living in a 940px column.

   trends-nav.js and nova.js. Both cached. */
/* v63: the app's own Trend Spotter design is back, on a backend that goes
   two passes deep — and the ask card stops covering the phone drawer.

   THE DESIGN WAS NEVER MISSING. The bundle shipped a whole Trend Spotter:
   hero, search bar, niche chips, a live scan meter, an animated radar with
   clickable signals, cards with badges and metric tiles and sparklines, a
   platform breakdown, hooks, opportunities and a detail modal. All of it is
   in trends.html's stylesheet — .nc-trend-card, .nc-radar-point, .nc-metric,
   .nc-bar-fill, .nc-platform-best, .nc-hook-quote, .nc-modal and about forty
   more — and none of it had ever been on screen, because the scan that was
   meant to fill it made no request and returned nothing. v60 replaced it with
   something that worked and looked like a form. This is the original markup
   and the original class names, driven by a scan this repo owns.

   TWO PASSES. One grounded in live search asking only what is rising, with
   momentum, crowding and fit judged per trend; one asking what this creator
   would actually make of them, returning hooks, gaps and platforms. Small
   schemas come back whole, and a failure in the second still leaves the first
   on screen. Crowding is asked for and shown because "rising" alone sends a
   small channel straight at what the big channels already own. Scans are
   cached per niche/window/size for the session, so pressing a chip twice
   costs one call, not two.

   LIGHT MODE, WHICH THE BUNDLE NEVER HAD. Its palette sets --nc-text, which
   nova.js flips, but --nc-panel and the border tokens are flipped by nobody —
   so every .nc-card on this page was a dark panel with dark text on it in
   light mode. Survivable with a hero and three cards on screen; not
   survivable with twenty. The surfaces flip now; the accents do not.

   AND THE ASK CARD STANDS DOWN FOR AN OPEN MENU. It is fixed at z-index
   99950 and fires three seconds in, which is exactly how long it takes to
   press the burger on a phone — so it landed on top of the drawer and covered
   the first four rows. The drawer was there and it worked; it just could not
   be seen. It waits for the menu to close now, steps aside if one opens under
   it, and no longer grabs focus when it opened itself on a phone, because
   that raised the keyboard over the page.

   trends-nav.js, trends.html, nova.js, nova-ask.js. All cached. */
/* v64: you can see what an effect or a transition does before you use it —
   and there is now something different to see.

   THE PANELS SHOWED YOU NOTHING. Thirty-six effects and twenty-six
   transitions, each a name and a 16px line icon. You chose Kaleidoscope over
   Prism by reading two words. Every tile has a live thumbnail now, drawn on
   your own footage when the project has any and on a built-in test card when
   it does not.

   ALL TWENTY-SIX TRANSITIONS WERE THE SAME FADE. The renderer never read
   transitionIn.type — the only places that field appears at all are two
   tooltips on the timeline. Checked rather than assumed: one clip at one
   playhead with fade, slide and cube rendered three byte-identical PNGs.
   editor-fx.js implements the named geometry through the __ncGrade draw hook,
   so Slide slides, Iris opens, Cube turns and Checker fills in diagonally. Ten
   types at the same playhead now give ten different frames.

   FIVE EFFECTS HAD NO RENDERING AT ALL. filmGrain, emboss,
   chromaticAberration, shake and zoomPunch were in the panel, in the effects
   object and in the AI presets, and in no branch of the filter builder. Their
   sliders moved and nothing happened. The three colour ones have a filter now;
   shake and zoomPunch are movement, so they live in the same per-frame hook as
   the transitions.

   AND STUDIO-KIT WAS DELETING TWENTY-ONE EFFECT TILES. Its artSlot() walks up
   from a label looking for an art box to fill, and decorate() empties whatever
   it returns. In the Transitions panel that is the icon box, which is right.
   In the Effects panel there is no art box, so it returned the tile — and
   emptying the tile deleted the slider. Twenty-one of the thirty-six effects
   had no control left in the DOM; the only survivors were the fifteen whose
   names it does not recognise. It now refuses any candidate holding a form
   control or text, and skips tiles editor-fx.js has claimed.

   editor-fx.js (NEW), editor.html, studio-kit.js. All cached. */
/* v65: the eleven duplicate effects are eleven different effects, clips move
   between lanes, and the arrow keys move a clip in time.

   ELEVEN OF THE THIRTY-SIX WERE LITERALLY ANOTHER ONE. Not similar — the same
   filter string: vintage==sepia, pixelate==posterize==ascii,
   scanlines==dots, halftone==crosshatch, mirror==wave. Thirty-six names,
   five looks between those eleven. They could not have been separated inside
   a filter chain, which is why they never were: CSS cannot pixelate, quantise
   to a palette, draw a character grid, rotate a halftone screen, hatch,
   mirror a half or displace a scanline. So ten of them are drawn now — real
   block averaging, a real level quantiser, a real character ramp, a real
   45-degree dot screen, real crossed strokes, real horizontal displacement —
   and sepia stays a filter because sepia is what sepia is. They run inside
   the editor's draw loop on the real frame, so the preview shows them and the
   export contains them, and the panel thumbnails call the same functions.

   MOVING A CLIP BETWEEN LANES. The timeline's drag handler captured the
   clip's trackId once at pointerdown and never read clientY at all, so the
   vertical axis was discarded and the clip sprang back. The store's moveClip
   always took a trackId; nothing was ever passing one. Lanes light up as you
   drag over them, an audio lane refuses anything that is not audio and says
   so, and the correction goes through setState so one drag is still one undo.

   THE ARROW KEYS MOVE TIME, NOT THE PICTURE. They were nudging
   transform.positionX and positionY — moving the video inside the frame,
   which is a once-a-project job — while sliding a clip a frame earlier had no
   key at all. Left/Right is now one frame, Shift one second, Up/Down the next
   lane that will take the clip. Nothing selected and the playhead keeps the
   keys. Clicking a clip also takes the keyboard off the project-name field,
   which the bundle's preventDefault had been leaving focused.

   AND THE REACTION GAME ACCUSES YOU OF BEING A ROBOT. A single go under 100ms
   is faster than signal reaches the back of the eye, so it is a guess that
   landed. NovaClip's own human check appears, and folds the moment you touch
   it.

   editor-fx.js, editor-lanes.js (NEW), editor.html, reaction.html. All cached. */
/* v66: a new project has two video lanes, and a project can hold more than
   one timeline.

   THE SECOND VIDEO LANE. A new project opened with V1, A1, T1 — one video
   lane — so the first thing anybody tried after lane-dragging shipped had
   nowhere to land: the only other lanes are audio, which refuses video, and
   text. A fresh project gets V1, V2, A1, T1 now. Four rows is what fits the
   timeline's default height; a fifth would open the editor with a scrollbar
   in it. Only a pristine project is ever touched — three lanes named exactly
   as the bundle makes them and no clips. There is deliberately no "already
   done this" flag: the first version kept one and it was wrong in the most
   ordinary case, because the editor autosaves every eight seconds, so closing
   the tab sooner than that saved nothing and the flag stopped the lane ever
   coming back.

   MORE THAN ONE TIMELINE. A strip of tabs above the lanes. Each timeline has
   its own lanes, clips and markers; the media library, the settings and the
   project name stay shared — which is the difference between this and a
   second project, and the whole point: upload once, cut it four ways. Undo
   travels with the timeline, in memory, so Undo on Timeline 2 can never
   restore a clip into Timeline 1.

   Two bugs worth remembering, both found by measuring rather than reading.
   The project id does not exist when the editor opens — the projects layer
   writes it on its first save — so timelines made in the first seconds were
   filed under 'default', and the next lookup found nothing and built a fresh
   empty one over the top; the shelf is carried across the one time the name
   changes. And the boot order was backwards: stashing the live store into the
   active timeline as soon as the store existed saved the editor's empty
   startup state over the real work, because the project restore lands seconds
   later. nc_timelines is written every two seconds and on pagehide, so it is
   never staler than the project's own save, and on boot it is applied to the
   store rather than read from it.

   editor-lanes.js, editor-timelines.js (NEW), editor.html. All cached. */
/* v58: three bugs found by going looking for them.

   STUDIO HAD THREE PANELS A PHONE COULD NOT REACH. Below 900px the bundle
   hides .nc-sidebar, and the burger that opens its drawer version sits in the
   .nc-topbar that nova.js hides as a duplicate second header — the rule whose
   comment says "their real controls are reachable from the menu", which on
   this one page was not true. What was left was the six routes the home screen
   happens to put on cards: Photo, Hype Lab and the analytics panel had no way
   in at all, and from inside any panel there was no way back to Studio home
   short of the browser's back button. A page can now hand its own routes to
   the phone menu (NC_PHONE_ROUTES) and Studio hands over all nine plus home.

   ELEVEN KEYS WERE BEING ASKED FOR AND WERE NOT IN THE TABLE — the history
   page's subtitle, six lines of the parent dashboard's content blocking, a
   pricing feature line and the four drawing tools. A missing key is silent:
   the translation pass leaves the English where it is, so these had never
   translated in nineteen languages and nothing anywhere said so. Found by
   listing every data-t on the site and checking it against the table.

   AND THE EDITOR/PHOTO TAB STRIP invented two keys, pair_editor and
   pair_photo, that were never added — while `editor` and `photo` have been in
   the table in twenty languages the whole time. It reads them now.

   nova.js and trends-nav.js. Both cached. */
/* v57: the layout no longer mirrors for Farsi, and the welcome is translated.

   THE RAIL STAYS ON THE LEFT. dir=rtl on <html> mirrors the whole document —
   rail to the other side, every flex row reversed, the timeline in the editor
   running backwards — and that was not wanted. editor.html had already had to
   cancel it locally with `#root{direction:ltr}` to stay usable, which is a
   rule worth doubting when the biggest page on the site has to undo it.

   So dir is now ltr in every language and a .nc-rtl class carries what Persian,
   Arabic and Urdu actually need: `unicode-bidi: plaintext` on the text
   elements, which was already there and doing the real work. Each paragraph,
   heading and cell resolves its own direction from its own first letter and
   aligns itself. The words read right to left; the furniture does not move.
   Measured at 1440px, Farsi and English now report identical boxes on index
   and profile. Fourteen mirror rules deleted.

   And the welcome dialog is in twenty languages. It was the last thing on the
   site written in English and the worst place for it — the first screen of a
   first visit. Forty-one keys: the role question, the parent instructions, the
   name and category steps, the ten category names and the ten lines under
   them. The greeting with a name in it is a template with a {n}, filled in
   when it is shown and its data-t dropped so the language pass cannot
   overwrite the filled sentence with the template.

   nova.js, index.html and the head snippet in all 31 pages. All cached. */
/* v56: the welcome asks who is holding the laptop, and a parent gets a
   parent's instructions.

   The site had one first visit, and it was a creator's: pick a name, pick what
   kind of videos you make, then four screens about Studio and the editors. A
   parent arriving to find out what this thing does to their child was asked to
   choose a video category and then told where the timeline is.

   So the welcome asks first — creator or parent, one screen, two buttons. A
   creator gets the two questions it always asked, now steps 2 and 3. A parent
   gets the four things to set up instead, in the order they have to happen —
   PIN, screen time, content blocking and the shield, alert email — and a
   button onto the Family Dashboard. The name and category questions are not
   asked at all: they are a creator's questions, and asking a parent what kind
   of videos they make is the site talking to the wrong person.

   The tour behind it forks the same way. Four parent screens instead of the
   four creator ones, and its last button opens Family rather than saying
   "Start" and leaving them wherever they happened to be.

   It changes what is SHOWN and never what is allowed: every row of the rail
   is where it was, and a parent who wants the editor still has it.

   nova.js and nova-instructions.js. Both cached. */
/* v55: the Farsi layout was reserving the rail twice, and NovaCoins is
   translated.

   "The whole site goes to the left in Farsi" was not a matter of taste, it was
   an arithmetic error. Left-to-right has a line that stands the body offset
   down when a wrapper is doing the offsetting — `body:has(.content){margin-
   left:0}` — and the right-to-left block never got its mirror. So index.html
   reserved the rail width on the body AND on .content: measured at 1440px,
   content stopped at 1037 with the rail starting at 1238, two hundred pixels
   of nothing down the side and the page pushed off it. Now 0 to 1238, the
   exact mirror of English.

   .wrap was pinned to the right edge in RTL as well — margin-left:auto with a
   fixed right margin — so Profile, Privacy and Terms sat against the side of
   the screen instead of centred. It is a centred column in both directions;
   mirroring a layout does not mean mirroring what was symmetrical already.

   Profile sat welded to the bar because the rule reserving the bar's height
   wrote padding-top on the body and REPLACED the 34px the page asks for. It
   is a transparent top border now, which reserves the same height and leaves
   each page's own padding alone. And its "Back to the site" link has its own
   row above the masthead rather than being the fourth item on that row,
   shoved to the far end by an auto margin.

   NovaCoins is translated — Nova stays, the coin half goes into the script
   being read. It was the last English word in the rail.

   nova.js and profile.html. Both cached. */
/* v54: the twelve cyber theme names are translated too.

   They were left in English last time on the reasoning that they are names
   like NovaCoins. They are not — NovaCoins is the product naming its own
   thing, and these are descriptions: a void, a blood moon, a solar flare.
   Somebody reading a list of twelve wants to know which is which.

   The genre words stay recognisable rather than being forced into an
   equivalent that does not exist — cyberpunk, synthwave, vaporwave, matrix,
   holo, xenon, titanium are loanwords nearly everywhere, transliterated where
   the script changes. What gets translated is the half that means something.
   Every option carries data-t, so switching language relabels the whole list
   in place, and the English in NC_SKINS is the fallback.

   nova.js, and it is cached. */
/* v53: cyber themes work in light mode, and the RTL languages are finished.

   The twelve cyber themes were dark themes by construction: nc_theme held
   EITHER light/dark/system OR a skin id, so choosing Neo Cyberpunk overwrote
   "light". Two keys now — nc_skin for which theme, nc_theme for which side —
   and a skin paints both ways. On the light side the background is white
   carrying a wash of the skin's primary, and the three neons are walked down
   towards ink until each clears 4.5:1 on it; #00F0FF on white is 1.3:1, so
   using them neat was never an option. Anybody whose nc_theme holds a skin id
   is migrated on the first read and sees no change.

   Two bugs found while building it: the skin sheet was appended before
   nc-theme-css during parse, so on any RELOAD with a skin stored the base
   palette won and the skin vanished (it worked from a click, which is why it
   looked fine); and the pre-paint snippet in every page cached one background
   for a theme that now has two sides.

   Right-to-left: Persian, Arabic and Urdu readers got the page laid out
   left-to-right and watched it flip when nova.js reached the end of <body>.
   Direction is set in the same head snippet as the theme now, so the shape of
   the page is right before the first frame. And the English left in it is
   gone: the Games rail row (no translation key existed), the profile card's
   "Creator", all six strings of the Ask card, its three shortcut chips, the
   ten category names and the cyber theme picker's own label. Measured: four
   English strings left on a Persian home page, now one, and that one is the
   "Clip" of NovaClip.

   The Creator Community block on the home page was a <div> where its
   neighbours are <section>s, so it never got the 7vw side gutter they all
   have and sat hard against the rail.

   nova.js, nova-ask.js, categories.js, index.html and the head snippet in all
   31 pages. All cached. */
/* v52: the device lock is gone, and Photo has left the site rail.

   The lock was a wall: enrol a passkey and every page asked the device to
   confirm it was you before anything opened. It locked the owner out of his
   own site. A WebAuthn prompt refuses for a dozen ordinary reasons — dismissed,
   timed out, a wet finger, a browser in a state it does not like — and each one
   drew the same wall with nothing behind it. The button that removed the lock
   was on the Profile page, which was behind the wall. A lock whose only key is
   inside the locked room is a trap.

   guard.js, passkey.js and locker.js are deleted, along with the enrolment
   controls on Profile and the precache entries that made sure the wall was the
   one thing guaranteed to work offline. nova.js now clears what any of it left
   in the browser — the passkey handle, the encrypted locker, and the face,
   voice and click-rhythm records from before those were removed — on every
   page load. Signing in is untouched; that is the account, on the server.

   Photo is out of the site rail for the same reason the Editor and the AI
   Editor left it: it lives in Studio now, so the row was a second door to one
   room. photo.html still opens on its own.

   nova.js, profile.html, privacy.html, terms.html. All cached. */
/* v51: the Photo editor is the third tool in Studio.

   The Editor and the AI Editor already opened full screen inside trends.html;
   Photo was still a trip out to its own page, which is the wrong shape for the
   one tool you reach for in the middle of an edit — the thumbnail is a frame of
   the video. Same treatment: a panel, a rail row next to the other two, and the
   whole viewport once it is open.

   Two things came out of building it, both older than this change:

   Embedded, the frame's own shell went on reserving room for furniture that is
   not drawn inside a frame — the rail on the left, and under 761px the top bar
   and the phone strip as well. A rail-wide empty column, and 126px of nothing
   above and below in a narrow frame. nova.js's embed stylesheet hid .sidebar
   but never zeroed what the shell was offset by.

   And a link straight to a panel — trends.html#/editor, a bookmark, a reload
   with a tool open — never opened it. The router runs once at boot, before
   React has mounted the element it needs, and nothing changes the hash
   afterwards, so no event ever ran it again. Clicking the rail always worked,
   which is why it was never noticed.

   nova.js, trends-nav.js. Both cached. */
/* v50: the parent dashboard's "Report to YouTube" link landed you on the
   video, not on a report form, and that is the most it could ever have done.
   YouTube publishes no URL that opens the report box for a comment — &lc=
   highlights the comment and stops there — so the promise was the bug, not
   the link. It now says "Open on YouTube", and a line under it gives the two
   taps that finish the job: ⋮ beside the comment, then Report. The paragraph
   below the scanner said the same untrue thing and says this instead.

   parent.html is cached. */
/* v48: deleting media blanked the editor. Reproduced, and it is two lines.

   The right-hand properties panel resolves the selected clip twice — once as
   the id, once as the object:

     n = selectedClipId
     r = clips.find(c => c.id === selectedClipId)

   and then gated its five tabs on `n` while passing `r` to them. Removing an
   asset drops the clip that used it but left selectedClipId pointing at the
   clip that no longer existed, so `n` stayed truthy, `r` became undefined, and
   the Transform tab's `const i = e.transform` threw. No error boundary, so
   React unmounted the entire application: root.children went to 0 and the page
   was the background image and nothing else, which is exactly what was
   reported. All five tabs had the same exposure.

   Gated on `r` now — the object it actually hands down. And removeAsset and
   removeTrack clear selectedClipId when the clip it points at is one of the
   ones they just removed, which is the state bug underneath the crash.

   Seven delete paths tested from a fresh page each: remove from the library by
   button and by action, deleteClip, the Delete key, rippleDelete, removeTrack
   holding the clip, and undo afterwards. All seven survive with no stale
   selection. The five tabs still render 23, 18, 36, 8 and 12 controls with a
   clip selected, and editing still writes through. */
/* v47: the home page background on a phone. v46 lifted the secondary text
   colour and that helped, but the cause was underneath it: this page painted
   two complete sets of blurred orbs at once — .orb (three, opacity .42) and
   .orb3d (three more, opacity .3). Their offsets are percentages of the
   viewport, so at 1440px they sit apart and read as atmosphere, and at 390px
   all six converge on one column and add up.

   Measured against the background actually behind each paragraph, body copy on
   this page sat between 2.40:1 and 3.64:1 — every one of the five failing the
   4.5:1 that body text needs. Now 4.54:1 to 8.31:1.

   Four changes, phones only: the second orb set goes, the first drops to
   opacity .18, #mouseglow goes (a screen-blend lightener chasing a pointer
   that touch devices do not have), and #stars — a full-viewport layer already
   sitting right after #orbs — gets a dark fill, which makes it a scrim over
   the orbs with the stars still drawn on top. No new element, and nothing for
   an animated orb to drift out from under. #nova-trail goes with them: a
   cursor-trail canvas at z-index 997, above every word, repainting for an
   effect touch cannot trigger.

   index.html is a cached page, which is the reason for the bump. */
/* v46: the phone UI, rebuilt. Measured on a 390px screen before touching
   anything, and what it found was five controls in a 52px bar, two stacked
   headers on the pages that bring their own, the points total shown twice with
   the copies disagreeing, three decorative cards floating over the hero text,
   and body copy set at 12.8px on the tools shelf.

   The bar is three things now — wordmark, coins, menu. Settings, Ask Nova and
   the page guide moved into the menu sheet, where they have their names beside
   them instead of being three unlabelled icons in a row. The coin badge is
   repositioned rather than duplicated, because addPts() finds it by id and a
   second copy would go stale. Second headers and the floating decoration are
   hidden below 760px, body text has a 15px floor, and the secondary text token
   moved away from the middle grey that vanished over the lighter half of the
   hero gradients.

   All of it lives in nova.js, which every page loads — the alternative was the
   same fix pasted into thirty-four pages and forgotten on the thirty-fifth. So
   a returning visitor served the old nova.js from cache gets the old phone UI
   back wholesale, which is the reason for this bump. trends.html changed too:
   a "NovaClipP" typo in its hero badge. */
/* v45: terms.html, for the same reason privacy.html changed in v44. Section 3
   still offered face sign-in, voice sign-in and the click rhythm as ways to
   unlock the device, and section 5's consent rule was written around face and
   voice features that no longer exist. Both now describe the passkey and the
   camera, microphone and voice changer that are actually there.

   Section 2 also gained the part it was missing: it said thirteen and cited
   COPPA, which is the US line. In the EU each country sets its own age for
   agreeing to a service like this, from 13 to 16 — so a fourteen-year-old in
   Germany was being told they could agree on their own when their own law says
   a parent has to. Governing law here is England and Wales, and the site is
   read across the EU, so that sentence had to be there. */
/* v44: privacy.html rewritten to match v43's deletions. It still described
   face, voice and click-rhythm sign-in, and the voice commands that went with
   them — a policy claiming to collect biometrics the site no longer has is a
   promise broken in the safest possible direction, but it is still wrong, and
   it is the first document any partner or regulator reads. There is a
   "Biometrics: removed" section now saying what went, why, and what happens to
   data already enrolled on somebody's browser; the camera and microphone
   section covers only the editor, the selfie studio and the voice changer; and
   the analytics section states plainly that ad personalisation is denied.

   Cached page, and the one page where a stale copy is a legal problem rather
   than a cosmetic one. */
/* v43: three changes, and two of them delete things.

   Biometrics are gone from the site. biometrics.html, biometric.js,
   biosentinel.js, rhythm.js and theme-biometric.css are deleted — a face
   descriptor or a voiceprint used to recognise somebody is Article 9 "special
   category" data under GDPR whatever machine it sits on, and this site's users
   are children. The passkey stays and is not the same thing: the private key
   is made inside the device's secure hardware and nothing biometric reaches
   this site. guard.js and profile.html both changed with it, and the shell
   drops five files.

   Ads are contextual only, structurally. novatools/nt.js and nt-config.js set
   requestNonPersonalizedAds, TFCD, TFUA and restricted data processing before
   the loader and again on every unit, and auto ads are refused rather than
   configured. All 31 pages also tell GA4 allow_google_signals:false and
   allow_ad_personalization_signals:false.

   And on a phone the rail is a menu. The 64px bottom strip that held fourteen
   links behind a sideways scroll is gone; below 760px there is a button in the
   bar and six items behind it — Studio, Socials, Games, Family, Pricing,
   Profile. That is a nova.js change, which every page loads, so a returning
   visitor served the old copy from cache gets the strip back on a page whose
   body no longer reserves room for it. */
/* v42: the five per-page walkthroughs are one site tour. Four screens about
   what NovaClip is, shown once on a first visit rather than a new modal every
   time somebody arrives somewhere new, and set in type you can actually read —
   32px headline, 19px copy, up from 20 and 13. Two shell files carry it:
   nova-instructions.js is rewritten, and nova.js loads it now, so the five
   pages that used to carry their own <script> tag no longer do. Without the
   bump a returning visitor gets the old pages from the cache asking for a file
   whose contents changed underneath them, and the tour either never appears or
   appears five times. */
/* v41: the Editor and the AI Editor left the main site rail and open full
   screen inside Studio instead — fixed, edge to edge, over the rail, with a
   34px strip carrying the way back. Photo took their place in the rail, since
   the Editor entry was its only route into the site. nova.js and trends-nav.js
   are both cached shell files and both changed, so without the bump a
   returning visitor gets one of them from the network and the other from the
   cache: a rail with no Editor in it and a Studio that still opens the tool
   into a 940px column, or the reverse.

   Three more in nova.js, all found by the width sweep once it was pointed at
   the eight pages it had never been given: aim.html, flap.html, reaction.html
   and offline.html had no link off them at all, so a page with no way out now
   gets one in the top bar (offline.html carries its own, since it does not
   load nova.js); a bare `button { width:100% }` on report.html was reaching
   into that bar and shoving the "?" off the edge; and the Editor/Photo tabs no
   longer float over the tool when it is embedded. */
/* v40: nova-instructions.js — a walkthrough for the five pages that need one
   (editor, AI editor, Studio, photo, tools). It opens once per tool and then
   only from the "?" in the top bar, and Next waits two seconds on each step:
   press it inside that window and the walkthrough restarts from step one and
   says why. Escape always closes, so it is a pace, not a cage. Also in v40:
   the Ideas and Scripts panels were printing "[object Object]" because ncAsk
   returns { text, err, ... } and both read it as a string. */
/* v39: the Studio panels were unreachable by clicking, which is the only way
   anybody reaches them. The app's rail routes with history.pushState, and
   pushState does not fire hashchange — so this file's router never ran on a
   click and the app's own "STAGED" placeholder stayed up. It listens for
   popstate and for a wrapped pushState now, and hides that placeholder with a
   class on <html> rather than an inline style React throws away on its next
   render. trends-nav.js is the file, and it is cached. */
/* v38: the Studio panels hand you something now instead of printing text and
   stopping. Ideas save to a shortlist that is drawn at the top of that panel
   and downloads as a file, and each one can go straight to Scripts or to the
   thumbnail maker with its title already in the box. Scripts downloads as a
   named .txt and hands the subject and the hook to the AI Editor, which used
   to ask for them again. Saving an idea also logs idea_save — a certificate
   task worth 5 towards Advanced and 15 towards Master that nothing on the site
   had ever written. trends-nav.js and publish.html both changed, both cached. */
/* v37: the editor exports vertical. Its resolution list was four landscape
   sizes, so a Short could be previewed at 9:16 and then only saved as a 16:9
   file with the phone footage boxed in the middle of it — Vertical 9:16,
   Vertical HD, Square and Portrait 4:5 are in the Export dialog now.
   The floating globe in the bottom-left corner is gone with them: it opened a
   second copy of the theme, vibe and language controls that the top bar has
   carried on every page for a while, and on the editor it sat over the tool
   rail. editor.html and nova.js both changed and both are cached. */
/* v36: NovaTools is personalised, and it gained three tools. A "Picked for
   you" strip at the top takes its four from the category — Art gets the new
   drawing board first, Tech the developer set — and disappears entirely for
   Classic or no category. The drawing board is new and hands what you drew
   straight to Animate a drawing, which until now needed paper, a dark pen and
   a camera before it could do anything. The video editor and the AI Editor are
   in the catalogue at last: the two largest tools on the site were the two not
   listed on the tools page. tools.html and categories.js both changed and both
   are cached. */
/* v35: three things, and the first is a fix. A category with no photograph
   recorded "no photo" in sessionStorage for the whole visit, and sessionStorage
   survives a reload — so adding the nine files changed nothing until the tab
   was closed, which is exactly how it was reported. A miss now carries a
   timestamp and is retried after two minutes.
   A neutral "Classic" category joins the nine: it is the plain NovaClip look,
   with no tint, no scene and nothing said to the AI about a channel.
   And nova-guide.js is back — the written walkthrough for twenty-four pages,
   on a "?" in the top bar rather than on the deleted Jarvis pill. New shell
   file, 29 pages reference it. */
/* v34: the backgrounds were invisible on the home page, which is the page
   they were reported invisible on. The wash, the photo and the drawn scene all
   sat at z-index:-1, which is BEHIND the element's own background — and every
   page paints an opaque body (index.html's --void is var(--nc-bg)). They are a
   stack now: --nc-bg on <html>, the body transparent and lifted above them.
   The three big blurred orbs seven pages float behind their content also
   follow the category, because at 460px and 42% opacity they were the loudest
   thing on the screen and they were still violet on a Food page. nova.js is
   the only file that changed and it is cached, so the bump is what delivers
   any of it. */
/* v33: every category has a real background now, not only a colour. Nine
   scenes are composed in category-scene.js and handed over as data URIs — a
   new shell file, loaded by 33 pages, so a cache without it is 33 pages asking
   for a script that is not there. nova.js falls back to it when backgrounds/
   holds no photograph for that category, and it now probes png, jpeg and webp
   as well as jpg, which is what somebody dropping a file in actually has. */
/* v32: Trend Spotter became Studio in the rail, and the page behind that name
   grew the Editor and the AI Editor as panels of its own. trends-nav.js is the
   file that changed and it is cached, so without the bump a returning visitor
   gets a rail with two rows that redirect away instead of two panels that open
   in place. nova.js also gained the per-category background photo layer —
   nothing ships in backgrounds/, and a category with no file there keeps its
   colours, so this bump costs nothing to anybody who adds none. */
/* v31: the front page's globe is gone and NovaClip's own mark turns there
   instead — nova-logo3d.js is a new shell file, index.html changed to load it,
   and nova-globe.js is deleted, so a cache still holding it would serve a page
   asking for a file that no longer exists. The category also lights the whole
   site now: nova.js tints the background family from it, so every page has to
   come back for the new copy or the choice shows on some pages and not others.
   categories.js carries the colours. */
/* v30: two buttons, a category that does something, and BioSentinel back.
   The bar gained a switch that puts the rail away and an "Ask Nova" button
   that reopens the card, so nova.js is the reason for the bump on its own.
   The category now steers the Ask card's shortcuts, Trend Spotter's first
   search and the AI prompts on ai.html, publish.html and trends-nav.js —
   every one of those is a cached file that would otherwise be served from
   v29 without the wiring. And biometrics.html is back, set up from inside
   profile.html rather than from the rail: the six files it needs are in the
   shell again, and profile.html has to be re-fetched or the frame that loads
   it does not exist. */
const CACHE = 'novaclip-v66';

/* Kept deliberately short: the shell of the site and the things a first
   offline launch cannot do without. Every extra file here is another chance
   for install to fail, and a worker that fails to install is no worker. */
const SHELL = [
  '/',
  '/index.html',
  '/offline.html',
  '/nova.js',
  '/logo.svg',
  /* Analytics is the page most likely to be opened on a train, and its charts
     came from a CDN until now — which is to say they did not come at all. */
  '/vendor/chart.umd.js',
  /* The Studio's skin and its panels. Both are small and both belong to the
     page above — the tiles and the tabs are markup this file's own script
     writes, so shipping analytics.html without them offline would leave three
     empty divs where the top of the dashboard should be. */
  '/studio-nexus.css',
  '/studio-nexus.js',
  /* The shared 1-10 scale. analytics.html and publish.html both call into it
     and both throw without it. */
  '/rank.js',
  /* The sticker art and the effect previews: the editor and the photo tool are
     both offline-capable without them, but both are much less useful. */
  '/stickers.js',
  '/studio-kit.js',
  /* The photo editor's effects library and its five extra tools. Cached beside
     the scripts above for the same reason grade.js is: every effect in it is
     arithmetic on a canvas already in memory, so it genuinely works on a train
     — and photo.html without it is a visibly smaller editor rather than a
     broken one, which is the worse failure to debug. */
  '/photo-fx.js',
  /* The photo picker itself is cached even though the photographs it fetches
     are not and cannot be. That is the point: offline, the button is still
     there and says in words that it needs the network and that Stickers does
     not. A missing button would just look like the feature had gone. */
  '/photos.js',
  /* The grade and its panels. Colour correction is arithmetic on the frame
     already in memory, so unlike the photo picker this one works offline. */
  '/grade.js',
  '/grade-ui.js',
  /* The effect and transition previews, and the transition geometry itself.
     Cached for the same reason the grade is: it is arithmetic on a canvas and
     a built-in test card, no network anywhere in it. Leaving it out would give
     an offline editor every tile blank AND every transition back to a plain
     fade, since the same file is what makes them differ. */
  '/editor-fx.js',
  /* Dragging a clip between lanes. Pure DOM and store work, nothing fetched,
     so it belongs in the cache with the rest of the editor's behaviour. */
  '/editor-lanes.js',
  /* The timeline tabs. Storage and DOM only — nothing fetched — so it works
     offline like the rest of the editor's behaviour. */
  '/editor-timelines.js',
  /* The mixer is Web Audio and a generated impulse response — no files to
     fetch, so it works on a train like the grade does. */
  '/mixer.js',
  '/mixer-ui.js',
  /* Picks a video encoder that actually emits bytes on this machine. */
  '/export-fix.js',
  /* Works out how long a dropped file actually is. It belongs in the shell for
     the same reason export-fix.js does: the editor loads it before its own
     bundle, and without it every import falls back to the four-line probe that
     turned an undecodable file into a silent five-second clip. */
  '/media-probe.js',
  /* Checks a dropped clip for fast flashing and blank footage. Pure
     arithmetic on frames already in memory, so it works offline. */
  '/moderate.js',
  /* Nova herself, drawn in SVG rather than fetched as an image. She is the
     face on the scanner and on the question nova-ask.js asks, and at a few
     hundred bytes of markup she costs less cached than the one PNG she
     replaced. */
  '/nova-mascot.js',
  /* The mark that turns on the front page. Cached because index.html is
     cached: the hero without it is a hero with an empty right-hand half, and
     unlike the globe it replaced there is nothing for it to fetch, so offline
     it is exactly as good as online. */
  '/nova-logo3d.js',
  /* The question asked three seconds in, and the category behind it. Both are
     cached because both work with no network at all: nova-ask.js matches what
     was typed against a table in its own file and only falls back to the model
     when nothing matches, and categories.js is a list and a localStorage key.
     Offline, the card still opens and still takes you to the right page. */
  '/nova-ask.js',
  /* The written page walkthroughs. Cached for the reason they are written
     down rather than asked of a model: a help button that needs the network
     is missing at exactly the moment somebody is stuck. */
  '/nova-guide.js',
  /* The five step-by-step walkthroughs, for the same reason and one more: the
     editor and the photo editor both work with the network off, so their
     instructions have to as well. */
  '/nova-instructions.js',
  '/categories.js',
  /* The nine drawn backgrounds. Cached because they are the floor under every
     category: a page served offline without this file is a page with the
     colours and no scene, which is a visibly different site from the one that
     was there a minute ago. */
  '/category-scene.js',
  /* The two pages the rail gained. History reads what is already stored on the
     device, so it is fully useful offline; Categories is the page that lets
     somebody change the answer they gave on their first visit, and it needs
     nothing but the file above. */
  '/history.html',
  '/categories.html',
  '/ai-edit.js',
  '/ai-edit-panel.js',
  /* Sends the Trend Spotter's rail to the real pages. Without it that rail
     offers four features this site already has as though they were unbuilt. */
  '/trends-nav.js',
  /* Hype Lab. The page and its engine go together: hype.html is markup with
     no behaviour of its own, so shipping it without hype.js offline would give
     somebody a drop zone that measures nothing and four dead checkboxes.
     The analysis, the effects and the music are all arithmetic on frames and
     samples already in memory — no model, no assets — so it genuinely works
     on a train. Only the "ask the AI for the words" button needs the network,
     and it says so when it cannot reach it. */
  '/hype.html',
  '/hype.js',
  /* The profile page's crypto and its avatar picker. Registering needs the
     network, but the page should not be a blank screen on a train either. */
  '/account.js',
  '/avatar.js',
  /* The focus timer is the one page here most likely to be opened with the
     wifi off on purpose. */
  '/study.html',
  /* NO DEVICE LOCK HERE ANY MORE.
     guard.js, passkey.js and locker.js are deleted, along with the enrolment
     controls on the Profile page — and biometrics.html, biometric.js,
     biosentinel.js, rhythm.js and theme-biometric.css before them.

     The gate locked the owner out of his own site: a WebAuthn prompt refuses
     for a dozen ordinary reasons, every one of them drew the same wall, and
     the button that removed the lock was on the Profile page, behind the wall.
     Precaching it made that worse, not better — the one file guaranteed to
     still be there offline was the one holding the door shut.

     Signing in is untouched. That is the account, on the server, and it never
     went through any of this. */
  '/profile.html',
  '/leaderboard.js',
  '/tools-data.js',
  '/tools-extra.js',
  '/teenverse.js',
  /* The two skins, and the faces they are set in. Without the woff2 files the
     first offline visit falls back to the system sans and the page looks
     wrong rather than merely plain. 50KB for both, once. */
  '/theme-teenverse.css',
  /* Keeps an embedded app's own theme picker from stealing the attribute the
     site selects its palette with. typing.html loads it before its bundle, so
     a cached page without it is a page where light mode does not work. */
  '/theme-bridge.js',
  '/fonts/plus-jakarta-sans-latin-wght-normal.woff2',
  '/fonts/space-grotesk-latin-wght-normal.woff2',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    /* allSettled, not addAll: addAll rejects the whole install if a single
       file 404s, and then the site has no service worker at all because of
       one missing icon. */
    await Promise.allSettled(SHELL.map(async (url) => {
      const res = await fetch(new Request(url, { cache: 'reload' }));
      if (res && res.ok) await cache.put(url, res);
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map((n) => (n !== CACHE ? caches.delete(n) : null)));
    await self.clients.claim();
  })());
});

/* For a future "a new version is ready — reload?" prompt. Nothing calls it
   yet; it costs four lines and means the page can hand over deliberately
   rather than the worker deciding on its own. */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

const IMAGE_OR_FONT = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf)$/i;
const MEDIA = /\.(?:mp3|wav|ogg|m4a|mp4|webm|mov|glb|gltf)$/i;

self.addEventListener('fetch', (event) => {
  const req = event.request;

  /* Chrome throws on this combination if a worker tries to handle it. */
  if (req.cache === 'only-if-cached' && req.mode !== 'same-origin') return;

  if (req.method !== 'GET') return;
  if (req.headers.has('range')) return;                 // audio/video seeking

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  if (url.origin !== self.location.origin) return;      // every API and CDN
  if (url.pathname.startsWith('/api/')) return;
  if (MEDIA.test(url.pathname)) return;                 // never worth caching here

  if (req.mode === 'navigate') { event.respondWith(page(req)); return; }
  if (IMAGE_OR_FONT.test(url.pathname)) { event.respondWith(quietly(req)); return; }

  event.respondWith(fresh(req));
});

/* A page: the server's copy when there is a network, the last one seen when
   there is not, and an honest offline page when neither exists. */
async function page(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) keep(req, res.clone());
    return res;
  } catch (e) {
    return (await caches.match(req)) ||
           (await caches.match('/offline.html')) ||
           new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  }
}

/* A script or a stylesheet: current if at all possible. */
async function fresh(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) keep(req, res.clone());
    return res;
  } catch (e) {
    const hit = await caches.match(req);
    if (hit) return hit;
    throw e;                    // let the page see the failure it would have seen
  }
}

/* A picture or a font: what we already have, and quietly fetch a fresh one
   for next time. */
async function quietly(req) {
  const hit = await caches.match(req);
  const spare = fetch(req).then((res) => {
    if (res && res.ok) keep(req, res.clone());
    return res;
  }).catch(() => null);
  return hit || (await spare) ||
         new Response('', { status: 504, statusText: 'Not cached and not reachable' });
}

/* One place that decides what is allowed to be written down. */
function keep(req, res) {
  /* `basic` means same-origin and readable. Anything opaque, redirected or
     partial is left alone. */
  if (!res || res.status !== 200 || res.type !== 'basic') return;
  if ((res.headers.get('cache-control') || '').includes('no-store')) return;
  caches.open(CACHE).then((c) => c.put(req, res)).catch(() => {});
}
