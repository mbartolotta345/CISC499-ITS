import { useMemo, useState } from "react";

type Screen = "placement" | "skillTree" | "lesson" | "quiz" | "project";
type QuizKind = "multiple" | "prediction" | "fill";

type KnowledgeComponent = {
  id: string;
  name: string;
  category: "Conceptual" | "Procedural" | "Conditional";
};

type Tier = {
  id: 1 | 2 | 3;
  label: string;
  title: string;
  objectives: string;
  kcIds: string[];
  projectPrompt: string;
  starterCode: string;
  checks: string[];
};

type Variant = {
  label: string;
  code: string;
  note: string;
};

type Assembly = {
  prompt: string;
  tokens: string[];
  correctOrder: string[];
};

type QuizQuestion = {
  id: string;
  kind: QuizKind;
  prompt: string;
  code?: string;
  options?: { id: string; label: string; preview?: string }[];
  answer: string;
  softHint: string;
  expertHint: string;
};

type Lesson = {
  id: string;
  tierId: 1 | 2 | 3;
  title: string;
  subtitle: string;
  kcIds: string[];
  variants: Variant[];
  assembly?: Assembly;
  rules: string[];
  quiz: QuizQuestion[];
};

type SequenceNode =
  | { id: string; type: "lesson"; lesson: Lesson }
  | { id: string; type: "project"; tier: Tier };

const kcs: KnowledgeComponent[] = [
  { id: "KC-01", name: "What HTML is & its purpose", category: "Conceptual" },
  { id: "KC-02", name: "HTML vs. programming languages", category: "Conceptual" },
  { id: "KC-03", name: "HTML vs. Markdown", category: "Conceptual" },
  { id: "KC-04", name: "Tag syntax (open/close/self-close)", category: "Procedural" },
  { id: "KC-05", name: "Common HTML tags & their purpose", category: "Conceptual" },
  { id: "KC-06", name: "DIV as a structural container", category: "Conceptual" },
  { id: "KC-07", name: "Writing attributes & values", category: "Procedural" },
  { id: "KC-08", name: "Nested HTML tags (parent/child)", category: "Procedural" },
  { id: "KC-09", name: "Predicting rendered output", category: "Conditional" },
  { id: "KC-10", name: "Core Markdown syntax", category: "Procedural" },
  { id: "KC-11", name: "Fenced code blocks in Markdown", category: "Procedural" },
  { id: "KC-12", name: "Nested Markdown structures", category: "Procedural" },
  { id: "KC-13", name: "HTML generated from Markdown", category: "Conditional" },
  { id: "KC-14", name: "Semantic vs. non-semantic tags", category: "Conceptual" },
  { id: "KC-15", name: "Block vs. inline elements", category: "Conditional" }
];

const tiers: Tier[] = [
  {
    id: 1,
    label: "Novice",
    title: "HTML Fundamentals",
    objectives: "LO 7, 8, 9, 10",
    kcIds: ["KC-01", "KC-02", "KC-03"],
    projectPrompt: "Build a tiny profile page with one heading, two paragraphs, and one link.",
    starterCode: "<h1>About Me</h1>\n<p>I am learning HTML.</p>\n",
    checks: ["h1", "p", "a"]
  },
  {
    id: 2,
    label: "Intermediate",
    title: "Syntax & Structure",
    objectives: "LO 1, 2, 3, 4, 5",
    kcIds: ["KC-04", "KC-05", "KC-06", "KC-07", "KC-08", "KC-15"],
    projectPrompt: "Build a product card with a div container, image, heading, paragraph, and link with an href.",
    starterCode: "<div class=\"card\">\n  <h2>Study Timer</h2>\n</div>\n",
    checks: ["div", "img", "h2", "p", "a[href]"]
  },
  {
    id: 3,
    label: "Advanced",
    title: "Reading & Writing HTML",
    objectives: "LO 6, 11, 12, 13, 14",
    kcIds: ["KC-09", "KC-10", "KC-11", "KC-12", "KC-13", "KC-14"],
    projectPrompt: "Convert a Markdown note into semantic HTML with a heading, list, code block, and section.",
    starterCode: "<section>\n  <h2>Markdown Notes</h2>\n</section>\n",
    checks: ["section", "h2", "ul", "li", "pre", "code"]
  }
];

