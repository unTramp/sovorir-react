# Sovorir Learner Design System v1

**Status:** learner UI contract  
**Date:** 2026-09-19  
**Scope:** learner-facing lesson, course and practice surfaces  
**Primary target:** mobile-first learner experience  
**Depends on:** `LEARNER_UI_UX_AUDIT.md`, `LESSON_ENGINE_V2.md`  
**Implementation status:** specification only; no component migration is implied until implementation tickets are created

---

## 1. Design goal

The Sovorir learner UI should feel like a calm, premium conversation with a real teacher, not a stack of generic EdTech widgets.

The interface should make the learner intuitively distinguish:

1. **someone is speaking to me;**
2. **this language matters;**
3. **it is my turn to act;**
4. **this is feedback;**
5. **I can continue.**

The design system exists to make those states visually obvious without adding labels and chrome everywhere.

---

## 2. Governing visual principles

### 2.1 Language before UI

Armenian content is the hero.

Controls, borders and progress indicators must never visually dominate the phrase being learned.

### 2.2 Conversation before cards

Use message geometry when the content is part of a conversation.

Do not wrap every conversational turn in a generic white card.

### 2.3 One mechanic, one visual family

Speaking, dialogue, listening and recall may have different behavior, but shared sub-actions should reuse the same primitives.

Examples:

- all play buttons share the same icon language;
- all learner recordings use the same playback primitive;
- all teacher messages use TeacherBubble;
- all learner turns use StudentBubble.

### 2.4 Warm action language

Primary actions, recording controls and learning emphasis belong to the warm Sovorir palette.

### 2.5 Soft student blue is semantic, not technical

Blue means:

> “это моя реплика / мой голос”

Blue does **not** mean:

- microphone;
- recording;
- generic audio progress;
- generic student state;
- global progress.

### 2.6 Reduce card stacking

Use hierarchy through spacing, typography and message placement before adding another bordered container.

---

# 3. Core visual roles

The learner UI should use five surface roles.

## 3.1 Message Surface

For:

- TeacherBubble;
- StudentBubble;
- CharacterMessage.

Represents a conversational utterance.

## 3.2 Learning Surface

For:

- PhraseGroup;
- Rule;
- Pattern;
- transcript/reveal.

Represents language being studied.

## 3.3 Interaction Surface

For:

- SpeakingTurn;
- Choice;
- Active Recall;
- Construct.

Represents an action required from the learner.

## 3.4 Feature Surface

For:

- VideoCard;
- focused Listening scene;
- image scene.

Represents rich contextual input.

## 3.5 Navigation Surface

For:

- InteractionDock;
- Continue;
- Finish;
- Completion CTA.

Represents progression, not lesson content.

New components should fit one of these roles before introducing a new surface family.

---

# 4. Color system

## 4.1 Primary warm palette

Current terracotta direction remains the product anchor.

Recommended semantic mapping:

```text
Primary action        → terracotta
Primary dark          → deep terracotta / brown
Content background    → warm off-white
Surface               → warm white / cream
Teacher surface       → warm cream / pale terracotta
Success               → muted olive/green
Warning               → warm amber
Error                  → restrained red
Student message       → soft dusty blue
```

Exact implementation tokens may evolve, but semantic roles must remain stable.

---

## 4.2 Student blue

The Student Bubble should keep a blue family.

Target characteristics:

- pale;
- dusty;
- slightly desaturated;
- compatible with cream/terracotta;
- low contrast as a background;
- medium contrast only for small accents.

Avoid bright cyan.

Conceptual roles:

```css
--student-surface
--student-surface-strong
--student-border
--student-accent
--student-text
```

The existing saturated values may be reused selectively during migration, but the final Student Bubble should not feel like a separate app theme.

---

## 4.3 Recording color

Recording is **not blue**.

Idle recording:

- primary terracotta.

Active recording:

- terracotta/deep warm tone;
- subtle pulse or live indicator.

Stop:

- high-contrast warm control.

