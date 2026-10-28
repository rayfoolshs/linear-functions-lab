# Linear Functions Lab — Build Plan

**Current version:** 1.0.0 (28 October 2026)  
**Version history:** `CHANGELOG.md`  
**Release metadata:** `version.json`

## 1. Purpose

Create a learner-facing website for Year 8 students (12–13 years old) that scaffolds the key concepts of linear functions and algebra, with clear explanations, worked examples, visual models and immediate feedback.

The site is designed for:

- students working independently
- teachers using a projector or interactive whiteboard
- revision and intervention
- classroom devices and home use

## 2. Curriculum focus

The site targets the Year 8 algebra content:

- variables, coefficients and constants
- simplifying expressions
- linear patterns and rules
- solving linear equations with two operations
- graphing linear relationships from a table of values
- modelling with linear functions

The design also builds foundations for Year 9 gradient–intercept form, brackets and direct proportion.

## 3. Design principles

1. **See it, try it, own it** — each lesson explains the idea, provides an interactive model, then checks understanding.
2. **One concept per screen** — reduce cognitive load.
3. **Visual first** — use tiles, balances, tables and graphs before symbols alone.
4. **Immediate feedback** — students know whether they are on track.
5. **Productive struggle with support** — hints and step-by-step scaffolds are available.
6. **Low-bandwidth and offline-friendly** — one static site, no frameworks or external dependencies.
7. **Accessible and responsive** — keyboard focus, labels, readable contrast and mobile layout.

## 4. Current build — v1

### Pages and lessons

1. Letters and terms
2. Patterns
3. Function machines
4. Tables to rules
5. Words to algebra
6. Substitution
7. Solving equations
8. Graphing
9. Real-life rules
10. Practice challenge

### Existing interactives

- live value slider for `3n + 5`
- next-term pattern detective
- function machine with input, multiplier and constant sliders
- table-to-rule checker
- substitution practice generator
- guided two-step equation solver
- graph explorer with `m` and `c` sliders
- cost-rule builder
- lesson quizzes with hints and explanations
- randomised 10-question practice challenge
- saved progress and completion tracking

### Technical structure

```
site/
  index.html     all lesson content and page structure
  styles.css     layout, typography, visuals and responsive states
  app.js         routing, progress, tools, quizzes and canvas graphics
```

No build step, package manager or server is required. `index.html` can be opened directly.

## 5. v2 build — additional graphical interactives (implemented)

The goal of v2 is to make abstract ideas more visible and manipulable.

### 5.1 Algebra tiles

**Location:** Lesson 1 — Letters and terms

**Concept:** An expression such as `3x + 5` is made of 3 variable tiles and 5 unit tiles. Unlike terms cannot be combined.

**Interaction:**

- sliders control the number of `x` tiles and unit tiles
- the expression and tile display update live
- a prompt reinforces that `3x + 5` is not `8x`

**Learning purpose:** distinguish coefficients, variables and constants; prevent the common `3x + 4 = 7x` error.

### 5.2 Growing tile pattern

**Location:** Lesson 2 — Patterns

**Concept:** A linear pattern can be represented visually as a growing set of tiles.

**Interaction:**

- sliders control the starting tiles, the number added each time, and the shape number
- the tile display grows or shrinks
- the total number of tiles and the rule update live

**Learning purpose:** connect a visual pattern, a table and an algebraic rule.

### 5.3 Balance-scale equation

**Location:** Lesson 7 — Solving equations

**Concept:** An equation is a balance. Whatever is done to one side must be done to the other.

**Interaction:**

- the equation is shown as a balance with `x` tiles and unit tiles on the left and a total on the right
- step 1 removes the constant from both sides
- step 2 splits the remaining value into equal groups
- the equation, balance and explanation update at each step
- a new equation can be generated

**Learning purpose:** make inverse operations and the balance method visible before students rely on written steps.

### 5.4 Click-to-plot coordinate grid

**Location:** Lesson 8 — Graphing

**Concept:** Coordinates are plotted in the order `(x, y)`.

**Interaction:**

- a blank coordinate grid is displayed with a table of target points
- students click the grid to plot each point
- correct points remain on the grid; incorrect clicks get feedback
- when all points are plotted, the straight line is revealed
- reset button clears the board

**Learning purpose:** practise coordinate order, plotting from a table, and connecting points to a line.

## 6. Build phases