const lessons: Lesson[] = [
  {
    id: "html-purpose",
    tierId: 1,
    title: "What HTML Does",
    subtitle: "Purpose, acronym, and where HTML fits",
    kcIds: ["KC-01", "KC-02"],
    variants: [
      {
        label: "Structure",
        code: "<h1>HTML gives content structure</h1>\n<p>The browser turns tags into a page.</p>",
        note: "HTML marks content so the browser can interpret headings, paragraphs, links, and more."
      },
      {
        label: "Not logic",
        code: "<p>2 + 2</p>\n<p>This displays text. It does not calculate.</p>",
        note: "HTML is a markup language. It describes content rather than running program logic."
      },
      {
        label: "Wrong fit",
        code: "<p>if score > 80 then pass</p>",
        note: "Program-like words render as plain text unless another language interprets them."
      }
    ],
    assembly: {
      prompt: "Arrange the tokens into a complete heading element.",
      tokens: ["Welcome", "</h1>", "<h1>"],
      correctOrder: ["<h1>", "Welcome", "</h1>"]
    },
    rules: [
      "HTML stands for HyperText Markup Language.",
      "Markup tells the browser what each piece of content means.",
      "HTML is not TypeScript because it does not execute typed program logic."
    ],
    quiz: [
      {
        id: "q-purpose-1",
        kind: "multiple",
        prompt: "What is HTML mainly used for?",
        options: [
          { id: "a", label: "Structuring content on web pages" },
          { id: "b", label: "Compiling TypeScript" },
          { id: "c", label: "Styling animations only" }
        ],
        answer: "a",
        softHint: "Look for the choice about giving a web page meaning and structure.",
        expertHint: "HTML defines document semantics and structure; CSS handles presentation and JavaScript/TypeScript handle behavior."
      },
      {
        id: "q-purpose-2",
        kind: "fill",
        prompt: "Complete the acronym: HTML = HyperText ___ Language",
        answer: "Markup",
        softHint: "The missing word means adding labels to content.",
        expertHint: "HTML is a markup language because tags annotate document content instead of expressing executable logic."
      }
    ]
  },
  {
    id: "html-markdown",
    tierId: 1,
    title: "HTML vs. Markdown",
    subtitle: "Two ways to express document structure",
    kcIds: ["KC-03", "KC-10"],
    variants: [
      {
        label: "HTML heading",
        code: "<h2>Schedule</h2>\n<p>Read, practice, reflect.</p>",
        note: "HTML uses tags with element names."
      },
      {
        label: "Markdown source",
        code: "<p># Schedule</p>\n<p>Read, practice, reflect.</p>",
        note: "Markdown symbols only become HTML after a Markdown processor converts them."
      },
      {
        label: "Converted",
        code: "<h2>Schedule</h2>\n<ul><li>Read</li><li>Practice</li><li>Reflect</li></ul>",
        note: "Markdown can generate HTML such as headings and lists."
      }
    ],
    assembly: {
      prompt: "Arrange the converted HTML for Markdown text: **strong**",
      tokens: ["</strong>", "strong", "<strong>"],
      correctOrder: ["<strong>", "strong", "</strong>"]
    },
    rules: [
      "Markdown is a shorthand authoring format.",
      "HTML is what the browser ultimately renders.",
      "Markdown features such as # headings and **bold** usually convert into HTML tags."
    ],
    quiz: [
      {
        id: "q-md-1",
        kind: "multiple",
        prompt: "Which Markdown feature commonly becomes an HTML <h1>?",
        options: [
          { id: "a", label: "# Title" },
          { id: "b", label: "`Title`" },
          { id: "c", label: "- Title" }
        ],
        answer: "a",
        softHint: "A heading in Markdown starts with a symbol before the words.",
        expertHint: "The number of # markers maps to heading depth, so # maps to h1 and ## maps to h2."
      },
      {
        id: "q-md-2",
        kind: "prediction",
        prompt: "What will this HTML display?",
        code: "<strong>Important</strong>",
        options: [
          { id: "a", label: "Plain word", preview: "Important" },
          { id: "b", label: "Bold word", preview: "<strong>Important</strong>" }
        ],
        answer: "b",
        softHint: "The strong tag emphasizes its content.",
        expertHint: "<strong> is semantic emphasis, and browsers usually render it with bold weight by default."
      }
    ]
  },
  {
    id: "tag-syntax",
    tierId: 2,
    title: "Tag Syntax",
    subtitle: "Open, close, self-close, and common tags",
    kcIds: ["KC-04", "KC-05"],
    variants: [
      {
        label: "Paired tag",
        code: "<p>This paragraph has an opening and closing tag.</p>",
        note: "Most elements wrap content between an opening tag and a closing tag."
      },
      {
        label: "Self closing",
        code: "<p>Image below:</p>\n<img src=\"https://dummyimage.com/180x80/e9eef6/263042&text=HTML\" alt=\"HTML label\">",
        note: "Void elements such as img do not wrap text content."
      },
      {
        label: "Wrong syntax",
        code: "<p>This paragraph never closes",
        note: "Browsers try to repair broken markup, but learners should write clear closing tags."
      }
    ],
    assembly: {
      prompt: "Arrange a link element with visible text.",
      tokens: ["Docs", "</a>", "<a href=\"docs.html\">"],
      correctOrder: ["<a href=\"docs.html\">", "Docs", "</a>"]
    },
    rules: [
      "Opening tags look like <p>; closing tags look like </p>.",
      "Some elements, including img and br, are void elements with no closing tag.",
      "Common tags have jobs: h1 for a main heading, p for text, a for links, img for images."
    ],
    quiz: [
      {
        id: "q-tags-1",
        kind: "multiple",
        prompt: "Which of the following is NOT a self-closing or void tag?",
        options: [
          { id: "a", label: "<p>" },
          { id: "b", label: "<img>" },
          { id: "c", label: "<br>" }
        ],
        answer: "a",
        softHint: "Think about which tag normally wraps text content.",
        expertHint: "The p element has a start tag and usually an end tag; img and br are void elements in HTML."
      },
      {
        id: "q-tags-2",
        kind: "fill",
        prompt: "Complete the closing tag: <h2>Title ___",
        answer: "</h2>",
        softHint: "A closing tag repeats the name and adds a slash.",
        expertHint: "The end tag must match the start tag name exactly, including heading level."
      }
    ]
  },
  {
    id: "structure-attributes",
    tierId: 2,
    title: "Structure & Attributes",
    subtitle: "DIV containers, attributes, nesting, block and inline flow",
    kcIds: ["KC-06", "KC-07", "KC-08", "KC-15"],
    variants: [
      {
        label: "With attribute",
        code: "<a href=\"https://developer.mozilla.org/\">Open MDN</a>",
        note: "Attributes add extra information, such as the URL for a link."
      },
      {
        label: "Without attribute",
        code: "<a>Open MDN</a>",
        note: "Without href, the text may look like a link but does not navigate."
      },
      {
        label: "Nested layout",
        code: "<div class=\"notice\"><h3>Reminder</h3><p>Practice nesting carefully.</p></div>",
        note: "The div groups related children into one structural container."
      }
    ],
    assembly: {
      prompt: "Build a div that contains a heading and paragraph in the correct order.",
      tokens: ["<p>Practice daily.</p>", "</div>", "<div>", "<h3>Tip</h3>"],
      correctOrder: ["<div>", "<h3>Tip</h3>", "<p>Practice daily.</p>", "</div>"]
    },
    rules: [
      "Attributes are written inside the opening tag as name=\"value\".",
      "Parent elements contain child elements; closing order should be inside-out.",
      "Block elements usually start on a new line; inline elements flow within text."
    ],
    quiz: [
      {
        id: "q-attr-1",
        kind: "fill",
        prompt: "Complete the image attribute: <img ___=\"photo.jpg\" alt=\"Photo\">",
        answer: "src",
        softHint: "The missing attribute gives the image file location.",
        expertHint: "src points to the image resource, while alt provides fallback/accessible text."
      },
      {
        id: "q-attr-2",
        kind: "prediction",
        prompt: "Which preview best matches this nested HTML?",
        code: "<div><h3>News</h3><p>Update posted.</p></div>",
        options: [
          { id: "a", label: "Heading above paragraph", preview: "<h3>News</h3><p>Update posted.</p>" },
          { id: "b", label: "One inline sentence", preview: "<span>News Update posted.</span>" }
        ],
        answer: "a",
        softHint: "h3 and p are both block-style elements in normal browser rendering.",
        expertHint: "The div groups children without changing their default block formatting."
      }
    ]
  },
  {
    id: "predict-semantic",
    tierId: 3,
    title: "Predicting Rendered Output",
    subtitle: "Read HTML and infer what the browser will show",
    kcIds: ["KC-09", "KC-14"],
    variants: [
      {
        label: "Semantic",
        code: "<article><h2>Lab Notes</h2><p>Use tags for meaning.</p></article>",
        note: "Semantic tags communicate meaning to browsers, tools, and assistive technology."
      },
      {
        label: "Non semantic",
        code: "<div><h2>Lab Notes</h2><p>Use tags for meaning.</p></div>",
        note: "A div can group content, but it does not identify the content as an article."
      },
      {
        label: "Inline mix",
        code: "<p>Read the <strong>important</strong> note.</p>",
        note: "Inline elements can sit inside text without forcing a new block."
      }
    ],
    assembly: {
      prompt: "Arrange semantic article markup.",
      tokens: ["</article>", "<p>Result ready.</p>", "<article>", "<h2>Report</h2>"],
      correctOrder: ["<article>", "<h2>Report</h2>", "<p>Result ready.</p>", "</article>"]
    },
    rules: [
      "Prediction means reading tags, nesting, and default browser behavior.",
      "Semantic tags such as article, section, nav, and header describe meaning.",
      "A div is useful but generic."
    ],
    quiz: [
      {
        id: "q-predict-1",
        kind: "prediction",
        prompt: "What will the browser display?",
        code: "<p>Hello <em>HTML</em></p>",
        options: [
          { id: "a", label: "Hello HTML with emphasis", preview: "<p>Hello <em>HTML</em></p>" },
          { id: "b", label: "The literal tags", preview: "&lt;p&gt;Hello &lt;em&gt;HTML&lt;/em&gt;&lt;/p&gt;" }
        ],
        answer: "a",
        softHint: "The browser interprets the tags instead of showing them as ordinary text.",
        expertHint: "Because the markup is parsed as HTML, p creates a paragraph and em creates emphasized inline content."
      },
      {
        id: "q-predict-2",
        kind: "multiple",
        prompt: "Which tag is more semantic for a standalone blog post?",
        options: [
          { id: "a", label: "<article>" },
          { id: "b", label: "<div>" },
          { id: "c", label: "<span>" }
        ],
        answer: "a",
        softHint: "Pick the tag whose name describes a self-contained piece of writing.",
        expertHint: "article carries document meaning; div and span are generic containers."
      }
    ]
  },
  {
    id: "markdown-html",
    tierId: 3,
    title: "Markdown to HTML",
    subtitle: "Code fences, nested Markdown, and generated HTML",
    kcIds: ["KC-10", "KC-11", "KC-12", "KC-13"],
    variants: [
      {
        label: "List",
        code: "<ul><li>Plan</li><li>Build</li><li>Review</li></ul>",
        note: "Markdown bullet lists commonly become ul and li elements."
      },
      {
        label: "Code block",
        code: "<pre><code>&lt;h1&gt;Hello&lt;/h1&gt;</code></pre>",
        note: "Fenced code blocks preserve code text instead of rendering it as page markup."
      },
      {
        label: "Nested",
        code: "<ul><li>HTML<ul><li>Tags</li><li>Attributes</li></ul></li></ul>",
        note: "Indented Markdown list items can generate nested list structures."
      }
    ],
    assembly: {
      prompt: "Arrange the HTML generated for a fenced code block.",
      tokens: ["</code></pre>", "&lt;p&gt;Hi&lt;/p&gt;", "<pre><code>"],
      correctOrder: ["<pre><code>", "&lt;p&gt;Hi&lt;/p&gt;", "</code></pre>"]
    },
    rules: [
      "Markdown headings, lists, emphasis, and code fences map to HTML elements.",
      "Fenced code blocks should display source code, not run it as HTML.",
      "Nested Markdown creates nested HTML when indentation or containment is used correctly."
    ],
    quiz: [
      {
        id: "q-mdhtml-1",
        kind: "multiple",
        prompt: "Which HTML element pair is commonly generated for a fenced code block?",
        options: [
          { id: "a", label: "<pre><code>...</code></pre>" },
          { id: "b", label: "<ul><li>...</li></ul>" },
          { id: "c", label: "<a href=\"...\">...</a>" }
        ],
        answer: "a",
        softHint: "A code fence needs to preserve formatting and mark code.",
        expertHint: "pre preserves whitespace and code identifies the content as code."
      },
      {
        id: "q-mdhtml-2",
        kind: "prediction",
        prompt: "What does this generated HTML represent?",
        code: "<ul><li>Parent<ul><li>Child</li></ul></li></ul>",
        options: [
          { id: "a", label: "Nested list", preview: "<ul><li>Parent<ul><li>Child</li></ul></li></ul>" },
          { id: "b", label: "Two paragraphs", preview: "<p>Parent</p><p>Child</p>" }
        ],
        answer: "a",
        softHint: "A ul inside an li means a list inside a list item.",
        expertHint: "The child ul is nested in the parent li, preserving the hierarchy from nested Markdown."
      }
    ]
  }
];

