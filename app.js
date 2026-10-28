(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const LESSON_IDS = [
    "letters",
    "patterns",
    "machines",
    "tables",
    "words",
    "substitute",
    "equations",
    "graphs",
    "real-life",
    "practice"
  ];

  const STORAGE_KEY = "linear-functions-lab-progress-v1";

  const PAGE_TITLES = {
    home: "Home",
    letters: "Letters and terms",
    patterns: "Patterns",
    machines: "Function machines",
    tables: "Tables to rules",
    words: "Words to algebra",
    substitute: "Substitution",
    equations: "Solving equations",
    graphs: "Graphing",
    "real-life": "Real-life rules",
    practice: "Practice challenge"
  };

  const formatNum = (n) => (n < 0 ? `−${Math.abs(n)}` : String(n));
  const formatSigned = (n) => (n < 0 ? `− ${Math.abs(n)}` : `+ ${n}`);

  const formatRule = (m, c) => {
    const mPart = `${formatNum(m)}x`;
    return c === 0 ? `y = ${mPart}` : `y = ${mPart} ${formatSigned(c)}`;
  };

  const formatRuleWithVar = (m, c, variable) => {
    const mPart = `${formatNum(m)}${variable}`;
    return c === 0 ? mPart : `${mPart} ${formatSigned(c)}`;
  };

  const formatExpression = (a, b) => {
    const aPart = `${a}x`;
    return b === 0 ? aPart : `${aPart} ${formatSigned(b)}`;
  };

  const formatEquation = (a, b, c) => {
    const left = b === 0 ? `${a}x` : `${a}x ${formatSigned(b)}`;
    return `${left} = ${formatNum(c)}`;
  };

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const shuffle = (items) => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (character) => {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return replacements[character];
    });

  /* ------------------------------------------------------------
     Progress
     ------------------------------------------------------------ */

  let completed = [];
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(stored)) {
      completed = stored.filter((id) => LESSON_IDS.includes(id));
    }
  } catch (error) {
    completed = [];
  }

  const saveProgress = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    } catch (error) {
      /* Progress simply will not persist if storage is unavailable. */
    }
  };

  const updateProgressUI = () => {
    const total = LESSON_IDS.length;
    const done = completed.length;
    const percent = (done / total) * 100;
    const remaining = total - done;

    const sidebarText = $("#sidebarProgressText");
    const sidebarFill = $("#sidebarProgressFill");
    const mobileProgress = $("#mobileProgress");
    const progressNote = $("#progressNote");

    if (sidebarText) sidebarText.textContent = `${done} / ${total}`;
    if (sidebarFill) sidebarFill.style.width = `${percent}%`;
    if (mobileProgress) mobileProgress.textContent = `${done}/${total}`;

    if (progressNote) {
      if (done === 0) {
        progressNote.textContent = "Complete a lesson to start your streak.";
      } else if (remaining === 0) {
        progressNote.textContent = "All lessons complete. Great work!";
      } else {
        progressNote.textContent = `${remaining} lesson${remaining === 1 ? "" : "s"} to go.`;
      }
    }

    $$(".path-card").forEach((card) => {
      const id = card.dataset.card;
      const isDone = completed.includes(id);
      card.classList.toggle("done", isDone);
      const status = $(".card-status", card);
      if (status) status.textContent = isDone ? "Completed" : "Not started";
    });

    $$(".complete-btn").forEach((button) => {
      if (!button.dataset.defaultLabel) {
        button.dataset.defaultLabel = button.textContent.trim();
      }
      const isDone = completed.includes(button.dataset.complete);
      button.classList.toggle("is-complete", isDone);
      button.textContent = isDone ? "Completed" : button.dataset.defaultLabel;
      button.disabled = isDone;
      button.setAttribute("aria-pressed", String(isDone));
    });
  };

  const markComplete = (id) => {
    if (!LESSON_IDS.includes(id) || completed.includes(id)) return;
    completed.push(id);
    saveProgress();
    updateProgressUI();
  };

  /* ------------------------------------------------------------
     Mobile navigation and routing
     ------------------------------------------------------------ */

  const sidebar = $("#sidebar");
  const backdrop = $("#backdrop");
  const menuButton = $("#menuBtn");
  const closeMenuButton = $("#closeMenu");

  const openMenu = () => {
    if (!sidebar || !backdrop || !menuButton) return;
    sidebar.classList.add("open");
    backdrop.hidden = false;
    menuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
  };

  const closeMenu = () => {
    if (!sidebar || !backdrop || !menuButton) return;
    sidebar.classList.remove("open");
    backdrop.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  menuButton?.addEventListener("click", openMenu);
  closeMenuButton?.addEventListener("click", closeMenu);
  backdrop?.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  $$(".nav-link, .brand, .mobile-brand").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });

  const pages = $$(".page");
  let hasRouted = false;

  const route = () => {
    const requested = (window.location.hash || "#home").replace("#", "");
    let target = pages.find((page) => page.dataset.page === requested);
    if (!target) target = pages.find((page) => page.dataset.page === "home");
    if (!target) return;

    pages.forEach((page) => {
      page.classList.toggle("active", page === target);
    });

    $$(".nav-link").forEach((link) => {
      const isActive = link.dataset.nav === target.dataset.page;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    document.title = `${PAGE_TITLES[target.dataset.page] || "Home"} | Linear Functions Lab`;
    closeMenu();
    window.scrollTo(0, 0);

    if (hasRouted) {
      const main = $("#main");
      main?.focus({ preventScroll: true });
    }
    hasRouted = true;

    if (target.dataset.page === "graphs") {
      drawGraph();
      drawPlotter();
    }
  };

  window.addEventListener("hashchange", route);

  /* ------------------------------------------------------------
     Quiz data
     ------------------------------------------------------------ */

  const lessonQuizzes = {
    letters: [
      {
        q: "What does 5n mean?",
        options: ["5 + n", "5 × n", "5 − n", "n ÷ 5"],
        answer: 1,
        hint: "The number next to a letter means multiply.",
        explanation: "5n means 5 groups of n, or 5 × n."
      },
      {
        q: "In 7x + 3, which number is the constant?",
        options: ["7", "x", "3", "7x"],
        answer: 2,
        hint: "The constant is the number that does not change.",
        explanation: "3 is the constant. 7 is the coefficient and x is the variable."
      }
    ],
    patterns: [
      {
        q: "The pattern is 6, 10, 14, 18, ... What is the rule for the nth term?",
        options: ["y = 4n + 2", "y = 2n + 4", "y = 4n + 6", "y = 6n + 4"],
        answer: 0,
        hint: "The step is 4. What would term 0 be?",
        explanation: "The terms go up by 4. Term 0 is 2, so y = 4n + 2."
      },
      {
        q: "Rule: y = 5n − 3. What is y when n = 4?",
        options: ["17", "20", "23", "12"],
        answer: 0,
        hint: "Substitute n = 4: 5 × 4 − 3.",
        explanation: "5 × 4 = 20, then 20 − 3 = 17."
      }
    ],
    machines: [
      {
        q: "A machine has the rule y = 3x + 2. What is the output when x = 5?",
        options: ["15", "17", "10", "13"],
        answer: 1,
        hint: "Multiply first, then add.",
        explanation: "3 × 5 = 15, then 15 + 2 = 17."
      },
      {
        q: "A machine has the rule y = 4x + 4. The output is 20. What was the input?",
        options: ["4", "5", "6", "16"],
        answer: 0,
        hint: "Work backwards: subtract 4, then divide by 4.",
        explanation: "20 − 4 = 16, then 16 ÷ 4 = 4."
      }
    ],
    tables: [
      {
        q: "Write the rule for the table: x = 0, 1, 2, 3 and y = 3, 7, 11, 15.",
        options: ["y = 3x + 4", "y = 4x + 3", "y = 4x + 7", "y = 7x + 3"],
        answer: 1,
        hint: "y goes up by 4. When x = 0, y = 3.",
        explanation: "The multiplier is 4 and the constant is 3, so y = 4x + 3."
      },
      {
        q: "Write the rule for the table: x = 0, 1, 2 and y = 12, 9, 6.",
        options: ["y = 3x + 12", "y = −3x + 12", "y = −3x + 6", "y = 12x − 3"],
        answer: 1,
        hint: "y goes down by 3. When x = 0, y = 12.",
        explanation: "The multiplier is −3 and the constant is 12, so y = −3x + 12."
      }
    ],
    words: [
      {
        q: "Which expression means '7 less than 3 times a number'?",
        options: ["3n − 7", "7 − 3n", "3(n − 7)", "7n − 3"],
        answer: 0,
        hint: "Start with 3 times the number, then subtract 7.",
        explanation: "3 times a number is 3n. 7 less than that is 3n − 7."
      },
      {
        q: "A taxi charges $4 flag fall plus $2 per kilometre. Which rule gives the cost C for d km?",
        options: ["C = 4d + 2", "C = 2d + 4", "C = 2d − 4", "C = 4d − 2"],
        answer: 1,
        hint: "The flag fall is the constant. The cost per km is the multiplier.",
        explanation: "The cost is $2 per km plus the $4 flag fall, so C = 2d + 4."
      }
    ],
    substitute: [
      {
        q: "Evaluate 5x − 3 when x = 4.",
        options: ["17", "20", "12", "23"],
        answer: 0,
        hint: "Substitute: 5 × 4 − 3.",
        explanation: "5 × 4 = 20, then 20 − 3 = 17."
      },
      {
        q: "Evaluate 10 − 2x when x = 6.",
        options: ["2", "−2", "22", "−22"],
        answer: 1,
        hint: "2 × 6 = 12, then 10 − 12.",
        explanation: "10 − 12 = −2."
      }
    ],
    equations: [
      {
        q: "Solve 2x + 9 = 23.",
        options: ["x = 7", "x = 16", "x = 14", "x = 5"],
        answer: 0,
        hint: "Subtract 9, then divide by 2.",
        explanation: "2x = 14, so x = 7."
      },
      {
        q: "Solve 4x − 5 = 19.",
        options: ["x = 6", "x = 3.5", "x = 24", "x = 5"],
        answer: 0,
        hint: "Add 5, then divide by 4.",
        explanation: "4x = 24, so x = 6."
      }
    ],
    graphs: [
      {
        q: "For y = 2x + 1, what is y when x = 3?",
        options: ["6", "7", "5", "8"],
        answer: 1,
        hint: "Substitute x = 3 into the rule.",
        explanation: "2 × 3 + 1 = 7."
      },
      {
        q: "Which point is on the line y = 3x − 2?",
        options: ["(1, 2)", "(2, 4)", "(0, 2)", "(3, 6)"],
        answer: 1,
        hint: "Substitute the x-value into the rule and see if you get the y-value.",
        explanation: "For (2, 4): 3 × 2 − 2 = 4, so the point is on the line."
      }
    ],
    "real-life": [
      {
        q: "Leo has $50 saved and saves $20 each week. Which rule gives his savings S after w weeks?",
        options: ["S = 20w + 50", "S = 50w + 20", "S = 20w − 50", "S = 50w − 20"],
        answer: 0,
        hint: "The starting amount is the constant. The weekly saving is the multiplier.",
        explanation: "He starts with $50 and adds $20 per week, so S = 20w + 50."
      },
      {
        q: "A phone plan costs $25 per month plus $0.05 per MB. What is the cost for 100 MB of extra data?",
        options: ["$30", "$25.50", "$5", "$125"],
        answer: 0,
        hint: "0.05 × 100 = 5, then add 25.",
        explanation: "0.05 × 100 = 5, and 25 + 5 = 30, so the cost is $30."
      }
    ]
  };

  const practiceBank = [
    ...lessonQuizzes.letters,
    ...lessonQuizzes.patterns,
    ...lessonQuizzes.machines,
    ...lessonQuizzes.tables,
    ...lessonQuizzes.words,
    ...lessonQuizzes.substitute,
    ...lessonQuizzes.equations,
    ...lessonQuizzes.graphs,
    ...lessonQuizzes["real-life"],
    {
      q: "Which of these is an equation?",
      options: ["4x + 7", "3n − 5", "2x + 1 = 9", "5 + 3"],
      answer: 2,
      hint: "Look for an equals sign.",
      explanation: "2x + 1 = 9 is an equation because it has an equals sign."
    },
    {
      q: "What is the coefficient in 9y + 4?",
      options: ["4", "y", "9", "9y"],
      answer: 2,
      hint: "The coefficient is the number multiplying the variable.",
      explanation: "9 is multiplying y, so 9 is the coefficient."
    },
    {
      q: "Solve x/2 + 5 = 9.",
      options: ["x = 8", "x = 2", "x = 28", "x = 4"],
      answer: 0,
      hint: "Subtract 5, then multiply by 2.",
      explanation: "x/2 = 4, so x = 8."
    },
    {
      q: "The graph of y = −2x + 5 crosses the y-axis at...",
      options: ["−2", "5", "2", "−5"],
      answer: 1,
      hint: "The constant c tells you where the line crosses the y-axis.",
      explanation: "In y = mx + c, c = 5, so the line crosses the y-axis at 5."
    }
  ];

  const questionMarkup = (question, name) => {
    const options = question.options
      .map(
        (option, index) => `
          <label class="option">
            <input type="radio" name="${escapeHtml(name)}" value="${index}">
            <span>${escapeHtml(option)}</span>
          </label>`
      )
      .join("");

    return `
      <div class="quiz-question" data-answer="${question.answer}" data-hint="${escapeHtml(question.hint)}" data-explanation="${escapeHtml(question.explanation)}">
        <p class="q-text">${escapeHtml(question.q)}</p>
        <div class="options">${options}</div>
        <div class="quiz-actions">
          <button class="btn primary small check-question" type="button">Check</button>
          <button class="btn ghost small hint-question" type="button">Hint</button>
        </div>
        <p class="feedback" aria-live="polite"></p>
      </div>`;
  };

  const renderLessonQuizzes = () => {
    $$(".quiz[data-quiz]").forEach((container) => {
      const key = container.dataset.quiz;
      const questions = lessonQuizzes[key] || [];
      container.innerHTML = questions
        .map((question, index) => questionMarkup(question, `${key}-${index}`))
        .join("");
    });
  };

  const handleQuizCheck = (button) => {
    const block = button.closest(".quiz-question");
    if (!block) return;

    const selected = $('input[type="radio"]:checked', block);
    const feedback = $(".feedback", block);
    if (!feedback) return;

    if (!selected) {
      feedback.textContent = "Choose an answer first.";
      feedback.className = "feedback neutral";
      return;
    }

    const correctAnswer = Number(block.dataset.answer);
    const choice = Number(selected.value);

    if (choice === correctAnswer) {
      block.classList.remove("incorrect");
      block.classList.add("correct");
      feedback.textContent = `Correct. ${block.dataset.explanation}`;
      feedback.className = "feedback good";
      $$('input[type="radio"]', block).forEach((input) => {
        input.disabled = true;
      });
      button.disabled = true;
      const hintButton = $(".hint-question", block);
      if (hintButton) hintButton.disabled = true;
    } else {
      block.classList.add("incorrect");
      feedback.textContent = `Not quite. ${block.dataset.hint}`;
      feedback.className = "feedback bad";
    }
  };

  const handleQuizHint = (button) => {
    const block = button.closest(".quiz-question");
    if (!block) return;
    const feedback = $(".feedback", block);
    if (!feedback) return;
    feedback.textContent = `Hint: ${block.dataset.hint}`;
    feedback.className = "feedback neutral";
  };

  document.addEventListener("click", (event) => {
    const checkButton = event.target.closest(".check-question");
    if (checkButton) {
      handleQuizCheck(checkButton);
      return;
    }

    const hintButton = event.target.closest(".hint-question");
    if (hintButton) {
      handleQuizHint(hintButton);
    }
  });

  document.addEventListener("change", (event) => {
    const input = event.target.closest('.quiz-question input[type="radio"]');
    if (!input) return;
    const block = input.closest(".quiz-question");
    if (!block || block.classList.contains("correct")) return;
    block.classList.remove("incorrect");
    const feedback = $(".feedback", block);
    if (feedback && feedback.classList.contains("bad")) {
      feedback.textContent = "";
      feedback.className = "feedback";
    }
  });

  /* ------------------------------------------------------------
     Lesson 1: letters
     ------------------------------------------------------------ */

  const letterSlider = $("#letterN");

  const updateLetterTool = () => {
    if (!letterSlider) return;
    const n = Number(letterSlider.value);
    const result = 3 * n + 5;
    const nOut = $("#letterNOut");
    const equation = $("#letterEquation");
    const explanation = $("#letterExplanation");
    if (nOut) nOut.textContent = n;
    if (equation) equation.textContent = `3 × ${n} + 5 = ${result}`;
    if (explanation) {
      explanation.textContent = `Three groups of ${n} is ${3 * n}, then add 5 to get ${result}.`;
    }
  };

  letterSlider?.addEventListener("input", updateLetterTool);

  /* ------------------------------------------------------------
     Lesson 1: algebra tiles
     ------------------------------------------------------------ */

  const tileXInput = $("#tileXCount");
  const tileUnitInput = $("#tileUnits");

  const updateTileTool = () => {
    if (!tileXInput || !tileUnitInput) return;
    const xCount = Number(tileXInput.value);
    const units = Number(tileUnitInput.value);
    const board = $("#tileBoard");
    const expression = $("#tileExpression");
    const explanation = $("#tileExplanation");

    const xTiles = '<span class="algebra-tile x-tile">x</span>'.repeat(xCount);
    const unitTiles = '<span class="algebra-tile unit-tile">1</span>'.repeat(units);
    if (board) board.innerHTML = xTiles + unitTiles;

    const xPart = xCount === 1 ? "x" : `${xCount}x`;
    const expressionText = units === 0 ? xPart : `${xPart} + ${units}`;
    if (expression) expression.textContent = expressionText;

    const xWord = xCount === 1 ? "1 x-tile" : `${xCount} x-tiles`;
    const unitWord = units === 0 ? "no unit tiles" : units === 1 ? "1 unit tile" : `${units} unit tiles`;
    if (explanation) {
      explanation.textContent = `${xWord} and ${unitWord}. You cannot combine x-tiles and unit tiles, so the expression stays ${expressionText}.`;
    }

    const xOut = $("#tileXOut");
    const unitOut = $("#tileUnitOut");
    if (xOut) xOut.textContent = xCount;
    if (unitOut) unitOut.textContent = units;
  };

  tileXInput?.addEventListener("input", updateTileTool);
  tileUnitInput?.addEventListener("input", updateTileTool);

  /* ------------------------------------------------------------
     Lesson 2: growing tile pattern
     ------------------------------------------------------------ */

  const patternStart = $("#patternStart");
  const patternStep = $("#patternStep");
  const patternShape = $("#patternShape");

  const updateGrowPattern = () => {
    if (!patternStart || !patternStep || !patternShape) return;
    const start = Number(patternStart.value);
    const step = Number(patternStep.value);
    const shape = Number(patternShape.value);
    const total = start + (shape - 1) * step;

    const board = $("#patternTileBoard");
    if (board) {
      board.innerHTML = '<span class="pattern-tile"></span>'.repeat(total);
    }

    const startOut = $("#patternStartOut");
    const stepOut = $("#patternStepOut");
    const shapeOut = $("#patternShapeOut");
    if (startOut) startOut.textContent = start;
    if (stepOut) stepOut.textContent = step;
    if (shapeOut) shapeOut.textContent = shape;

    const summary = $("#patternTileSummary");
    const rule = $("#patternTileRule");
    const explanation = $("#patternTileExplanation");
    if (summary) summary.textContent = `Shape ${shape} has ${total} tiles.`;
    if (rule) {
      rule.textContent = `t = ${formatRuleWithVar(step, start - step, "n")}`;
    }
    if (explanation) {
      explanation.textContent = `Shape 1 has ${start} tiles. Each new shape adds ${step} tiles.`;
    }
  };

  [patternStart, patternStep, patternShape].forEach((input) => {
    input?.addEventListener("input", updateGrowPattern);
  });

  /* ------------------------------------------------------------
     Lesson 2: next term
     ------------------------------------------------------------ */

  let nextTermState = null;

  const nextTermSequence = $("#nextTermSequence");
  const nextTermInput = $("#nextTermInput");
  const nextTermFeedback = $("#nextTermFeedback");
  const nextTermRule = $("#nextTermRule");
  const nextTermCheck = $("#nextTermCheck");

  const newNextTerm = () => {
    const step = randInt(2, 9);
    const start = randInt(1, 12);
    const terms = [start, start + step, start + 2 * step, start + 3 * step];
    const answer = start + 4 * step;
    nextTermState = { step, start, terms, answer };

    if (nextTermSequence) nextTermSequence.textContent = `${terms.join(", ")}, ...`;
    if (nextTermInput) {
      nextTermInput.value = "";
      nextTermInput.disabled = false;
    }
    if (nextTermFeedback) {
      nextTermFeedback.textContent = "";
      nextTermFeedback.className = "feedback";
    }
    if (nextTermRule) nextTermRule.textContent = "";
    if (nextTermCheck) nextTermCheck.disabled = false;
  };

  nextTermCheck?.addEventListener("click", () => {
    if (!nextTermState || !nextTermInput || !nextTermFeedback) return;
    const raw = nextTermInput.value.trim();
    if (raw === "") {
      nextTermFeedback.textContent = "Type a number first.";
      nextTermFeedback.className = "feedback neutral";
      return;
    }

    const value = Number(raw);
    if (value === nextTermState.answer) {
      nextTermFeedback.textContent = `Correct. The sequence goes up by ${nextTermState.step} each time.`;
      nextTermFeedback.className = "feedback good";
      if (nextTermRule) {
        const constant = nextTermState.start - nextTermState.step;
        nextTermRule.textContent = `The rule is y = ${formatRuleWithVar(nextTermState.step, constant, "n")}.`;
      }
      nextTermInput.disabled = true;
      nextTermCheck.disabled = true;
    } else {
      nextTermFeedback.textContent = `Not quite. The step is ${nextTermState.step}. Add ${nextTermState.step} to ${nextTermState.terms[3]}.`;
      nextTermFeedback.className = "feedback bad";
    }
  });

  nextTermInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      nextTermCheck?.click();
    }
  });

  $("#nextTermNew")?.addEventListener("click", newNextTerm);

  /* ------------------------------------------------------------
     Lesson 3: function machine
     ------------------------------------------------------------ */

  const machineInputs = {
    x: $("#machineXRange"),
    m: $("#machineMRange"),
    c: $("#machineCRange")
  };

  const updateMachine = () => {
    if (!machineInputs.x || !machineInputs.m || !machineInputs.c) return;
    const x = Number(machineInputs.x.value);
    const m = Number(machineInputs.m.value);
    const c = Number(machineInputs.c.value);
    const product = m * x;
    const y = product + c;

    const setText = (selector, value) => {
      const element = $(selector);
      if (element) element.textContent = value;
    };

    setText("#machineXOut", formatNum(x));
    setText("#machineMOut", formatNum(m));
    setText("#machineCOut", formatNum(c));
    setText("#machineX", formatNum(x));
    setText("#machineM", formatNum(m));
    setText("#machineC", formatNum(Math.abs(c)));
    setText("#machineCSign", c < 0 ? "−" : "+");
    setText("#machineY", formatNum(y));
    setText("#machineRule", formatRule(m, c));

    const steps = $("#machineSteps");
    if (steps) {
      const xText = x < 0 ? `(${formatNum(x)})` : `${x}`;
      const mText = m < 0 ? `(${formatNum(m)})` : `${m}`;
      if (c === 0) {
        steps.textContent = `${xText} × ${mText} = ${formatNum(y)}.`;
      } else {
        steps.textContent = `${xText} × ${mText} = ${formatNum(product)}, then ${formatNum(product)} ${formatSigned(c)} = ${formatNum(y)}.`;
      }
    }
  };

  Object.values(machineInputs).forEach((input) => {
    input?.addEventListener("input", updateMachine);
  });

  /* ------------------------------------------------------------
     Lesson 4: table to rule
     ------------------------------------------------------------ */

  let tableState = null;

  const tableTable = $("#tableToolTable");
  const tableMInput = $("#tableM");
  const tableCInput = $("#tableC");
  const tableFeedback = $("#tableFeedback");
  const tableHintText = $("#tableHintText");

  const updateTablePreview = () => {
    const mPreview = $("#tableMPreview");
    const cPreview = $("#tableCPreview");
    if (!tableMInput || !tableCInput) return;

    const mRaw = tableMInput.value.trim();
    const cRaw = tableCInput.value.trim();
    if (mPreview) mPreview.textContent = mRaw === "" ? "?" : formatNum(Number(mRaw));
    if (cPreview) cPreview.textContent = cRaw === "" ? "?" : formatNum(Number(cRaw));
  };

  const newTable = () => {
    let m = randInt(-4, 5);
    if (m === 0) m = 3;
    const c = randInt(-5, 10);
    const xs = [0, 1, 2, 3];
    const ys = xs.map((x) => m * x + c);
    tableState = { m, c, xs, ys };

    if (tableTable) {
      const body = $("tbody", tableTable);
      if (body) {
        body.innerHTML = `<tr><th>y</th>${ys.map((value) => `<td>${formatNum(value)}</td>`).join("")}</tr>`;
      }
    }

    if (tableMInput) tableMInput.value = "";
    if (tableCInput) tableCInput.value = "";
    if (tableFeedback) {
      tableFeedback.textContent = "";
      tableFeedback.className = "feedback";
    }
    if (tableHintText) {
      tableHintText.hidden = true;
      tableHintText.textContent = "";
    }
    updateTablePreview();
  };

  tableMInput?.addEventListener("input", updateTablePreview);
  tableCInput?.addEventListener("input", updateTablePreview);

  $("#tableCheck")?.addEventListener("click", () => {
    if (!tableState || !tableMInput || !tableCInput || !tableFeedback) return;

    const mRaw = tableMInput.value.trim();
    const cRaw = tableCInput.value.trim();

    if (mRaw === "" || cRaw === "") {
      tableFeedback.textContent = "Enter a multiplier and a constant first.";
      tableFeedback.className = "feedback neutral";
      return;
    }

    const m = Number(mRaw);
    const c = Number(cRaw);

    if (m === tableState.m && c === tableState.c) {
      tableFeedback.textContent = `Correct. The rule is ${formatRule(m, c)}.`;
      tableFeedback.className = "feedback good";
    } else if (m === tableState.m) {
      tableFeedback.textContent = "The multiplier is correct. Now check the constant: what is y when x = 0?";
      tableFeedback.className = "feedback bad";
    } else if (c === tableState.c) {
      tableFeedback.textContent = "The constant is correct. Now check the multiplier: how much does y change each step?";
      tableFeedback.className = "feedback bad";
    } else {
      tableFeedback.textContent = "Not quite. Find how much y changes each step, then look at y when x = 0.";
      tableFeedback.className = "feedback bad";
    }
  });

  $("#tableHint")?.addEventListener("click", () => {
    if (!tableHintText) return;
    tableHintText.hidden = false;
    tableHintText.textContent =
      "Hint: the multiplier is the change in y each time x goes up by 1. The constant is the value of y when x = 0.";
  });

  $("#tableNew")?.addEventListener("click", newTable);

  [tableMInput, tableCInput].forEach((input) => {
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        $("#tableCheck")?.click();
      }
    });
  });

  /* ------------------------------------------------------------
     Lesson 6: substitution
     ------------------------------------------------------------ */

  let subState = null;

  const subExpression = $("#subExpression");
  const subX = $("#subX");
  const subAnswer = $("#subAnswer");
  const subFeedback = $("#subFeedback");
  const subSteps = $("#subSteps");

  const newSubstitution = () => {
    const a = randInt(2, 6);
    const b = randInt(-9, 9);
    const x = randInt(-5, 6);
    const answer = a * x + b;
    subState = { a, b, x, answer };

    if (subExpression) subExpression.textContent = formatExpression(a, b);
    if (subX) subX.textContent = formatNum(x);
    if (subAnswer) subAnswer.value = "";
    if (subFeedback) {
      subFeedback.textContent = "";
      subFeedback.className = "feedback";
    }
    if (subSteps) {
      subSteps.hidden = true;
      subSteps.innerHTML = "";
    }
  };

  $("#subCheck")?.addEventListener("click", () => {
    if (!subState || !subAnswer || !subFeedback) return;
    const raw = subAnswer.value.trim();
    if (raw === "") {
      subFeedback.textContent = "Type your answer first.";
      subFeedback.className = "feedback neutral";
      return;
    }

    if (Number(raw) === subState.answer) {
      subFeedback.textContent = `Correct. The value is ${formatNum(subState.answer)}.`;
      subFeedback.className = "feedback good";
    } else {
      subFeedback.textContent = `Not quite. Substitute x = ${formatNum(subState.x)} and work it out carefully.`;
      subFeedback.className = "feedback bad";
    }
  });

  $("#subHint")?.addEventListener("click", () => {
    if (!subState || !subSteps) return;
    const { a, b, x, answer } = subState;
    const xText = x < 0 ? `(${formatNum(x)})` : `${x}`;
    const bPart = b === 0 ? "" : ` ${formatSigned(b)}`;
    subSteps.hidden = false;
    subSteps.innerHTML = `
      <p>${a}x${bPart}</p>
      <p>= ${a} × ${xText}${bPart}</p>
      <p>= ${formatNum(a * x)}${bPart}</p>
      <p>= <strong>${formatNum(answer)}</strong></p>`;
  });

  $("#subNew")?.addEventListener("click", newSubstitution);
  subAnswer?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      $("#subCheck")?.click();
    }
  });

  /* ------------------------------------------------------------
     Lesson 7: guided equation solver
     ------------------------------------------------------------ */

  let equationState = null;

  const eqDisplay = $("#eqDisplay");
  const eqAxLabel = $("#eqAxLabel");
  const eqStep1Input = $("#eqStep1Input");
  const eqStep1Check = $("#eqStep1Check");
  const eqStep1Feedback = $("#eqStep1Feedback");
  const eqStep1 = $("#eqStep1");
  const eqStep2 = $("#eqStep2");
  const eqStep2Input = $("#eqStep2Input");
  const eqStep2Check = $("#eqStep2Check");
  const eqStep2Feedback = $("#eqStep2Feedback");
  const eqSolution = $("#eqSolution");

  const newEquation = () => {
    const a = randInt(2, 6);
    let b = randInt(-9, 9);
    if (b === 0) b = 4;
    const x = randInt(-5, 9);
    const c = a * x + b;
    equationState = { a, b, c, x };

    if (eqDisplay) eqDisplay.textContent = formatEquation(a, b, c);
    if (eqAxLabel) eqAxLabel.textContent = `${a}x`;

    if (eqStep1Input) {
      eqStep1Input.value = "";
      eqStep1Input.disabled = false;
    }
    if (eqStep1Check) eqStep1Check.disabled = false;
    if (eqStep1Feedback) {
      eqStep1Feedback.textContent = "";
      eqStep1Feedback.className = "feedback";
    }
    if (eqStep2) eqStep2.classList.add("locked");
    if (eqStep2Input) {
      eqStep2Input.value = "";
      eqStep2Input.disabled = false;
    }
    if (eqStep2Check) eqStep2Check.disabled = false;
    if (eqStep2Feedback) {
      eqStep2Feedback.textContent = "";
      eqStep2Feedback.className = "feedback";
    }
    if (eqSolution) {
      eqSolution.hidden = true;
      eqSolution.innerHTML = "";
    }
  };

  eqStep1Check?.addEventListener("click", () => {
    if (!equationState || !eqStep1Input || !eqStep1Feedback) return;
    const raw = eqStep1Input.value.trim();
    if (raw === "") {
      eqStep1Feedback.textContent = "Type a number first.";
      eqStep1Feedback.className = "feedback neutral";
      return;
    }

    const target = equationState.c - equationState.b;
    if (Number(raw) === target) {
      eqStep1Feedback.textContent = `Correct. ${equationState.a}x = ${formatNum(target)}.`;
      eqStep1Feedback.className = "feedback good";
      eqStep2?.classList.remove("locked");
      eqStep1Input.disabled = true;
      if (eqStep1Check) eqStep1Check.disabled = true;
      eqStep2Input?.focus();
    } else {
      const undo = equationState.b > 0 ? `subtract ${equationState.b}` : `add ${Math.abs(equationState.b)}`;
      eqStep1Feedback.textContent = `Not quite. First ${undo} from both sides.`;
      eqStep1Feedback.className = "feedback bad";
    }
  });

  eqStep2Check?.addEventListener("click", () => {
    if (!equationState || !eqStep2Input || !eqStep2Feedback) return;
    const raw = eqStep2Input.value.trim();
    if (raw === "") {
      eqStep2Feedback.textContent = "Type a number first.";
      eqStep2Feedback.className = "feedback neutral";
      return;
    }

    if (Number(raw) === equationState.x) {
      eqStep2Feedback.textContent = `Correct. x = ${formatNum(equationState.x)}.`;
      eqStep2Feedback.className = "feedback good";
      eqStep2Input.disabled = true;
      if (eqStep2Check) eqStep2Check.disabled = true;
    } else {
      eqStep2Feedback.textContent = `Not quite. Divide ${formatNum(equationState.c - equationState.b)} by ${equationState.a}.`;
      eqStep2Feedback.className = "feedback bad";
    }
  });

  $("#eqShow")?.addEventListener("click", () => {
    if (!equationState || !eqSolution) return;
    const { a, b, c, x } = equationState;
    const undo = b > 0 ? `Subtract ${b}` : `Add ${Math.abs(b)}`;
    eqSolution.hidden = false;
    eqSolution.innerHTML = `
      <p>${formatEquation(a, b, c)}</p>
      <p>${undo} from both sides:</p>
      <p>${a}x = ${formatNum(c - b)}</p>
      <p>Divide both sides by ${a}:</p>
      <p>x = ${formatNum(x)}</p>
      <p>Check: ${a} × ${formatNum(x)} ${formatSigned(b)} = ${formatNum(c)}.</p>`;
  });

  $("#eqNew")?.addEventListener("click", newEquation);

  [eqStep1Input, eqStep2Input].forEach((input) => {
    input?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      if (input === eqStep1Input) {
        eqStep1Check?.click();
      } else {
        eqStep2Check?.click();
      }
    });
  });

  /* ------------------------------------------------------------
     Lesson 7: balance scale
     ------------------------------------------------------------ */

  let balanceState = null;

  const balanceLeftPan = $("#balanceLeftPan");
  const balanceRightPan = $("#balanceRightPan");
  const balanceEquation = $("#balanceEquation");
  const balanceRemove = $("#balanceRemove");
  const balanceSplit = $("#balanceSplit");
  const balanceFeedback = $("#balanceFeedback");
  const balanceStatus = $("#balanceStatus");

  const renderBalance = () => {
    if (!balanceState || !balanceLeftPan || !balanceRightPan || !balanceEquation) return;
    const { a, b, c, x, stage } = balanceState;

    if (stage < 2) {
      const xTiles = '<span class="balance-x-tile">x</span>'.repeat(a);
      const unitTiles = stage === 0 ? '<span class="balance-unit-tile">1</span>'.repeat(b) : "";
      balanceLeftPan.innerHTML = xTiles + unitTiles;

      const total = stage === 0 ? c : c - b;
      balanceRightPan.innerHTML = `<span class="balance-total">${formatNum(total)}</span>`;
    } else {
      balanceLeftPan.innerHTML = Array.from(
        { length: a },
        (_, index) =>
          `<div class="balance-group"><span class="balance-group-label">group ${index + 1}</span><span class="balance-x-tile">x</span></div>`
      ).join("");
      balanceRightPan.innerHTML = Array.from(
        { length: a },
        (_, index) =>
          `<div class="balance-group"><span class="balance-group-label">group ${index + 1}</span><strong>${formatNum(x)}</strong></div>`
      ).join("");
    }

    balanceEquation.textContent =
      stage === 0
        ? formatEquation(a, b, c)
        : stage === 1
          ? `${a}x = ${formatNum(c - b)}`
          : `x = ${formatNum(x)}`;

    if (balanceRemove) {
      balanceRemove.textContent = `Remove ${b} from both sides`;
      balanceRemove.disabled = stage > 0;
    }
    if (balanceSplit) {
      balanceSplit.textContent = `Split into ${a} equal groups`;
      balanceSplit.disabled = stage !== 1;
    }
    if (balanceStatus) {
      balanceStatus.textContent =
        stage === 0
          ? "Do the same thing to both sides to keep the balance."
          : stage === 1
            ? "Both sides are still equal. Now share each side into equal groups."
            : "Each group has the same value, so one x is revealed.";
    }
  };

  const newBalance = () => {
    const a = randInt(2, 4);
    const b = randInt(1, 8);
    const x = randInt(2, 8);
    const c = a * x + b;
    balanceState = { a, b, c, x, stage: 0 };

    if (balanceFeedback) {
      balanceFeedback.textContent = "";
      balanceFeedback.className = "feedback";
    }
    renderBalance();
  };

  balanceRemove?.addEventListener("click", () => {
    if (!balanceState || balanceState.stage !== 0) return;
    const { a, b, c } = balanceState;
    balanceState.stage = 1;
    renderBalance();
    if (balanceFeedback) {
      balanceFeedback.textContent = `Correct. Remove ${b} from both sides, so ${a}x = ${formatNum(c - b)}.`;
      balanceFeedback.className = "feedback good";
    }
  });

  balanceSplit?.addEventListener("click", () => {
    if (!balanceState || balanceState.stage !== 1) return;
    const { a, x } = balanceState;
    balanceState.stage = 2;
    renderBalance();
    if (balanceFeedback) {
      balanceFeedback.textContent = `Correct. Each of the ${a} groups has ${formatNum(x)}, so x = ${formatNum(x)}.`;
      balanceFeedback.className = "feedback good";
    }
  });

  $("#balanceNew")?.addEventListener("click", newBalance);

  /* ------------------------------------------------------------
     Lesson 8: graph
     ------------------------------------------------------------ */

  const graphM = $("#graphM");
  const graphC = $("#graphC");
  const graphRule = $("#graphRule");
  const graphMOut = $("#graphMOut");
  const graphCOut = $("#graphCOut");
  const graphTable = $("#graphTable");
  const canvasFallback = $("#canvasFallback");

  function drawGraph() {
    const canvas = $("#graphCanvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const m = Number(graphM?.value ?? 2);
    const c = Number(graphC?.value ?? 1);
    const width = 600;
    const height = 420;
    const scale = 2;

    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, width, height);

    const xMin = -10;
    const xMax = 10;
    const yMin = -7;
    const yMax = 7;
    const xScale = width / (xMax - xMin);
    const yScale = height / (yMax - yMin);
    const originX = -xMin * xScale;
    const originY = yMax * yScale;
    const toX = (x) => originX + x * xScale;
    const toY = (y) => originY - y * yScale;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    context.lineWidth = 1;
    context.strokeStyle = "#e8e3d8";
    for (let x = xMin; x <= xMax; x += 1) {
      context.beginPath();
      context.moveTo(toX(x), 0);
      context.lineTo(toX(x), height);
      context.stroke();
    }
    for (let y = yMin; y <= yMax; y += 1) {
      context.beginPath();
      context.moveTo(0, toY(y));
      context.lineTo(width, toY(y));
      context.stroke();
    }

    context.strokeStyle = "#8a96a8";
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(0, toY(0));
    context.lineTo(width, toY(0));
    context.stroke();
    context.beginPath();
    context.moveTo(toX(0), 0);
    context.lineTo(toX(0), height);
    context.stroke();

    context.fillStyle = "#69788e";
    context.font = "11px ui-sans-serif, system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "top";
    for (let x = xMin + 2; x <= xMax - 2; x += 2) {
      if (x === 0) continue;
      context.fillText(formatNum(x), toX(x), toY(0) + 6);
    }

    context.textAlign = "right";
    context.textBaseline = "middle";
    for (let y = yMin + 1; y <= yMax - 1; y += 2) {
      if (y === 0) continue;
      context.fillText(formatNum(y), toX(0) - 7, toY(y));
    }

    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillText("0", toX(0) - 7, toY(0) + 6);

    context.strokeStyle = "#0f766e";
    context.lineWidth = 3;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(toX(xMin), toY(m * xMin + c));
    context.lineTo(toX(xMax), toY(m * xMax + c));
    context.stroke();

    for (let x = -3; x <= 3; x += 1) {
      const y = m * x + c;
      if (y < yMin || y > yMax) continue;
      context.beginPath();
      context.arc(toX(x), toY(y), 4.5, 0, Math.PI * 2);
      context.fillStyle = "#e9a23b";
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = "#ffffff";
      context.stroke();
    }

    context.fillStyle = "#3d4d66";
    context.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText("x", width - 16, toY(0) + 7);
    context.fillText("y", toX(0) + 7, 8);
  }

  const updateGraph = () => {
    if (!graphM || !graphC) return;
    const m = Number(graphM.value);
    const c = Number(graphC.value);

    if (graphMOut) graphMOut.textContent = formatNum(m);
    if (graphCOut) graphCOut.textContent = formatNum(c);
    if (graphRule) graphRule.textContent = formatRule(m, c);
    if (canvasFallback) canvasFallback.textContent = `Graph of ${formatRule(m, c)}`;

    if (graphTable) {
      const xs = [-3, -2, -1, 0, 1, 2, 3];
      const body = $("tbody", graphTable);
      if (body) {
        body.innerHTML = `<tr><th>y</th>${xs.map((x) => `<td>${formatNum(m * x + c)}</td>`).join("")}</tr>`;
      }
    }

    drawGraph();
  };

  graphM?.addEventListener("input", updateGraph);
  graphC?.addEventListener("input", updateGraph);

  /* ------------------------------------------------------------
     Lesson 8: click-to-plot grid
     ------------------------------------------------------------ */

  const plotterState = {
    m: 2,
    c: 1,
    xs: [-2, -1, 0, 1, 2],
    ys: [-3, -1, 1, 3, 5],
    plotted: new Set(),
    complete: false
  };

  const plotterTargets = new Set(plotterState.xs.map((x, index) => `${x},${plotterState.ys[index]}`));
  const plotterCanvas = $("#plotterCanvas");
  const plotterProgress = $("#plotterProgress");
  const plotterFeedback = $("#plotterFeedback");
  const plotterFallback = $("#plotterFallback");
  const plotterRule = $("#plotterRule");

  const plotterCoordinate = (x, y) => `(${formatNum(x)}, ${formatNum(y)})`;

  function drawPlotter() {
    const canvas = plotterCanvas;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const width = 600;
    const height = 420;
    const scale = 2;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, width, height);

    const xMin = -10;
    const xMax = 10;
    const yMin = -7;
    const yMax = 7;
    const xScale = width / (xMax - xMin);
    const yScale = height / (yMax - yMin);
    const originX = -xMin * xScale;
    const originY = yMax * yScale;
    const toX = (x) => originX + x * xScale;
    const toY = (y) => originY - y * yScale;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    context.lineWidth = 1;
    context.strokeStyle = "#e8e3d8";
    for (let x = xMin; x <= xMax; x += 1) {
      context.beginPath();
      context.moveTo(toX(x), 0);
      context.lineTo(toX(x), height);
      context.stroke();
    }
    for (let y = yMin; y <= yMax; y += 1) {
      context.beginPath();
      context.moveTo(0, toY(y));
      context.lineTo(width, toY(y));
      context.stroke();
    }

    context.strokeStyle = "#8a96a8";
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(0, toY(0));
    context.lineTo(width, toY(0));
    context.stroke();
    context.beginPath();
    context.moveTo(toX(0), 0);
    context.lineTo(toX(0), height);
    context.stroke();

    context.fillStyle = "#69788e";
    context.font = "11px ui-sans-serif, system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "top";
    for (let x = xMin + 2; x <= xMax - 2; x += 2) {
      if (x === 0) continue;
      context.fillText(formatNum(x), toX(x), toY(0) + 6);
    }
    context.textAlign = "right";
    context.textBaseline = "middle";
    for (let y = yMin + 1; y <= yMax - 1; y += 2) {
      if (y === 0) continue;
      context.fillText(formatNum(y), toX(0) - 7, toY(y));
    }
    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillText("0", toX(0) - 7, toY(0) + 6);

    if (plotterState.complete) {
      context.strokeStyle = "#0f766e";
      context.lineWidth = 3;
      context.lineCap = "round";
      context.beginPath();
      context.moveTo(toX(xMin), toY(plotterState.m * xMin + plotterState.c));
      context.lineTo(toX(xMax), toY(plotterState.m * xMax + plotterState.c));
      context.stroke();
    }

    for (const key of plotterState.plotted) {
      const [x, y] = key.split(",").map(Number);
      context.beginPath();
      context.arc(toX(x), toY(y), 6, 0, Math.PI * 2);
      context.fillStyle = "#e9a23b";
      context.fill();
      context.lineWidth = 2.5;
      context.strokeStyle = "#ffffff";
      context.stroke();
    }

    context.fillStyle = "#3d4d66";
    context.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText("x", width - 16, toY(0) + 7);
    context.fillText("y", toX(0) + 7, 8);
  }

  const updatePlotterStatus = () => {
    const count = plotterState.plotted.size;
    const total = plotterState.xs.length;
    if (plotterProgress) {
      plotterProgress.textContent = `${count} of ${total} points plotted.`;
    }
    if (plotterFallback) {
      plotterFallback.textContent =
        count === total
          ? `All points plotted. The line is ${formatRule(plotterState.m, plotterState.c)}.`
          : `Click the grid to plot a point. ${count} of ${total} plotted.`;
    }
  };

  const plotPoint = (x, y, fromHint = false) => {
    const key = `${x},${y}`;
    if (plotterState.plotted.has(key)) {
      if (plotterFeedback) {
        plotterFeedback.textContent = `You already plotted ${plotterCoordinate(x, y)}.`;
        plotterFeedback.className = "feedback neutral";
      }
      return;
    }

    if (!plotterTargets.has(key)) {
      if (plotterFeedback) {
        plotterFeedback.textContent = `${plotterCoordinate(x, y)} is not one of the table points. Check the x and y values.`;
        plotterFeedback.className = "feedback bad";
      }
      return;
    }

    plotterState.plotted.add(key);
    if (plotterState.plotted.size === plotterTargets.size) {
      plotterState.complete = true;
      if (plotterFeedback) {
        plotterFeedback.textContent = `All five points plotted. The straight line is ${formatRule(plotterState.m, plotterState.c)}.`;
        plotterFeedback.className = "feedback good";
      }
    } else if (plotterFeedback) {
      plotterFeedback.textContent = fromHint
        ? `Plotted ${plotterCoordinate(x, y)} for you.`
        : `Correct. ${plotterCoordinate(x, y)} is plotted.`;
      plotterFeedback.className = fromHint ? "feedback neutral" : "feedback good";
    }

    updatePlotterStatus();
    drawPlotter();
  };

  plotterCanvas?.addEventListener("click", (event) => {
    const rect = plotterCanvas.getBoundingClientRect();
    const logicalX = ((event.clientX - rect.left) / rect.width) * 600;
    const logicalY = ((event.clientY - rect.top) / rect.height) * 420;
    const worldX = Math.round((logicalX - 300) / 30);
    const worldY = Math.round((210 - logicalY) / 30);

    if (worldX < -10 || worldX > 10 || worldY < -7 || worldY > 7) {
      if (plotterFeedback) {
        plotterFeedback.textContent = "Click inside the grid to plot a point.";
        plotterFeedback.className = "feedback neutral";
      }
      return;
    }

    plotPoint(worldX, worldY);
  });

  $("#plotterHint")?.addEventListener("click", () => {
    const targetIndex = plotterState.xs.findIndex(
      (x, index) => !plotterState.plotted.has(`${x},${plotterState.ys[index]}`)
    );
    if (targetIndex === -1) return;
    plotPoint(plotterState.xs[targetIndex], plotterState.ys[targetIndex], true);
  });

  $("#plotterReset")?.addEventListener("click", () => {
    plotterState.plotted.clear();
    plotterState.complete = false;
    if (plotterFeedback) {
      plotterFeedback.textContent = "";
      plotterFeedback.className = "feedback";
    }
    updatePlotterStatus();
    drawPlotter();
  });

  if (plotterRule) plotterRule.textContent = formatRule(plotterState.m, plotterState.c);

  /* ------------------------------------------------------------
     Lesson 9: cost builder
     ------------------------------------------------------------ */

  const costFixed = $("#costFixed");
  const costRate = $("#costRate");
  const costQty = $("#costQty");

  const updateCost = () => {
    if (!costFixed || !costRate || !costQty) return;
    const fixed = Number(costFixed.value);
    const rate = Number(costRate.value);
    const quantity = Number(costQty.value);
    const total = rate * quantity + fixed;

    const setText = (selector, value) => {
      const element = $(selector);
      if (element) element.textContent = value;
    };

    setText("#costFixedOut", fixed);
    setText("#costRateOut", rate);
    setText("#costQtyOut", quantity);
    setText("#costRule", `C = ${formatRuleWithVar(rate, fixed, "n")}`);
    setText("#costResult", `Cost for ${quantity} item${quantity === 1 ? "" : "s"} = $${total}`);
    setText("#costSteps", `${rate} × ${quantity} + ${fixed} = ${rate * quantity} + ${fixed} = ${total}`);
  };

  [costFixed, costRate, costQty].forEach((input) => {
    input?.addEventListener("input", updateCost);
  });

  /* ------------------------------------------------------------
     Practice challenge
     ------------------------------------------------------------ */

  const practiceIntro = $("#practiceIntro");
  const practiceGame = $("#practiceGame");
  const practiceResult = $("#practiceResult");
  const practiceQuestion = $("#practiceQuestion");
  const practiceCount = $("#practiceCount");
  const practiceScore = $("#practiceScore");
  const practiceProgress = $("#practiceProgress");
  const practiceFeedback = $("#practiceFeedback");
  const practiceCheck = $("#practiceCheck");
  const practiceNext = $("#practiceNext");
  const resultHeading = $("#resultHeading");
  const resultScore = $("#resultScore");
  const resultMessage = $("#resultMessage");

  const practiceState = {
    questions: [],
    index: 0,
    score: 0,
    answered: false
  };

  const renderPracticeQuestion = () => {
    const question = practiceState.questions[practiceState.index];
    if (!question || !practiceQuestion) return;

    practiceState.answered = false;
    const name = `practice-${practiceState.index}`;
    const options = question.options
      .map(
        (option, index) => `
          <label class="option">
            <input type="radio" name="${name}" value="${index}">
            <span>${escapeHtml(option)}</span>
          </label>`
      )
      .join("");

    practiceQuestion.innerHTML = `
      <div class="quiz-question" id="practiceQuestionCard">
        <p class="q-text">${escapeHtml(question.q)}</p>
        <div class="options">${options}</div>
      </div>`;

    if (practiceCount) {
      practiceCount.textContent = `Question ${practiceState.index + 1} of ${practiceState.questions.length}`;
    }
    if (practiceScore) practiceScore.textContent = `Score: ${practiceState.score}`;
    if (practiceProgress) {
      practiceProgress.style.width = `${(practiceState.index / practiceState.questions.length) * 100}%`;
    }
    if (practiceFeedback) {
      practiceFeedback.textContent = "";
      practiceFeedback.className = "feedback";
    }
    if (practiceCheck) {
      practiceCheck.hidden = false;
      practiceCheck.disabled = false;
    }
    if (practiceNext) practiceNext.hidden = true;
  };

  const startPractice = () => {
    practiceState.questions = shuffle(practiceBank).slice(0, 10);
    practiceState.index = 0;
    practiceState.score = 0;
    practiceState.answered = false;

    if (practiceIntro) practiceIntro.hidden = true;
    if (practiceResult) practiceResult.hidden = true;
    if (practiceGame) practiceGame.hidden = false;
    renderPracticeQuestion();
  };

  const finishPractice = () => {
    if (practiceGame) practiceGame.hidden = true;
    if (practiceResult) practiceResult.hidden = false;
    if (practiceProgress) practiceProgress.style.width = "100%";

    const total = practiceState.questions.length;
    const score = practiceState.score;
    const percentage = (score / total) * 100;

    let heading = "Keep practising";
    let message = "Go back to the lessons, try the tools again, and then have another go.";

    if (percentage >= 90) {
      heading = "Excellent work!";
      message = "You have a strong understanding of linear functions. Try explaining one of your answers to a partner.";
    } else if (percentage >= 70) {
      heading = "Strong work!";
      message = "You are getting the key ideas. Look back at any question you missed and check the explanation.";
    } else if (percentage >= 50) {
      heading = "Good effort";
      message = "You are on the right track. Revisit the lessons on tables, equations or graphs before your next try.";
    }

    if (resultHeading) resultHeading.textContent = heading;
    if (resultScore) resultScore.textContent = `You scored ${score} out of ${total}.`;
    if (resultMessage) resultMessage.textContent = message;

    markComplete("practice");
  };

  practiceCheck?.addEventListener("click", () => {
    if (practiceState.answered) return;
    const card = $("#practiceQuestionCard");
    if (!card) return;
    const selected = $('input[type="radio"]:checked', card);
    if (!selected) {
      if (practiceFeedback) {
        practiceFeedback.textContent = "Choose an answer first.";
        practiceFeedback.className = "feedback neutral";
      }
      return;
    }

    practiceState.answered = true;
    const question = practiceState.questions[practiceState.index];
    const choice = Number(selected.value);
    $$('input[type="radio"]', card).forEach((input) => {
      input.disabled = true;
    });

    if (choice === question.answer) {
      practiceState.score += 1;
      card.classList.add("correct");
      if (practiceFeedback) {
        practiceFeedback.textContent = `Correct. ${question.explanation}`;
        practiceFeedback.className = "feedback good";
      }
    } else {
      card.classList.add("incorrect");
      if (practiceFeedback) {
        practiceFeedback.textContent = `Not quite. The correct answer is ${question.options[question.answer]}. ${question.explanation}`;
        practiceFeedback.className = "feedback bad";
      }
    }

    if (practiceScore) practiceScore.textContent = `Score: ${practiceState.score}`;
    if (practiceCheck) practiceCheck.hidden = true;
    if (practiceNext) {
      practiceNext.hidden = false;
      practiceNext.focus();
    }
  });

  practiceNext?.addEventListener("click", () => {
    practiceState.index += 1;
    if (practiceState.index >= practiceState.questions.length) {
      finishPractice();
    } else {
      renderPracticeQuestion();
    }
  });

  $("#practiceStart")?.addEventListener("click", startPractice);
  $("#practiceRestart")?.addEventListener("click", startPractice);

  /* ------------------------------------------------------------
     Complete buttons and reset
     ------------------------------------------------------------ */

  $$(".complete-btn").forEach((button) => {
    button.addEventListener("click", () => {
      markComplete(button.dataset.complete);
    });
  });

  $("#resetProgress")?.addEventListener("click", () => {
    if (completed.length === 0) return;
    const shouldReset = window.confirm("Reset all lesson progress on this device?");
    if (!shouldReset) return;
    completed = [];
    saveProgress();
    updateProgressUI();
  });

  /* ------------------------------------------------------------
     Initial setup
     ------------------------------------------------------------ */

  renderLessonQuizzes();
  updateProgressUI();
  updateLetterTool();
  updateTileTool();
  updateGrowPattern();
  newNextTerm();
  updateMachine();
  newTable();
  newSubstitution();
  newEquation();
  newBalance();
  updateGraph();
  updatePlotterStatus();
  drawPlotter();
  updateCost();
  route();
})();
