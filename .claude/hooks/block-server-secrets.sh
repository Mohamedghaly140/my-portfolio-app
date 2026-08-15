#!/usr/bin/env bash
# PreToolUse guard for Write|Edit.
#
# CLAUDE.md invariant: only EXPO_PUBLIC_* variables belong in this repo. Everything
# shipped in an Expo bundle is readable by anyone with the app, so the web repo's
# server secrets must never land here in any form.
#
# Blocks two shapes:
#   1. a known server-secret variable assigned a non-empty value
#   2. a value that is self-evidently a live credential (API key, DSN, PEM block)
#
# Bare mentions of the names are deliberately allowed — docs/00-roadmap.md and
# CLAUDE.md both list them as prose, and blocking those would make the plan
# uneditable.
set -euo pipefail

SECRET_VARS='DATABASE_URL|DIRECT_URL|OPENAI_API_KEY|APP_SESSION_SECRET|AUTH_SECRET|AUTH_GITHUB_ID|AUTH_GITHUB_SECRET|RESEND_API_KEY|ADMIN_ALLOWLIST|WEB_BOT_AUTH_PRIVATE_KEY[A-Z_]*'

# Assignment carrying a real value: NAME= or NAME: followed by something that is
# not whitespace, a quote-terminator, or a <placeholder>.
ASSIGNMENT="(^|[^A-Z_])(${SECRET_VARS})[[:space:]]*[=:][[:space:]]*[\"']?[^[:space:]\"'<]"

# Credential-shaped literals, regardless of the variable they are bound to.
LITERALS='sk-[A-Za-z0-9_-]{20,}|re_[A-Za-z0-9_-]{20,}|postgres(ql)?://[^[:space:]/]+:[^[:space:]@]+@|-----BEGIN [A-Z ]*PRIVATE KEY-----'

payload="$(cat)"

text="$(printf '%s' "$payload" | jq -r '
  [ .tool_input.content?, .tool_input.new_string?, .tool_input.file_text? ]
  | map(select(type == "string")) | join("\n")
')"

[ -n "$text" ] || exit 0

if printf '%s' "$text" | grep -qE "$ASSIGNMENT" || printf '%s' "$text" | grep -qE "$LITERALS"; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Blocked: this write carries a server secret. Only EXPO_PUBLIC_* variables belong in this repo (CLAUDE.md § Environment) — DATABASE_URL, OPENAI_API_KEY, APP_SESSION_SECRET, AUTH_SECRET, RESEND_API_KEY and friends live in the web repo only. Anything in an Expo bundle is readable by anyone with the app."
    }
  }'
fi

exit 0
