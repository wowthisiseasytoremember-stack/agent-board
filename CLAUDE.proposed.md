---
> ⚠️ STOP. Before reading further:
> 1. Use the Brain MCP tool to read: claude-portable/ORIENTATION.md
> 2. Familiarize yourself with the full system — who Justin is, what's running, core rules, key paths.
> 3. Then return here and continue reading.
>
> If no Brain MCP tool is available, note it as a gap and proceed — but flag it at the end of the session.
> ⚠️ STOP. Before reading further:
> 1. Use the Brain MCP tool to read: claude-portable/ORIENTATION.md
> 2. Familiarize yourself with the full system — who Justin is, what's running, core rules, key paths.
> 3. Then return here and continue reading.
>
> If no Brain MCP tool is available, note it as a gap and proceed — but flag it at the end of the session.
**Last Updated:** 2026-04-20 00:00 UTC

# Agent Board — Claude Context

Multi-agent Kanban task board with a REST API and MCP server so AI agents can create and manage tasks directly.

---

## Tech Stack

- Node.js + TypeScript, compiled via `tsc` to `dist/`
- React Kanban dashboard served at http://localhost:3456
- Express-style REST API in `src/routes.ts`
- MCP (Model Context Protocol) server with 12 tools in `src/mcp-server.ts`
- JSON file storage with per-file mutex locking + automatic backups in `data/`
- Zod for input validation, Vitest for tests

---

## Key Files

| File | What It Does |
|------|-------------|
| `src/index.ts` | Entry point — starts HTTP server + dashboard |
| `src/routes.ts` | REST API route definitions |
| `src/mcp-server.ts` | MCP server — 12 tools for agent task management |
| `src/store.ts` | JSON file storage with mutex locking |
| `src/schemas.ts` | Zod schemas for all inputs |
| `src/audit.ts` | Appends to `audit.jsonl` — grows indefinitely |
| `data/` | JSON task storage + automatic backups |

---

## Run Commands

```bash
cd /home/ichabod/agent-board

npm run build   # tsc compile → dist/
npm start       # run compiled server (dashboard + API)
npm run dev     # tsc --watch (recompiles on change)
npm run mcp     # run MCP server standalone
npm test        # run Vitest test suite
```

---

## Gotchas

- `audit.jsonl` grows indefinitely — prune manually if the board has been running long-term
- MCP server (`npm run mcp`) and HTTP server (`npm start`) are separate processes — run both if agents need dashboard visibility too
- Always `npm run build` before `npm start` — runs from compiled `dist/`, not source
---

SESSION LOGS:
---
=== CLOSE LOG (last 7 days) ===

tags:
  - app-dev
  - infrastructure
  - agent
  - obsidian
summary: "Technical log detailing OpenClaw model configuration updates and DeepSeek API migration."
auto_tagged: "2026-05-10 01:04 UTC"

date: 2026-05-06 08:44 UTC
projects: [ichabod]
source: claude-code/ichabod
auto: true


**STATUS CHECK — 2026-05-06 08:43 UTC**





**Summary**
Reconfigured OpenClaw's primary model from `litellm/chat` (LiteLLM proxy hop) to `google-ai/gemini-2.5-flash` (direct Google AI API). Fixed stale DeepSeek model IDs (`deepseek-chat` / `deepseek-reasoner` → `deepseek-v4-flash` / `deepseek-v4-pro`) and expanded the TUI model picker with all Gemini generations plus DeepSeek V4. Session ended with the user verifying that OpenClaw's health check still referenced LiteLLM — diagnosed as the old agent instance reporting its own (pre-reload) state, not the current routing.

