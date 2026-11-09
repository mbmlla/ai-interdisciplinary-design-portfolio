import assert from "node:assert/strict";
import test from "node:test";

import {
  BOARD_SIZE,
  HOLD_DURATION_MS,
  INITIAL_CURSOR,
  INITIAL_DIRECTION,
  LEVELS,
  advanceFocus,
  createInitialState,
  getActiveMemory,
  moveCursor,
  pauseGame,
  restartGame,
  resumeGame,
  startGame,
  startNextLevel,
} from "../game-state.mjs";

function moveToActiveMemory(state) {
  const memory = getActiveMemory(state);
  let next = state;
  while (next.cursor.row > memory.row) next = moveCursor(next, -1, 0);
  while (next.cursor.row < memory.row) next = moveCursor(next, 1, 0);
  while (next.cursor.column > memory.column) next = moveCursor(next, 0, -1);
  while (next.cursor.column < memory.column) next = moveCursor(next, 0, 1);
  return next;
}

function completeActiveLevel(state) {
  return advanceFocus(moveToActiveMemory(state), HOLD_DURATION_MS);
}

test("the board is 20 by 20 and the run begins ready", () => {
  const state = createInitialState();
  assert.equal(BOARD_SIZE, 20);
  assert.equal(state.phase, "ready");
  assert.equal(state.level, 1);
  assert.equal(state.score, 0);
  assert.equal(state.completedSegments, 0);
  assert.equal(state.direction, INITIAL_DIRECTION);
  assert.deepEqual(state.cursor, INITIAL_CURSOR);
  assert.equal(state.items.length, 3);
});

test("movement waits for Start, records direction, and stays inside the board", () => {
  const ready = createInitialState();
  assert.strictEqual(moveCursor(ready, -1, 0), ready);

  let state = startGame(ready);
  state = moveCursor(state, 0, 1);
  assert.equal(state.direction, "right");
  state = moveCursor(state, -1, 0);
  assert.equal(state.direction, "up");

  for (let index = 0; index < BOARD_SIZE * 2; index += 1) {
    state = moveCursor(state, -1, 0);
    state = moveCursor(state, 0, -1);
  }
  assert.deepEqual(state.cursor, { row: 0, column: 0 });

  for (let index = 0; index < BOARD_SIZE * 2; index += 1) {
    state = moveCursor(state, 1, 0);
    state = moveCursor(state, 0, 1);
  }
  assert.deepEqual(state.cursor, { row: 19, column: 19 });
});

test("one memory adds exactly 10 points and one meter segment", () => {
  const state = completeActiveLevel(startGame(createInitialState()));

  assert.equal(state.score, 10);
  assert.equal(state.completedSegments, 1);
  assert.equal(state.perLevelMemoryCount, 1);
  assert.equal(state.phase, "level-complete");
  assert.equal(state.items[0].collected, true);

  const duplicateAttempt = advanceFocus(state, HOLD_DURATION_MS);
  assert.strictEqual(duplicateAttempt, state);
});

test("pause freezes focus and Resume requires another explicit hold", () => {
  let state = moveToActiveMemory(startGame(createInitialState()));
  state = advanceFocus(state, HOLD_DURATION_MS / 2);
  const paused = pauseGame(state);

  assert.equal(paused.phase, "paused");
  assert.equal(paused.focusProgressMs, HOLD_DURATION_MS / 2);
  assert.strictEqual(advanceFocus(paused, HOLD_DURATION_MS), paused);
  assert.strictEqual(moveCursor(paused, 1, 0), paused);

  state = resumeGame(paused);
  assert.equal(state.phase, "playing");
  assert.equal(state.focusProgressMs, HOLD_DURATION_MS / 2);
  state = advanceFocus(state, HOLD_DURATION_MS / 2);
  assert.equal(state.score, 10);
  assert.equal(state.completedSegments, 1);
});

test("three levels preserve total score and reset per-level state", () => {
  let state = completeActiveLevel(startGame(createInitialState()));
  assert.equal(state.level, 1);
  assert.equal(state.score, 10);

  state = startNextLevel(state);
  assert.equal(state.level, 2);
  assert.equal(state.score, 10);
  assert.equal(state.completedSegments, 1);
  assert.equal(state.perLevelMemoryCount, 0);
  assert.equal(state.direction, INITIAL_DIRECTION);
  assert.deepEqual(state.cursor, INITIAL_CURSOR);

  state = completeActiveLevel(state);
  assert.equal(state.score, 20);
  assert.equal(state.completedSegments, 2);
  assert.equal(state.phase, "level-complete");

  state = startNextLevel(state);
  assert.equal(state.level, 3);
  assert.equal(state.score, 20);
  assert.equal(state.perLevelMemoryCount, 0);
  assert.equal(state.direction, INITIAL_DIRECTION);
  assert.deepEqual(state.cursor, INITIAL_CURSOR);

  state = completeActiveLevel(state);
  assert.equal(state.score, 30);
  assert.equal(state.completedSegments, 3);
  assert.equal(state.perLevelMemoryCount, 1);
  assert.equal(state.phase, "game-complete");
  assert.deepEqual(
    state.items.map((item) => item.collected),
    [true, true, true],
  );
});

test("all memory items leave the starting area clear", () => {
  for (const level of LEVELS) {
    const distance =
      Math.abs(level.item.row - INITIAL_CURSOR.row) +
      Math.abs(level.item.column - INITIAL_CURSOR.column);
    assert.ok(distance >= 8, `${level.item.label} is too close to the start`);
  }
});

test("Play Again restores the complete run", () => {
  let state = completeActiveLevel(startGame(createInitialState()));
  state = startNextLevel(state);
  state = completeActiveLevel(state);
  state = startNextLevel(state);
  state = completeActiveLevel(state);
  state = restartGame(state);

  assert.equal(state.phase, "ready");
  assert.equal(state.level, 1);
  assert.equal(state.score, 0);
  assert.equal(state.completedSegments, 0);
  assert.equal(state.perLevelMemoryCount, 0);
  assert.equal(state.direction, INITIAL_DIRECTION);
  assert.deepEqual(state.cursor, INITIAL_CURSOR);
  assert.deepEqual(
    state.items.map((item) => item.collected),
    [false, false, false],
  );
});

test("two consecutive fresh runs use the same initial cursor position", () => {
  let state = startGame(createInitialState());
  state = moveCursor(state, -4, 5);
  const firstRestart = restartGame(state);

  state = startGame(firstRestart);
  state = moveCursor(state, 2, -3);
  const secondRestart = restartGame(state);

  assert.deepEqual(firstRestart.cursor, INITIAL_CURSOR);
  assert.deepEqual(secondRestart.cursor, INITIAL_CURSOR);
  assert.deepEqual(firstRestart.cursor, secondRestart.cursor);
});
