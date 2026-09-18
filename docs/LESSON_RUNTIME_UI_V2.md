# Sovorir Lesson Runtime UI v2

**Status:** screen/state composition contract  
**Date:** 2026-09-19  
**Scope:** learner Lesson screen only  
**Depends on:** LEARNER_DESIGN_SYSTEM_V1.md and LESSON_ENGINE_V2.md  
**Purpose:** define how lesson states should look and transition before implementation begins

---

## 1. Runtime goal

A Sovorir lesson should feel like a guided conversation that unfolds one meaningful action at a time.

The learner should always know:

- where they are;
- what the current situation is;
- what language matters;
- what they should do now;
- what happened after they acted;
- how they continue.

The UI must not require the learner to understand technical block names.

---

## 2. Screen skeleton

Canonical mobile composition:

    ┌──────────────────────────────┐
    │ ←  Lesson 4          2 of 5  │
    │    Order coffee      ━━━━     │
    ├──────────────────────────────┤
    │                              │
    │ Step label                   │
    │ Step title                   │
    │                              │
    │ conversational/content flow  │
    │                              │
    │ active interaction           │
    │                              │
    │ feedback/reveal              │
    │                              │
    ├──────────────────────────────┤
    │ interaction OR next action   │
    └──────────────────────────────┘

The bottom area has one owner only.

---

## 3. Header

Keep the existing compact lesson header concept.

Contents:

- back;
- lesson number;
- lesson title;
- Step X of Y;
- thin progress.

Rules:

- body title describes the current Step/job;
- preserve explicit lesson UUID in navigation;
- previous-Step navigation must keep lesson=<apiId>;
- do not add extra navigation chrome.

---

## 4. Step heading

Recommended examples:

    SITUATION
    At the café

or:

    YOUR TURN
    Say hello

The eyebrow is optional.

The title should describe the cognitive job, not the technical component.

Bad:

    Recording exercise

Preferred:

    Say it yourself

---

## 5. Progressive reveal

The scroll should contain only content the learner is currently allowed to know.

Before speaking:

    TeacherBubble
    PhraseGroup
    SpeakingTurn

After speaking completes:

    TeacherBubble
    PhraseGroup
    StudentBubble
    CharacterMessage
    DialogueChoice

Do not show future answers below an unresolved required interaction.

---

# 6. Guided Speaking

Primary use: first contact with speech production and pronunciation-sensitive material.

### A. Context

    Lusine TeacherBubble
    “Start with the simplest greeting.”
    [audio]

### B. Phrase

    PhraseGroup
    Բարև
    Barev
    Hello                     [audio]

### C. Learner turn

    Your turn

    Բարև
    Barev

    [ Listen ]

           [ microphone ]
          Tap to speak

### D. After recording

    StudentBubble
    You
    [play] ━━━━━ 0:03

    Record again

Then the next authored content reveals.

---

# 7. Speaking state machine

Main path:

    READY
      ↓ tap mic
    RECORDING
      ↓ finish
    SAVING
      ↓ success
    RECORDED
      ↓ progression
    COMPLETED

Alternative paths:

    READY → permission error → retry
    SAVING → save error → retry
    RECORDED → record again → READY

The layout should remain stable where practical.

---

# 8. Speaking READY

Visible:

- short instruction;
- target phrase;
- optional transliteration;
- optional reference audio;
- microphone;
- one helper line.

Do not show:

- learner playback;
- technical level bars;
- large timer;
- error controls unless there is an error.

---

# 9. Speaking RECORDING

Replace the idle control area with:

    ● Recording · 0:04

         [ Finish ]

Optional:

- subtle animated ring;
- soft pulse;
- restrained level motion.

Do not use:

- bright red panel;
- giant microphone;
- equipment-style level meter as the dominant visual.

The target phrase remains visible while recording.

---

# 10. Speaking SAVING

Keep the layout stable.

    Saving your answer…

Do not cause major vertical reflow.

---

# 11. Speaking RECORDED

The learner result becomes a StudentBubble:

                             You
                    [play] ━━━━ 0:04

                       Record again

Do not embed learner playback back inside the original prompt card.

---

# 12. Completed speaking replay

When reopening a completed Step:

- show the recorded StudentBubble if available;
- allow replay;
- show re-record only if intentional;
- do not reopen the active recorder by default.

---

# 13. Dialogue Scene

