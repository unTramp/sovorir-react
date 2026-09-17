# Sovorir Curriculum System v1

**Status:** Product / pedagogy contract v1  
**Date:** 2026-09-18  
**Scope:** learner curriculum, lesson composition, review system, audio/video production, mentor content pipeline  
**Source of truth:** this document defines how new Sovorir lessons should be designed. It does not replace canonical domain contracts; it constrains how they are used.

---

## 1. Product learning promise

Sovorir is not a phrasebook and not a sequence of quizzes. The product should teach a beginner to **recognize, retrieve and use spoken Eastern Armenian in real situations**.

The primary user feeling after a unit should be:

> «Я реально могу это сказать и понять в Ереване».

Progress is therefore measured by communicative capability, not by the number of screens viewed or words marked as learned.

The core learning loop is:

**Situation → Comprehension → Guided production → Retrieval → Realistic use → Spaced return**

A lesson MAY omit one stage when the archetype requires it, but a unit must contain all six.

---

## 2. Stable shell, variable lesson experience

The application needs a familiar outer rhythm while individual lessons must not feel copied from one template.

### 2.1 What remains predictable

Every normal lesson has:

1. a concrete communicative objective;
2. a real-life situation;
3. a small set of canonical LearningItems;
4. at least one meaningful learner action;
5. an immediate end-of-lesson retrieval check;
6. items eligible for future spaced practice.

### 2.2 What SHOULD vary

Lessons should vary in:

- opening modality: text, audio, video circle, scene video;
- order of explanation and discovery;
- amount of visible text;
- type of production: repeat, construct, choose, record, answer;
- interaction structure;
- formal vs informal register comparison;
- proportion of listening / speaking / reading;
- whether the final task is a dialogue, mission, listening test or free production.

### 2.3 Anti-template rule

Do NOT publish three consecutive lessons with the same sequence of section kinds.

Bad:

`intro → vocabulary → speaking → dialogue → recall`

repeated for Lessons 1, 2, 3, 4...

Preferred:

- L1: guided speaking;
- L2: discovery + conversation building;
- L3: listening first;
- L4: branching mission;
- L5: pattern building;
- L6: listening discrimination;

The learner should recognize the Sovorir language, not predict the next UI widget.

---

## 3. Lesson archetypes

A lesson has one PRIMARY archetype and may use mechanics from others.

### 3.1 Guided Speaking

**Purpose:** first contact with speech production and pronunciation.

Typical flow:

`mentor context → phrase → listen → repeat → small choice → recall`

Use for:

- first lesson;
- high-value survival phrases;
- pronunciation-sensitive material.

Target balance:

- 25% comprehension;
- 50% guided speaking;
- 25% retrieval/context use.

### 3.2 Discovery

**Purpose:** make the learner infer meaning before explanation.

Typical flow:

`audio/video scene → meaning question → reveal phrase → notice pattern → use it`

The answer is explained after the learner commits to an interpretation.

Use for:

- common conversational expressions;
- register contrasts;
- phrases whose meaning is obvious from context.

### 3.3 Conversation Builder

**Purpose:** progressively construct a conversation.

Typical flow:

`line 1 → learner reply → line 2 → learner reply → variation → full conversation`

Every added phrase should immediately unlock a new conversational turn.

Use for:

- introductions;
- small talk;
- service encounters.

### 3.4 Listening First

**Purpose:** develop recognition of natural speech instead of dependence on written Armenian/transliteration.

Typical flow:

`audio/video without transcript → comprehension → replay → transcript/reveal → shadow → dialogue`

Rules:

- first exposure SHOULD hide transcription where practical;
- learner may replay;
- transcript appears after first semantic attempt;
- final task uses a different voice/context where assets are available.

### 3.5 Pattern Builder

**Purpose:** discover and use a productive construction rather than memorize multiple isolated phrases.

Typical flow:

`two examples → notice what changes → rule in plain language → substitution → free slot`

Examples:

- «я хочу …»;
- «у меня есть …»;
- informal/polite pronoun switching;
- destinations with a reusable pattern.

Grammar terminology is secondary. Prefer observable patterns and communicative outcomes.

### 3.6 Mission

**Purpose:** integrate multiple previous skills in a simulated real-world task.

Typical flow:

`brief → scene → decisions / spoken replies → unexpected variation → outcome`

A Mission should introduce little or no new vocabulary. It is mainly retrieval and transfer.

Examples:

- order coffee;
- buy something;
- tell a taxi driver a destination;
- meet a new person;
- ask for directions.

### 3.7 Listening Discrimination

**Purpose:** distinguish similar sounds/forms/intent in natural audio.

Typical flow:

`two or more clips → identify meaning/form → replay → contrast explanation → production`

Useful for Armenian endings, polite/informal forms and frequently confused sounds.

### 3.8 Free Production

