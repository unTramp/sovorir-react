# Content Model

## Purpose

This document fixes the current lesson content model for Sovorir and serves as a shared reference for:

- learner frontend
- admin lesson builder
- backend lesson schema
- future AI draft generation

The system should be built around three levels:

- `Lesson`
- `Section`
- `Block`

## Structure

### Lesson

Lesson is the top-level educational entity.

Recommended fields:

- `title`
- `description`
- `orderIndex`
- `status`
- `objective` (optional, later)

Important:

- lesson title is **not** a content block
- lesson title is stored in lesson metadata

### Section

Section is a semantic part of the lesson.

Examples:

- introduction
- greetings
- grammar note
- practice
- review

Recommended fields:

- `title`
- `type`
- `orderIndex`

Important:

- section title is **not** a content block
- section title is stored in section metadata

### Block

Block is the smallest renderable content unit inside a section.

## Active Block Types

These block types are currently approved for the first content-first lesson flow.

### `heading`

Internal heading inside section content.

Use for:

- subheadings inside a section
- content grouping
- visual structure inside long sections

Example fields:

- `text`

Important:

- `heading` is not the lesson title
- `heading` is not the section title

### `teacherBubble`

Teacher message bubble rendered as a dedicated UI widget.

This maps to the current frontend concept:

- teacher avatar
- teacher name
- text message
- audio recording

Example fields:

- `teacherName`
- `teacherAvatarUrl`
- `text`
- `audioSrc`
- `duration`

Product note:

- this should be treated as its own semantic content type, not just a generic audio file

### `phraseCard`

Vocabulary / phrase learning card.

This maps to the current phrase card UI.

Example fields:

- `armenian`
- `translation`
- `transcription`
- `russian`
- `status`
- `audioSrc` (optional, later or per card)

Allowed statuses:

- `new`
- `learned`
- `review`

### `rule`

Rule or explanation block for pronunciation, reading, or grammar.

Example fields:

- `title`
- `items`

Use for:

- pronunciation rules
- polite forms
- grammar observations
- short usage notes

### `readingText`

Standalone reading passage.

Example fields:

- `content`
- `title` (optional, later)
- `translation` (optional, later)

Use for:

- short reading exercises
- scripted dialogue excerpts
- reading practice passages

### `text`

Plain explanatory text block.

Example fields:

- `content`

Use for:

- short explanations
- transitions between content groups
- summary text

## Reserved Block Types

These types exist conceptually and should remain reserved in the architecture, but they are **not part of the current lesson flow yet**.

### `studentBubble`

Student response bubble.

Potential future use:

- playback of student response
- teacher feedback context
- comparison between teacher and student examples

Current status:

- reserved
- not used in current lesson authoring

### `pronunciationPrompt`

Pronunciation / repetition prompt for learner speaking practice.

Potential future use:

- prompt for recording user speech
- AI pronunciation evaluation
- teacher review of student speaking

Current status:

- reserved
- not used in current lesson authoring

## Current Lesson Authoring Scope

For the current phase, lessons should be authored using only:

- `heading`
- `teacherBubble`
- `phraseCard`
- `rule`
- `readingText`
- `text`

The following should not be part of the current lesson authoring scope:

- student recording
- student playback bubbles
- pronunciation scoring flow

## Mapping To Current Implementation

The current codebase still contains legacy block names in some places.

Current compatibility mapping:

- `teacherBubble` -> legacy `audio` with `sender: "teacher"`
- `phraseCard` -> legacy `phrase`
- `readingText` -> currently can be represented as `text`

This mapping is transitional.

Target direction:

- frontend UI should move to semantic block names
- admin builder should expose semantic block names
- backend validation should move from legacy names to semantic names when the migration is scheduled

## Lesson 1 Direction

The first fully assembled lesson in the new model should be:

- `Lesson 1: Приветствия и прощания`

Its content should be adapted from the existing greeting / farewell content that currently lives in the old lesson content layer.

The current working draft for this lesson is stored in:

- [src/data/lesson1Draft.ts](/Users/andreydorofeev/Development/CLAUDE/sovorir-react/src/data/lesson1Draft.ts)

Recommended sections:

- introduction
- basic greetings
- greetings by time of day
- asking how someone is
- farewells
- politeness and etiquette
- lesson summary

## Guiding Principle

The content model should follow the real UI and teaching semantics.

That means:

- lesson metadata stays in lesson
- section metadata stays in section
- UI widgets become explicit block types
- interactive speaking blocks can be added later without rebuilding the model from scratch
