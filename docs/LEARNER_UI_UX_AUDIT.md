# Sovorir Learner UI/UX Audit v1

**Status:** product/design audit  
**Date:** 2026-09-19  
**Scope:** current learner-facing frontend on `main`  
**Purpose:** identify structural UX/UI problems before implementation work begins  
**Rule:** this document does not authorize ad-hoc CSS polishing. Redesign work should follow the priorities and component contracts defined here.

---

## 1. Executive conclusion

The learner product already has a strong functional foundation:

- linear course progression;
- stable lesson identity and reload-safe URLs;
- server-backed section completion;
- progressive content reveal;
- persisted InteractionAttempts;
- canonical LearningItems;
- lesson completion → Practice handoff;
- warm visual direction;
- recognisable teacher presence.

The main UX problem is not that the application is “ugly”. The problem is **visual and behavioral fragmentation inside the learning runtime**.

The current lesson screen mixes several generations of UI:

- teacher voice bubbles;
- phrase cards;
- quiz cards;
- record prompt cards;
- a separate sticky recorder;
- blue learner playback;
- dialogue bubbles;
- standalone audio cards;
- active recall actions;
- video variants;
- completion docks.

Each component is individually understandable, but together they do not yet feel like one coherent premium learning conversation.

The highest-value work is therefore not a general reskin. It is a **Lesson Runtime coherence pass**.

---

## 2. Audit severity model

### P0 — learner-loop defect

A problem that can break progression, identity, persistence or the meaning of an interaction.

### P1 — core experience defect

The function works, but the experience is confusing, visually inconsistent, disproportionately technical, or materially reduces perceived quality.

### P2 — polish / consistency

The function is usable but should be aligned with the final design system.

### KEEP

The current concept is strong and should not be redesigned without a clear reason.

---

## 3. Product design principles to preserve

The learner interface should feel:

- warm;
- conversational;
- calm;
- human;
- premium;
- low-friction;
- language-first rather than UI-first.

It should not feel:

- corporate-blue;
- dashboard-heavy;
- like a collection of unrelated widgets;
- like a voice-recorder utility;
- like a generic quiz application;
- like a messenger clone.

The teacher is a real product identity element. **Teacher bubbles remain.**

The target learner rhythm is:

`context → understand → act → receive feedback → continue`

UI should visually reinforce that rhythm.

---

# 4. App shell and navigation

## Current behavior

The application uses:

- persistent MobileHeader;
- BottomTabBar outside Lesson;
- lesson route hides BottomTabBar;
- lesson header shows lesson number/title plus Step progress;
- back inside Lesson moves to previous section or exits to Course.

## What works

**KEEP**

- Bottom navigation disappears in Lesson, protecting focus.
- Lesson header exposes lesson identity and current step.
- Progress is compact and understandable.
- App shell is structurally simple.

## Problems

### P0/P1 — lesson back navigation can drop explicit lesson identity

Current lesson back behavior navigates to:

`/lesson?section=<n>`

without preserving the explicit `lesson=<apiId>`.

This is risky when intentionally reviewing a completed lesson because route resolution without explicit lesson identity follows the catalog current lesson.

Target:

`/lesson?lesson=<apiId>&section=<n>`

must be preserved for backward step navigation as well.

### P2 — header and Step heading compete slightly

The MobileHeader already names the lesson. The body then opens with a large serif Step title. This can work, but spacing should make the hierarchy obvious:

- header = where am I;
- Step title = what am I doing now.

Do not add more header chrome.

---

# 5. Home

## Current role

Home is the re-entry point into learning:

- greeting;
- Continue Lesson hero;
- current lesson progress;
- Practice status;
- weekly activity;
- teacher note.

## Strengths

**KEEP / POLISH**

- “Continue Lesson” is the correct primary CTA.
- Current lesson and progress are immediately visible.
- Practice status is connected to LearningItem review state.
- Teacher section reinforces Lusine as a human presence.
- Warm terracotta hero is visually distinctive.

