import {
  BOARD_SIZE,
  HOLD_DURATION_MS,
  TOTAL_MEMORY_SEGMENTS,
  advanceFocus,
  canFocusMemory,
  clearFocus,
  createInitialState,
  getActiveMemory,
  getLevelDefinition,
  moveCursor,
  pauseGame,
  restartGame,
  resumeGame,
  snapshotState,
  startGame,
  startNextLevel,
} from "./game-state.mjs";

const board = document.querySelector("[data-board]");
const gameShell = document.querySelector("[data-game-shell]");
const playerCursor = document.querySelector("[data-player-cursor]");
const memoryItem = document.querySelector("[data-memory-item]");
const memoryDisplay = document.querySelector("[data-memory-display]");
const memoryMeter = document.querySelector("[data-memory-meter]");
const meterSegments = [...document.querySelectorAll("[data-meter-segment]")];
const pauseButton = document.querySelector("[data-pause-button]");
const startButton = document.querySelector("[data-start-button]");
const resumeButton = document.querySelector("[data-resume-button]");
const restartButtons = [...document.querySelectorAll("[data-restart-button]")];
const nextLevelButton = document.querySelector("[data-next-level-button]");
const playAgainButton = document.querySelector("[data-play-again-button]");
const levelLabel = document.querySelector("[data-level-label]");
const readyOverlay = document.querySelector("[data-ready-overlay]");
const pauseOverlay = document.querySelector("[data-pause-overlay]");
const transitionOverlay = document.querySelector("[data-transition-overlay]");
const completeOverlay = document.querySelector("[data-game-complete-overlay]");
const transitionHeading = document.querySelector("[data-transition-heading]");
const transitionCopy = document.querySelector("[data-transition-copy]");
const finalScore = document.querySelector("[data-final-score]");
const gameMessage = document.querySelector("[data-game-message]");
const liveStatus = document.querySelector("[data-live-status]");

const movementKeys = new Map([
  ["arrowup", [-1, 0]],
  ["w", [-1, 0]],
  ["arrowdown", [1, 0]],
  ["s", [1, 0]],
  ["arrowleft", [0, -1]],
  ["a", [0, -1]],
  ["arrowright", [0, 1]],
  ["d", [0, 1]],
]);

let state = createInitialState();
let focusTimer = null;
let lastFocusTime = 0;

function createBoardCells() {
  const fragment = document.createDocumentFragment();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const cell = document.createElement("span");
      cell.className = "board-cell";
      cell.dataset.row = String(row);
      cell.dataset.column = String(column);
      cell.style.gridRow = String(row + 1);
      cell.style.gridColumn = String(column + 1);
      cell.setAttribute("aria-hidden", "true");
      fragment.append(cell);
    }
  }

  board.prepend(fragment);
}

function placeOnBoard(element, position) {
  element.style.gridRow = String(position.row + 1);
  element.style.gridColumn = String(position.column + 1);
}

function setStatus(message) {
  liveStatus.textContent = message;
}

function renderMeter() {
  const currentSegment = state.completedSegments + 1;
  const focusPercent = Math.round(
    (state.focusProgressMs / HOLD_DURATION_MS) * 100,
  );

  for (const segment of meterSegments) {
    const segmentNumber = Number(segment.dataset.meterSegment);
    const isComplete = segmentNumber <= state.completedSegments;
    const isCurrent =
      segmentNumber === currentSegment &&
      currentSegment <= TOTAL_MEMORY_SEGMENTS;

    segment.classList.toggle("is-complete", isComplete);
    segment.classList.toggle("is-current", isCurrent);
    segment.style.setProperty(
      "--segment-fill",
      `${isComplete ? 100 : isCurrent ? focusPercent : 0}%`,
    );
  }

  memoryMeter.setAttribute("aria-valuenow", String(state.completedSegments));
  memoryMeter.setAttribute(
    "aria-valuetext",
    `${state.completedSegments} of ${TOTAL_MEMORY_SEGMENTS} memories complete`,
  );
}