Canonical flow:

    Scene context

    CharacterMessage

    Question / cue

    DialogueChoice
    DialogueChoice
    DialogueChoice

After selection:

    CharacterMessage

                             StudentBubble

    CharacterTyping

    CharacterMessage

If wrong:

    CharacterMessage

                             StudentBubble
                             attempted reply

    Lusine TeacherBubble
    short corrective hint

    choices become available again

---

# 14. Dialogue opening

A Dialogue may begin with:

- short scene text;
- Scene VideoCard;
- CharacterMessage;
- ListeningFocus.

Do not default to a generic white quiz card.

---

# 15. CharacterMessage

Example:

    [avatar] Ani · barista
             Ի՞նչ կցանկանաք
             [play] waveform 0:03

Translation/transliteration visibility is controlled by pedagogy.

Listening First may hide them initially.

---

# 16. DialogueChoice

Example:

    What do you answer?

    ┌────────────────────────────┐
    │ Մի սուրճ, խնդրում եմ       │
    │ One coffee, please          │
    └────────────────────────────┘

    ┌────────────────────────────┐
    │ Բարև                       │
    │ Hello                       │
    └────────────────────────────┘

Choices are controls, not messages.

StudentBubble appears only after commitment.

---

# 17. Correct dialogue transition

On correct choice:

1. selected choice locks briefly;
2. choice area collapses or becomes secondary;
3. selected answer appears right-aligned as StudentBubble;
4. character typing appears;
5. character reply appears;
6. InteractionAttempt completes;
7. next authored content reveals.

The intended feeling is:

> “I sent a reply.”

---

# 18. Wrong dialogue transition

On incorrect choice:

1. attempted reply may appear as StudentBubble;
2. use restrained error marker;
3. Lusine TeacherBubble appears with a concise hint;
4. choices become actionable again according to retry policy.

Do not:

- flash the page red;
- aggressively shake;
- automatically expose the correct answer unless authored.

---

# 19. Teacher correction

Example:

    Lusine
    Here they are asking what you would like.
    Try the phrase with “coffee”.

Reuse TeacherBubble.

Do not use a separate mentor-feedback card.

---

# 20. CharacterTyping

Typing belongs visually to the character.

It should:

- align on the character side;
- preserve avatar/indent relationship;
- use the message family;
- remain compact.

Do not use a floating disconnected three-dot block.

---

# 21. Active Recall

Before reveal:

    REMEMBER

    How would you say:
    “I want water”?

    [ I answered ]
    [ Need a hint ]

Behavior remains unchanged.

---

# 22. Active Recall hint

Use the current Lusine bottom-sheet concept.

Target:

    Lusine’s hint

    Remember the pattern:
    ... եմ ուզում

    [ Try myself ]

Closing returns to the exact previous recall state.

---

# 23. Active Recall reveal

After “I answered”:

    Compare

                             Your answer
                             Ես ջուր եմ ուզում

    translation / transliteration if required

    How did it go?
    [ Need to repeat ] [ Got it ]

If there was no actual recorded/text input, wording must avoid pretending the system transcribed the learner.

---

# 24. Listening First

### Initial

    LISTEN

    Don’t read yet. Try to understand.

            [ play ]
         waveform / audio

    What is happening?

    [ choice ]
    [ choice ]

### After semantic attempt

    Transcript reveal

    Ի՞նչ կցանկանաք
    ...

### Then

- replay;
- phrase explanation;
- later production/dialogue.

---

# 25. Audio ownership

If audio belongs to:

- Lusine → TeacherBubble;
- scene character → CharacterMessage;
- canonical phrase → InlineAudioButton;
- learner → StudentBubble RecordingPlayback;
- contextless listening exercise → ListeningFocus.

Do not route all audio through one generic AudioCard.

---

# 26. Pattern Builder

Example:

    Notice what changes

    Ես ջուր եմ ուզում
    Ես թեյ եմ ուզում

    What stays the same?

    [ choice / construct ]

    small Rule surface

    Now say:
    “I want coffee”

    [ recall / speaking ]

Pattern lessons should be visually lighter than missions.

Video is optional, not default.

---

# 27. Generic Choice

Composition:

    Prompt

    [ option ]
    [ option ]
    [ option ]

After answer:

- compact feedback;
- optional TeacherBubble if explanation benefits from mentor voice;
- tracked InteractionAttempt;
- next reveal only after required completion.

