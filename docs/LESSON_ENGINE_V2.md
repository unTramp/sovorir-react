# Sovorir Lesson Engine v2

**Status:** architecture contract / target runtime model  
**Date:** 2026-09-19  
**Scope:** learner lesson runtime, media presentation, interactions, progress, resume, review handoff and migration from legacy blocks  
**Applies to:** new lesson-engine work after the L1–L5 Pilot Gate  
**Does not require:** rewriting the already deployed L1–L5 content before the Pilot Gate is completed

---

## 1. Decision

Sovorir keeps the current content-driven foundation and evolves it instead of replacing it.

The target runtime chain is:

`Course → Lesson → Step → Presentation → Interaction → Feedback → Completion → Review`

The engine MUST remain capable of rendering lessons with different pedagogical shapes. A lesson is not a hard-coded screen and a Step is not a fixed template.

The learner-facing product loop remains:

`Situation → Comprehension → Guided production → Retrieval → Realistic use → Spaced return`

The architectural goal of v2 is to make that loop explicit in the runtime model while removing duplicated legacy mechanisms.

---

## 2. Product identity

Sovorir is an interactive spoken-language course, not:

- a video course;
- a phrasebook;
- a flashcard application;
- a quiz sequence;
- an LMS with static lesson pages.

The product should make a beginner feel:

> «Я понял ситуацию, смог ответить и могу использовать это в реальной жизни».

Video, audio, text and interactions are tools inside that learning loop. None of them is the product by itself.

---

## 3. Stable architecture, variable lesson experience

The engine MUST provide a stable technical shell while allowing lessons to feel different.

Stable:

- backend lesson identity;
- ordered Steps;
- canonical LearningItems;
- tracked Interactions;
- deterministic completion rules;
- server-backed progress;
- reload-safe URLs;
- review handoff.

Variable:

- opening modality;
- amount of text;
- media type;
- interaction type;
- order of explanation and discovery;
- amount of guidance;
- degree of learner production;
- final mission or retrieval mechanic.

Do not encode lesson archetypes as separate React screens.

Bad:

`Lesson4CafeScreen.tsx`

Preferred:

`Lesson → Step[] → PresentationNode[] + Interaction[] + CompletionRule`

---

## 4. Canonical runtime hierarchy

### 4.1 Course

Course owns the ordered learning path.

Responsibilities:

- lesson ordering;
- publication state;
- learner progression;
- determining completed/current/locked state from server progress.

The backend does not need a mutable `currentLesson` field. The current lesson is derived from the first published lesson whose required Steps are not complete.

### 4.2 Lesson

Lesson is the durable learning unit.

Recommended canonical fields:

```ts
interface Lesson {
  id: UUID;
  courseId: UUID;
  slug: string;
  revision: number;
  title: string;
  description: string;
  level: 'A0' | 'A1' | 'A2' | 'B1' | 'B2';
  estimatedMinutes: number;
  outcomes: string[];
  learningItemIds: UUID[];
  steps: LessonStep[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
}
```

Rules:

- `id` is stable backend identity;
- visual lesson number is presentation only;
- content edits that can invalidate attempt semantics increment `revision`;
- media-only replacement SHOULD NOT change LearningItem or Interaction IDs.

### 4.3 Step

Step replaces the mental model of “a page full of blocks”.

A Step represents one cognitive job.

```ts
interface LessonStep {
  id: UUID;
  revision: number;
  order: number;
  type: LessonStepType;
  title: string;
  objective: string;

  learningItemIds: UUID[];

  presentation: PresentationNode[];
  interactions: Interaction[];

  completion: CompletionRule;
}
```

Examples of Step jobs:

- understand a situation;
- notice a contrast;
- hear a new phrase;
- repeat it;
- choose a reply;
- complete a dialogue turn;
- retrieve without support;
- finish a mission.

A Step may contain presentation only, interactions only, or both.

---

## 5. Presentation and Interaction are different concepts

