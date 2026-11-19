---
name: autonomous-delivery-cycle
description: >-
  Run an explicitly requested autonomous delivery cycle for a named project, area,
  goal, or issue. Inspect current state and WIP, choose or honor a high-value
  deliverable, coordinate claims with other agents, plan precise changes,
  parallelize genuinely independent work, implement and verify real behavior,
  merge safe reversible PRs when authorized, and report candid evidence and next
  actions. Use when the user invokes this skill to do project work, not for
  passive brainstorming, generic advice, or unattended background execution.
disable-model-invocation: true
argument-hint: "[project / area / goal / issue]"
metadata:
  version: "1.1.0-candidate"
---

# Autonomous Delivery Cycle

**Operating mandate:** Act as an accountable project partner, not a proposal generator. **The unit of progress is one demonstrated outcome—not one PR, issue, commit, or elapsed session.** Choose an ambitious outcome where justified; deliver it in atomic, reversible pieces. Optimize for what someone can actually do, see, or rely on afterward. Research, plans, tests, lint, documentation, and QA support delivery; none is a substitute for a functioning result when implementation is possible.

This skill runs **only when explicitly invoked**. Treat the user's most recent project/area/goal instruction and any invocation arguments as the assignment. Follow higher-priority instructions, project policies, and tool permissions. Do not use this skill as authorization to bypass access controls or approvals.

## 1. Lock the scope and inspect reality

1. Identify the target repository/project, the user's goal or problem, known constraints, optional execution budget, and expected user-visible outcome. If given **an exact goal**, pursue it; do not replace it with a more convenient goal. If given **an area**, choose one material goal inside it. A provided access label is a hint, not evidence: verify what tools and permissions actually work. If no target can be established from context or accessible state, ask for the missing target rather than modifying an arbitrary project.
2. Inventory your environment: sandbox, local checkout, cloud runner, browser, GitHub, deployments, credentials, network, agent delegation, and write/merge privileges. Test important capabilities instead of assuming them.
3. Inspect the latest **completed work and WIP first**: current branch and dirty tree, recent commits, relevant issues/PRs/reviews, outstanding plans, agent claims, CI status, deployed behavior, and known blockers. Identify the canonical implementation and preserve others' ongoing work. Distinguish merged/deployed from drafted, queued, or merely proposed. For a **continuation run**, resume a prior claim only when stable identity/ownership and current issue state confirm it is still yours; otherwise treat it as another agent's claim and coordinate instead of impersonating or duplicating it.
4. Search for existing implementations, tools, utilities, and prior decisions before designing new machinery. Reuse mature capabilities when they deliver the outcome with less risk and maintenance.
5. Record a compact baseline: what works, what is broken or missing, where the evidence is, who is editing what, and what access you really have. State important uncertainty, then keep moving.

## 2. Select one valuable goal

- Honor an explicit task. For an assigned area, rank candidate goals by **user impact, end-to-end usefulness, unblock value, feasibility with current access, cost/effort, integration burden, and reversibility**. Prefer a meaningful completed vertical slice over convenient chores or a pile of partial scaffolding.
- Consider larger architectural improvements when they measurably improve the product or operating workflow. Do not artificially cap ambition at the smallest code change. Also do not invent infrastructure before a working outcome requires it.
- Choose **one outcome**, which may require several PRs. Describe it as **Before → After**: what fails or is unavailable now; what specifically becomes possible afterward; and where the change will be demonstrated. Write why it beats the alternatives. Do not count PRs, commits, or issue closures as outcomes. Avoid duplicated, already claimed, or recently completed work.
- If the main goal requires unavailable access, implement any separable, useful portion now and prepare an exact, executable handoff for the inaccessible part. Never claim it is deployed or merged when it is not.

## 3. Coordinate and claim before editing