function renderMessage() {
  const activeMemory = getActiveMemory(state);

  if (state.phase === "ready") {
    gameMessage.textContent = "The room is waiting.";
    return;
  }

  if (state.phase === "paused") {
    gameMessage.textContent = "Paused. Resume when you are ready.";
    return;
  }

  if (state.phase === "level-complete") {
    gameMessage.textContent =
      "Memory found. Start the next level when you are ready.";
    return;
  }

  if (state.phase === "game-complete") {
    gameMessage.textContent = "All three memories returned.";
    return;
  }

  if (canFocusMemory(state)) {
    gameMessage.textContent =
      "Memory found. Hold the mouse button, Space, or Enter to remember.";
    return;
  }

  gameMessage.textContent = `Search the room for ${activeMemory.label.toLowerCase()}.`;
}

function renderTransition() {
  if (state.level === 1) {
    transitionHeading.textContent = "Level one complete.";
    transitionCopy.textContent =
      "The letter reads, “I love you. Mom.” Continue when you are ready.";
    return;
  }

  transitionHeading.textContent = "Level two complete.";
  transitionCopy.textContent =
    "The room is turning inside out. In Level 3, important objects appear white instead of black. Find the stuffed animal in the inverse room. Continue when you are ready.";
}

function render() {
  const activeMemory = getActiveMemory(state);
  const levelDefinition = getLevelDefinition(state.level);
  const activeMemoryIsCollected = activeMemory?.collected ?? false;

  placeOnBoard(playerCursor, state.cursor);
  placeOnBoard(memoryItem, activeMemory);

  playerCursor.dataset.direction = state.direction;
  memoryItem.dataset.item = activeMemory.id;
  memoryDisplay.textContent = activeMemory.display;
  memoryItem.setAttribute(
    "aria-label",
    `${activeMemory.label}, the Level ${state.level} memory item`,
  );
  memoryItem.classList.toggle("is-near", canFocusMemory(state));
  memoryItem.classList.toggle(
    "is-focusing",
    canFocusMemory(state) && state.focusProgressMs > 0,
  );
  memoryItem.classList.toggle("is-collected", activeMemoryIsCollected);

  readyOverlay.hidden = state.phase !== "ready";
  pauseOverlay.hidden = state.phase !== "paused";
  transitionOverlay.hidden = state.phase !== "level-complete";
  completeOverlay.hidden = state.phase !== "game-complete";
  pauseButton.disabled = state.phase !== "playing";

  levelLabel.textContent = `Level ${state.level}`;
  finalScore.textContent = `${state.score} points.`;
  gameShell.dataset.phase = state.phase;
  gameShell.dataset.level = String(state.level);
  gameShell.dataset.world = levelDefinition.world;
  gameShell.dataset.score = String(state.score);
  gameShell.dataset.completedSegments = String(state.completedSegments);
  gameShell.dataset.perLevelMemoryCount = String(state.perLevelMemoryCount);
  gameShell.dataset.direction = state.direction;

  renderTransition();
  renderMeter();
  renderMessage();
}

function stopFocus({ clear = true, renderAfter = true } = {}) {
  if (focusTimer !== null) {
    window.clearInterval(focusTimer);
    focusTimer = null;
  }

  if (clear) state = clearFocus(state);
  if (renderAfter) render();
}

function finishFocusTick() {
  if (state.phase === "level-complete") {
    stopFocus({ clear: false, renderAfter: false });
    render();
    setStatus(
      `${getActiveMemory(state).label} collected. Level ${state.level} complete.`,
    );
    nextLevelButton.focus();
    return;
  }

  if (state.phase === "game-complete") {
    stopFocus({ clear: false, renderAfter: false });
    render();
    setStatus(
      `All three memories collected. Final score ${state.score} points.`,
    );
    playAgainButton.focus();
  }
}

function focusTick() {
  const now = performance.now();
  const elapsed = now - lastFocusTime;
  lastFocusTime = now;
  state = advanceFocus(state, elapsed);
  render();
  finishFocusTick();
}

function startFocus() {
  if (!canFocusMemory(state) || focusTimer !== null) return;

  lastFocusTime = performance.now();
  focusTimer = window.setInterval(focusTick, 40);
  setStatus("Remembering memory.");
}