## Problems

### P2 — hierarchy is good but visually more “app dashboard” than lesson runtime

Home uses several large rounded cards with slightly different visual grammar.

This is acceptable because Home is a dashboard. Do not spend the first redesign sprint here.

### P2 — weekly activity currently has more visual weight than its learning importance

The streak/activity panel is useful but should remain secondary to:

1. Continue Lesson;
2. due Practice.

## Decision

Home is **not a redesign priority**.

Only adjust it after the Lesson Runtime components establish the final design system.

---

# 6. Course screen

## Current role

Course displays linear lesson progression:

- completed;
- current;
- locked.

Completed lessons can reopen; locked lessons are disabled.

## Strengths

**KEEP / POLISH**

- progression model is immediately understandable;
- cards communicate status;
- progress bar appears only when relevant;
- “Можно повторить” is good learner language;
- locked state explains why it is unavailable.

## Problems

### P2 — cards are visually serviceable, not yet distinctive

The Course screen is functional but not a major source of UX pain.

### P2 — “разделы” is implementation language

User-facing copy may later prefer “шагов” over “разделов”, matching the Lesson header and mental model.

## Decision

Do not redesign Course before speaking/dialogue/audio.

---

# 7. Lesson shell

## Current role

The Lesson screen is the product core.

It provides:

- Step title;
- progressive reveal;
- one active interaction at a time;
- sticky interaction/action area;
- server completion;
- next Step navigation.

## Strengths

**KEEP**

- single scroll surface;
- progressive reveal;
- one primary learning job at a time;
- Step title as contextual anchor;
- sticky action area separated from content;
- completion cannot advance until required interactions are satisfied.

## Main problem

### P1 — the shell hosts too many independent visual languages

The Lesson shell itself is not wrong. The inconsistency comes from child components.

The redesign should therefore **standardize learner surfaces**, not replace the entire shell.

Target visual layers:

1. **Context layer** — teacher / scene / short explanation;
2. **Language layer** — phrases, examples, rule;
3. **Interaction layer** — learner action;
4. **Feedback layer** — outcome / reply / hint;
5. **Navigation layer** — continue/finish.

These layers should feel related even when their mechanics differ.

---

# 8. Teacher voice bubble

## Decision

**KEEP. Do not redesign the teacher bubble concept.**

Teacher bubbles are one of the strongest pieces of Sovorir identity.

Current strengths:

- Lusine avatar;
- warm teacher surface;
- sender name;
- short text;
- inline audio;
- recognisable chat-like shape;
- clear distinction from learner content.

## Allowed changes

Only controlled polish:

- audio containment;
- responsive spacing;
- waveform width;
- avatar overlap edge cases;
- long text behavior;
- loading/error state.

## Do not do

- do not remove the bubble;
- do not convert it to a generic card;
- do not replace Lusine with a label-only panel;
- do not make teacher audio visually identical to phrase audio;
- do not introduce a new blue accent.

Teacher bubbles should remain visually human and conversational.

---

# 9. Phrase cards / PhraseGroup

## Current behavior

Consecutive phrases are grouped into one rounded surface.

Each phrase shows:

- Armenian;
- transcription;
- translation;
- context;
- optional Russian pronunciation line;
- circular audio progress/play button.

## Strengths

**KEEP / POLISH**

The grouped surface is already considerably better than a vertical pile of independent cards.

Good decisions:

- one phrase group container;
- subtle separators;
- large Armenian typography;
- light audio control;
- played state changes background minimally.

## Problems

### P2 — information hierarchy can become crowded

A phrase may display:

- Armenian;
- transcription;
- translation;
- context;
- Russian pronunciation.

For early lessons this may be too many textual representations simultaneously.

The design system should define visibility rules by pedagogy, not always render every field with equal presence.

### P2 — audio progress ring is another audio visual language

The phrase control uses circular progress while teacher audio uses waveform and learner playback uses a horizontal bar.

