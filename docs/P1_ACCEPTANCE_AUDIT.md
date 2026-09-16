# P1 Acceptance Audit

Date: 2026-09-16  
Scope: canonical Lesson 1, progress persistence, recording, dialogue, active recall, completion and reset.  
Status: **conditional pass**. Automated acceptance is green; physical iPhone Safari and Android Chrome checks remain required before tagging `v0.1.0-p1`.

## Automated evidence

- Frontend regression suite: 204 tests passed.
- ESLint: passed.
- TypeScript: passed.
- Live production build: passed.
- Live backend health endpoint: HTTP 200.
- Current placeholder audio asset: HTTP 200 with byte-range support.
- Completion is authenticated and scoped to the current user.
- Reset is student-only and deletes only rows owned by the authenticated student.

## Findings

### Blocker

No blocker was reproduced in automated checks.

### Major — fixed in this audit

1. **A completed pronunciation attempt could not be recorded again.**
   - Added `Записать ещё раз` after local playback.
   - Retrying rewinds that interaction and all following interactions in the current step, preserving a linear flow.
   - The previous IndexedDB blob and metadata are removed before retry.

2. **Reset left learner artifacts on the device.**
   - Reset now also clears legacy flashcard progress and local recording blobs/metadata.
   - Canonical learning items, attempts, lesson progress and navigation state continue to be cleared.

3. **IndexedDB recording failures had no visible recovery state.**
   - A save failure now keeps the learner in the recording step and shows an actionable error.

### Major — open acceptance gates

1. **Physical-device recording is not yet certified.**
   - Verify permission denied/allowed, recording, playback and retry on iPhone Safari/PWA and Android Chrome.
   - Browser emulation is not sufficient for MediaRecorder and iOS audio-session behavior.

2. **Lesson audio is still placeholder content.**
   - The asset is reachable, but all canonical phrases currently reuse the same `.opus` file.
   - This validates mechanics, not pedagogical quality. Real Lusine recordings are required for final content acceptance.

3. **Pilot and production build modes are not separated.**
   - `build:live` currently enables developer tools so Reset remains available on the pilot server.
   - Before external beta, create separate pilot and production scripts and disable Reset in production.

4. **Documented seeded live credentials are stale.**
   - Backend health is green, but the documented student login was rejected.
   - Refresh the test account or update `docs/dev-environment.md` before repeatable automated live acceptance.

### Minor

1. Interaction attempts and the review queue are currently local-first; only confirmed section completion is restored cross-device. Server synchronization belongs in the P2 architecture contract.
2. `syncCompletedSectionsToServer()` intentionally uses `Promise.allSettled`; a background resync failure is not surfaced to the learner. Explicit completion still shows an error and remains unconfirmed.
3. The Browserslist dataset is stale. This does not block P1, but should be updated before beta browser certification.

## Device acceptance checklist

- [ ] Fresh student starts at Lesson 1 / Step 1.
- [ ] Context → Phrases → Listen/Repeat → Dialogue → Recall → Success is linear.
- [ ] Refresh in every step restores the expected local state.
- [ ] Denying microphone access shows recovery guidance and does not advance.
- [ ] Recording can be stopped, played and recorded again.
- [ ] Reference audio and learner audio never play simultaneously.
- [ ] Incorrect dialogue choice receives explanatory feedback and remains retryable.
- [ ] Active Recall never reveals the answer before `Я ответил`.
- [ ] Hint use is stored on the interaction attempt.
- [ ] Completion survives refresh and is returned by the backend curriculum response.
- [ ] Reopening a completed lesson is predictable.
- [ ] Reset affects only the authenticated pilot student and returns to Lesson 1.
- [ ] Safe areas and bottom action docks do not overlap content or the software keyboard.
- [ ] Slow/offline transitions show loading or recovery rather than a frozen UI.

## Release gate

Do not create `v0.1.0-p1` until all physical-device items pass, real content audio is supplied (or explicitly waived for pilot), and pilot/production build modes are separated.
