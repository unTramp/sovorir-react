# Sovorir Pilot Gate — Lessons 1–5

**Status:** active acceptance gate  
**Date:** 2026-09-18  
**Scope:** learner flow from course entry through Lessons 1–5, Practice handoff, reload/resume, media roles and controlled production publication.

This document separates what is already proven by automated checks from what still requires a live environment or physical-device validation. A feature is not considered pilot-ready merely because it builds.

---

## 1. Pilot goal

The first five lessons must work as one learning loop:

`catalog → lesson → interaction → section completion → lesson completion → LearningItem review queue → Practice → resume/deep link → next lesson`

The five lessons must also feel pedagogically different:

1. **L1 — Guided Speaking** — greetings and goodbyes.
2. **L2 — Discovery + Conversation Builder** — introductions and register choice.
3. **L3 — Listening First** — “how are you?” and connected spoken response.
4. **L4 — Mission** — order coffee inside a café task.
5. **L5 — Pattern Builder** — infer and transfer “I want / I don’t want”.

Passing this gate means we can continue to L6/L7 without building on an unverified lesson engine.

---

## 2. Automated gate — frontend

Required on `main`:

- [x] lint passes;
- [x] unit/component tests pass;
- [x] learner build passes;
- [x] admin build passes;
- [x] stable lesson URLs use backend `apiId`;
- [x] `/lesson?lesson=<apiId>&section=<n>` survives reload;
- [x] legacy direct `/lesson` resolves the catalog current lesson;
- [x] explicit completed-lesson deep link can reopen the lesson for review;
- [x] invalid or locked explicit lesson id does not silently open another lesson;
- [x] Home navigation emits stable lesson identity;
- [x] Course navigation emits stable lesson identity;
- [x] next-section navigation preserves lesson identity;
- [x] completion screen is lesson-aware rather than hard-coded to L1;
- [x] completion recap uses canonical LearningItems;
- [x] Practice Engine uses canonical review queue as its primary source;
- [x] Practice can interleave recall / listening / recognition;
- [x] Practice falls back safely when audio is unavailable;
- [x] Reset Progress clears canonical review/practice state;
- [x] normalized public lesson-detail fixture with `dialogue`, `activeRecall` and full tracking passes the production runtime Zod schema;
- [x] leaked DB storage aliases remain rejected by the learner API schema.

---

## 3. Automated gate — backend

Required on the backend default branch:

- [x] TypeScript build passes;
- [x] curriculum validator passes for L1–L5;
- [x] every lesson after L1 introduces 3–6 pilot LearningItems;
- [x] adjacent lessons do not reuse an identical section-type sequence;
- [x] every section has stable `stepId`;
- [x] tracked interactions have stable `interactionId`;
- [x] tracked LearningItem references belong to the lesson;
- [x] production shell scripts pass `bash -n`;
- [x] deploy refuses implicit server targets;
- [x] migrations are no longer allowed to fail silently;
- [x] production health check is fatal on failure;
- [x] curriculum publication validates before mutation;
- [x] curriculum publication creates a PostgreSQL backup before sync;
- [x] publication explicitly uses `RESET_PILOT_PROGRESS=false`;
- [x] learner API semantic-block round-trip is merged and green;
- [x] public interaction tracking contains lessonId + lessonRevision + stepId + interactionId + learningItemIds.

The public lesson contract is now guarded on both sides: backend CI validates `semantic → storage → public API`, and frontend CI validates the resulting public payload through the production runtime schema.

---

## 4. Production gate

These checks require the actual server and cannot be inferred from CI.

### Infrastructure prerequisite

The current Pilot Gate deploy was performed through the authenticated developer workstation over SSH to the intended production host. GitHub Actions deploy remains manual-only and can be configured later with repository secrets:

- [ ] `SSH_HOST`;
- [ ] `SSH_USER`;
- [ ] `SSH_PRIVATE_KEY`;
- [ ] optional `SSH_PORT` if the host does not use port 22.

**Do not put the private key into issues, docs, commits, or chat.**