Red is reserved for:

- actual error;
- destructive action;
- permission failure emphasis.

Do not use bright red as the normal “recording in progress” surface.

---

## 4.4 Success state

Success should use muted green/olive.

Avoid fluorescent green.

Success should communicate:

- complete;
- accepted;
- ready to continue.

Do not repaint entire bubbles bright green.

Use:

- small check;
- subtle border/accent;
- supporting text.

---

# 5. Typography

## 5.1 Hierarchy

Priority:

1. Armenian phrase;
2. conversational meaning/context;
3. transliteration;
4. translation;
5. pronunciation aid / metadata.

Not every layer should be visible at full strength simultaneously.

---

## 5.2 Armenian

Use the dedicated Armenian font.

Recommended visual priority:

- phrase learning: 23–30px mobile;
- short dialogue line: 16–20px;
- active recall answer: 20–26px;
- Practice hero answer: 26–32px.

Do not make Armenian appear like metadata.

---

## 5.3 Transliteration

Secondary.

Use when pedagogically needed.

Style:

- smaller;
- regular/medium;
- muted neutral;
- no italics if it reduces readability.

Transliteration should progressively fade from the course as the learner advances.

---

## 5.4 Translation

Use a softer contrast than Armenian.

In dialogue, translation may be hidden until reveal depending on lesson design.

---

## 5.5 Labels

Labels such as:

- “Лусине”;
- “Вы”;
- “Бариста”;
- “Ваш ответ”;

should be compact and secondary.

Do not create large uppercase UI headings inside every interaction.

---

# 6. Spacing

Use existing 4px-based scale.

Recommended rhythm:

```text
4   micro
8   related elements
12  compact control gap
16  default component padding
20  conversational separation
24  section separation
32  major phase separation
```

Important:

- messages in one conversation thread: 8–12px;
- new cognitive phase: 24–32px;
- Step title to first content: 20–24px;
- bottom dock safe separation: 12–16px.

---

# 7. Radius system

Keep the current warm rounded style but assign meaning.

Recommended:

- controls: 12–14px;
- message bubble: 18–22px with one asymmetrical corner;
- learning surface: 16–20px;
- feature/video: 20–24px;
- large Home hero: 28–32px;
- pills: full radius.

Do not randomly mix 10, 14, 16, 18, 20, 24, 28 and 32px without semantic reason.

---

# 8. Shadow system

Lesson runtime should use very little shadow.

Preferred:

- teacher/student message: subtle or none;
- learning surface: subtle 1px border + minimal shadow;
- active dock: stronger separation because it floats;
- Home hero: may retain deeper shadow;
- dialog choices: no floating-card shadow by default.

Avoid desktop-style hover elevation in the mobile lesson runtime.

---

# 9. Message Family

The most important visual family.

Includes:

- TeacherBubble;
- StudentBubble;
- CharacterMessage.

All three should feel related without being identical.

---

# 10. TeacherBubble

## 10.1 Status

**KEEP concept.**

Current teacher bubble is a strong Sovorir asset.

Do not redesign its identity.

## 10.2 Role

TeacherBubble represents:

- Lusine speaking;
- explanation;
- guidance;
- encouragement;
- correction;
- cultural hint.

## 10.3 Geometry

- left aligned;
- max width approximately 84–88%;
- warm cream/teacher gradient;
- asymmetric lower-left corner;
- avatar attached to message;
- sender name inside;
- audio integrated within the bubble.

## 10.4 Structure

```text
[avatar]
      Lusine
      Short guidance text

      [play]  waveform      0:08
```

## 10.5 Rules

TeacherBubble MUST:

- remain visually human;
- use Lusine avatar;
- keep audio inside the conversational message;
- support text-only and audio+text forms;
- avoid excessive borders.

TeacherBubble MUST NOT:

- become a generic card;
- use a separate “teacher audio card” for the same utterance;
- become full-width by default;
- use Student blue.

---

# 11. StudentBubble