Do not use the current generic quiz card as the mandatory visual for all choices.

---

# 28. Scene Video

Example:

    IN A CAFÉ

    ┌────────────────────────────┐
    │                            │
    │        scene video         │
    │             ▶              │
    │                            │
    └────────────────────────────┘

    What did the barista ask?

Video is Presentation.

The Interaction remains separate.

---

# 29. Mentor Video

Example:

    Lusine explains

    ┌───────────────────┐
    │                   │
    │   portrait video  │
    │        ▶           │
    │                   │
    └───────────────────┘

    short caption if needed

Do not wrap the same clip in an additional TeacherBubble without a specific reason.

---

# 30. Rule + example

Recommended:

    PhraseGroup

    Small warm Rule surface
    With friends use դու.
    With strangers / older people use դուք.

    Next interaction

Rule remains secondary to actual language.

---

# 31. Step completion

When required interactions are complete, the bottom area becomes:

    Next
    Answer naturally

    [ Continue → ]

Do not show Continue before it is actionable.

During sync:

    Saving…

Keep layout stable.

---

# 32. Final Step

Bottom area:

    Done
    All key phrases completed

    [ Finish lesson ]

No competing Continue CTA.

---

# 33. Lesson Completion

Recommended:

    ✓

    You can now:
    order coffee in Armenian

    Key phrases

    Ի՞նչ կցանկանաք
    What would you like?

    Մի սուրճ, խնդրում եմ
    One coffee, please

    These phrases are in your review plan.

    [ Back home ]

Prefer communicative capability over XP/gamification.

---

# 34. Reload / resume

When reloading mid-Step:

- restore completed interaction prefix;
- restore StudentBubble for completed learner turns;
- restore character replies belonging to completed state;
- do not replay fake typing delays for historical replies;
- focus the learner on the unresolved interaction.

---

# 35. Reopening completed lessons

Completed lesson review:

- opens Step 1 by default;
- shows completed content;
- keeps learner recordings replayable when available;
- only exposes reattempt controls where intended;
- does not behave like a locked current lesson.

---

# 36. Deep-link contract

For:

    /lesson?lesson=<id>&section=4

the runtime must:

- keep lesson identity;
- load allowed Step 4;
- bound invalid Step values;
- not silently substitute another lesson;
- restore completed-prefix state.

---

# 37. Bottom action ownership

At any moment exactly one state owns the bottom action area.

Priority:

1. active interaction;
2. Step completion;
3. Lesson completion.

Examples:

- speaking active → speaking controls;
- recall active → recall controls;
- inline choice active → choices inline, no Continue yet;
- Step done → Continue;
- final Step done → Finish lesson.

No stacking.

---

# 38. Error states

## Microphone denied

    Microphone access is disabled.

    Allow access to record your answer.

    [ Try again ]

## Save failure

    Couldn’t save the recording.

    Your lesson is still here.

    [ Retry ]

## Audio unavailable

Keep language content visible and make audio unavailable gracefully.

## Lesson load failure

Keep stable shell and provide Retry.

---

# 39. Mobile rules

At approximately 360px:

- message bubbles <= 88%;
- touch controls >= 44px;
- choice options one column;
- no horizontal scroll;
- Armenian wraps naturally;
- bottom dock respects safe area;
- recorder never covers the target phrase;
- VideoCard stays within viewport.

---

# 40. Tablet / desktop

Do not turn lessons into a wide dashboard.

Keep content centered.

Recommended:

- main runtime <= approximately 48rem;
- messages stay conversational width;
- Scene Video may use most content width;
- Mentor Video stays portrait-sized.

---

# 41. Motion

Use motion to communicate state only.

Dialogue send:
- subtle 120–220ms fade/translate.

Character typing:
- short authored delay for live progression only.

Character reply:
- subtle reveal.

Recording:
- pulse only while active.

Completion:
- restrained success reveal.

Respect reduced-motion settings.

---

# 42. L1 target feeling — Guided Speaking

    Lusine TeacherBubble
    “Let’s start with hello.”

    PhraseGroup
    Բարև
    Barev
    Hello

    SpeakingTurn
    Say it yourself

    StudentBubble
    learner recording

    Lusine TeacherBubble
    “Great. Now goodbye.”

    PhraseGroup
    Ցտեսություն

    SpeakingTurn
    ...

    Continue