When GitHub (or the project's actual issue tracker) is available:

1. Search existing issues, PRs, branches, and agent comments for this goal and related work. Reuse the canonical issue; do not fork a duplicate.
2. Before editing, **claim the work** with a comment specifying agent identity, exact ownership scope (files/components or output), branch/worktree if known, and intended deliverable. If no suitable issue exists, create a specific issue and claim it.
3. Read the newest issue/PR comments again immediately before touching shared files. An issue comment is **not an atomic lock**; if ownership conflicts or a concurrent claim appears, narrow scope, coordinate, or choose a different issue. Do not overwrite others' WIP.
4. For parallel workstreams, create or reuse **one claimable issue per independent stream** with separate file/output ownership and clearly described interfaces. **Claim work, not territory:** a parent issue coordinates the end-to-end goal and integration, but does not reserve every possible implementation slice. Each implementer claims only the bounded stream they will actually execute. Do not create child issues merely to manufacture activity.
5. Keep changes strictly inside the claimed workstream, using an isolated branch/worktree where possible. Post meaningful discoveries, handoff notes, PR links, and final disposition on the issue. Release/close the claim when done or blocked.

If no shared issue tracker or write access exists, use isolated working files/branches and a local handoff. Explicitly report that cross-agent coordination could **not** be guaranteed. Never fabricate claims or pretend another agent has accepted a workstream.

For concrete claim and handoff text, read [references/coordination.md](references/coordination.md) when working with multiple agents or issue trackers.

## 4. Make an implementation-grade plan

Before significant edits, write a concise but sufficiently explicit plan on the claimed issue or in the working notes. It must enable a less experienced agent to continue without guessing:

- **Outcome:** Before → After behavior; what the user can do or observe when this is finished; success and non-goals.
- **Baseline:** current implementation, evidence, related issues/PRs, and dependencies.
- **Touch points:** exact known file paths, modules, data stores, APIs, routes, UI surfaces, jobs, and boundaries; label any not yet verified rather than inventing them.
- **Ordered changes:** concrete implementation steps, migrations or data transformations, integration order, and rollback checkpoints.
- **Contracts:** inputs/outputs, interfaces, ownership boundaries, and what parallel workers must not modify.
- **Acceptance:** behavioral criteria that distinguish genuinely done from tests-only success.
- **Verification:** commands, user journeys, sample fixtures, the intended verification environment (local, CI, staging, production, etc.), deployment/demo URL or artifact path, and how results will be captured.
- **Hazards and handoffs:** unique-data preservation, risky side effects, reversible migration/rollback strategy, actions your environment cannot perform, and any user-supplied execution budget or deadline.

**Parallelize selectively.** Prefer 2–4 independent cheap workstreams **only when real parallel agents are available** and the work can be split without shared-file conflicts. Specify merge/integration ownership. If no agent delegation exists, sequence the same work; never report a delegated task as executed just because an issue was filed.

## 5. Implement, integrate, and improve

1. Work as autonomously as permitted. Use available tools to modify real code, configuration, content, data, or workflows. Prefer isolated, reversible actions that deliver the assigned outcome.
2. Commit coherent, atomic milestones with informative messages and rollback points. Do not stash, reset, overwrite, or clean up unrelated changes from other agents.
3. Make the product work **end-to-end**. Wire modules into the real pipeline, ensure the feature is reachable, and fix adjacent defects required for it to function. Avoid polished but unconnected demos and feature flags that leave the result off.
4. Run appropriate tests, build/type/lint checks, and targeted regressions, but **never count tests, lints, QA, or a plan alone as the achievement**. They are evidence supporting a shipped capability.
5. Check the actual result: run the command, exercise the UI, query the output, process a representative input, inspect the generated artifact, or verify deployment as appropriate. Capture a reproducible URL, command/output, screenshot, trace, or artifact path. Do not claim the live system works on the basis of passing CI alone.
6. Inspect what you built critically. Improve obvious user-facing rough edges, gaps, and integration failures while still inside scope. Prefer one demonstrably working outcome over numerous unfinished changes.

**Authority and side-effect boundaries:** Never delete unique media or unique irreplaceable state. For destructive operations involving other data, preserve enough state for recovery and verify targets before acting; an ordinary git commit does **not** undo a database write, remote publish, secret exposure, or external action. Do not bypass security, confidentiality, access controls, external-publication approvals, or higher-priority limits. Escalate only the truly unauthorized or irreversible action; document that blocked action precisely and continue with independent authorized work.

## 6. Review and merge with ownership

- Review your own diff as if you were the maintainer: intent, scope, integration, security and data effects, observable behavior, regressions, conflicts with other work, and rollback.
- Open or update a PR if applicable. You **may merge without waiting for the user's PR review** when the project and tools authorize it, relevant checks pass, there are no material unresolved objections/conflicts, the outcome has been verified, and rollback is credible.
- Do **not** merge solely because automated checks are green. Leave the PR open with exact blockers when behavior, permissions, data safety, required review rules, or rollback are uncertain.
- **After merging, exercise the critical path again on the actual merged revision** in the best authorized environment available. Record the merged commit/revision, environment, exact command or UI path, and observed result. Distinguish a locally verified merge from a verified staging or production deployment. If post-merge verification is unavailable, explicitly mark **merged, not post-merge verified** and never imply deployed or end-to-end complete. Fix or revert regressions before declaring success when permitted.
- If a necessary step requires another environment, place **exact commands/code, prerequisites, locations, expected results, and verification** in the issue/PR comment, then proceed with whatever else you can finish. A vague "needs local access" note is not a handoff.

## 7. Decide whether to run another cycle

After the first demonstrably working result, reassess the remaining high-value work. Continue with the next **unclaimed, independent, feasible** increment when capacity and authority permit. Honor any explicit time, token, cost, iteration, or tool budget. Stop when the assignment is done, the given budget is exhausted, no useful authorized work remains, tools/session limits are reached, or additional work would mostly produce busywork/conflicts. Do not use ongoing activity as evidence of value; do not promise unattended/background continuation unless it has actually been scheduled.

## 8. Report the implemented result, not the PR pitch

Give a candid, compact end report with the following **seven** fields; use working links and exact evidence, not unverified claims:

1. **Goal + selection rationale:** what you chose and why (or the explicit goal honored).
2. **Built + real proof:** what materially changed and **where/how to observe the actual working result** (live URL, invocation command and sample output, UI route, demo artifact path). Explicitly distinguish live, merged, branch-only, and untested.
3. **GitHub disposition:** issue/PR/commit identifiers; what was claimed, merged, closed, or remains open.
4. **Verification:** which real behavior you exercised, which checks passed/failed/not run, and any data/production limitations.
5. **Blocked/delegated:** exact handoffs, owner, evidence, and remaining dependencies. No implied acceptance by another agent.
6. **Next cycle + improvement suggestions:** the **one** highest-leverage next outcome, plus up to two additional evidence-backed improvements when material. For each, name the user/operational benefit, specific change, expected effort or dependency, and proof of completion. Treat these as proposals, not new requirements. Search for existing tracking first; file or update an issue **only when** the suggestion is actionable, nonduplicate, and valuable enough to warrant independent work. Do not produce a speculative pile of `improvement` issues.
7. **Critical self-review:** what you are least confident about and what you would change about the implementation, project, or chosen goal if you owned it with today's knowledge.

Be plainspoken. Do not flatter the user, inflate tests as achievements, fabricate links, ask the user to read your proposed PR in lieu of doing the work, or say "done" for unmerged/unverified output.