## 11.1 Decision

StudentBubble should be a **mirrored sibling of TeacherBubble**.

It is not a generic response panel.

## 11.2 Role

Represents:

- learner-selected dialogue reply;
- learner-recorded speech;
- revealed learner answer when appropriate;
- learner message in simulated conversation.

## 11.3 Geometry

- right aligned;
- max width approximately 80–86%;
- soft blue background;
- subtle blue border;
- asymmetric lower-right corner;
- no large separate card container around it.

## 11.4 Structure: text reply

```text
                         You
                  Բարև, ես Անդրեյն եմ
```

Optional secondary information:

- transliteration;
- translation;

only if pedagogically required.

## 11.5 Structure: recorded reply

```text
                         You
                [play] ━━━━━━━ 0:04
```

The learner recording should look like a message, not like a technical playback widget embedded inside a task card.

## 11.6 Color

Keep soft blue.

Recommended hierarchy:

- surface: pale dusty blue;
- border: slightly deeper blue;
- active play icon: student accent;
- waveform/progress: shared neutral/audio treatment with a modest student accent.

Do not flood the player with saturated cyan.

## 11.7 Completed speaking state

When a learner finishes a SpeakingTurn, the resulting StudentBubble should appear in the conversation flow.

Do **not** fade it to 55% opacity.

Completion means:

> “я это сказал”

not:

> “этот контрол теперь disabled”.

---

# 12. CharacterMessage

## 12.1 Role

Represents a non-teacher character:

- Ani;
- barista;
- cashier;
- taxi driver;
- stranger;
- friend.

## 12.2 Geometry

- left aligned;
- same general family as TeacherBubble;
- visually simpler than TeacherBubble;
- no Lusine branding;
- character token/avatar near message.

## 12.3 Visual difference from TeacherBubble

Teacher = mentor authority.

Character = scene participant.

CharacterMessage should use:

- neutral/warm surface;
- role/name label;
- optional portrait or avatar;
- optional inline audio.

Avoid making every character use the exact Lusine bubble.

---

# 13. Character identity

For recurring scene characters use one of:

1. small portrait;
2. illustrated avatar;
3. consistent initial token only as fallback.

Do not use random initials as the final premium experience if the character recurs.

Avatar size should remain small enough that language remains primary.

---

# 14. MessageAudio

TeacherBubble, StudentBubble and CharacterMessage should use one shared audio layout family.

## 14.1 Layout

```text
[play/pause]  waveform/progress        time
```

## 14.2 Shared behavior

All MessageAudio instances:

- play/pause;
- progress;
- remaining/duration;
- loading;
- error;
- 44px touch target;
- consistent icon size.

## 14.3 Visual adaptation

Teacher:

- terracotta accent.

Student:

- restrained student blue accent.

Character:

- neutral/terracotta depending on scene.

The structure remains the same.

---

# 15. InlineAudioButton

For PhraseCard and compact language surfaces.

## Role

A small action to hear canonical pronunciation.

It should not show a full waveform.

Target:

- 44px control;
- play/pause;
- subtle progress ring or minimal progress cue;
- warm primary accent.

The Phrase audio ring may remain if standardized as the official InlineAudioButton.

---

# 16. RecordingPlayback

## Role

Playback of learner-recorded audio.

## New visual contract

RecordingPlayback should be able to render **inside StudentBubble**.

Structure:

```text
[play] ━━━━━━━━━━━━━ 0:04
```

Rules:

- no separate blue card background;
- parent surface owns the bubble color;
- player itself uses transparent background;
- progress should be slim;
- time aligned at end;
- touch target remains >=44px.

Standalone form may exist in Pronunciation Trainer, but the primitive must be identical.

---

# 17. SpeakingTurn

The highest-priority interaction component.

## 17.1 Purpose

SpeakingTurn is the complete experience of:

> “теперь скажите это сами”.

It replaces the current mental split between RecordPrompt and StickyRecordCTA.

## 17.2 States

