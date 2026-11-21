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
const soundButton = document.querySelector("[data-sound-button]");
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
const memoryResponsePanels = [
  ...document.querySelectorAll("[data-memory-response]"),
];
const audioTracks = new Map(
  [...document.querySelectorAll("[data-audio]")].map((track) => [
    track.dataset.audio,
    track,
  ]),
);
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const audioVolumes = Object.freeze({
  "room-normal": 0.26,
  "room-inverse": 0.24,
  letter: 0.82,
  medal: 0.8,
  "stuffed-animal": 0.82,
  "game-complete": 0.84,
});
const backgroundTrackIds = Object.freeze({
  normal: "room-normal",
  inverse: "room-inverse",
});
const memoryTrackIds = Object.freeze([
  "letter",
  "medal",
  "stuffed-animal",
  "game-complete",
]);
const COMPLETION_SOUND_DELAY_MS = 2400;

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
let soundEnabled = true;
let audioPrimed = false;
let activeBackgroundTrack = null;
let activeMemoryTrack = null;
let activeCompletionTrack = null;
let completionSoundTimer = null;
let pointerVisual = null;
let pointerMotionFrame = null;
let motionPulseTimer = null;

for (const [trackId, track] of audioTracks) {
  track.volume = audioVolumes[trackId] ?? 0.8;
}

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

function cursorCellCenter() {
  return {
    x: (state.cursor.column + 0.5) / BOARD_SIZE,
    y: (state.cursor.row + 0.5) / BOARD_SIZE,
  };
}

function clearMotionPulse() {
  if (motionPulseTimer !== null) {
    window.clearTimeout(motionPulseTimer);
    motionPulseTimer = null;
  }
  gameShell.classList.remove("is-moving");
}

function signalRoomMotion() {
  if (reducedMotion.matches || state.phase !== "playing") return;

  gameShell.classList.add("is-moving");
  if (motionPulseTimer !== null) window.clearTimeout(motionPulseTimer);
  motionPulseTimer = window.setTimeout(() => {
    gameShell.classList.remove("is-moving");
    motionPulseTimer = null;
  }, 220);
}

function cancelPointerMotionFrame() {
  if (pointerMotionFrame === null) return;
  window.cancelAnimationFrame(pointerMotionFrame);
  pointerMotionFrame = null;
}

function resetVisualCursor() {
  cancelPointerMotionFrame();
  clearMotionPulse();
  pointerVisual = null;
}

function renderRoomDepth(position = pointerVisual ?? cursorCellCenter()) {
  const cursorX = Math.min(1, Math.max(0, position.x));
  const cursorY = Math.min(1, Math.max(0, position.y));
  const horizontalOffset = 0.5 - cursorX;
  const verticalOffset = 0.5 - cursorY;
  const motionScale = reducedMotion.matches ? 0 : 1;
  const boardWidth = board.clientWidth || 400;
  const flowOneRange = Math.min(22, boardWidth * 0.032) * motionScale;
  const flowTwoRange = Math.min(28, boardWidth * 0.04) * motionScale;

  board.style.setProperty("--cursor-x", `${(cursorX * 100).toFixed(2)}%`);
  board.style.setProperty("--cursor-y", `${(cursorY * 100).toFixed(2)}%`);
  board.style.setProperty(
    "--far-x",
    `${(horizontalOffset * 3 * motionScale).toFixed(2)}px`,
  );
  board.style.setProperty(
    "--far-y",
    `${(verticalOffset * 2 * motionScale).toFixed(2)}px`,
  );
  board.style.setProperty(
    "--mid-x",
    `${(horizontalOffset * 5 * motionScale).toFixed(2)}px`,
  );
  board.style.setProperty(
    "--mid-y",
    `${(verticalOffset * 3 * motionScale).toFixed(2)}px`,
  );
  board.style.setProperty(
    "--near-x",
    `${(horizontalOffset * 7 * motionScale).toFixed(2)}px`,
  );
  board.style.setProperty(
    "--near-y",
    `${(verticalOffset * 4 * motionScale).toFixed(2)}px`,
  );
  board.style.setProperty(
    "--flow-one-x",
    `${((cursorX - 0.5) * flowOneRange * 2).toFixed(2)}px`,
  );
  board.style.setProperty(
    "--flow-one-y",
    `${((cursorY - 0.5) * flowOneRange * 1.1).toFixed(2)}px`,
  );
  board.style.setProperty(
    "--flow-two-x",
    `${((0.5 - cursorX) * flowTwoRange * 2).toFixed(2)}px`,
  );
  board.style.setProperty(
    "--flow-two-y",
    `${((0.5 - cursorY) * flowTwoRange * 1.3).toFixed(2)}px`,
  );
  board.style.setProperty(
    "--flow-tilt",
    `${((cursorX - 0.5) * 8 * motionScale).toFixed(2)}deg`,
  );
  playerCursor.style.setProperty(
    "--depth-scale",
    reducedMotion.matches ? "1" : String(0.82 + cursorY * 0.23),
  );
}