This contributes to audio fragmentation.

## Target

Keep PhraseGroup.

Do not radically redesign it during the first sprint.

Normalize audio behavior later under the Audio System.

---

# 10. Rule / explanation blocks

## Current behavior

Warm light card, title plus list.

## Assessment

**KEEP / POLISH**

This component is structurally appropriate.

Rules should remain:

- short;
- contextual;
- one concept at a time;
- visually secondary to language and action.

Do not turn Rule into a large article or modal.

---

# 11. Audio system — major fragmentation

## Current implementations

The learner can encounter at least four materially different audio UIs:

1. teacher `VoiceBubble` → waveform;
2. `LessonAudioCard` → waveform inside standalone card;
3. `PhraseCard` → circular progress ring;
4. learner `RecordingPlayback` → blue horizontal progress bar.

Practice introduces another circular listening control.

## Severity

**P1**

This is a major coherence problem.

The learner should understand “tap to hear language” and “listen to my recording” without each context inventing a new media player.

## Student blue: keep the conversational identity, remove the technical subsystem

Current tokens explicitly define:

- `--color-student: #55B4E4`;
- blue student waveform;
- blue learner playback;
- blue student progress gradient.

The problem is **not the existence of blue itself**. Blue is useful as a semantic conversational cue for “это реплика ученика / это я”.

The problem is that the same saturated blue currently becomes an independent technical media language across waveform, playback and progress controls.

## Decision

Keep a softened blue family for **Student Bubble / Learner Message** identity.

Do not use saturated student blue as the generic color for recording technology, progress meters or unrelated controls.

Learner ownership should be communicated primarily through:

- right-side message position;
- label “Вы” / “Ваша запись”;
- a soft blue message surface;
- mirrored bubble geometry relative to Teacher Bubble;
- consistent typography and audio layout.

Interactive media controls inside the bubble should belong to the shared Audio System rather than inventing a separate blue player system.

## Target audio primitives

The redesign should define only three primitives:

### A. `InlineAudioButton`

For Phrase / compact language item.

### B. `MessageAudio`

For teacher/student conversational bubble.

### C. `RecordingPlayback`

For learner recording.

They may differ in layout, but must share:

- play/pause icon language;
- progress treatment;
- timing behavior;
- loading/error behavior;
- warm neutral palette.

---

# 12. Speaking / recording inside Lesson

## Current composition

Speaking is split across two different components:

### RecordPrompt in content

A dashed rounded card containing:

- mic/check icon;
- label;
- target phrase;
- completed learner playback;
- retry action;
- optional Skip.

### StickyRecordCTA below content

A second surface containing:

- huge custom 140×140 SVG mic;
- “Нажмите, чтобы записать”;
- AudioLevelMeter during recording;
- large red stop state;
- error state.

## Severity

**P1 — highest visual redesign priority**

This is the exact area that currently feels like a separate technical utility.

## Problems

### 12.1 Two surfaces describe one action

The prompt is in the scroll, but the action is elsewhere.

The learner has to mentally connect:

`record prompt card ↑`

with:

`large recorder ↓`

This weakens conversational continuity.

### 12.2 RecordPrompt looks like a system card, not learner speech

Current visual traits:

- dashed border;
- hover lift;
- muted utility label;
- separate skip link.

It reads more like “task widget” than “your turn to speak”.

### 12.3 completed state becomes visually disabled

`lesson-record-prompt--done` uses `opacity: 0.55`.

Completed learner speech should feel accomplished, not disabled.

### 12.4 learner playback is embedded inside prompt card

This directly matches the observed problem: after recording, the blue playback bar is inserted inside the same task card.

The result has too many nested concepts:

`task card → target → recording player → retry`

### 12.5 giant microphone dominates the lesson

The custom 140px SVG makes recording controls visually disproportionate to the language itself.

### 12.6 audio level meter adds technical instrumentation

Five level bars are useful debugging feedback but do not need to look like recording equipment.