**Purpose:** move beyond fixed answer buttons.

Typical flow:

`prompt → planning cue → learner records response → self-check/reference → optional teacher task`

Use sparingly in early A0/A1 and increasingly as vocabulary grows.

---

## 4. Media roles

Media is instructional, not decoration.

### 4.1 Audio phrase asset

Use for canonical pronunciation of a LearningItem.

Desired future variants:

- `normal` — natural but clear;
- `slow` — teaching speed;
- optional `contrast` / alternate speaker.

Pilot state MAY reuse `PILOT_AUDIO`.

### 4.2 Mentor voice bubble

Short spoken guidance from the mentor.

Good for:

- context;
- one teaching hint;
- encouragement after a difficult transition;
- culture/register note.

Avoid long lecture bubbles.

Recommended duration: **5–18 sec**.

### 4.3 Video Circle (`presentation: circle`)

Telegram-like circular mentor video. This is a first-class Sovorir mechanic.

Purpose:

- social presence;
- mouth/articulation visibility;
- greeting or reaction;
- human transition between stages;
- short cultural nuance.

Recommended duration: **4–20 sec**.

Rules:

- one idea per circle;
- no dense subtitles over the face;
- tap opens/replays; inline preview remains circular;
- muted autoplay is NOT required;
- sound must never start unexpectedly;
- circles should not be used simply because video exists.

Examples:

- «Смотрите на губы: дзез»;
- natural `Ո՞նց ես` with facial expression;
- «С другом здесь скажите так, а со старшим — вот так».

### 4.4 Lesson Video (`presentation: lesson`)

A normal instructional video, usually 30–90 sec.

Purpose:

- explanation that benefits from gesture/visual examples;
- compact grammar/pattern explanation;
- cultural context;
- pronunciation demonstration with overlays.

Should have:

- thumbnail;
- duration;
- optional captions/transcript;
- clear learning objective.

Do not place a long teacher video before every lesson.

### 4.5 Scene Video (`presentation: scene`)

Short realistic scene used as input before explanation or as a mission stimulus.

Examples:

- customer/barista;
- meeting at a language club;
- taxi driver/passenger;
- cashier/customer.

Purpose:

- infer meaning from situation;
- listening comprehension;
- transfer to natural speech.

Recommended duration: **8–35 sec**.

A scene may contain more than one speaker and SHOULD be reusable in later review.

---

## 5. Proposed media contract

Keep one canonical `video` block type at the API/storage level and vary presentation through metadata.

```ts
interface VideoBlock {
  type: 'video';
  presentation?: 'circle' | 'lesson' | 'scene';
  senderName?: string;
  text?: string;
  videoSrc: string;
  thumbnail?: string;
  duration?: number;
  captions?: Array<{ startMs: number; endMs: number; text: string }>;
  transcript?: string;
  posterMode?: 'image' | 'first-frame';
}
```

Default for legacy blocks: `presentation: 'lesson'`.

Do NOT create separate storage block enums for circle/scene unless future behavior proves materially different.

---

## 6. Interaction palette

The lesson engine should support a palette, not a fixed sequence.

### Input / comprehension

- phrase/audio listen;
- video circle;
- scene video;
- meaning multiple choice;
- identify register/intention;
- listening discrimination;
- transcript reveal;
- reading micro-dialogue.

### Guided production

- repeat/record;
- shadowing after audio;
- substitute name/place/item into a pattern;
- reconstruct a phrase;
- select a reply then speak it.

### Retrieval

- active recall from Russian/situation;
- listen and answer without transcript;
- delayed phrase recall;
- old-item interruption from prior lessons.

### Transfer

- dialogue;
- branching dialogue;
- mission;
- free recording;
- teacher assignment.

Not every mechanic must become a new React block immediately. New blocks are justified when behavior/state differs meaningfully.

---

## 7. Cognitive load rules

### 7.1 New material budget

For early A0/A1 lessons:

- preferred: **3–5 new LearningItems**;
- soft maximum: **6**;
- more items require grouping into a productive pattern or splitting the lesson.

A Mission may contain 0–2 new low-risk items but preferably none.

### 7.2 Old/new ratio

Starting from Lesson 3, every lesson SHOULD reuse earlier material.

Target over a unit:

- 60–75% current/new objective;
- 25–40% previously learned material appearing in new contexts.

### 7.3 Recognition is not mastery

Multiple choice alone MUST NOT mark a speaking item mastered.

For a speaking LearningItem, mastery evidence should eventually include at least one retrieval/production interaction.

### 7.4 Transliteration dependency

Early lessons may show transliteration prominently.

Over time:

1. Armenian + transliteration + translation;
2. Armenian + optional transliteration;
3. audio first, Armenian reveal later;
4. situation/audio with no immediate Russian cue.

This fading is gradual and item-sensitive.

---

