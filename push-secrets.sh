#!/usr/bin/env bash
# =============================================================================
#  Put the secrets on the right Workers, reading them from the environment.
# =============================================================================
#  THE VALUES ARE NEVER WRITTEN DOWN HERE. Each one is read from an environment
#  variable and piped straight into wrangler, so nothing is echoed, nothing is
#  stored in a file, and nothing lands in a transcript or a shell history.
#
#  THREE WORKERS, AND THEY ARE NOT INTERCHANGEABLE. This is the mistake that
#  made every AI feature answer 500 once already, so the worker name is on
#  every line rather than taken from whichever directory this is run in:
#
#      novaclip-ai       GEMINI_API_KEY
#      novaclip-server   the DB KV binding        (accounts, scores, email)
#      novaclip-pay      STRIPE_SECRET_KEY        (checkout)
#
#  Run it from anywhere. Safe to re-run: putting a secret again replaces it.
#  Anything missing from the environment is skipped and named at the end, so a
#  half-filled environment does a half-deploy rather than failing at line one.
#
#  -----------------------------------------------------------------------
#  THE ORDER, BECAUSE IT IS NOT THE ORDER YOU WOULD GUESS
#  -----------------------------------------------------------------------
#  A secret cannot be put on a worker that does not exist yet, and the Stripe
#  webhook cannot be created until the worker has a URL. So:
#
#    1  CLOUDFLARE_API_TOKEN in the environment. A change to it is picked up
#       by the session that is already running — this was first written here
#       as "start a new session", which was wrong, and measured to be wrong:
#       a replaced token was visible immediately. If a value does read as
#       stale, a new session is the thing to try, not the thing to do first.
#    2  wrangler deploy -c wrangler.pay.toml        (creates novaclip-pay)
#    3  this script                                 (puts STRIPE_SECRET_KEY on it)
#    4  take the worker's URL to the Stripe dashboard, add a webhook at
#       <url>/webhook for checkout.session.completed and
#       customer.subscription.deleted. Stripe shows the signing secret ONCE.
#    5  that secret into the environment as STRIPE_WEBHOOK_SECRET, then run
#       this script again — step 3 and this one are the same command.
#
#  Checking it worked, without printing any value:
#    curl -s https://<the pay worker>/health
#  configured:true, webhook:true, mode:"test" or "live", keyKind:"restricted".
# =============================================================================
set -u
set -o pipefail

AI_WORKER="${AI_WORKER:-novaclip-ai}"
SERVER_WORKER="${SERVER_WORKER:-novaclip-server}"
PAY_WORKER="${PAY_WORKER:-novaclip-pay}"

skipped=()
done_=()

#  WHAT EACH SECRET HAS TO LOOK LIKE, CHECKED BEFORE IT IS STORED.
#
#  Twice now a placeholder has been saved into the environment verbatim —
#  `<the Cloudflare token>`, then `<the Stripe key>` — because that is how the
#  setup instructions wrote them. Both are non-empty, so an emptiness check
#  passes both, and the second one travelled all the way onto a live worker
#  and sat there reporting configured:true. The first anybody would have known
#  was a parent pressing Pay and getting a Stripe 401.
#
#  A wrong value is cheap to fix here and expensive to fix once stored, so the
#  shape is checked on this side of the wire. Anything with angle brackets or
#  whitespace is a placeholder, whatever else it is. Beyond that, the formats
#  that are documented and stable are asserted; the rest are only checked for
#  being placeholder-shaped, because inventing a pattern for a value whose
#  format is not published is how a correct secret gets rejected.
shape_of() {
  case "$1" in
    STRIPE_SECRET_KEY)     echo '^[sr]k_(test|live)_[A-Za-z0-9]' ;;
    STRIPE_WEBHOOK_SECRET) echo '^whsec_[A-Za-z0-9]' ;;
    MAIL_FROM)             echo '@' ;;
    COIN_LINKS)            echo '^\{' ;;
    *)                     echo '' ;;
  esac
}

# put <worker> <secret-name> <env-var-name>
put() {
  local worker="$1" name="$2" var="$3" val="${!3:-}"
  if [ -z "$val" ]; then
    skipped+=("$name  (env var \$$var is not set)")
    return 0
  fi

  #  A placeholder, in any variable. This is the check that was missing.
  #
  #  MAIL_FROM is the one exception and it is not a quibble: a sender is
  #  written `NovaClip <noreply@novaclip.org>`, which is angle brackets AND a
  #  space, so the placeholder rule would reject the single correct form of
  #  the only value here that is supposed to look like that. Its own check
  #  below — it must contain an address — is what catches a placeholder for
  #  it, since `<your sender>` has no @ in it.
  if [ "$name" != "MAIL_FROM" ] && printf '%s' "$val" | grep -qE '[<>]|[[:space:]]'; then
    skipped+=("$name  (looks like a placeholder — it has angle brackets or spaces. \
Replace \$$var in the environment settings with the real value.)")
    return 0
  fi

  local want; want="$(shape_of "$name")"
  if [ -n "$want" ] && ! printf '%s' "$val" | grep -qE "$want"; then
    case "$name" in
      STRIPE_SECRET_KEY)     skipped+=("$name  (not a Stripe key — a real one starts sk_ or rk_ then test_ or live_)") ;;
      STRIPE_WEBHOOK_SECRET) skipped+=("$name  (not a signing secret — Stripe's start whsec_)") ;;
      MAIL_FROM)             skipped+=("$name  (should contain an address, e.g. NovaClip <noreply@novaclip.org>)") ;;
      COIN_LINKS)            skipped+=("$name  (should be JSON, e.g. {\"c300\":\"https://…\"})") ;;
    esac
    return 0
  fi
  # --- the only line that touches the value, and it goes to a pipe ----------
  if printf '%s' "$val" | wrangler secret put "$name" --name "$worker" >/dev/null 2>&1; then
    done_+=("$name -> $worker")
  else
    skipped+=("$name  (wrangler refused — is $worker deployed, and is the token allowed to edit it?)")
  fi
}