### 12.7 red recording state feels alarm-like

Red is semantically appropriate for “recording” in utility software but too aggressive for a calm learning experience.

## Redesign goal

Speaking should feel like **a learner turn in the conversation**.

Target conceptual flow:

```text
Your turn

Բարև
Barev

[ listen to example ]

        [ microphone ]
      Tap to speak
```

During recording:

```text
        ● Recording 0:04

       [ Finish ]
```

After recording:

```text
You
[ play ] ━━━━━ 0:04

[ Record again ]
```

The target phrase and learner recording should not visually fight for ownership of the same card.

## Design direction

Use a single `SpeakingTurn` experience consisting of:

- prompt/context;
- optional canonical phrase;
- optional reference audio;
- primary record action;
- calm recording feedback;
- learner playback;
- retry.

The action may still use a sticky dock on small screens, but it must visually belong to the same SpeakingTurn.

## Required palette

- terracotta/warm neutral for actions and recording controls;
- muted success;
- subtle recording pulse;
- soft blue may identify the completed learner message / Student Bubble;
- no saturated blue as the recording technology color;
- red only for destructive/error state, not primary recording mode.

---

# 13. Pronunciation Trainer

## Current behavior

Practice > Pronunciation has:

- separate header;
- word card;
- syllable card;
- reference audio;
- recording card;
- level meter;
- recording status;
- playback;
- retry;
- next word.

## Severity

**P1/P2**

The trainer is functionally rich, but it duplicates the recording experience with another UI system.

## Problems

- recording logic visually differs from Lesson speaking;
- separate technical recording panel;
- same blue learner playback;
- syllable card + word card + record card creates excessive card stacking;
- dictionary source is still legacy/static.

## Target

After SpeakingTurn is redesigned, Pronunciation Trainer should reuse the same recording primitives.

Do not maintain two independent microphone experiences.

---

# 14. Dialogue

## Current behavior

`MiniDialogue` renders:

1. instruction text;
2. character bubble with initial avatar;
3. answer choices;
4. selected learner bubble;
5. incorrect feedback as a separate “Lusine” card;
6. simulated typing dots;
7. character reply.

## Strengths

The functional sequence is already good.

It behaves like a mini conversation rather than a static quiz.

Good elements:

- character and learner have separate sides;
- selected learner answer becomes part of thread;
- character replies after a delay;
- incorrect choice creates feedback;
- successful choice advances progression;
- retry count is tracked.

## Severity

**P1 — highest visual redesign priority**

The mechanic is strong; presentation needs to catch up.

## Problems

### 14.1 dialogue has three different conversational surfaces

- character message bubble;
- learner bubble;
- Lusine feedback card.

Lusine feedback is not visually the same teacher bubble system already used elsewhere.

### 14.2 avatar is only an initial badge

The initial floating outside the bubble is functional but looks generic.

For named recurring characters, a small consistent portrait/character token would make scenes feel deliberate.

### 14.3 options look like generic form controls

The answer choices are full-width bordered buttons below the conversation.

They function, but the transition from “conversation” to “form” is visually abrupt.

### 14.4 incorrect answer remains as a red-outlined learner bubble

The user response becomes part of the conversation, then the same thread receives a teacher correction.

This is pedagogically useful, but error styling should not make the dialogue feel broken or punitive.

### 14.5 typing indicator lacks speaker anchoring

The typing surface appears as a generic floating block rather than clearly belonging to the character.

### 14.6 no unified audio affordance in dialogue turns

Dialogue should eventually allow character lines to be heard naturally using the same audio system.

## Target dialogue visual model

```text
Situation / instruction

[ Character avatar ]  Ani · barista
                      Ի՞նչ կցանկանաք
                      [ audio ]

Your answer

┌─────────────────────────────┐
│ Մի սուրճ, խնդրում եմ        │
│ One coffee, please           │
└─────────────────────────────┘
┌─────────────────────────────┐
│ ...                         │
└─────────────────────────────┘
```

