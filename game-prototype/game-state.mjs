export const BOARD_SIZE = 20;
export const MEMORY_SCORE = 10;
export const TOTAL_MEMORY_SEGMENTS = 3;
export const HOLD_DURATION_MS = 1200;
export const INITIAL_DIRECTION = "right";

export const INITIAL_CURSOR = Object.freeze({ row: 17, column: 3 });

export const LEVELS = Object.freeze([
  Object.freeze({
    number: 1,
    world: "normal",
    item: Object.freeze({
      id: "letter",
      label: "Mom's letter",
      display: "Mom",
      row: 11,
      column: 13,
    }),
  }),
  Object.freeze({
    number: 2,
    world: "normal",
    item: Object.freeze({
      id: "medal",
      label: "Medal",
      display: "★",
      row: 4,
      column: 16,
    }),
  }),
  Object.freeze({
    number: 3,
    world: "inverse",
    item: Object.freeze({
      id: "stuffed-animal",
      label: "Stuffed animal",
      display: "",
      row: 10,
      column: 11,
    }),
  }),
]);

export const LEVEL_ONE_MEMORY = LEVELS[0].item;

const PHASES = new Set([
  "ready",
  "playing",
  "paused",
  "level-complete",
  "game-complete",
]);

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function copyItems(items) {
  return items.map((item) => ({ ...item }));
}

function directionFromMovement(rowDelta, columnDelta, currentDirection) {
  if (Math.abs(columnDelta) >= Math.abs(rowDelta) && columnDelta !== 0) {
    return columnDelta > 0 ? "right" : "left";
  }
  if (rowDelta !== 0) return rowDelta > 0 ? "down" : "up";
  return currentDirection;
}

export function getLevelDefinition(level) {
  return LEVELS.find((entry) => entry.number === level) ?? null;
}

export function createInitialState() {
  return {
    phase: "ready",
    level: 1,
    score: 0,
    perLevelMemoryCount: 0,
    completedSegments: 0,
    focusProgressMs: 0,
    direction: INITIAL_DIRECTION,
    cursor: { ...INITIAL_CURSOR },
    items: LEVELS.map((level) => ({
      ...level.item,
      level: level.number,
      collected: false,
    })),
  };
}

export function startGame(state) {
  if (state.phase !== "ready") return state;
  return { ...state, phase: "playing" };
}

export function startNextLevel(state) {
  if (state.phase !== "level-complete" || state.level >= LEVELS.length) {
    return state;
  }

  return {
    ...state,
    phase: "playing",
    level: state.level + 1,
    perLevelMemoryCount: 0,
    focusProgressMs: 0,
    direction: INITIAL_DIRECTION,
    cursor: { ...INITIAL_CURSOR },
  };
}

export function moveCursor(state, rowDelta, columnDelta) {
  if (state.phase !== "playing") return state;

  const nextRow = clamp(state.cursor.row + rowDelta, 0, BOARD_SIZE - 1);
  const nextColumn = clamp(
    state.cursor.column + columnDelta,
    0,
    BOARD_SIZE - 1,
  );

  if (nextRow === state.cursor.row && nextColumn === state.cursor.column) {
    return state;
  }

  return {
    ...state,
    focusProgressMs: 0,
    direction: directionFromMovement(
      nextRow - state.cursor.row,
      nextColumn - state.cursor.column,
      state.direction,
    ),
    cursor: { row: nextRow, column: nextColumn },
  };
}

export function getAvailableMemoryAtCursor(state) {
  return (
    state.items.find(
      (item) =>
        item.level === state.level &&
        !item.collected &&
        item.row === state.cursor.row &&
        item.column === state.cursor.column,
    ) ?? null
  );
}

export function getActiveMemory(state) {
  return state.items.find((item) => item.level === state.level) ?? null;
}

export function canFocusMemory(state) {
  return state.phase === "playing" && Boolean(getAvailableMemoryAtCursor(state));
}

export function advanceFocus(state, elapsedMs) {
  if (!canFocusMemory(state) || elapsedMs <= 0) return state;

  const focusProgressMs = Math.min(
    HOLD_DURATION_MS,
    state.focusProgressMs + elapsedMs,
  );

  if (focusProgressMs < HOLD_DURATION_MS) {
    return { ...state, focusProgressMs };
  }

  const activeMemory = getAvailableMemoryAtCursor(state);
  if (!activeMemory) return { ...state, focusProgressMs: 0 };

  const items = copyItems(state.items).map((item) =>
    item.id === activeMemory.id ? { ...item, collected: true } : item,
  );
  const isFinalLevel = state.level === LEVELS.length;

  return {
    ...state,
    phase: isFinalLevel ? "game-complete" : "level-complete",
    score: state.score + MEMORY_SCORE,
    perLevelMemoryCount: state.perLevelMemoryCount + 1,
    completedSegments: Math.min(
      TOTAL_MEMORY_SEGMENTS,
      state.completedSegments + 1,
    ),
    focusProgressMs: 0,
    items,
  };
}

export function clearFocus(state) {
  if (state.phase !== "playing" || state.focusProgressMs === 0) return state;
  return { ...state, focusProgressMs: 0 };
}

export function pauseGame(state) {
  if (state.phase !== "playing") return state;
  return { ...state, phase: "paused" };
}

export function resumeGame(state) {
  if (state.phase !== "paused") return state;
  return { ...state, phase: "playing" };
}

export function restartGame() {
  return createInitialState();
}

export function snapshotState(state) {
  if (!PHASES.has(state.phase)) throw new Error(`Unknown phase: ${state.phase}`);
  return {
    ...state,
    cursor: { ...state.cursor },
    items: copyItems(state.items),
  };
}