## 8. Retrieval and review model

There are two different review loops.

### 8.1 Immediate Recall

Occurs inside or at the end of a lesson.

Purpose: verify that the learner can retrieve key material after a short delay.

Rules:

- do not repeat every teaching card verbatim;
- 2–4 high-value retrievals are enough for a normal lesson;
- use situation prompts rather than translation whenever possible.

### 8.2 Spaced Practice

Occurs outside the original lesson.

The Practice queue SHOULD mix:

- due items from older lessons;
- one or two recent items;
- listening and production modalities;
- different contexts for the same item.

Practice must avoid turning into a flashcard-only subsystem.

Future scheduling may use confidence/outcome/retry/hint history from `InteractionAttempt`.

---

## 9. Unit and mission structure

Recommended early curriculum rhythm:

| Lesson | Communicative objective | Primary archetype |
| --- | --- | --- |
| 1 | Поздороваться и попрощаться | Guided Speaking |
| 2 | Познакомиться | Conversation Builder / Discovery |
| 3 | Спросить «Как дела?» | Listening First |
| 4 | Заказать кофе | Mission / Conversation |
| 5 | Сказать «хочу / не хочу» | Pattern Builder |
| 6 | Понять числа и цену | Listening Discrimination |
| 7 | Купить что-то | Mission |
| 8 | Спросить, где находится место | Conversation Builder |
| 9 | Назвать место в такси | Listening + Speaking |
| 10 | Договориться о времени | Pattern Builder |
| 11 | Коротко рассказать о себе | Free Production |
| 12 | Yerevan Mission #1 | Integrated Mission |

This roadmap is directional; Armenian language review may alter exact wording/order.

### Unit checkpoint

Every 4–6 lessons, include a mission/checkpoint with little new content.

Every 10–12 lessons, include a larger integrated mission.

---

## 10. Lesson 1–3 differentiation contract

### Lesson 1 — Greetings

Primary archetype: Guided Speaking.

Experience:

`mentor context → four phrases → listen/repeat → contextual dialogue → immediate recall`

It teaches both Armenian and the Sovorir interaction model.

### Lesson 2 — Introductions

Primary archetype: Conversation Builder + Discovery.

Preferred experience:

1. An Ani video circle/audio says `Անունս Անի է` before the translation is shown.
2. Learner guesses/recognizes intent.
3. Meaning is revealed.
4. Learner personalizes: `Անունս … է`.
5. Informal question appears in a peer conversation.
6. Polite version appears in an adult/formal context.
7. Learner notices the contrast rather than reading a grammar lecture.
8. Two short dialogues use different registers.
9. Only the most important items receive immediate recall; all canonical items enter Practice.

Lesson 2 must NOT feel like Lesson 1 with different phrase cards.

### Lesson 3 — How are you?

Primary archetype: Listening First.

Preferred experience:

1. Hear/watch `Ո՞նց ես` without transcript.
2. Choose the communicative meaning.
3. Reveal text/transliteration.
4. Shadow the phrase.
5. Hear `Լավ եմ, շնորհակալություն։ Իսկ դո՞ւ։` as one chunk.
6. Understand the function before decomposing it.
7. Compare informal and polite contexts.
8. Final conversation reuses greetings/goodbyes from Lesson 1.

Lesson 3 should contain less up-front reading than Lessons 1–2.

---

## 11. Mentor model: Ani now, Lusine later

The mentor identity is presentation content, not curriculum identity.

For pilot development:

- use temporary mentor **Ani**;
- shared/fake audio is allowed;
- fake video assets/posters are allowed;
- canonical LearningItems and interaction IDs must remain mentor-independent.

When Lusine returns:

- replace mentor metadata/assets;
- do not change stable LearningItem IDs merely because the speaker changes;
- increment lesson/item revision only when pedagogical meaning/content changes.

---

## 12. Lusine Content Production Pipeline

Lusine's highest-value role is **native voice, face, cultural judgement and language QA**, not manually inventing lesson architecture.

### 12.1 Pipeline

`Curriculum plan`
→ `lesson script generated/prepared`
→ `language QA`
→ `recording pack generated`
→ `batch session with Lusine`
→ `asset ingestion`
→ `lesson preview`
→ `QA`
→ `publish`

### 12.2 Audio recording pack

For every LearningItem provide Lusine with:

- stable key;
- Armenian text;
- intended meaning/context;
- register;
- requested takes;
- target emotion;
- target speed;
- filename/asset ID.

Default requested takes:

1. natural/clear;
2. slow teaching take where useful.

Dialogues are additionally recorded as whole exchanges so learners hear connected speech.

### 12.3 Video-circle prompt template

Each circle brief contains:

- lesson + step;
- learning objective;
- exact spoken text or semantic intent;
- emotion/tone;
- target duration;
- whether mouth articulation is important;
- whether captions are needed;
- framing note.