function queuePointerMotion(position) {
  pointerVisual = position;
  if (pointerMotionFrame !== null) return;

  pointerMotionFrame = window.requestAnimationFrame(() => {
    pointerMotionFrame = null;
    renderRoomDepth();
    signalRoomMotion();
  });
}

function setStatus(message) {
  liveStatus.textContent = message;
}

function rewindTrack(track) {
  if (!track) return;
  try {
    track.currentTime = 0;
  } catch {
    // Metadata may still be loading. Playback can begin from zero naturally.
  }
}

function playTrack(track) {
  if (!track) return;
  track.muted = false;
  const playPromise = track.play();
  if (playPromise?.catch) playPromise.catch(() => {});
}

function finishPrimingTrack(track) {
  track.muted = false;
  if (
    track === activeBackgroundTrack ||
    track === activeMemoryTrack ||
    track === activeCompletionTrack
  ) {
    return;
  }
  track.pause();
  rewindTrack(track);
}

function primeAudioTracks(excludedTrack = null) {
  if (audioPrimed || !soundEnabled) return;
  audioPrimed = true;

  for (const track of audioTracks.values()) {
    if (track === excludedTrack) continue;

    track.muted = true;
    const playPromise = track.play();
    if (!playPromise?.then) {
      finishPrimingTrack(track);
      continue;
    }

    playPromise
      .then(() => {
        finishPrimingTrack(track);
      })
      .catch(() => {
        track.muted = false;
      });
  }
}

function getBackgroundTrack() {
  const levelDefinition = getLevelDefinition(state.level);
  return audioTracks.get(backgroundTrackIds[levelDefinition.world]);
}

function pauseBackgroundSound() {
  activeBackgroundTrack?.pause();
}

function stopBackgroundSound({ reset = true } = {}) {
  for (const trackId of Object.values(backgroundTrackIds)) {
    const track = audioTracks.get(trackId);
    track?.pause();
    if (reset) rewindTrack(track);
  }
  activeBackgroundTrack = null;
}

function playBackgroundForCurrentLevel({ restart = false } = {}) {
  if (!soundEnabled || state.phase !== "playing") return;

  const nextTrack = getBackgroundTrack();
  if (!nextTrack) return;

  if (activeBackgroundTrack !== nextTrack) {
    if (activeBackgroundTrack) {
      activeBackgroundTrack.pause();
      rewindTrack(activeBackgroundTrack);
    }
    activeBackgroundTrack = nextTrack;
    restart = true;
  }

  if (restart) rewindTrack(activeBackgroundTrack);
  activeBackgroundTrack.volume =
    audioVolumes[activeBackgroundTrack.dataset.audio] ?? 0.25;
  playTrack(activeBackgroundTrack);
}

function clearCompletionSoundTimer() {
  if (completionSoundTimer === null) return;
  window.clearTimeout(completionSoundTimer);
  completionSoundTimer = null;
}

function stopMemorySound() {
  clearCompletionSoundTimer();

  for (const trackId of memoryTrackIds) {
    const track = audioTracks.get(trackId);
    track?.pause();
    rewindTrack(track);
    if (track) track.volume = audioVolumes[trackId] ?? 0.8;
  }
  activeMemoryTrack = null;
  activeCompletionTrack = null;
}