Canonical states:

```text
idle
reference-playing
ready
recording
saving
recorded
retry
permission-error
save-error
completed
```

Not all states need unique screens.

---

# 18. SpeakingTurn — idle / ready

Recommended composition:

```text
Your turn

Բարև
Barev

[ Listen ]

        [ microphone ]
       Tap to speak
```

Rules:

- target phrase is visually primary;
- recording action is obvious but not oversized;
- microphone approximately 56–72px, not 140px;
- no dashed task-card border;
- no technical audio meter yet.

---

# 19. SpeakingTurn — recording

```text
      ● Recording · 0:04

          [ Finish ]
```

Optional:

- subtle animated ring;
- soft pulse;
- restrained live level motion.

Do not show a five-bar technical meter unless it materially improves confidence.

If level feedback is retained, render it as a soft organic signal, not an equipment meter.

---

# 20. SpeakingTurn — saving

```text
      Saving your answer…
```

Keep stable layout.

Do not jump the page vertically.

---

# 21. SpeakingTurn — recorded

The recorded answer transitions into StudentBubble.

```text
                         You
                 [play] ━━━ 0:04

                  Record again
```

The retry action is secondary.

The page should feel as if the learner just added a message to the conversation.

---

# 22. SpeakingTurn — error

Permission and save errors must be human-readable.

Examples:

- “Разрешите доступ к микрофону, чтобы записать ответ.”
- “Не удалось сохранить запись. Попробуйте ещё раз.”

Actions:

- Retry;
- Open permission instructions when supported;
- optional Skip only if pedagogy allows it.

Error state must not destroy previously visible context.

---

# 23. Skip behavior

Skip must not be a visually equal sibling of the main speaking action.

If skip is allowed:

- text action;
- low emphasis;
- explicit consequence if relevant.

Do not use dashed underline as the default final design language.

---

# 24. DialogueScene

Dialogue should feel like a scene thread.

## 24.1 Structure

```text
Scene context

CharacterMessage

Question / cue

DialogueChoice
DialogueChoice
DialogueChoice

StudentBubble

CharacterTyping

CharacterMessage

optional TeacherBubble feedback
```

---

# 25. Dialogue context

Use a short scene cue.

Example:

```text
In a café
The barista asks what you would like.
```

It may be:

- plain text;
- scene label;
- VideoCard above the thread.

Do not wrap the context in another heavy card unless it is media.

---

# 26. DialogueChoice

Choice is an interaction option, not a fake bubble.

## Geometry

- full width within interaction area;
- 52–60px minimum height;
- 14–16px radius;
- light neutral surface;
- subtle border;
- Armenian prominent;
- translation smaller if shown.

## States

- idle;
- pressed;
- selected;
- incorrect;
- disabled while character responds.

## Incorrect

Use restrained error styling:

- subtle red border;
- small feedback;
- no aggressive shake unless testing proves it helpful.

## Correct

Do not repaint the entire list green.

Selected response should transition into StudentBubble.

---

# 27. CharacterTyping

Typing indicator belongs visually to the character.

It should:

- align under the character side;
- preserve avatar/indent;
- use the same message surface family;
- be compact.

Avoid a generic floating three-dot rectangle disconnected from the speaker.

---

# 28. Teacher feedback in Dialogue

When Lusine intervenes after an incorrect choice:

**reuse TeacherBubble.**

Do not create `lesson-dialogue__mentor-feedback` as a separate visual identity.

Teacher feedback should be short.

Example:

```text
Lusine
Here it is better to answer with the polite form.
```

---

# 29. ActiveRecall

## Keep behavior

- learner thinks first;
- optional hint;
- answer reveal;
- self-rating.

## Visual mapping

Prompt:

- interaction heading / plain text.

Hint:

- Lusine bottom sheet / Teacher identity.

Revealed answer:

- StudentBubble or dedicated answer comparison surface depending on pedagogy.

Actions:

- InteractionDock.