### Phase 1 — Plan and audit

- confirm curriculum focus
- inventory existing lessons and tools
- define new interactive concepts and their purpose
- map each interactive to a lesson and a misconception

### Phase 2 — Structure and content

- add HTML containers for each new interactive
- write student-facing instructions and prompts
- ensure each tool has a clear goal, controls and feedback

### Phase 3 — Visual design

- style algebra tiles, pattern tiles, balance scale and plotter
- add responsive layouts for mobile and tablet
- maintain consistent visual language with existing tools

### Phase 4 — Behaviour

- implement live updates and state changes
- add step-by-step balance logic
- add canvas rendering and click-to-coordinate mapping
- add reset/new-question controls

### Phase 5 — Testing

- syntax check JavaScript
- run automated interaction checks in a headless browser
- verify mobile menu, layout and touch targets
- check keyboard focus and labels
- confirm progress tracking still works

### Phase 6 — Review

- check language is appropriate for 12–13 year olds
- confirm examples are mathematically correct
- check that feedback is helpful rather than giving answers too quickly
- identify future extensions

## 7. Acceptance criteria

The v2 and v3 builds are complete when:

- all new interactives render and respond correctly
- each interactive is usable with a mouse, touch and keyboard where applicable
- the table graph reveals its line when the correct rule is entered
- the story builder updates the sentence, rule, result and bar model
- the substitution machine reveals the final value at the right moment
- the cost graph follows the rule and moves with the chosen quantity
- no runtime errors occur
- the mobile layout has no horizontal overflow
- existing quizzes and progress tracking still work
- the site remains a dependency-free static build

## 8. Future ideas

- drag-and-drop algebra tiles
- student accounts and teacher dashboard
- printable worksheet generated from the practice bank
- audio narration for instructions
- dark mode
- more real-life modelling contexts
- adaptive practice that responds to student errors
- teacher mode with answers and misconception notes

## 9. File map after v3

```
site/
  BUILD-PLAN.md      this plan
  CHANGELOG.md       version history and release notes
  TODO.md            active checklist and future backlog
  version.json       machine-readable release metadata
  index.html         lesson structure and interactive containers
  styles.css         visual system, tiles, balance, grid and responsive layout
  app.js             routing, progress, tools, quizzes and canvas logic
```

## 10. v3 visual additions and student prompts (implemented)

### 10.1 Table-to-graph reveal — Lesson 4

**Prompt shown to students:** "Points plotted from the table. Find the rule to reveal the line."

**What it does:** plots the table values as points on a small coordinate grid. When the student enters the correct rule, the straight line is revealed and the prompt changes to show the rule.

**Purpose:** connect a table of values, a rule and a graph in one view.

### 10.2 Story-to-rule bar model — Lesson 5

**Prompt shown to students:** "Choose a story. Change the starting value and the rate. The bar model shows the fixed part and the repeated part."

**Story prompts:**

- "A taxi charges a $6 flag fall plus $2 per kilometre."
- "Mia starts with $60 saved and saves $25 each week."
- "A bike hire shop charges a $30 booking fee plus $12 per hour."

**What it does:** switches between three real-life contexts and updates the sentence, rule, calculation and proportional bar model live.

**Purpose:** make the constant and the multiplier visible in a word problem.

### 10.3 Visual substitution flow — Lesson 6

**Prompt shown to students:** "Follow the value through the machine."

**What it does:** shows `x` flowing through the multiplier, the product, the constant and the final value. The final value stays hidden until the student checks, reveals the steps, or asks for a hint.

**Purpose:** make substitution a visible sequence rather than an abstract instruction.

### 10.4 Live cost graph — Lesson 9

**Prompt shown to students:** "The line shows the cost rule. The dot is your chosen quantity."

**What it does:** plots `C = rate × n + fixed` and moves a point to the chosen number of items. The fixed cost appears as the y-intercept.

**Purpose:** connect a real-life linear rule to its graph and show the meaning of the starting value.

## 11. Deployment

- **Current version:** 1.0.0
- **Live site:** https://rayfoolshs.github.io/linear-functions-lab/
- **Repository:** https://github.com/rayfoolshs/linear-functions-lab
- **Release:** `v1.0.0`
- **Hosting:** GitHub Pages, deployed from the `main` branch root.
- **Build step:** none — the committed static files are the deployed site.
- **Backup:** Git tag, GitHub release and local release archive.
