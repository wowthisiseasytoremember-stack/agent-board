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
