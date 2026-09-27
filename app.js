const roster = [
  { id: "001", name: "櫻木 真乃", unit: "イルミネーションスターズ" },
  { id: "002", name: "風野 灯織", unit: "イルミネーションスターズ" },
  { id: "003", name: "八宮 めぐる", unit: "イルミネーションスターズ" },
  { id: "004", name: "月岡 恋鐘", unit: "アンティーカ" },
  { id: "005", name: "田中 摩美々", unit: "アンティーカ" },
  { id: "006", name: "白瀬 咲耶", unit: "アンティーカ" },
  { id: "007", name: "三峰 結華", unit: "アンティーカ" },
  { id: "008", name: "幽谷 霧子", unit: "アンティーカ" },
  { id: "009", name: "小宮 果穂", unit: "放課後クライマックスガールズ" },
  { id: "010", name: "園田 智代子", unit: "放課後クライマックスガールズ" },
  { id: "011", name: "西城 樹里", unit: "放課後クライマックスガールズ" },
  { id: "012", name: "杜野 凛世", unit: "放課後クライマックスガールズ" },
  { id: "013", name: "有栖川 夏葉", unit: "放課後クライマックスガールズ" },
  { id: "014", name: "大崎 甘奈", unit: "アルストロメリア" },
  { id: "015", name: "大崎 甜花", unit: "アルストロメリア" },
  { id: "016", name: "桑山 千雪", unit: "アルストロメリア" },
  { id: "017", name: "芹沢 あさひ", unit: "ストレイライト" },
  { id: "018", name: "黛 冬優子", unit: "ストレイライト" },
  { id: "019", name: "和泉 愛依", unit: "ストレイライト" },
  { id: "020", name: "浅倉 透", unit: "ノクチル" },
  { id: "021", name: "樋口 円香", unit: "ノクチル" },
  { id: "022", name: "福丸 小糸", unit: "ノクチル" },
  { id: "023", name: "市川 雛菜", unit: "ノクチル" },
  { id: "024", name: "七草 にちか", unit: "シーズ" },
  { id: "025", name: "緋田 美琴", unit: "シーズ" },
  { id: "050", name: "斑鳩 ルカ", unit: "コメティック" },
  { id: "051", name: "鈴木 羽那", unit: "コメティック" },
  { id: "052", name: "郁田 はるき", unit: "コメティック" },
].map((idol) => ({
  ...idol,
  image: `./assets/${idol.id}.jpg`,
  source: `https://shop.asobistore.jp/s/products/detail/249786-5_sc-c${idol.id}-00-00`,
}));

const elements = {
  questionNumber: document.querySelector("#question-number"),
  questionTotal: document.querySelector("#question-total"),
  largeNumber: document.querySelector("#large-number"),
  score: document.querySelector("#score"),
  progressBar: document.querySelector("#progress-bar"),
  progressRow: document.querySelector("#progress-row"),
  image: document.querySelector("#quiz-image"),
  choices: document.querySelector("#choices"),
  feedback: document.querySelector("#feedback"),
  feedbackStatus: document.querySelector("#feedback-status"),
  correctName: document.querySelector("#correct-name"),
  correctUnit: document.querySelector("#correct-unit"),
  sourceLink: document.querySelector("#source-link"),
  next: document.querySelector("#next-button"),
  nextLabel: document.querySelector("#next-label"),
  quiz: document.querySelector("#quiz-layout"),
  result: document.querySelector("#result"),
  finalScore: document.querySelector("#final-score"),
  finalTotal: document.querySelector("#final-total"),
  resultTitle: document.querySelector("#result-title"),
  resultMessage: document.querySelector("#result-message"),
  restart: document.querySelector("#restart-button"),
  modeButtons: [...document.querySelectorAll(".mode-button")],
};

const state = {
  mode: 10,
  questions: [],
  index: 0,
  score: 0,
  answered: false,
  options: [],
};

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function currentQuestion() {
  return state.questions[state.index];
}

function sourceId(id) {
  return id;
}