This separation is mandatory in v2.

### Presentation

Presentation shows or explains something.

Examples:

- text;
- canonical phrase;
- mentor audio;
- scene audio;
- rule;
- image;
- video;
- transcript;
- contextual prompt.

Presentation does not itself prove learning.

### Interaction

Interaction asks the learner to do something.

Examples:

- choose meaning;
- identify intent;
- repeat;
- record;
- answer a dialogue;
- recall a phrase;
- discriminate two audio clips;
- construct a phrase;
- respond freely.

Interaction creates evidence about learner behavior and MAY gate progression.

This means a scene video and a dialogue are separate entities:

```text
Step
├── Presentation
│   └── Scene video
└── Interaction
    └── Dialogue response
```

Do not create a compound “video dialogue block” merely because both appear together.

---

## 6. Canonical LearningItem

LearningItem remains the source of truth for reusable language knowledge.

```ts
interface LearningItem {
  id: UUID;
  revision: number;
  type: 'word' | 'phrase' | 'sentence' | 'pattern';

  armenian: string;
  transliteration: string;
  translation: string;

  audio?: {
    normal: MediaAsset;
    slow?: MediaAsset;
  };

  contexts: string[];
  register: 'neutral' | 'informal' | 'polite' | 'formal';
  difficulty: number;
  tags: string[];
  reviewable: boolean;
}
```

A LearningItem can appear in:

- multiple Lessons;
- multiple Steps;
- dialogue;
- recall;
- listening;
- Practice;
- future missions.

Do not duplicate the same linguistic item merely because it appears in another lesson.

---

## 7. Interaction model

All learner actions that influence progression SHOULD converge on one canonical Interaction contract.

Target palette:

```ts
type Interaction =
  | ChoiceInteraction
  | ListenRepeatInteraction
  | DialogueInteraction
  | RecallInteraction
  | ListeningDiscriminationInteraction
  | ConstructInteraction
  | FreeResponseInteraction;
```

Every Interaction SHOULD have:

```ts
interface InteractionBase {
  id: UUID;
  revision: number;
  required: boolean;
  learningItemIds: UUID[];
  analyticsKey: string;
}
```

### 7.1 Choice

Replaces legacy special handling of `multipleChoice`.

Use for:

- meaning;
- intent;
- register;
- listening comprehension;
- pattern noticing.

A required Choice MUST participate in the same progression/completion system as Dialogue, Recall and Speaking.

### 7.2 Listen / Repeat

Use when production or pronunciation is the learning job.

It MAY include:

- reference audio;
- recording;
- replay;
- comparison;
- retry.

Speech scoring is optional and must not be required for the basic engine.

### 7.3 Dialogue

Dialogue represents a social turn, not merely a multiple-choice card.

It may support:

- choice response;
- spoken response;
- typed response later;
- character reply;
- feedback;
- branching continuation.

### 7.4 Recall

Learner must retrieve before seeing the answer.

Possible prompt sources:

- Russian meaning;
- situation;
- image;
- previous dialogue context;
- audio cue.

### 7.5 Listening discrimination

Learner distinguishes sound, form, speaker intent or register.

### 7.6 Construct

Learner assembles or substitutes part of a productive pattern.

### 7.7 Free response

Learner records or later types an open answer.

This should be introduced gradually in early A0/A1.

---

## 8. Unified progression gate

v2 removes the conceptual split where some interactive widgets gate progression and others do not.

For every Step:

1. render presentation nodes in authored order;
2. expose required interactions according to the Step reveal policy;
3. persist InteractionAttempt;
4. show feedback;
5. reveal the next authored segment;
6. enable Step completion only when the CompletionRule is satisfied.

Target completion modes:

```ts
type CompletionRule =
  | { mode: 'viewed' }
  | { mode: 'all-required'; requiredInteractionIds: UUID[] }
  | { mode: 'any'; interactionIds: UUID[]; minimum: number }
  | { mode: 'score'; interactionIds: UUID[]; minimumScore: number };
```