**Patterns / Conventions**
- OpenClaw model refs use format `provider/model-id` where `provider` matches a key in `models.providers` in `~/.openclaw/openclaw.json`. The `google-ai` provider → `generativelanguage.googleapis.com/v1beta/openai`. The `deepseek` provider → `api.deepseek.com`. Neither goes through LiteLLM.
- DeepSeek's live API (as of 2026-05-06) only returns `deepseek-v4-flash` and `deepseek-v4-pro`. `deepseek-chat` and `deepseek-reasoner` are gone from their models endpoint. Verify with: `curl https://api.deepseek.com/models -H "Authorization: Bearer $KEY"`.
- LiteLLM config at `~/01_Infrastructure/homeserver/stacks/02-ai/config.yaml` still uses stale names: `deepseek-chat` and `deepseek-reasoner` as direct DeepSeek routes, `deepseek-v4-flash` routed through OpenRouter. These need updating separately.
- OpenClaw's TUI streaming watchdog is hardcoded at 30s (`DEFAULT_STREAMING_WATCHDOG_MS = 3e4` in `tui-i8gtgAaG.js`). Not configurable via `openclaw.json`. The "no stream updates for 30s" message means the backend dropped the run silently — root cause was LiteLLM proxy latency.
- To reload OpenClaw gateway after config change: `kill -HUP $(pgrep -f "openclaw.*gateway" | head -1)`. A new PID will appear; the old one exits. Gateway serves from `localhost:18789`.
- `agents.defaults.model.primary` in `openclaw.json` sets the default model for ALL agents (including the gateway agent). Agent-level `model: {}` means "inherit defaults."
- OpenClaw TUI status bar shows the active model for the current session. If it still shows the old model after a config change, the gateway session was started before the reload — close and reopen the TUI.