After selection:

```text
                           You
                 Մի սուրճ, խնդրում եմ

[ Character ]  Շատ լավ...

[ Lusine teacher bubble only when pedagogically useful ]
```

## Decision

Dialogue should be redesigned as a **scene thread**, not a quiz with bubble decoration.

Reuse the existing teacher bubble for Lusine feedback instead of inventing another teacher style.

---

# 15. Active Recall

## Current behavior

Active Recall reuses dialogue styling.

Before reveal:

- prompt;
- actions in interaction dock:
  - “Я ответил”;
  - “Нужна подсказка”.

Hint opens a bottom sheet from Lusine.

After reveal:

- answer appears as learner bubble;
- learner self-rates:
  - “Нужно повторить”;
  - “Получилось”.

## Strengths

**KEEP / POLISH**

This is pedagogically one of the better interactions.

Good decisions:

- learner must act before reveal;
- hint is optional;
- hint usage is tracked;
- answer becomes a learner turn;
- self-evaluation produces meaningful outcome.

## Problems

### P2 — visually dependent on current Dialogue system

Once Dialogue is redesigned, Active Recall must inherit the same learner-turn language.

### P2 — answer bubble says “Вы” even though the system revealed it

This is conceptually okay (“this is what you should have said”), but copy could clarify:

“Ваш ответ” / “Сравните”.

### P2 — hint sheet is good but should use teacher identity consistently

“Подсказка Лусине” is strong. Maintain it.

---

# 16. Multiple Choice

## Current behavior

The lesson renderer sends `onAnswer={() => {}}`.

The component itself:

- stores selection locally;
- shows correct/wrong;
- optionally shows explanation.

It currently does not participate in the same InteractionAttempt and required progression pipeline as Dialogue/Recall/Record.

## Severity

**P0/P1 architectural UX defect**

This is not just visual.

A learner can perform a cognitively important choice, but the engine does not treat it as first-class evidence in the same way as other interactions.

## Target

Choice must become canonical Interaction:

- stable Interaction ID;
- start attempt;
- selectedOptionId;
- correct/incorrect outcome;
- retry policy;
- required flag;
- progression gating when required;
- feedback layer.

## Visual direction

Do not reuse the old generic quiz card unchanged.

Choice presentation depends on context:

- semantic meaning question;
- listening comprehension;
- pattern noticing;
- dialogue response.

The common contract should be behavioral, not force one identical visual card.

---

# 17. Standalone LessonAudioCard

## Current behavior

Card containing:

- audio icon;
- title;
- description;
- waveform;
- play;
- duration.

## Assessment

**P2 / potential consolidation**

It is usable, but adds another media-card visual language.

Use it only where the audio itself is the learning object, such as Listening First.

Do not use standalone AudioCard where:

- audio belongs to a phrase;
- audio belongs to Lusine;
- audio belongs to a dialogue line.

Those should use their native component.

---

# 18. Video

## Current behavior

Legacy roles:

- circle;
- scene;
- lesson.

Opening uses a separate full-screen VideoOverlay.

## Current decision

Already covered by `LESSON_ENGINE_V2.md`:

- no new circle presentation;
- one rounded `VideoCard`;
- roles: mentor / scene / explanation;
- AI-generated scene video is Presentation, not Dialogue.

## Severity

**P1 after speaking/dialogue**

Do not implement video redesign before the core speaking/dialogue pass.

---

# 19. Lesson Action Dock

## Current behavior

Displays:

- next Step title;
- Continue;
- Finish;
- syncing/error state.

Mobile stacks title and button.

## Strengths

**KEEP / POLISH**

This is a sound interaction pattern.

It separates navigation from content.

## Problems

### P2 — can compete with active interaction dock

There are multiple bottom/action concepts:

- recording sticky CTA;
- interaction portal;
- lesson action dock.

The runtime should have one defined bottom-action ownership rule.

## Target rule

At any moment, the bottom action area is owned by exactly one state:

