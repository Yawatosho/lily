const BOOK_COLORS = [
  "#8d4b52",
  "#2f6e72",
  "#6a5a7d",
  "#9a6c38",
  "#476b4f",
  "#b26455",
  "#425d7c",
  "#7a4f3a"
];

const SHELF_ROWS = 3;
const BOOKS_PER_ROW = 8;
const FIND_BOOK_COUNT = SHELF_ROWS * BOOKS_PER_ROW;
const CALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const COUNTDOWN_STEPS = [
  { text: "れでぃ〜", sound: "ready", durationMs: 1500 },
  { text: "ご〜！", sound: "go", durationMs: 1000 }
];
const COUNTDOWN_SOUNDS = {
  ready: "./sounds/ready.mp3",
  go: "./sounds/go.mp3"
};
const GAME_SOUNDS = {
  ok: "./sounds/ok.mp3",
  ng: "./sounds/ng.mp3",
  result_s: "./sounds/result_s.mp3",
  result_a: "./sounds/result_a.mp3",
  result_b: "./sounds/result_b.mp3",
  result_c: "./sounds/result_c.mp3"
};
const RESULT_ASSET_VERSION = "v34";
const STORY_ASSET_VERSION = "v41";
const MODE_LABELS = {
  find: "まいご本レスキュー",
  sort: "バラバラ本棚レスキュー"
};
const countdownAudio = {};
const gameAudio = {};

const STORY_DATA = {
  find: {
    label: MODE_LABELS.find,
    slides: [
      {
        image: `./assets/story_maigo_a.png?${STORY_ASSET_VERSION}`,
        text: "ひよっこ司書のリリーは、今日も元気に図書館の本棚を整理していました。\n「よし！ もうちょっとで終わり！」と張り切っていたそのとき\n—— 「ここじゃないよ〜。誰か気づいてくれないかな？」 「えっ？」\nリリーは思わず本を抱えたままキョロキョロ。"
      },
      {
        image: `./assets/story_maigo_b.png?${STORY_ASSET_VERSION}`,
        text: "誰もいない静かな図書館。でも、確かにどこかから声が……。\n「ねえ、ぼくの位置はここじゃないの。元の場所に戻してほしいなあ！」\n「ええっ！？ しゃ、しゃべる本！？ そんなのアリ！？ で、でも……たしかに、本が間違った場所にあったら困っちゃうもんね！」"
      },
      {
        image: `./assets/story_maigo_c.png?${STORY_ASSET_VERSION}`,
        text: "どうやら1冊の本が、間違った場所に紛れ込んでしまったみたい。でも、それがどこにあるのかはわかりません。\n「よーし！ こうなったら、ぜーったい見つけてあげる！ まかせて！」\n請求記号を頼りに、迷子の本を見つけ出し、正しい本棚へ戻してあげましょう！"
      }
    ]
  },
  sort: {
    label: MODE_LABELS.sort,
    slides: [
      {
        image: `./assets/story_seiri_a.png?${STORY_ASSET_VERSION}`,
        text: "迷子の本を元の場所に戻したリリーが、ほっと息をついたそのとき。\nガタガタガタッ！\n「えっ、なに！？」\n見ると、本棚の本たちが、あちこち入れかわって、バラバラの順番に並んでいました。"
      },
      {
        image: `./assets/story_seiri_b.png?${STORY_ASSET_VERSION}`,
        text: "「ぼく、この場所じゃないよ〜」\n「わたし、同じ仲間の本のそばに戻りたいな」\n「順番がちがうと、読みに来た人が見つけられないよ！」\nリリーは本の背中をじっと見つめました。"
      },
      {
        image: `./assets/story_seiri_c.png?${STORY_ASSET_VERSION}`,
        text: "「だいじょうぶ！　ちゃんとみんな元の場所に戻してあげるからね！」\nさあ、バラバラになった本たちをよく見て、正しい順番へ戻してあげましょう！"
      }
    ]
  }
};

const ROUND_LIBRARY = [
  {
    level: "Round 1",
    mission: "一冊だけ、数字の順番から外れています。",
    pattern: "wide"
  },
  {
    level: "Round 2",
    mission: "近い数字が増えました。数字を最後まで見比べます。",
    pattern: "close"
  },
  {
    level: "Round 3",
    mission: "同じ数字の本があります。アルファベット順が頼りです。",
    pattern: "duplicates"
  }
];

