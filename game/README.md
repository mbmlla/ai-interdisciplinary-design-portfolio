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

## Environmental memory system

The bedroom now gives the player specific landmarks to learn: a branched tree whose limbs recede behind three layered, wavy canopy shapes beyond the window; three taped papers with different scribbles, directional shading, and large palette-colored stickers placed in separate blank areas; height marks; individually shaded drawers with mismatched knobs; a loose rug thread; and a single cyan-and-white sock whose cyan matches the books. The tree keeps exactly two small front-canopy squiggles in separate locations; their average footprint is about half the earlier size and one is 30% larger than the other. The dresser's middle drawer sits slightly forward with a dark top cavity and lower cast shadow. The narrower twin-style bed has a full-width curved headboard layered behind the mattress, with the room plane visible around it instead of pale bedding. The mattress begins in front of the headboard and retains its contact shadow, large striped blanket, and pinched white pillow enlarged by about 30% with cool lower shading and corner folds. Its stitched dotted detail now belongs only to the rug instead of appearing on the blanket. The shelf holds a classic gold trophy whose loop handles share the stem's highlighted gold shading, beside books with the same upper-left light and lower-right shadow direction. The note, medal, and both rabbit forms include smaller identifying details instead of relying on flat silhouettes. In Level 2, the tall center paper falls fully into the open floor strip between the dresser and rug while its two tape strips remain on the wall; the sock shifts below the dresser with a clear gap from the paper, the middle drawer pulls farther open, and the view behind the tree changes from dark blue at the top to pink at the bottom. Level 3 restores the paper arrangement while preserving the room's shapes in cold inverse lighting. The recovered medal remains in its exact Level 2 position with muted cyan, lavender, and navy inverse colors, but only the stuffed rabbit is interactive. The inverse sock keeps the normal-room placement, size, and angle while its colors change.

Each recovered object pauses the run with a short personal memory, a distinct visual response, and its own supplied sound cue. The normal bedroom music loops through Levels 1 and 2. The inverse recording replaces it only after the player chooses to begin Level 3. Room music yields when a memory is found so the object response remains clear.

Audio begins only after **Start** and can be muted with the music-note button. Pause, hidden-tab, and lost-window-focus events pause the audio; it resumes only after an explicit player action. The written memory and abstract visual response remain available when sound is muted, but the level-completion panels intentionally omit written sound descriptions. The final rabbit response begins immediately, then the short completion cue joins after 2.4 seconds so the completion screen is not held for the full 35-second rabbit recording.

| Game event | Supplied audio |
|---|---|
| Levels 1–2 room music | `room-music.m4a` |
| Level 3 inverse-room music | `inverse-room.wav` |
| Mom's letter recovered | `moms-letter-rustle.wav` |
| Medal recovered | `medal.mp3` |
| Stuffed rabbit recovered | `stuffed-rabbit.wav` |
| Full game complete | `game-complete.wav` |

The current letter cue is a trimmed derivative of `new-mom-letter.wav`. It begins at source frame 16,274 (about 0.369 seconds), preserving the faint first paper attack while removing the dead lead-in. The earlier `moms-letter.wav` remains in the audio folder for reversibility.

The two large 24-bit WAV recordings are stored as 16-bit, 44.1 kHz stereo browser copies to reduce download size while the original files remain unchanged.

## Spatial depth system

The bedroom keeps its illustrated 2D style but now behaves like a shallow dollhouse. A back wall, baseboard, receding floor seams, furniture side faces, window sill, shelf brackets, and contact shadows separate the room into near, middle, and far planes. Uneven drawings, bedding, pillows, and rug edges make the space feel used rather than mechanically rigid.

While the game is playing, a broad pool of light follows the cursor and decorative objects shift by only a few pixels according to their depth. The 20 × 20 board itself never moves, so the memory cells and pointer mapping stay fixed. With reduced motion enabled, the parallax and drifting color textures stop and the moving exploration light is removed.

Mom's note is 50% larger and follows the bed's near plane. The medal follows the shelf's far plane from a cell clear of the HUD. In the inverse room, the detailed white rabbit replaces the gray decorative landmark so the two silhouettes do not overlap.

## Fluid cursor and color movement

The logical game still uses the 20 × 20 board, but the visible cursor is no longer a CSS Grid item. Keyboard movement eases between cell centers, while mouse movement follows the pointer continuously inside each cell. The logical row and column change only when the player crosses a cell boundary, so collision, scoring, and memory targeting remain unchanged.

Two irregular color ribbons now trail the cursor in opposite directions. Coral and yellow lead in the normal room, while lavender and cyan follow; the inverse room swaps their emphasis. The cursor's smaller ribbons stretch briefly during movement. Pausing freezes both logical input and the movement variables. Reduced-motion mode keeps the colors static, removes reactive displacement, and makes user-driven cursor positioning immediate.

## Local preview

From this `game` folder, run:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173` in a desktop browser.

## Controls

- Select **Start** before the board accepts input.
- Move the cartoon cursor by hovering across the board with a mouse, or use the Arrow keys or WASD.
- Hovering any visible part of a memory object snaps the cartoon cursor to that object's exact grid cell.
- When the cursor reaches the current memory item, hold the mouse button, Space, or Enter for 1.2 seconds.
- Pause with **P**, Escape, or the on-screen Pause button.
- Mute or restore all game audio with the music-note button.
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
