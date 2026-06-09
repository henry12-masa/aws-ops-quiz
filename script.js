const params = new URLSearchParams(location.search);
const type = params.get("type") || "all";

const quizInfo = {
  incident: {
    title: "AWS障害対応クイズ",
    desc: "障害切り分け・復旧・冗長化・ログ確認・再発防止"
  },
  monitoring: {
    title: "AWS運用監視クイズ",
    desc: "CloudWatch・CloudTrail・EventBridge・アラーム・ログ監視"
  },
  cost: {
    title: "AWSコスト最適化クイズ",
    desc: "Rightsizing・Savings Plans・RI・S3ライフサイクル・可視化"
  },
  wellarchitected: {
    title: "AWS Well-Architected Frameworkクイズ",
    desc: "運用上の優秀性・セキュリティ・信頼性・性能効率・コスト最適化・持続可能性"
  },
  securityIncident: {
    title: "AWSセキュリティインシデント対応クイズ",
    desc: "検知・封じ込め・調査・復旧・証跡保全・IAM対応"
  }
};

const pageTitle = document.getElementById("pageTitle");
const pageDesc = document.getElementById("pageDesc");
const quizList = document.getElementById("quizList");

if (type === "all") {
  document.title = "AWS実務対応クイズ";
  pageTitle.textContent = "AWS実務対応クイズ";
  pageDesc.textContent = "障害対応・運用監視・コスト最適化・Well-Architected・セキュリティ対応を50問ランダムで学習";
} else {
  const info = quizInfo[type] || quizInfo.incident;
  document.title = info.title;
  pageTitle.textContent = info.title;
  pageDesc.textContent = info.desc;
}

quizList.innerHTML = `
  <a href="index.html" class="${type === "all" ? "active" : ""}">全カテゴリ50問</a>
  ${Object.keys(quizInfo).map(key => `
    <a href="?type=${key}" class="${type === key ? "active" : ""}">
      ${quizInfo[key].title}
    </a>
  `).join("")}
`;

function normalizeQuestion(q){
  return {
    question: q.question || q.q,
    choices: q.choices || q.c,
    answer: q.answer || q.a,
    explanation: q.explanation || q.e || ""
  };
}

let questions = [];

if (type === "all") {
  Object.keys(quizInfo).forEach(key => {
    if (window.quizData && window.quizData[key]) {
      questions.push(...window.quizData[key].map(normalizeQuestion));
    }
  });
} else {
  questions = window.quizData?.[type]
    ? window.quizData[type].map(normalizeQuestion)
    : [];
}

questions = questions.sort(() => Math.random() - 0.5).slice(0, 50);

let currentIndex = 0;
let score = 0;
let answered = false;

const counter = document.getElementById("counter");
const scoreEl = document.getElementById("score");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const resultEl = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");

function showQuestion() {
  answered = false;
  resultEl.textContent = "";
  nextBtn.style.display = "none";

  if (questions.length === 0) {
    questionEl.textContent = "問題データが読み込めませんでした";
    choicesEl.innerHTML = "";
    counter.textContent = "0 / 0";
    scoreEl.textContent = "スコア: 0";
    progressBar.style.width = "0%";
    return;
  }

  if (currentIndex >= questions.length) {
    questionEl.textContent = "終了！";
    choicesEl.innerHTML = "";
    counter.textContent = `${questions.length} / ${questions.length}`;
    scoreEl.textContent = `スコア: ${score}`;
    resultEl.textContent = `${questions.length}問中 ${score}問正解`;
    progressBar.style.width = "100%";
    return;
  }

  const q = questions[currentIndex];

  counter.textContent = `${currentIndex + 1} / ${questions.length}`;
  scoreEl.textContent = `スコア: ${score}`;
  questionEl.textContent = q.question;
  progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;

  choicesEl.innerHTML = "";

  q.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;

    btn.onclick = () => {
      if (answered) return;
      answered = true;

      if (choice === q.answer) {
        score++;
        resultEl.textContent = "正解！";
      } else {
        resultEl.textContent = `不正解。正解は「${q.answer}」`;
      }

      if (q.explanation) {
        resultEl.textContent += ` ${q.explanation}`;
      }

      scoreEl.textContent = `スコア: ${score}`;
      nextBtn.style.display = "block";
    };

    choicesEl.appendChild(btn);
  });
}

nextBtn.onclick = () => {
  currentIndex++;
  showQuestion();
};

showQuestion();