For the near-term learner engine, `viewed` and `all-required` are sufficient.

---

## 9. InteractionAttempt is the evidence layer

Every meaningful learner action is persisted as an InteractionAttempt.

Current tracking context is retained:

```ts
lessonId
lessonRevision
stepId
interactionId
learningItemIds
```

Attempt data includes:

```ts
lessonAttemptId
status
outcome
hintUsed
retryCount
selectedOptionId
recordingId
startedAt
completedAt
```

This is the foundation for future adaptation.

Example future inference:

- recognition strong;
- recall weak;
- hint usage high;
- repeated failures in polite register.

Practice can later use this evidence to choose modality and schedule.

v2 does not require adaptive scheduling immediately, but MUST preserve the data needed for it.

---

## 10. LessonAttempt

A LessonAttempt groups InteractionAttempts from one intentional run through a Lesson.

Rules:

- current unfinished lesson SHOULD resume the latest valid LessonAttempt;
- completing the lesson closes the active LessonAttempt;
- reopening a completed lesson for review MAY create a new LessonAttempt;
- attempts from different lesson revisions must not be merged blindly.

---

## 11. Resume and deep-link contract

Stable learner URL:

`/lesson?lesson=<lessonApiId>&section=<stepNumber>`

Rules:

- backend UUID is identity;
- lesson number is display only;
- current unfinished lesson resumes first incomplete Step;
- completed lesson intentionally reopens at Step 1;
- locked lesson cannot be entered by URL manipulation;
- invalid explicit lesson ID does not silently fall back to another lesson;
- refresh MUST preserve lesson identity and bounded Step;
- completed interaction prefix SHOULD be restored from persisted attempts.

Long-term, URL may move from `section` to `step`, but migration must preserve existing links.

---

## 12. Media v2: one video system

### 12.1 Decision

Sovorir no longer treats a circular “video bubble” as a first-class visual mechanic.

All new lesson videos SHOULD use a unified rounded rectangular `VideoCard`.

Semantic role is separate from visual geometry.

Target role:

```ts
type VideoRole =
  | 'mentor'
  | 'scene'
  | 'explanation';
```

Backward compatibility:

- legacy `presentation: 'circle'` → role `mentor`;
- legacy `presentation: 'lesson'` → role `explanation`;
- legacy `presentation: 'scene'` → role `scene`.

Legacy values MAY remain accepted by API/UI during migration, but new authored content should use the v2 role model once the contract is implemented.

### 12.2 Unified VideoCard

All roles share:

- rounded frame;
- poster/first frame;
- play state;
- loading/error state;
- captions/transcript support;
- optional title/caption;
- duration;
- full-screen/overlay playback where useful;
- no unexpected audible autoplay.

Suggested visual treatment:

**mentor / explanation**
- portrait-oriented 4:5 or 3:4;
- medium card width;
- focus on face, articulation or gesture.

**scene**
- 16:9 or 4:3;
- wider card;
- environment and multiple actors may be visible.

These are presentation defaults, not storage types.

### 12.3 Why the circle is removed

The circle:

- over-emphasizes messenger UI;
- wastes useful video area;
- competes with normal lesson composition;
- creates an unnecessary special component;
- becomes redundant once short video is framed cleanly inside the lesson.

Human presence remains important. Only the circular mask is removed.

---

## 13. Mentor media vs generated scene media

Sovorir SHOULD distinguish source/role conceptually even when both use VideoCard.

### Mentor / Lusine

Best for:

- pronunciation;
- natural Armenian;
- articulation;
- register nuance;
- cultural note;
- short explanation;
- human trust and course identity.

### Generated scene video

AI video (for example Grok-generated clips) is suitable for:

- café;
- shop;
- taxi;
- meeting;
- street;
- home;
- other short contextual scenes.

Primary purpose:

- establish situation;
- provide visual comprehension cues;
- make missions feel real;
- vary contexts cheaply.

