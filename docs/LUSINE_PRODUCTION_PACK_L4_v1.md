# Lusine Production Pack v1 — Lesson 4: Coffee Mission

**Status:** production brief, not final media  
**Date:** 2026-09-18  
**Depends on:** `CURRICULUM_SYSTEM_v1.md`  
**Current pilot mentor:** Ani  
**Final native mentor:** Lusine  
**Primary archetype:** Mission

---

## 1. Production goal

Lesson 4 must feel different from Lessons 1–3.

The learner is not watching a teacher explain five café phrases. The learner enters a café situation and solves a sequence of communicative problems:

`greet → understand service question → order → handle follow-up → decline politely → ask for bill → leave`.

Human media should support immersion. For this lesson, **scene video is more important than a teacher talking-head circle**.

Until real media is attached, the lesson must remain fully usable with pilot audio and text/dialogue fallback.

---

## 2. Canonical audio batch

Record clean NORMAL takes for all five items. Add SLOW only where useful for articulation.

| Asset key | Armenian | Meaning | Function | Takes |
| --- | --- | --- | --- | --- |
| `l4_inch_ktsankanak` | `Ի՞նչ կցանկանաք` | Что бы вы хотели? | service question / comprehension | NORMAL + SLOW |
| `l4_mi_surch_khndrum_em` | `Մի սուրճ, խնդրում եմ` | Один кофе, пожалуйста | learner order | NORMAL + SLOW |
| `l4_urish_ban_uzum_ek` | `Ուրիշ բան ուզո՞ւմ եք` | Хотите что-нибудь ещё? | service follow-up / comprehension | NORMAL + SLOW |
| `l4_voch_shnorhakalutyun` | `Ոչ, շնորհակալություն` | Нет, спасибо | learner reply | NORMAL |
| `l4_hashivy_khndrum_em` | `Հաշիվը, խնդրում եմ` | Счёт, пожалуйста | learner closing request | NORMAL + SLOW |

### Delivery direction

Service questions should sound like real café speech, not like dictionary prompts.

For learner-response phrases, keep pronunciation clear but preserve normal sentence rhythm. Do not over-separate words in NORMAL takes.

---

## 3. Connected-speech assets

These are not separate LearningItems. They are whole-scene inputs for mission playback and later review.

### Barista opening

> `Բարև ձեզ։ Ի՞նչ կցանկանաք։`

Asset: `l4_dialogue_barista_opening_v1.wav`

### Order + follow-up

> Customer: `Մի սուրճ, խնդրում եմ։`  
> Barista: `Իհարկե։ Ուրիշ բան ուզո՞ւմ եք։`  
> Customer: `Ոչ, շնորհակալություն։`

Asset: `l4_dialogue_order_followup_v1.wav`

### Closing

> Customer: `Հաշիվը, խնդրում եմ։`  
> Barista: `Իհարկե։`  
> Customer: `Շնորհակալություն։ Ցտեսություն։`

Asset: `l4_dialogue_bill_goodbye_v1.wav`

The lesson deliberately reuses greeting / thanks / goodbye language from earlier lessons without adding those lines as new LearningItems.

---

## 4. Required scene video — café mission opener

**Priority:** HIGH  
**Asset:** `l4_scene_cafe_order_v1.mp4`  
**Presentation:** `scene`  
**Target duration:** 15–25 sec  
**Primary purpose:** create the real-world problem before explanation.

### Scene

1. learner POV approaches a café counter;
2. barista acknowledges the customer naturally;
3. barista says `Բարև ձեզ։ Ի՞նչ կցանկանաք։`;
4. pause briefly as if waiting for the learner's answer;
5. do not show a Russian translation in the video itself.

### Direction

- believable café energy, not staged teacher delivery;
- barista may be Lusine or another native speaker;
- eye line should approximate speaking to the learner;
- keep background sound low enough that the Armenian line remains clear;
- record a clean isolated dialogue track in addition to camera audio;
- no embedded subtitles; app transcript handles captions;
- leave 0.5–1.0 sec visual space before and after the spoken line for editing.

### App behavior

Before final asset exists:

- use current pilot audio/text fallback;
- do not attach a fake unrelated video just to exercise the UI.

After production:

- attach as a `video` block with `presentation: 'scene'`;
- transcript: `Բարև ձեզ։ Ի՞նչ կցանկանաք։`;
- poster mode: thumbnail;
- autoplay muted is acceptable only if product QA confirms it does not surprise the learner;
- spoken audio should require explicit play unless the lesson UX later defines a deliberate listening-start interaction.

---

## 5. Optional scene video — follow-up pressure

**Asset:** `l4_scene_anything_else_v1.mp4`  
**Presentation:** `scene`  
**Target duration:** 8–14 sec  
**Purpose:** simulate the common moment where the learner thinks the order is finished but receives another question.

### Brief

> Barista confirms the coffee naturally, then asks `Ուրիշ բան ուզո՞ւմ եք։` and waits.

No Russian explanation. The learner should infer the communicative function from the situation and then choose / say `Ոչ, շնորհակալություն։`

This asset is valuable because it introduces mild communicative pressure without adding complexity to the grammar.

---

## 6. Optional video circle — phrase confidence

Lesson 4 does **not** require a video circle for its main experience. This is intentional variation.

If recording time permits:

**Asset:** `l4_circle_khndrum_em_v1.mp4`  
**Presentation:** `circle`  
**Duration:** 8–12 sec  
**Purpose:** show natural rhythm of the reusable polite chunk `խնդրում եմ` in two café phrases.

### Brief

> Say `Մի սուրճ, խնդրում եմ։` naturally. Then `Հաշիվը, խնդրում եմ։` naturally. One short Russian bridge is allowed: «Один и тот же вежливый кусочек». Do not explain grammar.

This circle should be treated as enrichment, not a gate for publishing Lesson 4.

---

## 7. Native QA checklist for Lusine

Before approving final media, Lusine should explicitly answer:

1. Are the service questions natural for a normal Yerevan café?
2. Is `Մի սուրճ, խնդրում եմ` acceptable as a beginner-safe default order in the shown context?
3. Does `Ուրիշ բան ուզո՞ւմ եք` sound natural in this service exchange?
4. Is `Ոչ, շնորհակալություն` the natural short refusal here?
5. Is `Հաշիվը, խնդրում եմ` natural for the intended café context?
6. Is any line technically correct but noticeably bookish in everyday speech?
7. Would a native speaker change intonation or wording depending on café formality?

Any wording correction must be applied to curriculum content and LearningItem revision before final attachment if it changes the learner-facing phrase.

---

## 8. Recommended shooting order

Do not shoot by lesson screen order.

### Audio setup

1. five canonical NORMAL takes;
2. selected SLOW takes;
3. barista opening;
4. order + follow-up dialogue;
5. bill + goodbye dialogue.

### Camera setup

1. required café opener scene;
2. optional follow-up scene;
3. optional `խնդրում եմ` video circle.

One camera / lighting setup should be enough for both scene clips if the barista position remains consistent.

---

## 9. Definition of Done

Lesson 4 media production is complete when:

1. all five canonical items have approved NORMAL audio;
2. service-question recordings sound natural at normal café speed;
3. learner-response phrases have clear beginner-friendly takes;
4. required café opener scene is recorded, selected, processed and attached;
5. isolated audio exists for the main scene dialogue;
6. transcript metadata is attached outside the video file;
7. native QA confirms wording/register;
8. final asset replacement does not change stable LearningItem or Interaction IDs;
9. the lesson still works if scene video temporarily fails to load;
10. the mission remains understandable without requiring a talking-head explanation.
