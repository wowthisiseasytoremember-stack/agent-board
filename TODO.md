# Agent Board — Task & Plan Tracking

**Last Updated:** 2026-08-13 03:50 UTC
**Status:** active

---

## Active & Upcoming Tasks

- [ ] **Audit Trail Rotation**: Add log rotation / auto-pruning for `data/audit.jsonl` to prevent unbounded log growth.
- [ ] **Custom Branding Options**: Add options for `clientViewEnabled` custom dashboard headers and white-labeling.
- [ ] **Configurable Audit Path**: Expose a CLI flag / env var for custom audit file locations.
- [ ] **Framework Integration Tests**: Add integration tests verifying MCP tool calls under newer agent runners.

---

## Completed Milestones

- [x] **Core Multi-Agent Board**: REST API, MCP server (14 tools), Kanban UI, JSON store with mutex locking.
- [x] **DAG Dependencies & Cycle Detection**: Enforced task prerequisite checking before moving to `doing`.
- [x] **Auto-Retry Engine**: Automatic task retry logic with max-attempts and system comment tracking.
- [x] **HMAC-SHA256 Signed Webhooks**: Cryptographic webhook signature header (`X-AgentBoard-Signature`) for OpenClaw.
- [x] **Comprehensive Test Suite**: Vitest suite with 107 passing tests (`store.test.ts`, `api.test.ts`).
- [x] **Agent Docs & Ecosystem Scaffolding**: Integrated `AGENTS.md` and `TODO.md` via `project-init`.