1. active interaction;
2. Step completion;
3. Lesson completion.

Never visually stack competing primary CTAs.

---

# 20. Completion screen

## Current behavior

Shows:

- “Урок завершён!”;
- actual lesson title;
- recap of canonical LearningItems;
- Home button.

## Strengths

The completion state is now content-aware and canonical.

**KEEP the logic.**

## Problems

### P1/P2 — emotional payoff is weak

The screen is structurally a warm bordered card.

It does not yet fully communicate:

> “Теперь я реально умею X.”

## Target

Completion should show:

1. capability acquired;
2. lesson title;
3. 3–5 high-value phrases;
4. review handoff confirmation;
5. clear next action.

Avoid generic gamification.

Preferred message:

`Теперь вы можете заказать кофе по-армянски.`

rather than:

`+50 XP`.

---

# 21. Practice — Mixed Review

## Current behavior

Three modes:

- recall;
- listening;
- recognition.

After reveal user selects:

- Ещё раз;
- С трудом;
- Знаю.

## Strengths

**KEEP**

The underlying model is good:

- one canonical LearningItem;
- mixed modalities;
- answer hidden first;
- learner self-rates;
- session summary.

## Problems

### P2 — looks somewhat like a generic flashcard product

Current central large card is clean but does not yet carry much of the conversational Sovorir identity.

### P2 — listening uses yet another circular progress player

This should align with the Audio System.

### P2 — Practice header says “Карточки”

The new system is no longer just cards.

A future label like “Повторение” / “Смешанная практика” may fit the product model better.

## Decision

Polish after Lesson Runtime.

---

# 22. Dictionary

## Current state

Still driven by static legacy dictionary data.

## Severity

**P2 architectural cleanup**

Not a current UX blocker, but long-term it should consume canonical LearningItems rather than a parallel dictionary model.

Do not redesign first.

---

# 23. Notes / teacher advice

## Assessment

**KEEP / P2**

Teacher notes support the human-mentor positioning.

They are not part of the current learner-loop problem.

---

# 24. Assignments

## Assessment

**KEEP / P2**

Functionally separate from the self-paced Lesson Engine.

Do not include in first polish sprint unless a shared primitive changes underneath it.

---

# 25. Color system audit

## Strong current colors

Keep:

- terracotta primary;
- cream/off-white surfaces;
- charcoal text;
- warm borders;
- muted green success.

## Student color family

The legacy learner/student blue system:

```css
--color-student-rgb: 85, 180, 228;
--color-student-dark: #1681C0;
--color-student-muted: #3A97C5;
--color-waveform-student-played: #55B4E4;
--color-waveform-student-unplayed: #BBDFF0;
--color-student-progress-from: #4FC3F7;
--color-student-progress-to: #0288D1;
```

## Decision

Preserve **blue as a conversational identity for Student Bubble**, but soften and narrow its scope.

Blue SHOULD mean:

- learner-authored / learner-spoken message;
- the right side of a conversation;
- “это моя реплика”.

Blue SHOULD NOT automatically mean:

- generic audio progress;
- recording activity;
- microphone state;
- global student progress;
- unrelated action buttons.

The Student Bubble should be a visual sibling of Teacher Bubble, not a separate technical design system.

---

# 26. Card system audit

Current learner runtime contains too many “everything is a card” moments:

- PhraseGroup;
- RecordPrompt;
- Rule;
- LessonAudioCard;
- quiz;
- Completion;
- Video;
- Practice;
- Pronunciation word;
- Pronunciation syllables;
- Pronunciation record.

## Problem

When every block has:

- border;
- radius;
- background;
- padding;

nothing establishes hierarchy.

## Target surface taxonomy

Define only:

### Message surface

Teacher / character / learner conversational turn.

### Learning surface

Phrase group / rule / pattern.

### Interaction surface

Choice / recall / speaking action.

### Feature surface

Scene video / listening focus.

### Navigation surface