echo "Checking the token first, so a bad one fails here and not halfway through."

#  THREE CHECKS, BECAUSE A TOKEN FAILS IN THREE DIFFERENT WAYS AND THEY LOOK
#  NOTHING ALIKE FROM DOWN HERE.
#
#    missing    — nothing in the environment
#    a placeholder — the instructions said `<the Cloudflare token>` and that is
#                  what got saved, angle brackets and all. It is 55 characters
#                  of perfectly ordinary text, so every length or emptiness
#                  check passes and Cloudflare answers 6111, "invalid format
#                  for Authorization header", nine times in a row.
#    real but wrong — right shape, lacks Workers Scripts: Edit, or expired.
#
#  The first version of this guard asked `wrangler whoami` and looked for the
#  words "not authenticated". That caught the first case only: a malformed
#  token fails on the wire, with a different message, so the guard passed it
#  through and let all nine secrets fail one at a time — which reads as nine
#  broken workers rather than one bad string.
#
#  So: shape first, locally, because that is where a pasted placeholder dies;
#  then ask Cloudflare, which is the only thing that can tell real from wrong.
#  The token is never printed, only described.

tok="${CLOUDFLARE_API_TOKEN:-}"

if [ -z "$tok" ]; then
  echo "  CLOUDFLARE_API_TOKEN is not set in this session." >&2
  echo "  Add it in the environment settings, then start a NEW session —" >&2
  echo "  a session only ever sees the variables that existed when it began." >&2
  exit 1
fi

if printf '%s' "$tok" | grep -qE '[<>[:space:]]'; then
  echo "  CLOUDFLARE_API_TOKEN looks like a placeholder, not a token." >&2
  echo "  It contains angle brackets or spaces; a real one has neither." >&2
  echo "  A Cloudflare API token is about 40 characters of letters, digits," >&2
  echo "  underscores and dashes. If the stored value still reads like" >&2
  echo "  <the Cloudflare token>, that literal text was saved by mistake." >&2
  exit 1
fi

#  Ask Cloudflare itself. /user/tokens/verify is the endpoint whose entire job
#  is this question, it needs no account id, and it works for any token.
ver="$(curl -s --max-time 20 \
        -H "Authorization: Bearer $tok" \
        https://api.cloudflare.com/client/v4/user/tokens/verify 2>/dev/null)"

if ! printf '%s' "$ver" | grep -q '"success":true'; then
  echo "  Cloudflare rejected the token." >&2
  #  Its own words, which name the problem better than any guess here. The
  #  reply describes the token; it never contains it.
  printf '%s' "$ver" | grep -oE '"(code|message)":[^,}]*' | head -4 | sed 's/^/    /' >&2
  echo "  The token needs Workers Scripts: Edit — the 'Edit Cloudflare Workers'" >&2
  echo "  template covers it. Replace it in the environment settings and start" >&2
  echo "  a new session." >&2
  exit 1
fi
echo "  token is valid and active"
echo

#  Checkout.
put "$PAY_WORKER"    STRIPE_SECRET_KEY     STRIPE_SECRET_KEY
put "$PAY_WORKER"    STRIPE_WEBHOOK_SECRET STRIPE_WEBHOOK_SECRET

#  Parent email confirmation. On the SERVER worker, not the pay one: the
#  Family Dashboard is an accounts feature and the code that sends the code
#  lives in leaderboard-worker.js.
put "$SERVER_WORKER" MAIL_KEY              MAIL_KEY
put "$SERVER_WORKER" MAIL_FROM             MAIL_FROM
put "$SERVER_WORKER" MAIL_PROVIDER         MAIL_PROVIDER
put "$SERVER_WORKER" COIN_LINKS            COIN_LINKS
put "$SERVER_WORKER" AGE_PROVIDER          AGE_PROVIDER
put "$SERVER_WORKER" AGE_SECRET            AGE_SECRET

#  Gemini. Its own worker, and nothing else's.
put "$AI_WORKER"     GEMINI_API_KEY        GEMINI_API_KEY

echo "Set:"
if [ ${#done_[@]} -eq 0 ]; then echo "  (nothing)"; else printf '  %s\n' "${done_[@]}"; fi
echo
echo "Skipped:"
if [ ${#skipped[@]} -eq 0 ]; then echo "  (nothing)"; else printf '  %s\n' "${skipped[@]}"; fi
echo
echo "Now check what each worker reports, which says what is live without"
echo "showing any value:"
echo "  curl -s https://novaclip-server.eskondori-pt.workers.dev/health"
echo "  curl -s https://<the pay worker>/health"
