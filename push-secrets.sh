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
#    1  CLOUDFLARE_API_TOKEN in the environment, then a NEW session — an
#       existing one does not pick up a variable added after it started.
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

# put <worker> <secret-name> <env-var-name>
put() {
  local worker="$1" name="$2" var="$3" val="${!3:-}"
  if [ -z "$val" ]; then
    skipped+=("$name  (env var \$$var is not set)")
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
#  READ THE WORDS, NOT THE EXIT CODE. `wrangler whoami` exits 0 whether or not
#  there is a token — measured, with no token set, it prints "You are not
#  authenticated" and still returns 0. Guarding on $? therefore passed cleanly
#  with no credential at all and left every line below to fail one at a time,
#  which reads as nine broken workers rather than one missing token.
who="$(wrangler whoami 2>&1 | sed 's/\x1b\[[0-9;]*m//g')"
if printf '%s' "$who" | grep -qi "not authenticated"; then
  echo "  no token. Add CLOUDFLARE_API_TOKEN to the environment's secrets," >&2
  echo "  then start a NEW session — an existing one does not pick it up." >&2
  exit 1
fi
printf '%s\n' "$who" | grep -iE "account|email" | head -2 | sed 's/^/  /'
echo "  ok"
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
