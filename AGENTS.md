---
schema: agents-md/v1

project: agent-board
initiative: agent-infra
family: hermes

what: >-
  A task board that AI agents can drive themselves. Tasks live in JSON files
  with mutex-locked writes and automatic backups, and are reachable three ways:
  a Kanban web dashboard for humans, a REST API, and an MCP server exposing the
  board as tools. Supports DAG dependencies between tasks, auto-retry, and an
  append-only audit trail.

stack: [typescript, node, mcp, zod, vitest]

entrypoints:
  - src/index.ts
  - src/mcp-server.ts

modules:
  - name: REST API
    path: src/routes.ts
    does: HTTP endpoints for creating, claiming, and moving tasks.
  - name: MCP server
    path: src/mcp-server.ts
    does: Exposes the board to agents as MCP tools.
  - name: Store
    path: src/store.ts
    does: JSON file persistence with per-file locking and backups.
  - name: Audit trail
    path: src/audit.ts
    does: Records every state transition.
  - name: Kanban dashboard
    path: dashboard
    does: Browser UI for watching and moving agent tasks.

updated: 2026-08-13 03:50 UTC
---

**Last Updated:** 2026-08-13 03:50 UTC

# Agent Board — Operating Guide

Multi-agent Kanban task board with a REST API and MCP server so AI agents can create and manage tasks directly.

---

## Technical Architecture

- **Stack**: Node.js + TypeScript (`tsc` -> `dist/`)
- **Dashboard**: Web UI served at `http://localhost:3456`
- **REST API**: Express-style router in `src/routes.ts`
- **MCP Server**: Model Context Protocol server exposing tools in `src/mcp-server.ts`
- **Storage**: File-backed JSON store in `data/` with async per-file mutex locking and auto-backups (`src/store.ts`)
- **Validation & Testing**: Zod schemas (`src/schemas.ts`), Vitest test suite (`tests/`)

---

## Directory & Key Files

| File/Path | Purpose |
|---|---|
| `src/index.ts` | Server entrypoint (HTTP server + dashboard) |
| `src/routes.ts` | REST API routes for tasks, projects, audit log |
| `src/mcp-server.ts` | MCP server entrypoint with tool definitions |
| `src/store.ts` | JSON file store with mutex locks and backups |
| `src/schemas.ts` | Zod validation schemas for API & MCP |
| `src/audit.ts` | Append-only audit logger (`data/audit.jsonl`) |
| `data/` | JSON state (`tasks.json`, `projects.json`, `agents.json`) + `backups/` |
| `dashboard/` | Browser Kanban interface |

---

## Verified Run Commands

```bash
cd /home/ichabod/Projects/agent-board

npm run build   # tsc compile -> dist/
npm start       # Run compiled HTTP server (dashboard + API on port 3456)
npm run dev     # tsc --watch (recompile on change)
npm run mcp     # Run standalone MCP server
npm test        # Run Vitest test suite (vitest run)
```

---

## Current State

Project core architecture, REST API, MCP tools, DAG dependencies, auto-retry, and Vitest test suite (107 passing tests) are fully operational. Active tasks and backlog items are managed in [`TODO.md`](./TODO.md). Latest session closeout logged on 2026-06-16 (free-agent-plan-execution integration).

---

## Real Pitfalls & Gotchas

- **Separate Processes**: `npm run mcp` (MCP server) and `npm start` (HTTP server) are separate processes. Launch both if agents require dashboard visibility and MCP tools.
- **Build Before Start**: `npm start` runs compiled JS from `dist/`. Always run `npm run build` after editing TypeScript source.
- **Audit Log Growth**: `data/audit.jsonl` grows indefinitely with every task state change; prune manually if running long-term.

---

## Hardening Rules

- **Closeout Sync (inviolable):** Always write per-session closeout entries using `~/.hermes/scripts/write-closeout.py` to update `~/brain/memory/ichabod/_close-log.jsonl`.
