# The Room Remembers — Three-Level Browser Demo

This playable build uses plain HTML, CSS, and JavaScript with no package installation or build step. The square 20 × 20 bedroom works with mouse hover or keyboard movement.

The layout scales to a phone-sized screen, but touch-only movement is not part of this build yet.

## Level progression

| Level | Memory item | World | Score after finding it |
|---|---|---|---:|
| 1 | Mom's letter | Soft-gray bedroom | 10 |
| 2 | Medal | Soft-gray bedroom | 20 |
| 3 | Stuffed animal | Dark inverse bedroom; the memory is white | 30 |

Each level contains one active memory. A transition screen waits for **Start Next Level** after Levels 1 and 2. The Level 2 transition explains the inverse-room rule before Level 3 begins. **Play Again** resets the full run after the 30-point completion screen.

## Local preview

From this `game` folder, run:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173` in a desktop browser.

## Controls

- Select **Start** before the board accepts input.
- Move the cartoon cursor by hovering across the board with a mouse, or use the Arrow keys or WASD.
- When the cursor reaches the current memory item, hold the mouse button, Space, or Enter for 1.2 seconds.
- Pause with **P**, Escape, or the on-screen Pause button.
- Returning to a blurred or hidden tab never resumes automatically; select **Resume**.
- **Restart run** restores Level 1, the opening position and direction, the hidden score, all three items, and the empty meter.

The score remains hidden during play. It appears only on the final completion screen.

## Checks

Run the state checks with:

```sh
node --test tests/state.test.mjs
```

For local inspection, the browser console can read a copy of the state with:

```js
window.__roomRemembers.getState()
```