const SORT_LIBRARY = [
  ["014.2", "A"], ["014.2", "B"], ["015.0", "A"], ["017.1", "C"], ["019.5", "A"], ["019.5", "D"], ["070.1", "B"], ["070.1", "D"],
  ["159.2", "A"], ["159.2", "C"], ["289.1", "B"], ["289.1", "D"], ["410.2", "A"], ["410.2", "C"], ["596.4", "B"], ["721.5", "A"],
  ["913.6", "A"], ["913.6", "C"], ["914.5", "A"], ["933.7", "B"], ["990.1", "A"], ["991.2", "B"], ["995.4", "C"], ["999.1", "A"]
];

const RECORDS_KEY = "lily-bookshelf-rescue-records-v1";
const RECORD_LIMIT = 10;

const state = {
  activeMode: "find",
  timerId: null,
  countdownId: null,
  find: null,
  sort: null,
  story: null
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function makeBook([number, letter], index, scope) {
  return {
    id: `${scope}-${number}-${letter}-${index}`,
    number,
    letter,
    color: BOOK_COLORS[index % BOOK_COLORS.length],
    sortKey: `${number.padStart(5, "0")}-${letter}`
  };
}

function compareBooks(a, b) {
  const byNumber = Number(a.number) - Number(b.number);
  if (byNumber !== 0) return byNumber;
  return a.letter.localeCompare(b.letter);
}

function formatTime(ms) {
  return `${(ms / 1000).toFixed(1)}秒`;
}

function emptyRecords() {
  return { find: [], sort: [] };
}

function readRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(RECORDS_KEY) || "{}");
    return {
      find: Array.isArray(records.find) ? records.find : [],
      sort: Array.isArray(records.sort) ? records.sort : []
    };
  } catch {
    return emptyRecords();
  }
}

function writeRecords(records) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Records are optional; gameplay should continue even when storage is unavailable.
  }
}

function saveRecord(mode, totalMs) {
  const records = readRecords();
  const entry = {
    ms: Math.round(totalMs),
    playedAt: new Date().toISOString()
  };
  records[mode] = [...records[mode], entry]
    .sort((a, b) => a.ms - b.ms)
    .slice(0, RECORD_LIMIT);
  writeRecords(records);
}

function formatRecordDate(isoText) {
  const date = new Date(isoText);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function showScreen(id) {
  $$(".screen").forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === id);
  });
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function startTimer(target, readMs) {
  stopTimer();
  const paint = () => {
    target.textContent = formatTime(readMs());
  };
  paint();
  state.timerId = setInterval(paint, 100);
}

function getCountdownAudio(name) {
  const source = COUNTDOWN_SOUNDS[name];
  if (!source || typeof Audio === "undefined") return null;
  if (!countdownAudio[name]) {
    countdownAudio[name] = new Audio(source);
    countdownAudio[name].preload = "auto";
  }
  return countdownAudio[name];
}

function playCountdownSound(name) {
  stopCountdownSounds();
  const audio = getCountdownAudio(name);
  if (!audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  } catch {
    // Sound is a presentation layer; blocked playback should not stop the game.
  }
}

function stopCountdownSounds() {
  Object.values(countdownAudio).forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Ignore browsers that cannot seek an unloaded audio file.
    }
  });
}

function getGameAudio(name) {
  const source = GAME_SOUNDS[name];
  if (!source || typeof Audio === "undefined") return null;
  if (!gameAudio[name]) {
    gameAudio[name] = new Audio(source);
    gameAudio[name].preload = "auto";
  }
  return gameAudio[name];
}

function stopGameSounds() {
  Object.values(gameAudio).forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Ignore browsers that cannot seek an unloaded audio file.
    }
  });
}

function playGameSound(name) {
  stopGameSounds();
  const audio = getGameAudio(name);
  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  } catch {
    // Sound is a presentation layer; blocked playback should not stop the game.
  }
}

function stopCountdown(options = {}) {
  if (state.countdownId) {
    clearTimeout(state.countdownId);
    state.countdownId = null;
  }
  if (options.stopSounds !== false) stopCountdownSounds();
  const overlay = $("#countdownOverlay");
  if (overlay) overlay.hidden = true;
}

