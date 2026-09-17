# Sovorir pilot implementation plan

## Goal

Deliver one honest, reliable learning loop:

`sign in → lesson → practice → assignment → teacher review → feedback`

## Phase 0 — repository baseline

- Work in `feature/sovorir-pilot-stabilization`.
- Preserve existing local changes; do not reset the worktree.
- Restore referenced media assets.
- Standardize on Node.js 22 LTS and document local setup.

## Phase 1 — stabilization

- Fix session restoration and role navigation.
- Remove controls that do not perform their advertised action.
- Make lint, tests and both production builds clean.
- Add visible loading, empty, error and retry states.
- Add CI for typecheck, lint, test and learner/admin builds.

Exit criteria: no runtime test errors, no missing assets, reload-safe auth, clean CI.

## Phase 2 — focused pilot scope

Keep learner navigation focused on Today, Lessons, Practice, Assignments and Profile. Keep teacher navigation focused on Review queue, Students and Profile. Hide unbacked features such as Pro, live lessons, clubs, statistics and pronunciation scoring until they have real data and a complete flow.

## Phase 3 — unified data contract

- Route lessons, vocabulary, practice, progress and assignments through repositories.
- Keep mock and live transports behaviorally compatible.
- Never silently replace failed live data with demo content.
- Restore the live API and define explicit offline behavior.

## Phase 4 — complete learner loop

- Persist lesson position and completion.
- Generate practice from the active lesson.
- Upload, preview and retry voice assignments.
- Restore all state after reload and on another device.

## Phase 5 — internal design system

Consolidate reusable primitives in `src/components/ui`: Button, Input, Card, Modal, Avatar, Badge, AudioControl, Progress, EmptyState, ErrorState and Spinner. Keep the system in this repository until more than one independent frontend consumes it.

## Phase 6 — content operations

- Add lesson catalog, media upload, preview and draft/publish workflow to admin.
- Prepare and language-review 3–5 complete lessons with unique audio.
- Validate missing media and malformed content before publish.

## Phase 7 — teacher review and pilot

- Implement review queue, audio playback and text/voice feedback.
- Add end-to-end coverage, error monitoring and basic product analytics.
- Run a closed pilot with 5–15 students before expanding scope.