function playCompletionSound() {
  completionSoundTimer = null;
  if (!soundEnabled || state.phase !== "game-complete") return;

  if (activeMemoryTrack && !activeMemoryTrack.paused) {
    activeMemoryTrack.volume = 0.3;
  }

  activeCompletionTrack = audioTracks.get("game-complete") ?? null;
  rewindTrack(activeCompletionTrack);
  playTrack(activeCompletionTrack);
}

function playMemorySound(soundId, { includeCompletion = false } = {}) {
  if (!soundEnabled) return;

  stopMemorySound();
  activeMemoryTrack = audioTracks.get(soundId) ?? null;
  if (!activeMemoryTrack) return;

  activeMemoryTrack.volume = audioVolumes[soundId] ?? 0.8;
  rewindTrack(activeMemoryTrack);
  playTrack(activeMemoryTrack);

  if (includeCompletion) {
    completionSoundTimer = window.setTimeout(
      playCompletionSound,
      COMPLETION_SOUND_DELAY_MS,
    );
  }
}

function renderSoundButton() {
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundButton.setAttribute(
    "aria-label",
    soundEnabled ? "Mute game audio" : "Turn game audio on",
  );
}

function renderMemoryResponse(levelDefinition) {
  const { response } = levelDefinition;

  for (const panel of memoryResponsePanels) {
    panel.dataset.response = response.sound;
    panel.querySelector("[data-response-title]").textContent = response.title;
    panel.querySelector("[data-response-copy]").textContent = response.memory;
  }
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

function renderTransition(levelDefinition) {
  transitionHeading.textContent = `Level ${
    state.level === 1 ? "one" : "two"
  } complete.`;

  if (state.level === 1) {
    transitionCopy.textContent =
      "Look again: familiar details have shifted. Continue when you are ready.";
  } else {
    transitionCopy.textContent =
      "The room is turning inside out. In Level 3, important objects appear white instead of black. Find the stuffed animal in the inverse room. Continue when you are ready.";
  }

  renderMemoryResponse(levelDefinition);
}

function render() {
  const activeMemory = getActiveMemory(state);
  const levelDefinition = getLevelDefinition(state.level);
  const activeMemoryIsCollected = activeMemory?.collected ?? false;

  placeOnBoard(memoryItem, activeMemory);
  renderRoomDepth();

  playerCursor.dataset.direction = state.direction;
  memoryItem.dataset.item = activeMemory.id;
  memoryDisplay.textContent = activeMemory.display;
  memoryItem.setAttribute(
    "aria-label",
    `${activeMemory.label}, the Level ${state.level} memory item`,
  );
  board.setAttribute("aria-label", levelDefinition.boardLabel);
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
  gameShell.dataset.cursorRow = String(state.cursor.row);
  gameShell.dataset.cursorColumn = String(state.cursor.column);
  gameShell.dataset.memoryResponse = levelDefinition.response.sound;

  renderTransition(levelDefinition);
  renderSoundButton();
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
  if (
    state.phase !== "level-complete" &&
    state.phase !== "game-complete"
  ) {
    return;
  }

  const levelDefinition = getLevelDefinition(state.level);
  const memoryResponse = levelDefinition.response;
  pauseBackgroundSound();
  playMemorySound(memoryResponse.sound, {
    includeCompletion: state.phase === "game-complete",
  });

  if (state.phase === "level-complete") {
    stopFocus({ clear: false, renderAfter: false });
    render();
    setStatus(
      `${getActiveMemory(state).label} collected. ${memoryResponse.memory}`,
    );
    nextLevelButton.focus();
    return;
  }

  if (state.phase === "game-complete") {
    stopFocus({ clear: false, renderAfter: false });
    render();
    setStatus(
      `${getActiveMemory(state).label} collected. ${memoryResponse.memory} All three memories collected. Final score ${state.score} points.`,
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
  signalRoomMotion();

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
  const normalizedX = Math.min(
    1,
    Math.max(0, (event.clientX - bounds.left) / bounds.width),
  );
  const normalizedY = Math.min(
    1,
    Math.max(0, (event.clientY - bounds.top) / bounds.height),
  );

  if (event.target.closest("[data-memory-item]")) {
    const activeMemory = getActiveMemory(state);
    const memoryCenter = {
      x: (activeMemory.column + 0.5) / BOARD_SIZE,
      y: (activeMemory.row + 0.5) / BOARD_SIZE,
    };
    pointerVisual = memoryCenter;
    handleMovement(
      activeMemory.row - state.cursor.row,
      activeMemory.column - state.cursor.column,
      false,
    );
    queuePointerMotion(memoryCenter);
    return;
  }

  const column = Math.min(
    BOARD_SIZE - 1,
    Math.max(0, Math.floor(normalizedX * BOARD_SIZE)),
  );
  const row = Math.min(
    BOARD_SIZE - 1,
    Math.max(0, Math.floor(normalizedY * BOARD_SIZE)),
  );

  const visualPosition = { x: normalizedX, y: normalizedY };
  pointerVisual = visualPosition;
  handleMovement(
    row - state.cursor.row,
    column - state.cursor.column,
    false,
  );
  queuePointerMotion(visualPosition);
}

function pauseCurrentGame(message = "Game paused.") {
  pauseBackgroundSound();
  stopMemorySound();
  if (state.phase !== "playing") return;
  cancelPointerMotionFrame();
  clearMotionPulse();
  stopFocus({ clear: false, renderAfter: false });
  state = pauseGame(state);
  render();
  setStatus(message);
  resumeButton.focus();
}

function resumeCurrentGame() {
  if (state.phase !== "paused") return;
  state = resumeGame(state);
  resetVisualCursor();
  render();
  playBackgroundForCurrentLevel();
  setStatus(`Level ${state.level} resumed.`);
  board.focus();
}

function performRestart() {
  stopBackgroundSound();
  stopMemorySound();
  stopFocus({ clear: false, renderAfter: false });
  state = restartGame(state);
  resetVisualCursor();
  render();
  setStatus("Run restarted. Press Start to begin Level 1.");
  startButton.focus();
}

startButton.addEventListener("click", () => {
  state = startGame(state);
  resetVisualCursor();
  render();
  const backgroundTrack = getBackgroundTrack();
  primeAudioTracks(backgroundTrack);
  playBackgroundForCurrentLevel({ restart: true });
  setStatus("Level 1 started. Find Mom's letter.");
  board.focus();
});

pauseButton.addEventListener("click", () => {
  pauseCurrentGame();
});

soundButton.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    const backgroundTrack = getBackgroundTrack();
    primeAudioTracks(backgroundTrack);
    playBackgroundForCurrentLevel();
  } else {
    pauseBackgroundSound();
    stopMemorySound();
  }
  renderSoundButton();
  setStatus(soundEnabled ? "Game audio on." : "Game audio muted.");
  board.focus();
});