Action dock / completion CTA.

Components should not invent a sixth card style casually.

---

# 27. Typography audit

Current typography direction is broadly good:

- UI sans;
- Armenian-specific font;
- serif Step title.

## Keep

- Armenian phrases visually dominant;
- Step title as scene/cognitive heading;
- muted translation/transliteration.

## Improve

Define exact hierarchy for:

1. Armenian;
2. transliteration;
3. translation;
4. Russian pronunciation aid;
5. context.

Do not display all five with similar emphasis.

---

# 28. Animation / motion

Current useful motion:

- progressive reveal;
- typing dots;
- recording pulse;
- subtle button feedback.

## Problems

Some hover lifts/shadows come from earlier desktop-card conventions.

Mobile lesson should not feel like a website full of hover cards.

## Direction

Prefer motion that communicates state:

- reveal;
- listening progress;
- recording active;
- reply arrives;
- success.

Avoid decorative card lifting inside the lesson.

---

# 29. Loading / error / offline

## Current strengths

- lesson loading state;
- lesson load error + retry;
- recording error;
- save error;
- audio error;
- completion sync state.

## P2 problem

Error language and presentation are component-specific.

Future design system should define:

- inline recoverable error;
- blocking load error;
- media unavailable state;
- permission denied state;
- offline/pending sync state.

The app already has local-first behavior in InteractionAttempts; UI should eventually expose sync failure gracefully without alarming the learner.

---

# 30. Accessibility / touch

Positive existing work:

- ARIA labels;
- button semantics;
- 44–48px controls in many places;
- safe-area usage;
- keyboard Escape for hint sheet;
- mobile-specific action dock.

## Important follow-up

Speaking redesign must preserve:

- minimum touch size;
- recording permission feedback;
- visible state change;
- screen-reader labels;
- no color-only status;
- retry after permission denial.

Dialogue options must retain clear focus and selected/error semantics.

---

# 31. Functional findings discovered during UX audit

These are not visual-only and should become engineering tickets.

## F1 — preserve lesson identity on Back

**Severity: P0/P1**

MobileHeader previous-Step navigation currently drops `lesson=<apiId>`.

Fix after Pilot validation or immediately if reproduced in live E2E.

## F2 — Choice is not a canonical tracked/gated Interaction

**Severity: P0/P1**

`MultipleChoiceCard` in the lesson receives a no-op `onAnswer`.

Required Choice must join the InteractionAttempt + completion pipeline.

## F3 — duplicate recording experiences

**Severity: P1**

Lesson speaking and Practice pronunciation implement separate visual recording systems.

Consolidate after defining SpeakingTurn.

## F4 — duplicate audio languages

**Severity: P1**

Teacher waveform, standalone waveform, phrase ring, learner blue bar and Practice listening ring should be normalized.

## F5 — teacher feedback inside Dialogue does not reuse teacher bubble

**Severity: P1**

Unify teacher identity.

## F6 — completed speaking state looks disabled

**Severity: P1**

Do not use 55% opacity as “success”.

---

# 32. Component disposition matrix

| Function | Decision | Priority |
| --- | --- | --- |
| Home | Keep, later polish | P2 |
| Course | Keep, later polish | P2 |
| App shell | Keep | — |
| Lesson header | Keep, fix identity issue | P0/P2 |
| Lesson shell | Keep architecture | — |
| Teacher bubble | **KEEP** | — |
| PhraseGroup | Keep, polish hierarchy | P2 |
| Rule | Keep | P2 |
| Audio system | Consolidate | P1 |
| RecordPrompt | Redesign | P1 |
| StickyRecordCTA | Redesign/merge conceptually | P1 |
| RecordingPlayback | Restyle + reuse | P1 |
| Dialogue | Redesign visually | P1 |
| Active Recall | Keep behavior, inherit new conversation UI | P2 |
| Multiple Choice | Canonicalize behavior + redesign contextually | P0/P1 |
| LessonAudioCard | Consolidate use cases | P2 |
| Video | Unified VideoCard already specified | P1 |
| Action Dock | Keep, define ownership | P2 |
| Completion | Keep logic, improve payoff | P1/P2 |
| Mixed Practice | Keep logic, later polish | P2 |
| Pronunciation Trainer | Reuse Speaking primitives | P1/P2 |
| Dictionary | Later canonical migration | P2 |
| Notes | Keep | P2 |
| Assignments | Keep | P2 |