GitHub Actions secrets are no longer a blocker for this Pilot Gate because the production deployment and publication have already been completed through the controlled SSH path.

### Controlled publish sequence

Production verification on 2026-09-18:

- [x] backend default branch revision `bd9150b4de0d74ce6470fb2ca31dca3054794f1d` deployed to the intended production host;
- [x] migration step succeeded without `|| true` and reported no schema changes required;
- [x] `/health` succeeded after deploy;
- [x] `content:validate` succeeded inside the production API container;
- [x] timestamped pg_dump backup was created and verified non-empty;
- [x] `content:pilot` synced five pilot lessons with `RESET_PILOT_PROGRESS=false`;
- [x] `/health` succeeded after content publication;
- [ ] authenticated lesson catalog returns five published pilot lessons;
- [ ] lesson detail for each L1–L5 passes frontend runtime validation;
- [ ] course status correctly advances completed → current → locked.

---

## 5. Learner end-to-end gate

Run from a clean/reset pilot learner account.

### Course progression

- [ ] L1 is current; L2–L5 are locked initially;
- [ ] completing L1 unlocks L2 and makes L2 current;
- [ ] repeat through L5 with exactly one current lesson at a time;
- [ ] completed lessons remain reopenable for review;
- [ ] locked lessons cannot be entered by URL manipulation.

### Resume and deep links

For at least L2 and L4:

- [ ] stop in a middle section;
- [ ] reload browser/app;
- [ ] same lesson reopens, not L1;
- [ ] resume section is correct;
- [ ] copy a stable lesson URL and open it in a fresh tab;
- [ ] explicit completed-lesson link opens section 1 for intentional review.

### Interaction persistence

For a lesson containing multiple interactions:

- [ ] complete only part of the required interactions;
- [ ] reload;
- [ ] already-completed interaction prefix remains complete;
- [ ] next required interaction is restored correctly;
- [ ] no duplicate POST/PATCH attempt sequence is visible;
- [ ] section cannot complete while a required interaction is missing.

### Completion

For every L1–L5:

- [ ] completion title corresponds to the actual lesson;
- [ ] recap phrases belong to that lesson;
- [ ] no L1-specific greeting copy appears in L2–L5;
- [ ] canonical LearningItems are handed to review queue;
- [ ] returning Home refreshes catalog state and advances course.

---

## 6. Pedagogical differentiation gate

The goal is not just five valid JSON lessons. They must create visibly different cognitive jobs.

### L1 — Guided Speaking

- [ ] high guidance and low uncertainty;
- [ ] learner hears/sees before producing;
- [ ] speaking repetition feels appropriate for onboarding;
- [ ] informal/polite greeting distinction is clear.

### L2 — Discovery + Conversation

- [ ] learner infers meaning before explicit explanation;
- [ ] name is personalized rather than memorized as a fixed phrase;
- [ ] `քո / ձեր` contrast is contextual, not grammar-lecture-first;
- [ ] two social situations require different register decisions.

### L3 — Listening First

- [ ] first meaningful task can be completed from listening/context;
- [ ] text does not pre-answer the listening question;
- [ ] connected response is trained as a chunk;
- [ ] prior L1 material returns inside the final exchange.

### L4 — Mission

- [ ] learner enters a café task immediately;
- [ ] no standalone vocabulary dump precedes the task;
- [ ] new language appears only when needed by the mission;
- [ ] service question creates a small unexpected turn;
- [ ] earlier greetings/social language is reused naturally.

### L5 — Pattern Builder

- [ ] learner first compares examples;
- [ ] learner identifies `եմ ուզում` before receiving rule wording;
- [ ] positive vs negative contrast is clear;
- [ ] learner transfers the pattern to another object;
- [ ] speaking step tests generation, not only recognition.

### Cross-lesson anti-template check

- [ ] no two consecutive lessons feel like the same screen sequence with different text;
- [ ] phrase cards are not the default opener for every lesson;
- [ ] number of required interactions feels proportional to the learning job;
- [ ] review is compact and high-value rather than replaying the whole lesson.