Do not redesign the underlying behavior.

---

# 30. ChoiceInteraction

Canonical Choice is a behavior contract, not necessarily one universal card.

Visual variants:

- standard semantic choice;
- listening choice;
- pattern choice;
- dialogue choice.

Shared states:

- idle;
- selected;
- correct;
- incorrect;
- feedback;
- retry;
- completed.

Shared tracking:

- InteractionAttempt.

---

# 31. PhraseGroup

## Keep

The current grouped phrase surface remains.

## Refine hierarchy

Recommended:

```text
Armenian
transliteration
translation
context / pronunciation aid only if needed
                               [audio]
```

Do not show every secondary line merely because data exists.

The lesson authoring layer should control which aids are visible.

---

# 32. Rule Surface

Compact warm learning surface.

Structure:

- short title;
- 1–3 points;
- optional mini example.

Avoid nested cards.

---

# 33. ListeningFocus

When audio itself is the learning object, use a dedicated feature surface.

Example:

```text
Listen first
Do not read the transcript yet.

          [ play ]
     simple waveform
```

After learner action, transcript may reveal below.

This is distinct from Phrase inline audio.

---

# 34. VideoCard

Follows `LESSON_ENGINE_V2.md`.

## Shared

- rounded rectangle;
- poster;
- play affordance;
- duration;
- optional caption;
- no sound autoplay.

## Mentor / explanation

Preferred:

- 4:5 or 3:4;
- medium width;
- face/articulation focus.

## Scene

Preferred:

- 16:9 or 4:3;
- wide;
- environment visible.

No circular presentation for new content.

---

# 35. InteractionDock

One bottom-action owner at a time.

## Ownership priority

```text
active Interaction
>
Step completion
>
Lesson completion
```

Never show two competing primary action docks.

## Desktop/tablet

May use compact floating rounded dock.

## Mobile

- width nearly full;
- safe-area aware;
- one obvious primary action;
- secondary actions low emphasis.

---

# 36. Step completion

When all required interactions are complete:

```text
Next
[ next Step title ]

[ Continue → ]
```

Do not show the dock until the learner can act on it.

Sync state:

- “Saving…”;
- button disabled;
- layout stable.

---

# 37. Lesson Completion

## Goal

Communicate capability gained.

Structure:

```text
✓

Now you can:
Order coffee in Armenian

Key phrases
...

These phrases are in your review plan.

[ Home / Continue ]
```

Avoid:

- generic confetti overload;
- XP-first message;
- unrelated gamification.

---

# 38. Progress indicators

Progress should be quiet.

Use:

- thin warm track;
- step count;
- small completion check.

Avoid:

- saturated blue;
- multiple progress systems on one screen;
- large circles unless they are primary interactive media controls.

---

# 39. Loading states

## Lesson

Prefer stable content skeleton / compact text state.

Avoid full-screen spinner if the shell can remain visible.

## Audio

- loading icon inside play control;
- preserve dimensions.

## Recording save

- retain SpeakingTurn layout;
- show saving text/state.

## Video

- poster remains;
- show inline loading.

---

# 40. Error states

Define four classes:

### Inline media error

Example: audio failed.

### Interaction error

Example: recording save failed.

### Permission error

Example: microphone denied.

### Blocking content error

Example: lesson failed to load.

Each should have:

- plain language;
- specific retry;
- no raw technical error.

---

# 41. Accessibility

All redesigned components MUST retain:

- 44px minimum touch targets;
- visible focus;
- semantic buttons;
- aria-labels;
- non-color status;
- reduced-motion compatibility;
- screen-reader compatible recording state;
- captions/transcript capability for video;
- text alternatives for media context.

---

# 42. Responsive rules

## Mobile is canonical

Design for approximately 360–430px widths first.

## Message width

Teacher/Student/Character:

- max 84–88%;
- never force full width.

## Tablet/Desktop

Keep learner content centered.

Do not stretch bubbles across large screens.