---

# 33. Recommended implementation order

## Phase 0 — finish live Pilot Gate verification

Do not destabilize learner progression before validating production.

Verify:

- L1–L5 sequential progression;
- resume;
- deep link;
- attempts;
- Practice handoff;
- device behavior.

Log visual defects while testing.

## Phase 1 — Learner Design System v1

Before code, define:

- warm color roles;
- surface taxonomy;
- typography;
- spacing;
- audio primitives;
- learner/teacher/character message primitives;
- interaction dock;
- state colors.

Explicitly keep soft student blue for Student Bubble identity while deprecating the saturated technical blue media subsystem.

## Phase 2 — SpeakingTurn redesign

Create one reusable learner-speaking experience.

Unify:

- prompt;
- reference audio;
- record;
- recording state;
- playback;
- retry;
- error;
- completion.

Use it in Lesson first, then Pronunciation Trainer.

## Phase 3 — Dialogue Scene redesign

Build:

- CharacterMessage;
- LearnerMessage;
- DialogueChoice;
- CharacterTyping;
- teacher feedback via existing TeacherBubble;
- optional inline audio;
- clean correct/incorrect transitions.

## Phase 4 — canonical Choice

Move MultipleChoice into the tracked Interaction flow.

Do not allow a required choice to be merely decorative local state.

## Phase 5 — Audio System

Normalize:

- Phrase audio;
- Message audio;
- learner playback;
- listening focus.

Remove blue playback language.

## Phase 6 — Unified VideoCard

Implement `LESSON_ENGINE_V2` media decision.

## Phase 7 — completion + Practice polish

Once lesson language is stable, apply it to:

- completion;
- Mixed Practice;
- Pronunciation;
- Course/Home light polish.

---

# 34. What should NOT happen next

Do not:

- start L6/L7 implementation;
- globally change random margins/colors;
- rewrite Home first;
- delete teacher bubbles;
- convert everything into chat bubbles;
- introduce more component-specific audio players;
- add more blue indicators;
- build Grok video integration before VideoCard exists;
- rewrite the lesson engine from scratch;
- migrate all legacy stores in one large PR.

---

# 35. Definition of success for the polish sprint

A learner should be able to open any L1–L5 Step and immediately understand:

1. **what Lusine/context is telling me;**
2. **what language matters;**
3. **what I am supposed to do now;**
4. **what happened after I acted;**
5. **how I continue.**

Without needing to understand the component type.

Speaking should feel like “my turn to talk”, not “a recorder opened”.

Dialogue should feel like “I am inside a small scene”, not “I answered a quiz with chat decoration”.

Audio should feel like one product system, not several unrelated media widgets.

Teacher bubbles should remain recognisable and unchanged in concept.

---

# 36. Next design artifact

The next document should be:

`LEARNER_DESIGN_SYSTEM_V1.md`

It must define the concrete UI contract before implementation:

- palette and removal of learner blue;
- surface taxonomy;
- TeacherBubble preservation rules;
- CharacterMessage;
- LearnerMessage;
- SpeakingTurn states;
- DialogueChoice;
- audio controls;
- VideoCard;
- InteractionDock;
- Completion state;
- responsive/mobile behavior.

After that, create:

`LESSON_RUNTIME_UI_V2.md`

with full screen compositions and state-by-state flows for:

- guided speaking;
- dialogue;
- active recall;
- listening;
- video scene;
- Step completion;
- Lesson completion.

Only then should Codex receive implementation tickets.