const placementQuestions = kcs.map((kc, index) => ({
  id: kc.id,
  prompt: `${index + 1}. ${kc.name}`,
  options: [
    { id: "confident", label: "I can teach this" },
    { id: "partial", label: "I know parts of this" },
    { id: "unsure", label: "I need practice" }
  ],
  answer: index < 5 ? "confident" : index < 10 ? "partial" : "confident"
}));

const defaultConfidence = {
  fundamentals: 45,
  syntax: 35,
  reading: 25
};

const lessonById = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const tierById = Object.fromEntries(tiers.map((tier) => [tier.id, tier]));

function App() {
  const [screen, setScreen] = useState<Screen>("placement");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);
  const [activeTierId, setActiveTierId] = useState<1 | 2 | 3>(1);
  const [confidence, setConfidence] = useState(defaultConfidence);
  const [placementAnswers, setPlacementAnswers] = useState<Record<string, string>>({});
  const [placementResult, setPlacementResult] = useState<string>("");
  const [projectCode, setProjectCode] = useState<Record<number, string>>({
    1: tiers[0].starterCode,
    2: tiers[1].starterCode,
    3: tiers[2].starterCode
  });

  const sequence = useMemo<SequenceNode[]>(() => {
    return tiers.flatMap((tier) => [
      ...lessons.filter((lesson) => lesson.tierId === tier.id).map((lesson) => ({ id: lesson.id, type: "lesson" as const, lesson })),
      { id: projectId(tier.id), type: "project" as const, tier }
    ]);
  }, []);

  const activeLesson = lessonById[activeLessonId] ?? lessons[0];
  const activeTier = tierById[activeTierId] ?? tiers[0];

  const startAt = (tierId: 1 | 2 | 3) => {
    const nextCompleted = new Set<string>();
    if (tierId >= 2) {
      lessons.filter((lesson) => lesson.tierId === 1).forEach((lesson) => nextCompleted.add(lesson.id));
      nextCompleted.add(projectId(1));
    }
    if (tierId >= 3) {
      lessons.filter((lesson) => lesson.tierId === 2).forEach((lesson) => nextCompleted.add(lesson.id));
      nextCompleted.add(projectId(2));
    }
    setCompleted(nextCompleted);
    const firstLesson = lessons.find((lesson) => lesson.tierId === tierId) ?? lessons[0];
    setActiveLessonId(firstLesson.id);
    setActiveTierId(tierId);
    setScreen("skillTree");
  };

  const applyConfidencePlacement = () => {
    const average = (confidence.fundamentals + confidence.syntax + confidence.reading) / 3;
    if (average >= 75 && confidence.reading >= 65) {
      startAt(3);
    } else if (average >= 50 && confidence.syntax >= 45) {
      startAt(2);
    } else {
      startAt(1);
    }
  };

  const scorePlacementQuiz = () => {
    const score = placementQuestions.reduce((sum, question) => {
      return sum + (placementAnswers[question.id] === question.answer ? 1 : 0);
    }, 0);
    const tierId: 1 | 2 | 3 = score >= 12 ? 3 : score >= 8 ? 2 : 1;
    setPlacementResult(`Placement score: ${score}/15. Recommended start: Tier ${tierId} ${tierById[tierId].label}.`);
    startAt(tierId);
  };

  const openNode = (node: SequenceNode) => {
    if (!isUnlocked(sequence, completed, node.id)) {
      return;
    }
    if (node.type === "lesson") {
      setActiveLessonId(node.lesson.id);
      setActiveTierId(node.lesson.tierId);
      setScreen("lesson");
    } else {
      setActiveTierId(node.tier.id);
      setScreen("project");
    }
  };

  const completeLesson = (lessonId: string) => {
    setCompleted((existing) => new Set(existing).add(lessonId));
    setScreen("skillTree");
  };

  const completeProject = (tierId: number) => {
    setCompleted((existing) => new Set(existing).add(projectId(tierId)));
    setScreen("skillTree");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-button" onClick={() => setScreen("placement")} aria-label="Return to placement">
          <span className="brand-mark">HT</span>
          <span>
            <strong>HTML Tutor</strong>
            <small>Browser-based ITS prototype</small>
          </span>
        </button>
        <nav className="topnav" aria-label="Main screens">
          <button className={screen === "placement" ? "active" : ""} onClick={() => setScreen("placement")}>Placement</button>
          <button className={screen === "skillTree" ? "active" : ""} onClick={() => setScreen("skillTree")}>Skill Tree</button>
          <button className={screen === "lesson" ? "active" : ""} onClick={() => setScreen("lesson")}>Lesson</button>
          <button className={screen === "quiz" ? "active" : ""} onClick={() => setScreen("quiz")}>Quiz</button>
          <button className={screen === "project" ? "active" : ""} onClick={() => setScreen("project")}>Project</button>
        </nav>
      </header>

      {screen === "placement" && (
        <PlacementScreen
          confidence={confidence}
          setConfidence={setConfidence}
          placementAnswers={placementAnswers}
          setPlacementAnswers={setPlacementAnswers}
          placementResult={placementResult}
          onSelect={startAt}
          onConfidence={applyConfidencePlacement}
          onScoreQuiz={scorePlacementQuiz}
        />
      )}

      {screen === "skillTree" && (
        <SkillTreeScreen sequence={sequence} completed={completed} onOpen={openNode} />
      )}

      {screen === "lesson" && (
        <LessonScreen lesson={activeLesson} onQuiz={() => setScreen("quiz")} />
      )}

      {screen === "quiz" && (
        <QuizScreen lesson={activeLesson} onBack={() => setScreen("lesson")} onComplete={() => completeLesson(activeLesson.id)} />
      )}

      {screen === "project" && (
        <ProjectScreen
          tier={activeTier}
          code={projectCode[activeTier.id]}
          setCode={(value) => setProjectCode((existing) => ({ ...existing, [activeTier.id]: value }))}
          onComplete={() => completeProject(activeTier.id)}
        />
      )}
    </div>
  );
}