Generated scene video SHOULD NOT become the linguistic source of truth.

Preferred production pattern:

```text
AI visual scene
+
approved Armenian audio / dialogue assets
+
canonical LearningItems
```

This avoids depending on unstable generated lip-sync, pronunciation or text rendering.

If generated speech is used, it requires native QA before publication.

---

## 14. Video placement rule

Do not attach video automatically to every Dialogue.

Authoring model:

```text
Step
├── optional Video Presentation
├── optional Audio/Text Presentation
└── one or more Interactions
```

Use video when it improves:

- situation comprehension;
- listening;
- articulation;
- emotional/social context;
- cultural nuance.

Do not use video merely to increase production value.

Early-course guideline:

- 0–2 video assets per normal lesson;
- some lessons should have none;
- missions may justify more scene media;
- Pattern Builder lessons may work better audio/text-first.

---

## 15. Feedback layer

Feedback should be modeled as the response to an Interaction outcome, not hidden inside arbitrary UI widgets.

Feedback may contain:

- correct/incorrect state;
- short explanation;
- character reply;
- reference answer;
- hint usage;
- retry CTA;
- replay;
- learner/reference comparison.

Feedback SHOULD be immediate and compact.

Do not turn every wrong answer into a lecture.

---

## 16. Reveal model

The current progressive reveal behavior is retained.

A Step can reveal content incrementally:

```text
Presentation A
↓
Interaction 1
↓ completed
Feedback 1
↓
Presentation B
↓
Interaction 2
↓ completed
Completion
```

Implementation may initially continue to flatten authored elements for rendering, but the canonical model should preserve semantic separation.

The learner must not be able to scroll past required interactions and consume the rest of the answer sequence without acting.

---

## 17. Completion and lesson exit

Step completion:

- verify CompletionRule;
- persist server progress;
- only then navigate to the next Step.

Final Step:

- verify required interactions;
- persist final Step;
- close LessonAttempt;
- hand reviewable LearningItems to Review;
- show lesson-specific recap;
- refresh catalog before returning Home.

Completion screen MUST be lesson-aware.

No L1-specific copy or recap may leak into later lessons.

---

## 18. Review handoff

At lesson completion:

1. upsert canonical LearningItems;
2. select only `reviewable=true`;
3. enqueue them with sourceLessonId;
4. schedule first spaced return;
5. keep immediate lesson recap separate from spaced review.

Current simple timing is acceptable for Pilot:

- first spaced return: approximately +24h;
- again: +5m;
- hard: +1d;
- easy: +7d.

This is intentionally not the final SRS algorithm.

Future review scheduling may consume InteractionAttempt evidence.

---

## 19. Practice Engine direction

Practice remains a separate learning loop using the same LearningItems.

Current modes are retained:

- recall;
- listening;
- recognition.

Target additions later:

- dialogue recall;
- production recording;
- register choice;
- listening discrimination;
- contextual transfer.

Practice MUST NOT regress into a second isolated dictionary/flashcard data model.

Canonical LearningItem is the shared source.

---

## 20. Persistence ownership

### Server is source of truth for

- published course structure;
- Lesson/Step content;
- canonical LearningItems;
- section/Step completion;
- InteractionAttempts;
- learner course progression.

### Local persisted state may temporarily own

- optimistic interaction state;
- active LessonAttempt helper state;
- current Practice session;
- review scheduling during Pilot;
- UI preferences.

Target after Pilot:

- sync ReviewQueue/SRS state to backend for multi-device consistency;
- reduce duplicate local/server progress concepts;
- preserve local-first resilience where useful.

---

## 21. Legacy compatibility

The current product contains two generations:

```text
canonical domain
↕ adapters
legacy render blocks / stores
```

v2 does not demand a big-bang rewrite.

Compatibility may remain for:

- legacy block names;
- local seed lessons;
- admin draft format;
- legacy FlashcardStore;
- existing `presentation: circle | lesson | scene`.