function startQuiz(mode = state.mode) {
  if (![10, 28].includes(Number(mode))) throw new Error("mode は 10 または 28 を指定してください");
  state.mode = Number(mode);
  state.questions = shuffle(roster).slice(0, state.mode);
  state.index = 0;
  state.score = 0;
  state.answered = false;
  elements.quiz.hidden = false;
  elements.progressRow.hidden = false;
  elements.result.hidden = true;
  elements.modeButtons.forEach((button) => {
    const active = Number(button.dataset.mode) === state.mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderQuestion();
  return getQuizState();
}

function createOptions(correct) {
  const sameUnit = shuffle(roster.filter((idol) => idol.unit === correct.unit && idol.id !== correct.id));
  const others = shuffle(roster.filter((idol) => idol.unit !== correct.unit));
  const distractors = [...sameUnit.slice(0, 2), ...others].filter(
    (idol, index, list) => list.findIndex((item) => item.id === idol.id) === index,
  ).slice(0, 3);
  return shuffle([correct, ...distractors]);
}

function renderQuestion() {
  const question = currentQuestion();
  state.answered = false;
  state.options = createOptions(question);
  const number = String(state.index + 1).padStart(2, "0");
  elements.questionNumber.textContent = number;
  elements.questionTotal.textContent = String(state.questions.length);
  elements.largeNumber.textContent = number;
  elements.score.textContent = String(state.score);
  elements.progressBar.style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
  elements.image.src = question.image;
  elements.image.alt = `第${state.index + 1}問：ソロ曲をイメージしたステッカーデザイン`;
  elements.feedback.hidden = true;
  elements.next.hidden = true;
  elements.choices.replaceChildren();

  state.options.forEach((idol, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice";
    button.dataset.id = idol.id;
    button.innerHTML = `<span class="choice__key">${index + 1}</span><span class="choice__name">${idol.name}</span>`;
    button.addEventListener("click", () => answer(idol.name));
    elements.choices.append(button);
  });
}

function answer(characterName) {
  if (state.answered) throw new Error("この問題は回答済みです");
  const selected = state.options.find((idol) => idol.name === characterName);
  if (!selected) throw new Error("現在の選択肢にあるキャラクター名を指定してください");
  const correct = currentQuestion();
  const isCorrect = selected.id === correct.id;
  state.answered = true;
  if (isCorrect) state.score += 1;
  elements.score.textContent = String(state.score);

  [...elements.choices.children].forEach((button) => {
    button.disabled = true;
    if (button.dataset.id === correct.id) button.classList.add("is-correct");
    else if (button.dataset.id === selected.id) button.classList.add("is-wrong");
    else button.classList.add("is-dimmed");
  });

  elements.feedbackStatus.textContent = isCorrect ? "CORRECT! 正解" : "MISS! 正解はこちら";
  elements.feedbackStatus.style.color = isCorrect ? "var(--lime)" : "var(--red)";
  elements.correctName.textContent = correct.name;
  elements.correctUnit.textContent = ` / ${correct.unit}`;
  elements.sourceLink.href = correct.source;
  elements.feedback.hidden = false;
  elements.nextLabel.textContent = state.index === state.questions.length - 1 ? "結果を見る" : "次の問題へ";
  elements.next.hidden = false;
  elements.next.focus({ preventScroll: true });
  return { correct: isCorrect, answer: correct.name, score: state.score };
}

function nextQuestion() {
  if (!state.answered) throw new Error("先に現在の問題へ回答してください");
  if (state.index >= state.questions.length - 1) {
    showResult();
    return getQuizState();
  }
  state.index += 1;
  renderQuestion();
  if (window.matchMedia("(max-width: 860px)").matches) {
    elements.image.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return getQuizState();
}

function showResult() {
  const ratio = state.score / state.questions.length;
  let title = "ナイスチャレンジ！";
  let message = "絵柄のモチーフを見直して、もう一度挑戦してみよう。";
  if (ratio === 1) {
    title = "PERFECT PRODUCER!";
    message = "全問正解！ 28人のソロ曲モチーフを完全に見抜きました。";
  } else if (ratio >= 0.8) {
    title = "かなりのシャニマス通！";
    message = "あと少しでパーフェクト。細かなモチーフまで見えています。";
  } else if (ratio >= 0.5) {
    title = "いいセンス！";
    message = "半分以上正解です。気になる絵柄は商品ページでも確認できます。";
  }
  elements.quiz.hidden = true;
  elements.progressRow.hidden = true;
  elements.finalScore.textContent = String(state.score);
  elements.finalTotal.textContent = `/ ${state.questions.length}`;
  elements.resultTitle.textContent = title;
  elements.resultMessage.textContent = message;
  elements.result.hidden = false;
  elements.result.scrollIntoView({ behavior: "smooth", block: "center" });
}

function getQuizState() {
  const question = currentQuestion();
  return {
    mode: state.mode,
    questionNumber: state.index + 1,
    totalQuestions: state.questions.length,
    score: state.score,
    answered: state.answered,
    choices: state.options.map((idol) => idol.name),
    image: question?.image,
  };
}

elements.modeButtons.forEach((button) => button.addEventListener("click", () => startQuiz(Number(button.dataset.mode))));
elements.next.addEventListener("click", nextQuestion);
elements.restart.addEventListener("click", () => startQuiz(state.mode));

document.addEventListener("keydown", (event) => {
  if (!state.answered && ["1", "2", "3", "4"].includes(event.key)) {
    const choice = state.options[Number(event.key) - 1];
    if (choice) answer(choice.name);
  } else if (state.answered && event.key === "Enter") {
    nextQuestion();
  }
});

function registerWebMcpTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const register = (tool) => {
    try {
      void Promise.resolve(context.registerTool(tool)).catch(() => {});
    } catch (_) {}
  };
  register({
    name: "start_character_quiz",
    title: "キャラクタークイズを開始",
    description: "10問または全28問のクイズを開始し、画面を最初の問題へ更新します。",
    inputSchema: {
      type: "object",
      properties: { mode: { type: "integer", enum: [10, 28] } },
      required: ["mode"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: ({ mode }) => startQuiz(mode),
  });
  register({
    name: "answer_character_quiz",
    title: "現在のクイズに回答",
    description: "画面に表示中の選択肢からキャラクター名を選び、回答結果を表示します。",
    inputSchema: {
      type: "object",
      properties: { characterName: { type: "string", minLength: 1 } },
      required: ["characterName"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: ({ characterName }) => answer(characterName),
  });
  register({
    name: "read_character_quiz_state",
    title: "クイズの状態を確認",
    description: "現在の問題番号、スコア、選択肢を読み取ります。",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: () => getQuizState(),
  });
}

startQuiz(10);
registerWebMcpTools();