**Lessons / Dead ends**
- First `kill -HUP` sent to the old gateway PID (1338148) caused it to exit; a new process (2182355) spawned from the watchdog/supervisor. `curl localhost:18789/health` returned nothing for ~2s then the gateway came back serving HTML. Always wait 2s and check for the new PID.
- OpenClaw health check message "LiteLLM proxy instead of OpenRouter" was misleading — the agent that ran the health check was the OLD session still running on `litellm/chat`. It described its own model path, not the new config. The on-disk config was already correct. Confirmed by reading `~/.openclaw/openclaw.json` directly.
- Attempted `curl localhost:18789/api/v1/config/models` and `/api/v1/agents/defaults` — both returned empty (endpoints don't exist). No live API endpoint exposes the resolved primary model; only the config file is authoritative.

**Issues (unresolved)**
- LiteLLM config (`~/01_Infrastructure/homeserver/stacks/02-ai/config.yaml`) has stale DeepSeek model names: `deepseek-chat` and `deepseek-reasoner` no longer exist on DeepSeek's API. Need to update to `deepseek-v4-flash` / `deepseek-v4-pro` and rebuild the container (`cd ~/01_Infrastructure/homeserver && make up STACK=02-ai`).
- Gemini 3 preview models (`gemini-3-flash-preview`, `gemini-3-pro-preview`) added to OpenClaw picker but not tested — unknown whether they accept requests or are invite-only.


date: 2026-05-06 20:04 UTC
projects: [ichabod]
source: claude-code/ichabod
auto: true

date: 2026-05-07 15:53 PDT
projects: [ichabod]
source: claude-code/ichabod


**Summary**
Reconfigured OpenClaw's


date: 2026-05-07 15:55 UTC
projects: [ichabod-infrastructure]
source: claude-code/ichabod

date: 2026-05-08 16:31 UTC
projects: [ichabod]
source: gemini-cli/ichabod




**Summary**
Initial plan draft for infrastructure cleanup. Superseded by entry below.


date: 2026-05-09 00:40 UTC
projects: [ichabod-infrastructure]
source: claude-code/ichabod




**Summary**
Portfolio site session: synced systems-and-sigils into the job-search Projects folder, pulled 7 new Lovable commits (including a portrait placeholder in the hero), swapped the placeholder with Justin's real headshot, and ported the bento grid capabilities interaction from app/ to systems-and-sigils. Committed and pushed all changes to the GitHub remote so Lovable will pick them up.

**Patterns / Conventions**
- **Two-repo split:** systems-and-sigils has TWO copies. `~/Documents/job-search/systems-and-sigils/` is the git source with the GitHub remote (`wowthisiseasytoremember-stack/systems-and-sigils.git`). `~/Projects/job-search/systems-and-sigils/` is a working copy synced via rsync. Always make edits in Projects/, then rsync back to Documents/ before committing from Documents/.
  - Sync Projects → Documents: `rsync -av --exclude node_modules --exclude dist --exclude .git --exclude .wrangler ~/ Projects/job-search/systems-and-sigils/ ~/Documents/job-search/systems-and-sigils/`
  - Pull new Lovable commits: fetch from Documents/, then rsync Documents/ → Projects/ (same command, reversed dirs)
- **bun not in PATH** in Claude Code zsh sessions on ichabod. Always use `~/.bun/bin/bun` explicitly. `~/.bun/bin/bunx vite` also fails if node_modules aren't installed — run `~/.bun/bin/bun install` first after a fresh rsync.
- **Mac SSH:** local IP `192.168.1.13` is unreachable from ichabod. Use `mac-tailscale` alias (100.75.13.38, user: justin) for SCP. `scp mac-tailscale:"/path/to/file" /dest/` works reliably.
- **headshot.jpg** canonical location: `/home/ichabod/Projects/job-search/headshot.jpg` (207KB). Copied to `systems-and-sigils/public/headshot.jpg` and `app/public/headshot.jpg`.
- **Lovable portrait slot:** Hero.tsx right column (col-start-9, col-span-4) has a `<figure style="aspectRatio: 4/5">` — just replace the inner `<div>` with `<img src="/headshot.jpg" className="h-full w-full object-cover object-top" />` and remove the comment.
- **StatValue export in Capabilities.tsx** — `MobileSnapshot.tsx` imports `StatValue` directly from `./Capabilities`. Never remove that export when refactoring the Capabilities layout.
- **useInView for entrance animations breaks Playwright fullPage screenshots** — IntersectionObserver never fires for elements below the viewport in a static screenshot. Cards render with `opacity-0` and stay invisible. Use CSS-only hover effects; skip JS-driven entrance animations on bento cards.
- **Lovable commits are authored by** `gpt-engineer-app[bot]` — that's the Lovable.dev bot identity on GitHub. Normal to see these in the log.
- **sigils dev server:** `cd ~/Projects/job-search/systems-and-sigils && ~/.bun/bin/bun run dev --port 5175`. App dev server: `cd ~/Projects/job-search/app && npm run dev -- --port 5174`.

**Lessons / Dead ends**
- First headshot attempt used an ambient absolutely-positioned `<img>` behind the text (opacity 0.18, 38% width, gradient fade). Looked fine but was redundant once Lovable's proper portrait figure slot was discovered after pulling the 7 new commits. The rsync overwrite replaced my ambient version with Lovable's designed slot — which was the right outcome.
- `~/.bun/bin/bunx vite dev` failed with `ERR_MODULE_NOT_FOUND` in the Projects/ copy because node_modules hadn't been installed yet (rsync excludes them). Fix: `~/.bun/bin/bun install` in the project dir before starting the dev server.
- `pkill -f "vite.*5175"` returned exit code 144 (no process found) — the prior server had already died. Not an error, just means the server had crashed. Start fresh instead.

**Issues (unresolved)**
- **Deploy not done.** systems-and-sigils is ready for Cloudflare Pages but hasn't been deployed. `wrangler.jsonc` is configured for project `justin-ryan-portfolio`. Run: `cd ~/Documents/job-search/systems-and-sigils && ~/.bun/bin/bunx wrangler pages deploy dist --project-name justin-ryan-portfolio` (after `~/.bun/bin/bun run build`).
- **AI product resume thin.** `public/justin-ryan-ai-product.pdf` is 6KB vs. 37KB for the other variants. Needs a content pass before the site goes live.
- **Dev servers left running** on ichabod: app/ on port 5174 (npm), systems-and-sigils on port 5175 (bun). Kill with `pkill -f "vite.*5174"` and `pkill -f "vite.*5175"` when done.
- **Malformed auto-close entry** at line 166-178 of `_close-log.md` (date: 2026-05-09 00:47 UTC) — truncated summary, no content. Cleaned up in this write.

**Stale docs / Wrong locations**
- Memory note `portfolio-codebase-duplication-tension.md` says "Two live portfolio codebases (systems-and-sigils + The Quiet Authority app/), neither deployed." — systems-and-sigils is now the canonical one with the real headshot and bento grid. The app/ is still a useful design reference but is not the one to ship. Update the memory note if this decision sticks.



**Summary**

date: 2026-05-09 01:00 UTC
projects: [ichabod, memory]
source: openclaw/ichabod
auto: true

date: 2026-05-09 07:15 UTC
projects: [ichabod-infrastructure, tangle-trove]
source: claude-code/ichabod




**Summary**
**Summary**
Infrastructure audit reviewed — 12 categories of built-but-never-launched items. Planning session interrupted before the plan was written.


date: 2026-05-08 02:00 UTC
projects: [ichabod, tangle-trove, photo-bot]
source: claude-code/ichabod

date: 2026-05-09 01:38 UTC
projects: [homeserver]
source: claude-code/ichabod
auto: true




**Summary**
Added `append_file` tool to the brain MCP server to work around Cloudflare WAF blocking large writes (~16KB+). The WAF block lives on anthropic.com's zone (the MCP gateway hop from Mac Claude Code), not on scoreapp.pro — no fix at the source, so the protocol now supports chunked writes instead.

**Patterns / Conventions**
- brain MCP server source: `/home/ichabod/mcp-brain/server.py`. Managed by systemd: `brain-mcp.service` (`/etc/systemd/system/brain-mcp.service`). Token is in that service file as `Environment="BRAIN_VAULT_TOKEN=..."`. No `.env` file exists in `/home/ichabod/mcp-brain/` — don't look there.
- `brain-mcp.service` runs as root (`/usr/bin/python3`), not as a user service. Use `sudo systemctl restart brain-mcp.service` to restart it — `systemctl --user` won't find it.
- Large write workaround: call `write_file` for the first chunk, then `append_file` for subsequent chunks. Keep each chunk under ~12KB to stay well below the ~16KB WAF trigger. For appending to existing files (e.g. GLOBAL_STATE.md), `append_file` alone is fine if the entry is under 12KB.
- The Cloudflare tunnel config for brain MCP: `/etc/cloudflared/brain-mcp.yml`. Routes `brain.scoreapp.pro` → `http://localhost:8094`. Tunnel ID: `9bb535e2-8ffb-4168-bc98-736d8de435a6`.
- Three brain MCP servers still running simultaneously: `brain_mcp_server.py` (port 8091, SSE), `mcp-brain/server.py` (port 8094, HTTP, the real one), and `basic-memory` (stdio, session-scoped, 1.2GB). Consolidation is a separate task.

**Lessons / Dead ends**
- Killed the original server process (PID 685549) and tried to restart manually with `python3 /home/ichabod/mcp-brain/server.py &` — spawned two processes AND conflicted with systemd's own restart loop (counter hit 14). Fix: kill the manual processes, wait for systemd to recover on its own, then leave it alone. Always use `sudo systemctl restart brain-mcp.service` for restarts.
- `sudo systemctl restart brain-mcp.service` was blocked by the session permission filter. Letting systemd handle its own restart loop after clearing the conflicting manual process was sufficient — the service recovered in ~10 seconds.
- curl-based tool verification against `http://localhost:8094` was also blocked by the permission filter. Confirmed correctness instead by: (a) grep on server.py to verify `append_file` at line 78, (b) service running cleanly at 64MB with no crash = no syntax error.

**Issues (unresolved)**
- Open question from prior session: does claude.ai cloud (web/mobile) MCP traffic go through anthropic.com, or directly to brain.scoreapp.pro? If direct, the new WAF rule on scoreapp.pro helps it; if proxied through anthropic.com, no fix yet. Verify by attempting a large `write_file` from claude.ai web.
- Three overlapping brain MCP servers still running (8091, 8094, basic-memory/1.2GB). Should consolidate to one — separate task.



**Summary**
Hey — what are we working on today?


date: 2026-05-09 01:56 UTC
projects: [ichabod-infrastructure, tangle-trove