Recommended lesson content max width remains approximately 640–768px depending on interaction.

---

# 43. Motion

Use motion only for state communication.

Allowed:

- message/reply reveal;
- character typing;
- recording pulse;
- audio progress;
- Step completion transition;
- Video play overlay.

Avoid:

- card hover lifts everywhere;
- decorative bouncing;
- excessive scale animations.

---

# 44. Component reuse rules

## TeacherBubble

Used by:

- lesson guidance;
- dialogue feedback;
- teacher audio;
- short teaching notes within lesson.

## StudentBubble

Used by:

- dialogue selected answer;
- speaking recording result;
- active recall answer when appropriate.

## CharacterMessage

Used by:

- dialogue scene;
- mission;
- listening scene transcript.

## RecordingPlayback

Used by:

- StudentBubble;
- Pronunciation Trainer;
- future assignments.

## InlineAudioButton

Used by:

- PhraseCard;
- compact canonical LearningItem.

## MessageAudio

Used by:

- TeacherBubble;
- StudentBubble;
- CharacterMessage.

---

# 45. Components to deprecate conceptually

After migration:

- technical student-blue playback container;
- giant 140px lesson mic;
- five-bar equipment-style AudioLevelMeter as primary recording UI;
- separate dialogue mentor-feedback card;
- circular video presentation for new content;
- dashed RecordPrompt utility card;
- independent audio visual languages per feature.

Compatibility code may remain temporarily.

---

# 46. Token migration direction

Do not delete existing CSS tokens immediately.

Introduce semantic aliases first.

Example:

```css
--surface-teacher
--surface-student
--surface-character

--accent-teacher
--accent-student

--action-primary
--status-success
--status-error

--media-progress
--media-track
```

Map old tokens under the aliases during migration.

Then remove obsolete implementation-specific tokens after components converge.

---

# 47. Design QA checklist

Every learner component should pass:

### Hierarchy
- Is Armenian/content more prominent than UI chrome?

### Role
- Is it obvious whether this is teacher, learner, character, learning content or an action?

### Action
- Is the next expected action obvious?

### Media
- Does audio use an approved primitive?

### Color
- Is blue used only when semantically learner-owned?

### Surface
- Does the component fit one of the five surface roles?

### Completion
- Is success shown as success, not disabled opacity?

### Mobile
- Does it work at 360px without overlap?

### Accessibility
- Can status be understood without color?

---

# 48. First implementation targets

After runtime screen compositions are approved, implement in this order:

1. StudentBubble;
2. shared RecordingPlayback;
3. SpeakingTurn;
4. CharacterMessage;
5. DialogueChoice;
6. DialogueScene;
7. TeacherBubble reuse for feedback;
8. canonical Choice state;
9. Audio primitive consolidation;
10. VideoCard.

TeacherBubble itself should receive only compatibility/polish changes unless a concrete defect is found.

---

# 49. Acceptance criteria

Design System v1 is reflected in production when:

1. TeacherBubble remains recognisable;
2. StudentBubble is a true mirrored conversational bubble;
3. learner recordings appear as StudentBubble messages;
4. blue remains a soft learner-message identity but no longer drives generic recording/media UI;
5. Dialogue reads as a scene thread;
6. Lusine feedback in Dialogue uses TeacherBubble;
7. speaking no longer looks like a recorder utility;
8. audio controls share a coherent system;
9. no new circular video is authored;
10. required interactions have one clear action area;
11. completed learner speech does not fade like disabled UI;
12. mobile layout remains primary and accessible.

---

# 50. Relationship to other documents

- `LEARNER_UI_UX_AUDIT.md` explains the current problems.
- This document defines the target learner visual system.
- `LESSON_ENGINE_V2.md` defines runtime semantics.
- `LESSON_RUNTIME_UI_V2.md` defines concrete screen/state compositions.
- `PILOT_GATE_L1-L5.md` remains the production behavior gate.

No implementation ticket should contradict these contracts without explicitly updating the relevant document.