---

## 7. Practice Engine gate

After completing at least L1–L3:

- [ ] canonical items appear in review queue;
- [ ] items are not immediately duplicated by legacy dictionary state;
- [ ] only due items enter a normal practice session;
- [ ] session caps at intended size;
- [ ] modes visibly alternate where possible;
- [ ] listening mode hides answer text before reveal;
- [ ] recall asks learner to produce before reveal;
- [ ] recognition asks for meaning rather than repeating the same prompt;
- [ ] `again / hard / easy` changes next review date;
- [ ] session survives a reload if intentionally persisted;
- [ ] Reset Progress clears queue and active practice session.

---

## 8. Media gate

Fake media is acceptable for the current pilot, but the engine must support the final production model.

### Video roles

- [ ] `presentation: circle` renders as a short human/mentor video unit;
- [ ] `presentation: lesson` renders as a normal explanation video;
- [ ] `presentation: scene` renders as contextual scene media;
- [ ] legacy video without `presentation` remains compatible;
- [ ] transcript metadata is accepted;
- [ ] thumbnail / first-frame poster behavior is stable;
- [ ] no audible autoplay surprises the learner.

### Lesson-specific media intent

- [ ] L2 can accept a Discovery video-circle without restructuring the lesson;
- [ ] L3 can accept Listening First circle/scene media;
- [ ] L4 scene video can replace its fake contextual media without ID migration;
- [ ] L5 remains valid with audio-first production and no mandatory scene video.

---

## 9. Lusine production gate

Before replacing fake assets:

- [ ] native wording/register QA completed by Lusine;
- [ ] canonical LearningItem ids remain unchanged when audio is replaced;
- [ ] Interaction ids remain unchanged for media-only replacement;
- [ ] NORMAL audio exists for every selected production LearningItem;
- [ ] selected SLOW takes exist where articulation benefits;
- [ ] connected speech is recorded as whole lines where specified;
- [ ] video circles remain short and single-purpose;
- [ ] scene videos prioritize believable context over acting;
- [ ] asset filenames follow production-pack naming convention;
- [ ] final assets move through recorded → selected → processed → attached → QA-approved → published.

---

## 10. Physical-device gate

These checks are manual and must not be marked passed from desktop CI.

### iPhone Safari / installed PWA

- [ ] open course and lesson;
- [ ] recording permission flow works;
- [ ] recording CTA remains reachable with safe areas / keyboard;
- [ ] audio play/pause works repeatedly;
- [ ] video circle layout does not crop face/mouth incorrectly;
- [ ] scene video fits portrait viewport;
- [ ] reload/deep-link resumes correct lesson;
- [ ] scrolling and sticky interaction dock do not fight each other;
- [ ] completion → Home transition refreshes catalog.

### Android Chrome

Repeat the same checks, especially:

- [ ] MediaRecorder behavior;
- [ ] permission denial/retry;
- [ ] audio focus;
- [ ] sticky dock positioning;
- [ ] PWA standalone navigation if installed.

---

## 11. Exit criteria

**Pilot Gate L1–L5 is PASSED only when:**

1. frontend automated gate is green;
2. backend automated gate is green;
3. backend is deployed to the intended production host;
4. V5 curriculum is published with a verified backup and no progress reset;
5. all five lessons can be completed sequentially on a clean learner account;
6. reload/resume works after L1 and in at least two later lessons;
7. Practice receives and schedules canonical LearningItems;
8. lesson archetypes remain visibly different during real use;
9. at least one iPhone and one Android physical-device pass is completed;
10. no P0/P1 defects remain in the learner loop.

Only after this gate should L6/L7 become the main implementation focus.

---

## 12. Current blockers

### External / configuration

No external deployment blocker remains for the current Pilot Gate. GitHub Actions SSH secrets are still optional follow-up infrastructure work for future one-click deploys.

### Pending verification

- authenticated live API validation;
- real sequential L1–L5 learner pass;
- physical iPhone/Android pass;
- final Lusine native media recording/QA (not required for fake-media engineering pilot).