But new architecture work MUST move toward canonical domain contracts rather than adding more legacy exceptions.

---

## 22. Migration priorities

### P0 — complete Pilot Gate first

Before structural refactor:

- sequential L1–L5 learner pass;
- reload/resume;
- interaction persistence;
- Practice handoff;
- physical iPhone/Android pass;
- no P0/P1 learner defects.

Do not destabilize the Pilot Gate to clean architecture prematurely.

### P1 — unify Interaction progression

After Pilot:

- make Choice participate in canonical required Interaction gating;
- remove special-case progression logic by block type where possible;
- centralize interaction completion;
- preserve tracking IDs.

### P1 — unified VideoCard

- implement one VideoCard renderer;
- map legacy circle/lesson/scene to semantic roles;
- stop authoring new circular presentation;
- preserve old content without migration breakage.

### P1 — formal Presentation/Interaction Step runtime

- render from canonical LessonStep;
- reduce dependence on legacy flattened block semantics;
- keep adapters during transition.

### P2 — remove duplicate learning stores

- migrate old FlashcardStore consumers to LearningItemStore;
- use LearningItem everywhere new functionality is built.

### P2 — server Review state

- persist review queue and schedule;
- support cross-device Practice;
- prepare for richer SRS.

### P3 — adaptive learning

Use InteractionAttempt history for:

- modality selection;
- difficulty;
- hint sensitivity;
- weak-item resurfacing;
- personalized spacing.

---

## 23. Acceptance criteria for Lesson Engine v2

The engine is considered migrated when:

1. new Lessons are authored in canonical Lesson/Step structure;
2. Presentation and Interaction are separate concepts;
3. all required Interaction types use one progression/completion mechanism;
4. stable tracking is preserved end-to-end;
5. reload resumes the correct Step and completed interaction prefix;
6. server progress determines course state;
7. canonical LearningItems drive lesson recap and Practice;
8. new video uses unified VideoCard;
9. circular video is compatibility-only, not a new-content mechanic;
10. AI scene video can be inserted as Presentation without changing Dialogue logic;
11. L1–L5 continue to work during migration;
12. no new lesson requires a custom Lesson-specific React screen.

---

## 24. Authoring example

Example: café mission.

```text
Lesson: Заказать кофе

Step: Войдите в ситуацию
  Presentation:
    - scene video: café
    - optional ambient / dialogue audio
  Interaction:
    - choice: what is the barista asking?

Step: Сделайте заказ
  Presentation:
    - LearningItem: «Մի սուրճ, խնդրում եմ»
    - canonical audio
  Interaction:
    - listen-repeat

Step: Ответьте бариста
  Presentation:
    - character line
  Interaction:
    - dialogue response

Step: Неожиданный поворот
  Presentation:
    - scene/audio: «Ուրիշ բան ուզո՞ւմ եք»
  Interaction:
    - dialogue or recall

Step: Финальная попытка
  Interaction:
    - recall / spoken mission
  Completion:
    - all required interactions
```

The same engine can render a Pattern Builder with no scene video or a Listening First lesson with audio-first presentation.

---

## 25. Governing rule

When deciding whether to add a new React component, block type, media type or storage enum, ask:

> Does this represent a genuinely different learner behavior or state, or only a different visual presentation?

If only presentation differs, prefer metadata and a shared component.

If learner behavior, persistence, tracking or completion differs materially, a new canonical Interaction/Presentation type may be justified.

This rule is especially important for video.

---

## 26. Relationship to existing documents

- `CURRICULUM_SYSTEM_v1.md` remains the pedagogy/product contract.
- This document is the target learner runtime/engine contract.
- `PILOT_GATE_L1-L5.md` remains the acceptance gate before L6/L7 becomes the main implementation focus.
- Legacy `content-model.md` describes an earlier block-first phase and should not override the canonical Lesson/Step model in this document.

If implementation and this document diverge during migration, document the compatibility layer explicitly rather than pretending the migration is complete.