resumeButton.addEventListener("click", () => {
  resumeCurrentGame();
});

for (const restartButton of restartButtons) {
  restartButton.addEventListener("click", performRestart);
}

nextLevelButton.addEventListener("click", () => {
  stopMemorySound();
  state = startNextLevel(state);
  resetVisualCursor();
  render();
  playBackgroundForCurrentLevel();
  setStatus(
    `Level ${state.level} started. Find ${getActiveMemory(state).label.toLowerCase()}.`,
  );
  board.focus();
});

playAgainButton.addEventListener("click", performRestart);

board.addEventListener("pointermove", moveCursorToPointer);
board.addEventListener("pointerleave", () => {
  if (state.phase !== "playing") return;
  stopFocus();
  cancelPointerMotionFrame();
  clearMotionPulse();
  pointerVisual = null;
  renderRoomDepth();
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
    if (state.phase === "playing") {
      resetVisualCursor();
      handleMovement(...movement);
    }
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

reducedMotion.addEventListener("change", () => {
  resetVisualCursor();
  render();
});

window.__roomRemembers = {
  getState: () => snapshotState(state),
  getAudioState: () =>
    Object.fromEntries(
      [...audioTracks].map(([trackId, track]) => [
        trackId,
        {
          paused: track.paused,
          currentTime: track.currentTime,
          duration: track.duration,
          readyState: track.readyState,
          volume: track.volume,
          muted: track.muted,
          error: track.error?.code ?? null,
        },
      ]),
    ),
};

createBoardCells();
render();