Example:

```text
Lesson 3 / informal greeting
Format: video circle
Duration: 7–10 sec
Goal: learner hears natural Ո՞նց ես and sees articulation
Tone: warm, casual, as if meeting a familiar student
Script: «Ո՞նց ես» + one natural repetition
Do not explain grammar.
```

### 12.4 Lesson-video prompt template

```text
Lesson 5 / pattern explanation
Format: lesson video
Duration: 45–60 sec
Goal: show how one construction changes with the object
Hook: one real situation
Examples: maximum 3
End with a direct learner task
No long theoretical grammar terminology
```

### 12.5 Batch production

Recording sessions SHOULD be organized by asset type rather than lesson-by-lesson:

- phrase audio batch;
- dialogue batch;
- video-circle batch;
- lesson-video batch.

This minimizes setup/context switching and allows 5–10 lessons to be covered in one production session when scripts are ready.

---

## 13. Content QA gates

A lesson cannot be publish-ready until it passes:

### Language QA

- native wording is natural Eastern Armenian;
- register is correct;
- transliteration is consistent;
- translation expresses communicative meaning rather than misleading literal wording;
- audio/video matches text.

### Pedagogy QA

- objective describes a real capability;
- new-item budget is respected;
- at least one production/retrieval action exists;
- old content is reused where appropriate;
- lesson differs meaningfully from adjacent lessons;
- no interaction exists only to increase click count.

### Product QA

- stable IDs unique;
- all tracked LearningItem IDs exist;
- media has fallback behavior;
- no autoplay surprise audio;
- lesson is resumable;
- mandatory interactions are accessible and completable;
- mobile viewport is primary.

---

## 14. Technical roadmap

### Phase A — Curriculum contract (NOW)

- [x] canonical Lesson 1 foundation;
- [x] canonical Lesson 2/3 draft content;
- [x] interaction attempt persistence;
- [x] cross-device resume bridge;
- [x] curriculum API runtime validation;
- [x] define Curriculum System v1;
- [ ] video presentation metadata (`circle | lesson | scene`);
- [ ] production-ready video-circle renderer;
- [ ] authoring/admin support for presentation choice.

### Phase B — Differentiated Lessons 2/3

- [ ] reshape Lesson 2 into discovery/conversation progression;
- [ ] reshape Lesson 3 into listening-first progression;
- [ ] add pilot video-circle blocks with fake assets;
- [ ] reduce repetitive phrase-card sequences;
- [ ] add tests asserting adjacent lessons have intentional structural variation;

### Phase C — Practice engine

- [ ] due-item queue;
- [ ] interaction-history-informed priority;
- [ ] mixed modalities;
- [ ] old/new interleaving;
- [ ] practice session completion metrics.

### Phase D — Lessons 4–6 / Unit 1

- [ ] L4 coffee mission;
- [ ] L5 pattern builder;
- [ ] L6 numbers/prices listening discrimination;
- [ ] first Unit checkpoint;

### Phase E — Lusine production system

- [ ] recording-pack generator;
- [ ] asset manifest;
- [ ] upload/attach workflow;
- [ ] video-circle batch workflow;
- [ ] language QA status;
- [ ] content preview/publish gate.

### Phase F — Integrated Unit Mission

- build Lessons 7–12;
- Yerevan Mission #1;
- teacher assignment/review where human feedback has high value.

---

## 15. Analytics needed later

Do not optimize solely for lesson completion.

Useful signals:

- first-attempt correctness;
- hint usage;
- retries;
- replay count;
- time before answer;
- skipped production;
- delayed recall outcome;
- performance on old items inside new lessons;
- mission success;
- lesson abandonment by step type.

Media analytics:

- circle play rate;
- replay rate;
- full video completion;
- video → successful interaction correlation.

These metrics should answer: **does this mechanic improve learning/engagement?**, not merely «was it clicked?».

---

## 16. Definition of Done for a new lesson

A new lesson is done when:

1. objective is communicative and testable;
2. primary archetype is declared;
3. structure differs intentionally from neighboring lessons;
4. canonical LearningItems have stable IDs/revisions;
5. all mandatory interactions have stable IDs/tracking;
6. new material budget is justified;
7. at least one previous item is reused from Lesson 3 onward where pedagogically sensible;
8. immediate recall exists but is not a verbatim replay of teaching cards;
9. reviewable items enter spaced Practice;
10. media serves a defined instructional role;
11. fake pilot media can be replaced without changing the curriculum identity;
12. curriculum validator, frontend tests and builds are green;
13. mobile lesson can be interrupted and resumed;
14. language has passed native review before final production release.

---

## 17. Product principle

**Sovorir should feel like a guided sequence of small real conversations, not a content carousel.**

Consistency belongs in navigation, interaction semantics and visual language. Variety belongs in the learning path.