function startCountdown(onDone) {
  const overlay = $("#countdownOverlay");
  const text = $("#countdownText");
  if (!overlay || !text) {
    onDone();
    return;
  }

  stopCountdown();
  let index = 0;
  overlay.hidden = false;

  const paint = () => {
    const step = COUNTDOWN_STEPS[index];
    text.textContent = step.text;
    text.classList.toggle("is-word", step.text.length > 1);
    text.classList.remove("is-pop");
    void text.offsetHeight;
    text.classList.add("is-pop");
    playCountdownSound(step.sound);
  };

  const scheduleNext = () => {
    const step = COUNTDOWN_STEPS[index];
    state.countdownId = setTimeout(() => {
      state.countdownId = null;
      index += 1;
      if (index >= COUNTDOWN_STEPS.length) {
        stopCountdown({ stopSounds: false });
        onDone();
        return;
      }
      paint();
      scheduleNext();
    }, step.durationMs);
  };

  paint();
  scheduleNext();
}

function renderRoundMeter(currentRound) {
  $("#findRoundMeter").innerHTML = [0, 1, 2]
    .map((index) => {
      const className = index < currentRound ? "round-dot is-done" : index === currentRound ? "round-dot is-current" : "round-dot";
      return `<span class="${className}"></span>`;
    })
    .join("");
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function randomLetter() {
  return CALL_LETTERS[randomInt(CALL_LETTERS.length)];
}

function formatCallNumber(tenths) {
  const whole = Math.floor(tenths / 10);
  const decimal = tenths % 10;
  return `${String(whole).padStart(3, "0")}.${decimal}`;
}

function randomUniqueTenths(count, min, max) {
  const values = new Set();
  while (values.size < count) {
    values.add(min + randomInt(max - min + 1));
  }
  return [...values].sort((a, b) => a - b);
}

function pickUniqueLetters(count) {
  const letters = CALL_LETTERS.slice();
  for (let index = letters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [letters[index], letters[swapIndex]] = [letters[swapIndex], letters[index]];
  }
  return letters.slice(0, count).sort();
}

function buildWideFindEntries() {
  return randomUniqueTenths(FIND_BOOK_COUNT, 10, 9990).map((tenths) => [
    formatCallNumber(tenths),
    randomLetter()
  ]);
}

function buildCloseFindEntries() {
  const entries = [];
  let tenths = 1000 + randomInt(7300);
  for (let index = 0; index < FIND_BOOK_COUNT; index += 1) {
    tenths += 1 + randomInt(6);
    entries.push([formatCallNumber(tenths), randomLetter()]);
  }
  return entries;
}

function buildDuplicateFindEntries() {
  const entries = [];
  let tenths = 3500 + randomInt(3000);
  for (let group = 0; group < 8; group += 1) {
    tenths += 4 + randomInt(8);
    pickUniqueLetters(3).forEach((letter) => {
      entries.push([formatCallNumber(tenths), letter]);
    });
  }
  return entries;
}

function buildFindEntries(pattern) {
  if (pattern === "duplicates") return buildDuplicateFindEntries();
  if (pattern === "close") return buildCloseFindEntries();
  return buildWideFindEntries();
}

function pickFindMoveIndexes(bookCount, roundIndex) {
  const minimumDistance = [4, 3, 2][roundIndex] ?? 2;
  const candidates = [];

  for (let from = 0; from < bookCount; from += 1) {
    for (let to = 0; to < bookCount; to += 1) {
      if (from === to || Math.abs(from - to) < minimumDistance) continue;
      candidates.push({ from, to });
    }
  }

  return candidates[randomInt(candidates.length)] ?? { from: 0, to: bookCount - 1 };
}

function buildFindRound(roundIndex) {
  const template = ROUND_LIBRARY[roundIndex];
  const sortedBooks = buildFindEntries(template.pattern)
    .map((book, index) => makeBook(book, index, `find-${roundIndex}`))
    .sort(compareBooks);
  const books = sortedBooks.map((book) => ({ ...book }));
  const move = pickFindMoveIndexes(books.length, roundIndex);
  const [answer] = books.splice(move.from, 1);
  books.splice(move.to, 0, answer);
  return {
    ...template,
    answerId: answer.id,
    answerFrom: move.from,
    answerTo: move.to,
    books
  };
}

function renderShelf(container, books, options = {}) {
  container.innerHTML = "";

  for (let row = 0; row < SHELF_ROWS; row += 1) {
    const shelfRow = document.createElement("div");
    shelfRow.className = "shelf-row";
    const rowBooks = books.slice(row * BOOKS_PER_ROW, row * BOOKS_PER_ROW + BOOKS_PER_ROW);

    rowBooks.forEach((book, offset) => {
      const index = row * BOOKS_PER_ROW + offset;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "book";
      button.style.setProperty("--book-color", book.color);
      button.dataset.bookId = book.id;
      button.setAttribute("aria-label", `${book.number} ${book.letter} の本`);

      if (options.sortable) {
        button.dataset.sortBook = "true";
        button.dataset.index = String(index);
        button.addEventListener("pointerdown", onSortPointerDown);
        if (dragState?.moved && dragState.bookId === book.id) {
          button.classList.add("is-dragging");
        } else if (state.sort?.selectedIndex === index) {
          button.classList.add("is-selected");
        }
      } else {
        button.addEventListener("click", () => chooseFindBook(book.id));
      }

      button.innerHTML = `
        <span class="call-label" aria-hidden="true">
          <span>${book.number}</span>
          <span>${book.letter}</span>
          <span>図書館</span>
        </span>
      `;
      shelfRow.appendChild(button);
    });

    container.appendChild(shelfRow);
  }
}

function startFindMode() {
  stopTimer();
  stopCountdown();
  stopGameSounds();
  state.activeMode = "find";
  state.find = {
    roundIndex: 0,
    totalMs: 0,
    penaltyMs: 0,
    startedAt: 0,
    locked: false,
    round: null
  };
  showScreen("findScreen");
  startFindRound({ countdown: true });
}

function startFindRound(options = {}) {
  const find = state.find;
  const shouldCountdown = options.countdown === true;
  find.round = buildFindRound(find.roundIndex);
  find.penaltyMs = 0;
  find.locked = shouldCountdown;
  find.startedAt = 0;

  renderRoundMeter(find.roundIndex);
  $("#findMission").textContent = find.round.mission;
  $("#findFeedback").textContent = `${find.round.level} / 全3ラウンド`;
  $("#findFeedback").className = "feedback";
  renderShelf($("#findShelf"), find.round.books);
  $("#findTimer").textContent = formatTime(find.totalMs);

  const startRoundTimer = () => {
    find.locked = false;
    find.startedAt = performance.now();
    startTimer($("#findTimer"), () => find.totalMs + find.penaltyMs + performance.now() - find.startedAt);
  };

  if (!shouldCountdown) {
    startRoundTimer();
    return;
  }

  const round = find.round;
  startCountdown(() => {
    if (state.activeMode !== "find" || state.find !== find || find.round !== round) return;
    startRoundTimer();
  });
}

function chooseFindBook(bookId) {
  const find = state.find;
  if (!find || find.locked) return;

  const bookEl = $(`[data-book-id="${bookId}"]`, $("#findShelf"));
  if (bookId !== find.round.answerId) {
    playGameSound("ng");
    find.penaltyMs += 3000;
    bookEl?.classList.add("is-wrong");
    $("#findFeedback").textContent = "その本は順番どおり。3秒だけロスタイムです。";
    $("#findFeedback").className = "feedback is-warn";
    setTimeout(() => bookEl?.classList.remove("is-wrong"), 500);
    return;
  }

  find.locked = true;
  playGameSound("ok");
  find.totalMs += find.penaltyMs + performance.now() - find.startedAt;
  stopTimer();
  $("#findTimer").textContent = formatTime(find.totalMs);
  bookEl?.classList.add("is-answer");
  $("#findFeedback").textContent = "見つけた！ リリーが正しい棚へ戻しました。";
  $("#findFeedback").className = "feedback is-good";

  setTimeout(() => {
    if (find.roundIndex < 2) {
      find.roundIndex += 1;
      startFindRound();
    } else {
      finishGame("find", find.totalMs);
    }
  }, 900);
}

function buildSortBooks() {
  return SORT_LIBRARY
    .map((book, index) => makeBook(book, index, "sort"))
    .sort(compareBooks);
}

function shuffleBooks(books) {
  const copy = books.map((book) => ({ ...book }));
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function startSortMode() {
  stopTimer();
  stopCountdown();
  stopGameSounds();
  const sorted = buildSortBooks();
  state.activeMode = "sort";
  state.sort = {
    sorted,
    books: shuffleBooks(sorted),
    startedAt: 0,
    selectedIndex: null,
    locked: true,
    completed: false
  };
  showScreen("sortScreen");
  $("#sortFeedback").textContent = "小さい数字から、同じ数字はAから順番です。";
  $("#sortFeedback").className = "feedback";
  renderSortShelf();
  $("#sortTimer").textContent = formatTime(0);

  const sort = state.sort;
  startCountdown(() => {
    if (state.activeMode !== "sort" || state.sort !== sort) return;
    sort.locked = false;
    sort.startedAt = performance.now();
    startTimer($("#sortTimer"), () => performance.now() - sort.startedAt);
  });
}

function renderSortShelf(books = state.sort.books) {
  renderShelf($("#sortShelf"), books, { sortable: true });
}

function captureSortBookRects() {
  const rects = new Map();
  $$("#sortShelf .book").forEach((bookEl) => {
    rects.set(bookEl.dataset.bookId, bookEl.getBoundingClientRect());
  });
  return rects;
}

function animateSortMoves(previousRects) {
  if (!previousRects?.size) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const shelf = $("#sortShelf");
  const movingBooks = [];

  $$(".book", shelf).forEach((bookEl) => {
    const previousRect = previousRects.get(bookEl.dataset.bookId);
    if (!previousRect) return;

    const currentRect = bookEl.getBoundingClientRect();
    const deltaX = previousRect.left - currentRect.left;
    const deltaY = previousRect.top - currentRect.top;
    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return;

    bookEl.classList.add("is-reordering");
    bookEl.style.transition = "none";
    bookEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    movingBooks.push(bookEl);
  });

  if (!movingBooks.length) return;
  shelf.offsetHeight;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      movingBooks.forEach((bookEl) => {
        bookEl.style.transition = "transform 340ms cubic-bezier(0.16, 1, 0.3, 1)";
        bookEl.style.transform = "translate(0, 0)";
      });

      setTimeout(() => {
        movingBooks.forEach((bookEl) => {
          bookEl.classList.remove("is-reordering");
          bookEl.style.transition = "";
          bookEl.style.transform = "";
        });
      }, 380);
    });
  });
}