function PlacementScreen({
  confidence,
  setConfidence,
  placementAnswers,
  setPlacementAnswers,
  placementResult,
  onSelect,
  onConfidence,
  onScoreQuiz
}: {
  confidence: typeof defaultConfidence;
  setConfidence: (confidence: typeof defaultConfidence) => void;
  placementAnswers: Record<string, string>;
  setPlacementAnswers: (answers: Record<string, string>) => void;
  placementResult: string;
  onSelect: (tierId: 1 | 2 | 3) => void;
  onConfidence: () => void;
  onScoreQuiz: () => void;
}) {
  const [showExpertQuiz, setShowExpertQuiz] = useState(false);

  return (
    <main className="screen two-column placement-grid">
      <section className="panel intro-panel">
        <p className="eyebrow">Screen 1</p>
        <h1>Start with the right challenge level.</h1>
        <p className="lede">
          Choose a quick route into the tutor or rate your confidence across the major topic groups for a more precise starting model.
        </p>
        <div className="tier-picks">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              className="tier-pick"
              onClick={() => (tier.id === 3 ? setShowExpertQuiz(true) : onSelect(tier.id))}
            >
              <span>Tier {tier.id}</span>
              <strong>{tier.label}</strong>
              <small>{tier.title}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Confidence placement</p>
        <h2>Rate each topic group</h2>
        <Slider
          label="HTML fundamentals"
          value={confidence.fundamentals}
          onChange={(value) => setConfidence({ ...confidence, fundamentals: value })}
        />
        <Slider
          label="Syntax and structure"
          value={confidence.syntax}
          onChange={(value) => setConfidence({ ...confidence, syntax: value })}
        />
        <Slider
          label="Reading, writing, Markdown"
          value={confidence.reading}
          onChange={(value) => setConfidence({ ...confidence, reading: value })}
        />
        <button className="primary-action" onClick={onConfidence}>Generate starting tier</button>
      </section>

      {showExpertQuiz && (
        <section className="panel quiz-placement">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Expert placement quiz</p>
              <h2>15 KC check</h2>
            </div>
            <button className="ghost-action" onClick={() => setShowExpertQuiz(false)}>Close</button>
          </div>
          <div className="placement-question-list">
            {placementQuestions.map((question) => (
              <div className="placement-question" key={question.id}>
                <span>{question.prompt}</span>
                <select
                  value={placementAnswers[question.id] ?? ""}
                  onChange={(event) => setPlacementAnswers({ ...placementAnswers, [question.id]: event.target.value })}
                >
                  <option value="">Choose confidence</option>
                  {question.options.map((option) => (
                    <option value={option.id} key={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button className="primary-action" onClick={onScoreQuiz}>Score placement quiz</button>
          {placementResult && <p className="result-line">{placementResult}</p>}
        </section>
      )}
    </main>
  );
}

function SkillTreeScreen({
  sequence,
  completed,
  onOpen
}: {
  sequence: SequenceNode[];
  completed: Set<string>;
  onOpen: (node: SequenceNode) => void;
}) {
  return (
    <main className="screen skill-layout">
      <section className="panel skill-summary">
        <p className="eyebrow">Screen 2</p>
        <h1>Skill Tree</h1>
        <p className="lede">A directed vertical progression. Complete each lesson quiz and tier project to unlock the next node.</p>
        <div className="state-legend">
          <span><i className="dot locked-dot" />Locked</span>
          <span><i className="dot unlocked-dot" />Unlocked</span>
          <span><i className="dot complete-dot" />Complete</span>
        </div>
        <div className="kc-grid">
          {kcs.map((kc) => (
            <span key={kc.id} className={`kc-chip ${kc.category.toLowerCase()}`}>{kc.id}</span>
          ))}
        </div>
      </section>
      <section className="skill-tree" aria-label="Lesson progression">
        {sequence.map((node, index) => {
          const complete = completed.has(node.id);
          const unlocked = isUnlocked(sequence, completed, node.id);
          const tier = node.type === "lesson" ? tierById[node.lesson.tierId] : node.tier;
          return (
            <button
              key={node.id}
              className={`tree-node ${complete ? "complete" : unlocked ? "unlocked" : "locked"}`}
              onClick={() => onOpen(node)}
              disabled={!unlocked}
            >
              <span className="node-index">{index + 1}</span>
              <span className="node-copy">
                <small>Tier {tier.id} {tier.label}</small>
                <strong>{node.type === "lesson" ? node.lesson.title : `${tier.label} Mini Project`}</strong>
                <em>{node.type === "lesson" ? node.lesson.kcIds.join(", ") : tier.checks.join(", ")}</em>
              </span>
            </button>
          );
        })}
      </section>
    </main>
  );
}

function LessonScreen({ lesson, onQuiz }: { lesson: Lesson; onQuiz: () => void }) {
  const [variantIndex, setVariantIndex] = useState(0);
  const [assemblyTokens, setAssemblyTokens] = useState(lesson.assembly?.tokens ?? []);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [assemblyFeedback, setAssemblyFeedback] = useState("");
  const variant = lesson.variants[variantIndex] ?? lesson.variants[0];

  const resetAssembly = () => {
    setAssemblyTokens(lesson.assembly?.tokens ?? []);
    setAssemblyFeedback("");
  };

  const moveToken = (from: number, to: number) => {
    const next = [...assemblyTokens];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setAssemblyTokens(next);
  };

  const checkAssembly = () => {
    if (!lesson.assembly) {
      return;
    }
    const wrongIndex = assemblyTokens.findIndex((token, index) => token !== lesson.assembly?.correctOrder[index]);
    if (wrongIndex === -1) {
      setAssemblyFeedback("Correct. The structure is valid.");
    } else {
      setAssemblyFeedback(`First issue: position ${wrongIndex + 1} should be ${lesson.assembly.correctOrder[wrongIndex]}.`);
    }
  };

  return (
    <main className="screen lesson-screen">
      <section className="panel lesson-header">
        <p className="eyebrow">Screen 3</p>
        <h1>{lesson.title}</h1>
        <p className="lede">{lesson.subtitle}</p>
        <div className="kc-row">{lesson.kcIds.map((kc) => <span className="kc-pill" key={kc}>{kc}</span>)}</div>
      </section>

      <section className="panel variant-lab">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Code variant tabs</p>
            <h2>Compare the output</h2>
          </div>
        </div>
        <div className="tab-row" role="tablist">
          {lesson.variants.map((item, index) => (
            <button
              key={item.label}
              className={index === variantIndex ? "active" : ""}
              onClick={() => setVariantIndex(index)}
              role="tab"
              aria-selected={index === variantIndex}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="code-preview-grid">
          <pre className="code-block"><code>{variant.code}</code></pre>
          <SafePreview html={variant.code} />
        </div>
        <p className="note-line">{variant.note}</p>
      </section>

      {lesson.assembly && (
        <section className="panel assembly-lab">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Drag-and-drop assembly</p>
              <h2>{lesson.assembly.prompt}</h2>
            </div>
            <button className="ghost-action" onClick={resetAssembly}>Reset</button>
          </div>
          <div className="token-bank">
            {assemblyTokens.map((token, index) => (
              <button
                key={`${token}-${index}`}
                draggable
                className="html-token"
                onDragStart={() => setDragIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) {
                    moveToken(dragIndex, index);
                  }
                  setDragIndex(null);
                }}
              >
                {token}
              </button>
            ))}
          </div>
          <div className="assembled-preview">
            <code>{assemblyTokens.join("")}</code>
          </div>
          <button className="primary-action" onClick={checkAssembly}>Validate structure</button>
          {assemblyFeedback && <p className={assemblyFeedback.startsWith("Correct") ? "success-line" : "error-line"}>{assemblyFeedback}</p>}
        </section>
      )}

      <section className="panel rules-panel">
        <p className="eyebrow">Key rules</p>
        <ul>
          {lesson.rules.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>
        <button className="primary-action" onClick={onQuiz}>Take mini quiz</button>
      </section>
    </main>
  );
}

function QuizScreen({ lesson, onBack, onComplete }: { lesson: Lesson; onBack: () => void; onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [hintMode, setHintMode] = useState<Record<string, "soft" | "expert" | "">>({});
  const correctCount = lesson.quiz.filter((question) => normalizeAnswer(answers[question.id]) === normalizeAnswer(question.answer)).length;
  const passed = correctCount === lesson.quiz.length;

  return (
    <main className="screen quiz-screen">
      <section className="panel lesson-header">
        <p className="eyebrow">Screen 4</p>
        <h1>{lesson.title} Mini Quiz</h1>
        <p className="lede">Questions mix conceptual checks, code prediction, and fill-in-the-blank syntax.</p>
      </section>

      <section className="quiz-list">
        {lesson.quiz.map((question) => {
          const isCorrect = normalizeAnswer(answers[question.id]) === normalizeAnswer(question.answer);
          const showFeedback = submitted && answers[question.id] !== undefined;
          return (
            <article className="panel quiz-card" key={question.id}>
              <div className="question-meta">
                <span>{question.kind}</span>
                {showFeedback && <strong className={isCorrect ? "success-line" : "error-line"}>{isCorrect ? "Correct" : "Needs revision"}</strong>}
              </div>
              <h2>{question.prompt}</h2>
              {question.code && <pre className="code-block compact"><code>{question.code}</code></pre>}
              {question.kind === "fill" ? (
                <input
                  className="blank-input"
                  value={answers[question.id] ?? ""}
                  onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })}
                  placeholder="Type the missing code"
                />
              ) : (
                <div className={question.kind === "prediction" ? "prediction-options" : "answer-options"}>
                  {question.options?.map((option) => (
                    <button
                      key={option.id}
                      className={answers[question.id] === option.id ? "selected" : ""}
                      onClick={() => setAnswers({ ...answers, [question.id]: option.id })}
                    >
                      <span>{option.label}</span>
                      {option.preview && <span className="screenshot-option" dangerouslySetInnerHTML={{ __html: option.preview }} />}
                    </button>
                  ))}
                </div>
              )}
              {submitted && !isCorrect && (
                <div className="hint-box">
                  <div className="hint-actions">
                    <button onClick={() => setHintMode({ ...hintMode, [question.id]: "soft" })}>Soft hint</button>
                    <button onClick={() => setHintMode({ ...hintMode, [question.id]: "expert" })}>Expert hint</button>
                  </div>
                  {hintMode[question.id] === "soft" && <p>{question.softHint}</p>}
                  {hintMode[question.id] === "expert" && <p>{question.expertHint}</p>}
                </div>
              )}
            </article>
          );
        })}
      </section>

      <section className="panel quiz-actions">
        <button className="ghost-action" onClick={onBack}>Back to lesson</button>
        <button className="primary-action" onClick={() => setSubmitted(true)}>Check answers</button>
        {submitted && <span className={passed ? "success-line" : "error-line"}>Score: {correctCount}/{lesson.quiz.length}</span>}
        {submitted && passed && <button className="primary-action" onClick={onComplete}>Complete lesson</button>}
      </section>
    </main>
  );
}

function ProjectScreen({
  tier,
  code,
  setCode,
  onComplete
}: {
  tier: Tier;
  code: string;
  setCode: (code: string) => void;
  onComplete: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const results = tier.checks.map((check) => ({ check, ok: checkHtml(code, check) }));
  const passed = results.every((result) => result.ok);

  return (
    <main className="screen project-screen">
      <section className="panel lesson-header">
        <p className="eyebrow">Screen 5</p>
        <h1>Tier {tier.id} Mini Project</h1>
        <p className="lede">{tier.projectPrompt}</p>
      </section>

      <section className="editor-grid">
        <div className="panel editor-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">HTML editor</p>
              <h2>{tier.label} build</h2>
            </div>
          </div>
          <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} />
        </div>
        <div className="panel preview-panel">
          <p className="eyebrow">Sandboxed preview</p>
          <SafePreview html={code} tall />
        </div>
      </section>

      <section className="panel instruction-panel">
        <div>
          <p className="eyebrow">Automated checker</p>
          <h2>Required evidence</h2>
        </div>
        <div className="check-list">
          {results.map((result) => (
            <span key={result.check} className={checked ? (result.ok ? "check-pass" : "check-fail") : ""}>
              {result.check}
            </span>
          ))}
        </div>
        <button className="primary-action" onClick={() => setChecked(true)}>Check My Code</button>
        {checked && (
          <p className={passed ? "success-line" : "error-line"}>
            {passed ? "Project checks passed." : "Some required elements are missing or incomplete."}
          </p>
        )}
        {checked && passed && <button className="primary-action" onClick={onComplete}>Complete project</button>}
      </section>
    </main>
  );
}

function Slider({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="slider-row">
      <span>{label}</span>
      <input type="range" min="0" max="100" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <strong>{value}%</strong>
    </label>
  );
}

function SafePreview({ html, tall = false }: { html: string; tall?: boolean }) {
  const srcDoc = `<!doctype html><html><head><style>body{font-family:Inter,Arial,sans-serif;padding:18px;color:#1e293b;line-height:1.5}img{max-width:100%;height:auto}.card,.notice{border:1px solid #cbd5e1;border-radius:8px;padding:12px;background:#f8fafc}code,pre{background:#eef2f7;padding:4px 6px;border-radius:5px}</style></head><body>${stripScripts(html)}</body></html>`;
  return <iframe className={`safe-preview ${tall ? "tall" : ""}`} title="Rendered HTML preview" sandbox="" srcDoc={srcDoc} />;
}

function isUnlocked(sequence: SequenceNode[], completed: Set<string>, id: string) {
  const index = sequence.findIndex((node) => node.id === id);
  if (index <= 0) {
    return true;
  }
  return completed.has(id) || completed.has(sequence[index - 1].id);
}

function projectId(tierId: number) {
  return `project-${tierId}`;
}

function normalizeAnswer(value = "") {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function stripScripts(html: string) {
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
}

function checkHtml(html: string, check: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(stripScripts(html), "text/html");
  return Boolean(doc.querySelector(check));
}

export default App;