---

# 43. L2 target feeling — Conversation Builder

    Scene context: meeting someone

    CharacterMessage
    Բարև

    DialogueChoice

    StudentBubble
    Բարև

    CharacterTyping

    CharacterMessage
    Ի՞նչ է քո անունը

    phrase reveal / hint

    DialogueChoice or SpeakingTurn

    StudentBubble
    Անունս Անդրեյ է

    CharacterMessage
    Շատ հաճելի է

---

# 44. L3 target feeling — Listening First

    Listen first

    CharacterMessage audio first
    transcript hidden

    Meaning Choice

    Feedback

    Transcript reveal

    PhraseGroup

    SpeakingTurn / shadowing

    New voice or dialogue transfer

    Continue

---

# 45. L4 target feeling — Mission

    Scene VideoCard: café

    CharacterMessage
    Ի՞նչ կցանկանաք

    DialogueChoice

    StudentBubble
    Մի սուրճ, խնդրում եմ

    CharacterMessage
    Ուրիշ բան ուզո՞ւմ եք

    Active Recall / DialogueChoice

    StudentBubble
    Ոչ, շնորհակալություն

    unexpected variation

    final speaking / recall

    capability completion

---

# 46. L5 target feeling — Pattern Builder

    two PhraseGroup examples

    notice prompt

    Choice / Construct

    Rule

    substitution

    Recall

    negative contrast

    Recall

    Completion

---

# 47. Mapping from current code

Keep concept:

- VoiceBubble → TeacherBubble / MessageAudio;
- PhraseCard + PhraseGroup;
- RuleCard;
- ActiveRecall behavior;
- LessonCompleteCard logic;
- LessonSectionView progressive reveal shell.

Refactor:

- RecordPrompt + StickyRecordCTA → SpeakingTurn;
- RecordingPlayback → shared transparent primitive usable in StudentBubble;
- MiniDialogue → DialogueScene + CharacterMessage + StudentBubble + DialogueChoice;
- dialogue mentor feedback → TeacherBubble;
- MultipleChoice lesson usage → canonical ChoiceInteraction;
- LessonVideoBubble → VideoCard.

---

# 48. Incremental migration rule

Preserve live L1–L5.

Recommended implementation:

1. introduce primitives;
2. migrate one interaction family;
3. verify current lessons;
4. migrate the next family;
5. remove compatibility CSS only after all consumers move.

Do not rewrite content, tracking and visual runtime at the same time.

---

# 49. Visual QA scenarios

Inspect all of these before the polish sprint is considered complete:

1. TeacherBubble text-only;
2. TeacherBubble with long audio;
3. StudentBubble text;
4. StudentBubble recording;
5. Speaking ready;
6. Speaking recording;
7. Speaking saved;
8. microphone denied;
9. Dialogue idle;
10. Dialogue wrong + Lusine feedback;
11. Dialogue correct + typing + reply;
12. Active Recall before reveal;
13. Active Recall hint;
14. Active Recall answer;
15. Listening First;
16. PhraseGroup with 1, 3 and 5 items;
17. Rule;
18. Scene VideoCard;
19. Step completion dock;
20. Lesson completion;
21. 360px width;
22. desktop width;
23. reload into partial dialogue;
24. completed lesson review.

---

# 50. Acceptance criteria

Lesson Runtime UI v2 is successful when:

1. teacher messages retain the Sovorir teacher identity;
2. learner output consistently becomes StudentBubble;
3. StudentBubble is a mirrored sibling of TeacherBubble;
4. speaking feels like a conversational turn;
5. dialogue feels like a scene, not a quiz;
6. required Choice participates in tracked progression;
7. audio controls feel like one system;
8. blue is reserved for learner conversational identity;
9. only one bottom action owner exists at a time;
10. current Step state survives reload;
11. L1–L5 migrate incrementally;
12. no custom screen is needed for each lesson archetype.

---

# 51. Implementation boundary

This document still does not authorize a big implementation PR.

Implementation should now be split into small tickets/PRs beginning with:

1. lesson route identity fix;
2. StudentBubble primitive;
3. RecordingPlayback normalization;
4. SpeakingTurn;
5. DialogueScene;
6. canonical Choice tracking;
7. audio cleanup;
8. VideoCard.

Each change must preserve the Pilot learner loop.