function buildSortInsertion(books, fromIndex, toIndex) {
  const nextBooks = books.slice();
  if (fromIndex < 0 || fromIndex >= nextBooks.length || toIndex < 0) return nextBooks;

  const [movingBook] = nextBooks.splice(fromIndex, 1);
  const insertIndex = Math.min(toIndex, nextBooks.length);
  nextBooks.splice(insertIndex, 0, movingBook);
  return nextBooks;
}

function isPointInsideSortShelf(x, y) {
  const shelf = $("#sortShelf");
  const rect = shelf.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function getSortInsertionIndexFromPoint(x, y) {
  if (!isPointInsideSortShelf(x, y)) return null;

  if (dragState?.itemRects?.length) {
    let closestIndex = null;
    let closestDistance = Infinity;
    dragState.itemRects.forEach((rect, index) => {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(x - centerX, y - centerY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return Number.isFinite(closestIndex) ? closestIndex : null;
  }

  let closestIndex = null;
  let closestDistance = Infinity;
  $$("#sortShelf .book").forEach((bookEl) => {
    const rect = bookEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(x - centerX, y - centerY);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = Number(bookEl.dataset.index);
    }
  });

  return Number.isFinite(closestIndex) ? closestIndex : null;
}

function previewSortInsertion(toIndex) {
  if (!dragState?.moved || !state.sort) return;
  const maxIndex = state.sort.books.length - 1;
  const previewIndex = Math.min(Math.max(toIndex, 0), maxIndex);
  if (dragState.previewIndex === previewIndex) return;

  dragState.previewIndex = previewIndex;
  scheduleSortDragPreview();
}

function scheduleSortDragPreview() {
  if (!dragState || dragState.previewFrame) return;
  dragState.previewFrame = requestAnimationFrame(() => {
    dragState.previewFrame = null;
    applySortDragPreview();
  });
}

function applySortDragPreview() {
  if (!dragState?.itemRects) return;

  const fromIndex = dragState.index;
  const toIndex = dragState.previewIndex;
  $$("#sortShelf .book").forEach((bookEl, index) => {
    if (bookEl.dataset.bookId === dragState.bookId) return;

    let targetIndex = index;
    if (toIndex > fromIndex && index > fromIndex && index <= toIndex) {
      targetIndex = index - 1;
    } else if (toIndex < fromIndex && index >= toIndex && index < fromIndex) {
      targetIndex = index + 1;
    }

    if (targetIndex === index) {
      bookEl.classList.remove("is-previewing");
      bookEl.style.transform = "";
      return;
    }

    const currentRect = dragState.itemRects[index];
    const targetRect = dragState.itemRects[targetIndex];
    bookEl.classList.add("is-previewing");
    bookEl.style.transform = `translate(${targetRect.left - currentRect.left}px, ${targetRect.top - currentRect.top}px)`;
  });
}

function clearSortDragPreview() {
  if (dragState?.previewFrame) {
    cancelAnimationFrame(dragState.previewFrame);
    dragState.previewFrame = null;
  }

  $$("#sortShelf .book").forEach((bookEl) => {
    bookEl.classList.remove("is-dragging", "is-previewing");
    bookEl.style.transform = "";
  });
}

function insertSortBook(fromIndex, toIndex, options = {}) {
  const shouldAnimate = options.animate !== false;
  const books = state.sort.books;
  if (fromIndex < 0 || toIndex < 0) return;
  if (fromIndex === toIndex) {
    state.sort.selectedIndex = null;
    $("#sortFeedback").textContent = "小さい数字から、同じ数字はAから順番です。";
    $("#sortFeedback").className = "feedback";
    renderSortShelf();
    return;
  }
  const previousRects = shouldAnimate ? captureSortBookRects() : null;
  state.sort.books = buildSortInsertion(books, fromIndex, toIndex);
  state.sort.selectedIndex = null;
  renderSortShelf();
  if (shouldAnimate) animateSortMoves(previousRects);
  checkSortComplete();
}

function handleSortTap(index) {
  const sort = state.sort;
  if (!sort || sort.locked || sort.completed) return;
  if (sort.selectedIndex === null) {
    sort.selectedIndex = index;
    $("#sortFeedback").textContent = "差し込みたい場所の本を選びます。";
    $("#sortFeedback").className = "feedback";
    renderSortShelf();
    return;
  }
  insertSortBook(sort.selectedIndex, index);
}

let dragState = null;

function onSortPointerDown(event) {
  if (!state.sort || state.sort.locked || state.sort.completed) return;
  event.preventDefault();

  const index = Number(event.currentTarget.dataset.index);
  const book = state.sort.books[index];
  if (!book) return;
  dragState = {
    pointerId: event.pointerId,
    index,
    bookId: book.id,
    element: event.currentTarget,
    startX: event.clientX,
    startY: event.clientY,
    itemRects: null,
    previewIndex: index,
    previewFrame: null,
    moved: false,
    ghost: null
  };

  event.currentTarget.setPointerCapture(event.pointerId);
  window.addEventListener("pointermove", onSortPointerMove);
  window.addEventListener("pointerup", onSortPointerUp, { once: true });
}

function createDragGhost(bookEl, x, y) {
  const ghost = bookEl.cloneNode(true);
  const rect = bookEl.getBoundingClientRect();
  ghost.classList.remove("is-dragging");
  ghost.classList.add("drag-ghost");
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  ghost.style.left = `${x}px`;
  ghost.style.top = `${y}px`;
  document.body.appendChild(ghost);
  return ghost;
}

function onSortPointerMove(event) {
  if (!dragState) return;
  const distance = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);

  if (!dragState.moved && distance > 6) {
    dragState.moved = true;
    state.sort.selectedIndex = null;
    dragState.itemRects = $$("#sortShelf .book").map((bookEl) => bookEl.getBoundingClientRect());
    dragState.ghost = createDragGhost(dragState.element, event.clientX, event.clientY);
    dragState.element.classList.add("is-dragging");
    applySortDragPreview();
  }

  if (dragState.ghost) {
    dragState.ghost.style.left = `${event.clientX}px`;
    dragState.ghost.style.top = `${event.clientY}px`;
    const previewIndex = getSortInsertionIndexFromPoint(event.clientX, event.clientY);
    if (previewIndex !== null) previewSortInsertion(previewIndex);
  }
}

function onSortPointerUp(event) {
  if (!dragState) return;
  window.removeEventListener("pointermove", onSortPointerMove);

  const drag = dragState;
  const dropIndex = drag.moved ? getSortInsertionIndexFromPoint(event.clientX, event.clientY) : null;
  try {
    drag.element.releasePointerCapture(drag.pointerId);
  } catch {
    // Pointer capture can already be released on some mobile browsers.
  }

  drag.element.classList.remove("is-dragging");
  drag.ghost?.remove();

  if (!drag.moved) {
    dragState = null;
    handleSortTap(drag.index);
    return;
  }

  if (dropIndex === null) {
    clearSortDragPreview();
    dragState = null;
    return;
  }

  clearSortDragPreview();
  dragState = null;
  insertSortBook(drag.index, dropIndex, { animate: false });
}

function checkSortComplete() {
  const sort = state.sort;
  if (!sort || sort.locked) return;
  const complete = sort.books.every((book, index) => book.id === sort.sorted[index].id);
  if (!complete) {
    $("#sortFeedback").textContent = "あと少し。棚の左上から右へ、次の段へ進みます。";
    $("#sortFeedback").className = "feedback";
    return;
  }

  sort.completed = true;
  const totalMs = performance.now() - sort.startedAt;
  stopTimer();
  $("#sortTimer").textContent = formatTime(totalMs);
  $("#sortFeedback").textContent = "ぴったり整列！ 本たちも落ち着きました。";
  $("#sortFeedback").className = "feedback is-good";
  setTimeout(() => finishGame("sort", totalMs), 750);
}

function resultProfile(mode, totalMs) {
  const seconds = totalMs / 1000;
  const resultImage = (fileName) => `./assets/${fileName}?${RESULT_ASSET_VERSION}`;
  const resultSound = (rank) => `result_${rank}`;
  if (mode === "find") {
    if (seconds <= 15) {
      return {
        image: resultImage("result_maigo_s.png"),
        sound: resultSound("s"),
        message: "すっごーい！ リリーもビックリのスーパー司書さんだね！まいご本たちも大喜び！ 図書館のヒーロー、ここに誕生！"
      };
    }
    if (seconds <= 30) {
      return {
        image: resultImage("result_maigo_a.png"),
        sound: resultSound("a"),
        message: "やったね！ まいご本たちも無事におうちへ帰れたよ！こんなに頼れる人がいて、図書館も安心だね♪"
      };
    }
    if (seconds <= 45) {
      return {
        image: resultImage("result_maigo_b.png"),
        sound: resultSound("b"),
        message: "お疲れさま！ ちょっと時間はかかったけど、ちゃんと全部見つけられたね！\n迷子の本たちもホッとしてるよ！"
      };
    }
    return {
      image: resultImage("result_maigo_c.png"),
      sound: resultSound("c"),
      message: "ふぅ～、なんとか間に合ったね！\nもうちょっと早く見つけられると、まいご本たちももっと嬉しいかも？"
    };
  }

  if (seconds <= 55) {
    return {
      image: resultImage("result_seiri_s.png"),
      sound: resultSound("s"),
      message: "すごい集中力！ 本たちが一瞬でぴしっと整列しました。リリーも胸を張って拍手しています！"
    };
  }
  if (seconds <= 85) {
    return {
      image: resultImage("result_seiri_a.png"),
      sound: resultSound("a"),
      message: "やったね！ 数字とアルファベットをよく見て、きれいな本棚に戻せました。"
    };
  }
  if (seconds <= 125) {
    return {
      image: resultImage("result_seiri_b.png"),
      sound: resultSound("b"),
      message: "お疲れさま！ じっくり見比べて、最後まで本棚を整えられました。次はもっとスムーズにいけそう！"
    };
  }
  return {
    image: resultImage("result_seiri_c.png"),
    sound: resultSound("c"),
    message: "ふぅ、なんとか整いました！ 数字が同じときはアルファベットを見ると、もっと早く並べられます。"
  };
}

function finishGame(mode, totalMs) {
  stopTimer();
  stopCountdown();
  saveRecord(mode, totalMs);
  const profile = resultProfile(mode, totalMs);
  state.activeMode = mode;
  $("#resultTitle").textContent = `${MODE_LABELS[mode]} 結果`;
  $("#resultScore").textContent = formatTime(totalMs);
  $("#resultMessage").replaceChildren(...profile.message.split("\n").flatMap((line, index) => {
    const nodes = [];
    if (index > 0) nodes.push(document.createElement("br"));
    nodes.push(document.createTextNode(line));
    return nodes;
  }));
  $("#resultArt").src = profile.image;
  showScreen("resultScreen");
  playGameSound(profile.sound);
}

function renderStoryText(container, text) {
  container.replaceChildren(...text.split("\n").flatMap((line, index) => {
    const nodes = [];
    if (index > 0) nodes.push(document.createElement("br"));
    nodes.push(document.createTextNode(line));
    return nodes;
  }));
}

function showStoryChoice() {
  state.story = null;
  $("#storyTitle").textContent = "リリーと本たちの物語";
  $("#storyChoice").hidden = false;
  $("#storyViewer").hidden = true;
}

function openStoryMode(mode) {
  if (!STORY_DATA[mode]) return;
  state.story = { mode, index: 0 };
  $("#storyChoice").hidden = true;
  $("#storyViewer").hidden = false;
  renderStorySlide();
}

function renderStorySlide() {
  const story = state.story ? STORY_DATA[state.story.mode] : null;
  if (!story) {
    showStoryChoice();
    return;
  }

  const slide = story.slides[state.story.index];
  $("#storyTitle").textContent = story.label;
  $("#storyModeLabel").textContent = story.label;
  $("#storySlideImage").src = slide.image;
  renderStoryText($("#storySlideText"), slide.text);
  $("#storyProgress").innerHTML = story.slides
    .map((_, index) => `<span class="${index === state.story.index ? "is-current" : ""}"></span>`)
    .join("");
  $("#storyPrevButton").disabled = state.story.index === 0;
  $("#storyNextButton").textContent = state.story.index === story.slides.length - 1 ? "おわり" : "つぎへ";
}

function moveStorySlide(direction) {
  if (!state.story) return;
  const story = STORY_DATA[state.story.mode];
  const nextIndex = state.story.index + direction;
  if (nextIndex < 0) return;
  if (nextIndex >= story.slides.length) {
    showStoryChoice();
    return;
  }
  state.story.index = nextIndex;
  renderStorySlide();
}

function renderRecordList(container, records) {
  container.innerHTML = "";
  if (!records.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "record-empty";
    emptyItem.textContent = "まだ記録がありません";
    container.appendChild(emptyItem);
    return;
  }

  records.forEach((record, index) => {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    const time = document.createElement("strong");
    const date = document.createElement("small");

    rank.textContent = `${index + 1}`;
    time.textContent = formatTime(record.ms);
    date.textContent = formatRecordDate(record.playedAt);

    item.append(rank, time, date);
    container.appendChild(item);
  });
}

function openRecordsScreen() {
  stopTimer();
  stopCountdown();
  stopGameSounds();
  const records = readRecords();
  renderRecordList($("#findRecords"), records.find);
  renderRecordList($("#sortRecords"), records.sort);
  showScreen("recordsScreen");
}

function openStoryScreen() {
  stopTimer();
  stopCountdown();
  stopGameSounds();
  showStoryChoice();
  showScreen("storyScreen");
}

function goHome() {
  stopTimer();
  stopCountdown();
  stopGameSounds();
  state.find = null;
  state.sort = null;
  state.story = null;
  showScreen("titleScreen");
}

function retryActiveMode() {
  if (state.activeMode === "sort") {
    startSortMode();
    return;
  }
  startFindMode();
}

function bindUI() {
  $$("[data-start-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.startMode === "sort") {
        startSortMode();
      } else {
        startFindMode();
      }
    });
  });

  $$("[data-go-home]").forEach((button) => {
    button.addEventListener("click", goHome);
  });

  $("[data-open-story]").addEventListener("click", openStoryScreen);
  $("[data-open-records]").addEventListener("click", openRecordsScreen);

  $$("[data-story-mode]").forEach((button) => {
    button.addEventListener("click", () => openStoryMode(button.dataset.storyMode));
  });
  $("#storySelectButton").addEventListener("click", showStoryChoice);
  $("#storyPrevButton").addEventListener("click", () => moveStorySlide(-1));
  $("#storyNextButton").addEventListener("click", () => moveStorySlide(1));

  $("#retryButton").addEventListener("click", retryActiveMode);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

bindUI();
registerServiceWorker();