function handleMovement(rowDelta, columnDelta, announce = true) {
  if (state.phase !== "playing") return;

  const oldRow = state.cursor.row;
  const oldColumn = state.cursor.column;
  const nextState = moveCursor(state, rowDelta, columnDelta);

  if (
    nextState.cursor.row === oldRow &&
    nextState.cursor.column === oldColumn
  ) {
    return;
  }

  stopFocus({ renderAfter: false });
  state = nextState;
  render();

  if (canFocusMemory(state)) {
    setStatus(
      `${getActiveMemory(state).label} found. Hold the mouse button, Space, or Enter to remember.`,
    );
  } else if (announce) {
    setStatus(
      `Cursor at row ${state.cursor.row + 1}, column ${state.cursor.column + 1}.`,
    );
  }
}

function moveCursorToPointer(event) {
  if (state.phase !== "playing") return;
  if (event.pointerType === "touch") return;
  if (event.target.closest("button, .game-hud, .game-overlay")) return;

  const bounds = board.getBoundingClientRect();
  const column = Math.min(
    BOARD_SIZE - 1,
    Math.max(
      0,
      Math.floor(((event.clientX - bounds.left) / bounds.width) * BOARD_SIZE),
    ),
  );
  const row = Math.min(
    BOARD_SIZE - 1,
    Math.max(
      0,
      Math.floor(((event.clientY - bounds.top) / bounds.height) * BOARD_SIZE),
    ),
  );

  handleMovement(
    row - state.cursor.row,
    column - state.cursor.column,
    false,
  );
}

function pauseCurrentGame(message = "Game paused.") {
  if (state.phase !== "playing") return;
  stopFocus({ clear: false, renderAfter: false });
  state = pauseGame(state);
  render();
  setStatus(message);
  resumeButton.focus();
}

function resumeCurrentGame() {
  if (state.phase !== "paused") return;
  state = resumeGame(state);
  render();
  setStatus(`Level ${state.level} resumed.`);
  board.focus();
}

function performRestart() {
  stopFocus({ clear: false, renderAfter: false });
  state = restartGame(state);
  render();
  setStatus("Run restarted. Press Start to begin Level 1.");
  startButton.focus();
}

startButton.addEventListener("click", () => {
  state = startGame(state);
  render();
  setStatus("Level 1 started. Find Mom's letter.");
  board.focus();
});

pauseButton.addEventListener("click", () => {
  pauseCurrentGame();
});

resumeButton.addEventListener("click", () => {
  resumeCurrentGame();
});

for (const restartButton of restartButtons) {
  restartButton.addEventListener("click", performRestart);
}

nextLevelButton.addEventListener("click", () => {
  state = startNextLevel(state);
  render();
  setStatus(
    `Level ${state.level} started. Find ${getActiveMemory(state).label.toLowerCase()}.`,
  );
  board.focus();
});

playAgainButton.addEventListener("click", performRestart);

board.addEventListener("pointermove", moveCursorToPointer);
board.addEventListener("pointerleave", () => {
  stopFocus();
});

memoryItem.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch" || event.button !== 0) return;
  event.preventDefault();
  startFocus();
});

window.addEventListener("pointerup", () => {
  stopFocus();
});
window.addEventListener("pointercancel", () => {
  stopFocus();
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const movement = movementKeys.get(key);

  if (movement) {
    event.preventDefault();
    handleMovement(...movement);
    return;
  }

  if ((key === " " || key === "enter") && state.phase === "playing") {
    if (canFocusMemory(state)) {
      event.preventDefault();
      startFocus();
    }
    return;
  }

  if (key === "p") {
    event.preventDefault();
    if (state.phase === "playing") pauseCurrentGame();
    else if (state.phase === "paused") resumeCurrentGame();
    return;
  }

  if (key === "escape" && state.phase === "playing") {
    event.preventDefault();
    pauseCurrentGame();
  }
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key === " " || key === "enter") stopFocus();
});

window.addEventListener("blur", () => {
  pauseCurrentGame("Game paused because the window lost focus.");
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseCurrentGame("Game paused because the tab was hidden.");
  }
});

window.__roomRemembers = {
  getState: () => snapshotState(state),
};

createBoardCells();
render();
