# The Room Remembers — Play-test Record

## Level-transition pacing decision

**Recorded:** November 8, 2026  
**Status:** Player-controlled transition implemented and browser-checked; first-time-player evidence is still pending

### Question

Should the next level begin automatically after a short countdown, or wait for the player to select **Start Next Level**?

### Hypotheses — not play-test evidence

- A five-second automatic countdown may preserve dreamlike flow, but may start the next level before a first-time player finishes reading.
- A player-controlled button may improve comprehension and accessibility, but may introduce a short pause between memories.

### Small comparison test

Test with at least four first-time players:

1. Give half the players a five-second automatic transition.
2. Give half the players a **Start Next Level** button with no countdown.
3. Do not explain the transition before play.
4. Observe whether each player finishes reading, understands the next goal, and makes a purposeful first move.
5. Ask: “Did the next level begin before, after, or when you felt ready?”

Record for each player:

| Player | Version | Finished reading? | Understood next goal? | First purposeful action | Felt rushed? | Notes |
|---|---|---|---|---|---|---|
| Pending | Pending | Pending | Pending | Pending | Pending | Pending |

### Actual evidence

On November 8, 2026, the complete run was checked in the browser:

- Level 1 stopped after the letter at 10 points and one meter segment. The next level did not begin until **Start Next Level** was selected.
- Level 2 stopped after the medal at 20 points and two meter segments. The transition remained visible and explained that Level 3 uses an inverse room where the important object is white.
- Selecting **Start Next Level** began Level 3 at the shared starting position, facing right, with the per-level memory count reset to zero and the total score preserved at 20.
- Level 3 ended after the stuffed animal with three filled meter segments and a final score of 30 points.

These observations confirm the implementation and pacing mechanism. They do not show whether a first-time player finishes reading or understands the inverse-room clue; that still requires the comparison test above.

### Decision

Use the player-controlled **Start Next Level** transition in the current demo. Revisit the wording or pacing after first-time-player evidence is recorded.

## Environmental recall and memory-response test

**Status:** Implementation check pending

For each level, ask a first-time player what they remember about the window, drawings, dresser, rug, bed, and small floor objects before they continue. After Level 2 begins, record which displaced detail they notice first. After the inverse room begins, ask which landmarks prove that it is still the same bedroom.

Record whether the player can explain why each recovered object matters:

| Memory | Detail recalled | Meaning understood | Sound noticed | Visual response noticed | Notes |
|---|---|---|---|---|---|
| Mom's letter | Pending | Pending | Pending | Pending | Pending |
| Medal | Pending | Pending | Pending | Pending | Pending |
| Stuffed rabbit | Pending | Pending | Pending | Pending | Pending |

Repeat one run with sound muted and one with reduced motion. Scoring, meter progress, transition timing, and story comprehension should remain unchanged.

## Spatial-room refinement check

**Recorded:** November 20, 2026  
**Status:** Implemented and browser-checked; first-time-player perception still needs observation

### Actual implementation evidence

- At a 1400-pixel desktop viewport, the wall/floor split, baseboard, converging floor seams, furniture side faces, window sill, shelf brackets, irregular textiles, and contact shadows were all visible without changing the square board.
- At a 390-pixel viewport, the complete board and controls remained inside the viewport with no horizontal overflow.
- Moving one cell with the keyboard changed the cursor from column 4 to column 5 and changed the decorative near-plane offset from 2.27 pixels to 1.93 pixels. The board stayed stationary.
- Clicking Mom's letter and the medal moved the cursor to each memory cell. The rabbit's ear initially selected the row above its body; the hover rule was corrected so every visible part of the rabbit now selects its exact cell.
- A complete browser run stopped at 10 and 20 points, then completed the inverse room at 30 points with three meter segments.
- **Play Again** returned to Level 1, 0 points, 0 segments, row 18, column 4, facing right. Pause and explicit Resume also remained functional.
- The browser console reported no warnings or errors.

### Perception test still needed

Show the updated room to at least three first-time players without describing the depth changes. Ask, “What kind of space are you in?” and “Which three room details would help you recognize it after it changes?” Record whether they call it a bedroom, whether they perceive a wall and floor, and which landmarks they remember. This will show whether the room feels explorable rather than merely more decorated.

## Object clarity and placement check

**Recorded:** November 20, 2026  
**Status:** Implementation and overlap checks passed; first-time recognition evidence is pending

### Actual implementation evidence

- Mom's note rendered at approximately 1.49 cell widths on the desktop check, close to the requested 50% increase once its border is included. Its computed translation matched the bed's near-plane translation.
- At 390 pixels wide, the relocated medal did not intersect either the pause/sound button group or the memory meter. The same no-overlap result passed at 1400 pixels wide.
- The medal's computed translation matched the shelf's far-plane translation before and after keyboard movement.
- The decorative rabbit now has unequal ears, blue stitching, eyes, a nose, side paws, feet, and a belly patch. The recovered inverse rabbit uses the same identifying features at a larger scale, while the gray duplicate is hidden in Level 3.
- Clicking each enlarged or irregular memory silhouette still placed the cursor on the exact memory cell. A complete run ended with 30 points and three meter segments.
- **Play Again** restored Level 1, 0 points, 0 segments, row 18, column 4, and the right-facing direction. Pause and explicit Resume remained functional.
- The 390-pixel page had no horizontal overflow, and the browser console reported no warnings or errors.

### Recognition test still needed

Show Level 3 to first-time players without naming the target. Ask what they think the white object is before they collect it. Record whether they independently identify a rabbit or stuffed animal, and which feature—ears, face, stitched ear, paws, or belly button—made it recognizable.

## Cursor and reactive-color check

**Recorded:** November 20, 2026  
**Status:** Browser behavior passed; subjective motion testing and reduced-motion emulation remain

### Actual implementation evidence

- Before **Start**, mouse and Arrow-key input left the logical and visual cursor at row 18, column 4.
- One keyboard step changed exactly one logical column. The cursor remained at its starting pixel position immediately after input, moved between positions after 70 milliseconds, and settled at the new cell center after the 145-millisecond transition.
- Two mouse positions inside the same logical cell kept the state at row 11, column 6 while changing the visual cursor from 25.53% to 29.08% across the board.
- During that same-cell mouse movement, the leading flow offset changed from -8.83 pixels to -7.55 pixels. The room geometry did not move.
- While paused, row, column, cursor coordinates, and flow offset remained unchanged after additional mouse and Arrow-key input. Resume remained explicit.
- At 390 pixels, the board remained 370 pixels wide with no horizontal overflow. At 1400 pixels, the board remained 828 pixels wide with no horizontal overflow.
- Normal-room coral/yellow movement and inverse-room cyan/lavender movement remained behind the furniture, memories, cursor, HUD, and overlays.
- A complete browser run still stopped at 10 and 20 points and finished at 30 points with three meter segments. **Play Again** restored the initial logical and visual cursor position.
- The browser console reported no warnings or errors.

### Checks still needed

Ask first-time players whether the cursor now feels smooth enough and whether the flowing colors support exploration or become distracting. The reduced-motion rules were source-reviewed, but this environment did not provide a media-preference emulator for a visual browser check.

## Supplied-audio integration check

**Recorded:** November 20, 2026  
**Status:** Browser behavior passed; subjective mix testing remains

### Actual implementation evidence

- On a fresh load, all six supplied recordings decoded without an error and remained silent before **Start**. The browser reported the expected durations: 34.99 seconds for normal-room music, 71.32 seconds for the inverse room, 4.46 seconds for Mom's letter, 13.35 seconds for the medal, 35 seconds for the stuffed rabbit, and 4.32 seconds for game completion.
- Selecting **Start** began only the normal-room music. Pause stopped the track without advancing its time, and **Resume** continued it only after the explicit button press.
- The sound control paused the room music, changed to “Turn game audio on” with `aria-pressed="false"`, and resumed the same music when restored.
- Recovering Mom's letter paused the room music, played only the letter cue, and stopped at 10 points with one meter segment. Starting Level 2 resumed the normal-room track from its paused point.
- Recovering the medal played only the medal cue and stopped at 20 points with two meter segments. Starting Level 3 reset the normal track and began only the inverse-room recording.
- Recovering the rabbit paused the inverse track, began the rabbit cue, and completed the game at 30 points with three meter segments. The completion cue began once after the planned 2.4-second delay while the rabbit cue continued at a lower volume.
- **Play Again** returned to Level 1, 0 points, 0 segments, row 18, column 4, facing right. All six recordings were paused and rewound to zero.
- At a 390-pixel viewport, the board remained 370 pixels wide, both HUD controls remained present, the audio elements added no visible space, and the page had no horizontal overflow.
- A clean browser session reported no console warnings or errors from the game.

### Listening test still needed

Play a complete run on both a phone speaker and headphones. Check whether the room music stays beneath the object cues, whether the inverse room feels clearly different, and whether the rabbit and completion recordings blend comfortably during their short overlap. Adjust the per-track volume values or the 2.4-second delay only after that listening evidence.

## Room-landmark clarity check

**Recorded:** November 20, 2026  
**Status:** Visual and gameplay checks passed; first-time recognition testing remains

### Actual implementation evidence

- At the desktop preview, the outdoor tree remained clipped behind all four translucent window panes. Its branches were painted after the back canopy but before the middle and front layers, so the limbs receded beneath the foliage while the trunk base stayed clear.
- The bed changed from an 11-by-9-cell block to a narrower 10-by-11-cell twin-style silhouette. Its curved dark headboard, pale sheet, striped blanket, and soft foot drape established a clear head-to-foot direction without moving any memory cell.
- The pillow became a horizontal pinched cushion with an outlined seam, four corner folds, and cool lower shading. It remained separate from Mom's letter and shifted deliberately in Level 2.
- The shelf object still read as one trophy. Its open loop handles gained lighter upper-left edges, darker lower-right edges, and small cast shadows matching the gold stem. The neighboring books retained the same directional light.
- All three taped wall papers displayed different scribble paths and shared upper-left paper highlights with lower-right inset and cast shadows. Each drawer face gained the same light direction while keeping its mismatched knob.
- Exactly one cyan-and-white striped sock appeared beside the rug. Its body computed to `#79dce5`, matching the cyan source used by the books, while its smooth ankle, contrasting heel, rounded toe, and three foot stripes remained distinguishable.
- At a 390-pixel viewport, the window measured about 93 × 111 pixels, the tree 80 × 98 pixels, the trophy 29 × 62 pixels, the books 39 × 41 pixels, the dresser 93 × 111 pixels, the bed 185 × 204 pixels, the blanket 169 × 123 pixels, the pillow 64 × 48 pixels, and the sock 42 × 50 pixels. The board stayed 370 pixels wide with no horizontal overflow.
- The inverse room preserved the same tree, papers, dresser, trophy, bed, blanket, pillow, and sock structures while recoloring them as dark counterparts. The explicit inverse sock palette remained active, and the white stuffed rabbit stayed separate from the revised bed.
- A complete run still stopped at 10 and 20 points, completed Level 3 at 30 points and three meter segments, and **Play Again** restored Level 1, 0 points, row 18, column 4, and the right-facing direction.
- The clean browser session reported no game warnings or errors.

### Recognition test still needed

Show the normal room to at least three first-time players without naming the revised details. Ask what they see outside the window, what sits on the shelf, what lies beside the rug, and what the large object on the right is. Record whether they independently identify a tree, trophy, sock, bed, pillow, and blanket; whether the three paper marks look different; and whether the lighting feels consistent across the books, trophy, papers, and drawers.

## Completion-popup and room-detail refinement check

**Recorded:** November 20, 2026  
**Status:** Implementation and browser checks passed; first-time recognition testing remains

### Actual implementation evidence

- The Level 1, Level 2, and game-complete panels retained the object title, written memory, visual response, and continuation action while showing no `Sound:` label or written sound description.
- Removing that text did not remove the recordings. Recovering Mom's letter still began `moms-letter-rustle.wav`, paused the normal room music, and produced no audio error.
- The dashed ellipse was removed from the blanket. The related stitched motif remains on the rug, away from the bed.
- The headboard filled the bed's inner width: 320 pixels inside a 325-pixel bed at the desktop check, leaving only the bed's 2.5-pixel border on each side.
- The three wall papers contained three different sticker paths in the existing cyan, coral, and lavender room colors. Each sticker moved into its own positioned SVG layer and became 105–122% wider than its previous rendering. Their path bounds did not intersect the scribbled-line bounds at either 1400 or 390 pixels.
- The coral window-side shape and its separate wallpaper-tear element were absent in all three levels.
- The normal and inverse sock both used grid area `15 / 5 / 18 / 7`, the same 62 × 90-pixel layout box, and the same `-18deg` rotation at desktop size. At 390 pixels, both used the same 36 × 51-pixel layout box, position, and transform; only the inverse palette changed.
- The 390-pixel page kept a 370-pixel square board with no horizontal overflow. A complete keyboard run still stopped at 10 and 20 points and finished at 30 points with three meter segments.
- **Play Again** restored Level 1 and an empty meter. Pause stopped the normal room track, explicit **Resume** restarted it, and both actions remained visible at 390 pixels.
- Portfolio-to-game and game-to-portfolio navigation both loaded at 390 pixels. The portfolio structure checker passed, and the browser reported no game-origin console warnings or errors.

### Recognition test still needed

Show the revised wall papers, bed, and inverse sock to first-time players without naming the changes. Record whether the stickers read as intentional room decoration, the dark form reads as one full-width headboard, and the sock is recognized as the same object rather than a newly placed one.

## Canopy, drawer, and bed-depth refinement check

**Recorded:** November 20, 2026  
**Status:** Implementation and browser checks passed; first-time depth recognition testing remains

### Actual implementation evidence

- The tree retained exactly two front-canopy squiggles. Their path widths changed from 77 and 63 viewBox units to 39 and 30, making the new average 49.3% of the previous average. The upper-left mark is exactly 30% wider than the lower-right mark, and both remain fixed visual landmarks instead of moving between runs.
- The middle drawer moved 4% sideways and `0.14rem` forward/down, widened by 2.5%, and gained a dark cavity above plus a cast shadow below. The Level 2 rule that previously flattened its transform was removed, so the drawer remained visibly ajar in Levels 1 and 2 and kept the same geometry in the inverse room.
- The headboard remained at layer 0 while the sheet remained at layer 1. Increasing their overlap and adding an upward sheet shadow made the mattress visibly sit in front of the headboard rather than sharing its plane.
- The pillow changed from `34% × 22%` of the bed to `44% × 29%`, an increase of about 29% in width and 32% in height. It stayed inside the bed at desktop and 390-pixel widths, retained its Level 2 shift, and kept the same proportions in the inverse room.
- Desktop and 390-pixel screenshots showed the two tree marks separated, the drawer gap unobstructed, the headboard behind the mattress, and the enlarged pillow clear of the rabbit and HUD.
- A complete keyboard run at 390 pixels still completed at 10, 20, and 30 points. **Play Again** returned to the Level 1 ready screen, and **Pause** followed by explicit **Resume** returned to active play.
- Portfolio-to-game and game-to-portfolio navigation both loaded at 390 pixels. The portfolio structure checker passed, the two game folders matched byte for byte, and the browser reported no game-origin warning or error after browser-extension noise was excluded.

### Recognition test still needed

Show the updated tree, dresser, and bed to first-time players without naming the changes. Record whether they notice two subtle canopy marks, identify the middle drawer as slightly open, read the headboard as sitting behind the mattress, and recognize the enlarged pillow without mistaking it for another object.

## Headboard rear-plane correction check

**Recorded:** November 20, 2026  
**Status:** Implementation and browser checks passed

### Actual implementation evidence

- The pale area behind the headboard came from the full-height `.room-bed` background and border, not from the headboard or pillow. That positioning container is now transparent.
- The visible mattress is now the `.bed-sheet` layer. It begins at 23% of the bed height, spans the same inner width as the headboard, and continues to the foot with the original border, inset shading, and cast shadows.
- The right-side depth face now also begins at 23%, so it no longer creates a rear slab beside the headboard. The mattress remains above the headboard in the layer order and preserves the existing overlap shadow.
- Desktop and 390-pixel screenshots showed the room plane around the curved headboard in both normal and inverse rooms. The pillow, blanket, rabbits, and memory positions remained unchanged.
- At 390 pixels, the page measured 390 pixels in both client and scroll width, so the correction introduced no horizontal overflow. A complete keyboard run still reached the 30-point completion screen.
- The browser reported no game-origin warning or error after browser-extension noise was excluded.

## Mom's-letter replacement-audio check

**Recorded:** November 20, 2026  
**Status:** Implementation and browser checks passed; final listening preference remains with the designer

### Actual implementation evidence

- The supplied `new-mom-letter.wav` was stereo, 44.1 kHz, 16-bit PCM with a 4.830771-second duration. Waveform analysis found the faint rustle attack near 0.369 seconds and sustained rustling by 0.380 seconds.
- The browser derivative begins at source frame 16,274, a near-zero crossing at approximately 0.369 seconds. It requires no added fade and has a 4.461746-second duration.
- The new cache-safe file is `assets/audio/moms-letter-rustle.wav`. The previous `moms-letter.wav` remains unchanged, and no inverse-room or other game audio was replaced.
- On a fresh page load, the letter audio reported ready state 4, the expected 4.461746-second duration, and no media error.
- Recovering Mom's letter played the replacement cue from its beginning, paused the normal-room track, added one meter segment, and stopped at the Level 1 completion screen. The cue was actively playing at 0.276 seconds when inspected.
- The browser reported no game-origin audio warning or error after browser-extension noise was excluded.

## Level 2 environmental-shift check

**Recorded:** November 20, 2026  
**Status:** Implementation and browser checks passed; first-time recognition testing remains

### Actual implementation evidence

- Level 2 showed two complete papers on the wall and the tall center paper fully visible in the floor strip between the dresser and rug. Its two original tape strips remained visible at the empty wall position.
- The sock moved below the dresser instead of sharing the paper's lower-center area. At desktop width, the paper and sock had about 73 pixels of horizontal separation; at 390 pixels, they retained about 41 pixels of separation and both silhouettes stayed readable.
- The middle drawer moved farther down and to the right, exposing a deeper dark cavity above it and a stronger cast shadow below. The change remained visible at desktop and 390-pixel widths.
- The Level 2 window changed to a dark-blue, violet, and pink vertical gradient behind the existing tree. The panes, trunk, branches, and canopy remained readable in front of it.
- At 390 pixels, the fallen paper measured about 65 × 28 pixels, the relocated sock about 42 × 48 pixels, and the page client width and scroll width both measured 390 pixels, so the changes added no horizontal overflow.
- Recovering the medal still stopped the run at Level 2 completion. Starting Level 3 restored the center paper to the wall and hid the separate tape remnant; completing the rabbit still produced 30 points and three meter segments.
- **Play Again**, **Pause**, and explicit **Resume** remained functional. The browser reported no game-origin warning or error after browser-extension noise was excluded.

### Recognition test still needed

Show Level 1 and Level 2 to first-time players without naming the changes. Ask what moved, what remained behind, whether a drawer appears open, and what time or mood the window suggests. Record whether they independently notice the fallen paper, leftover tape, open drawer, and blue-to-pink sky.

## Persistent inverse-medal check

**Recorded:** November 20, 2026  
**Status:** Implementation and browser checks passed; first-time recognition testing remains

### Actual implementation evidence

- The active Level 2 medal and decorative Level 3 medal both measured 31.2 × 31.2 pixels at desktop size and shared the exact position `x: 724.13`, `y: 276`. Both used grid row 7, column 13 and the same far-plane translation.
- Level 3 recolored the medal with muted cyan, lavender, and navy while preserving its circle, star, and two-ribbon proportions. The larger white rabbit remained visually distinct as the active memory.
- The Level 3 medal is hidden from accessibility, has no memory-item attribute, ignores pointer events, and sits below the interactive rabbit in the layer order.
- Holding on the recovered medal for 1.6 seconds moved the general room cursor to its cell but left the phase playing and the score at 20. Recovering the rabbit still completed the game at 30 points and three meter segments.
- At 390 pixels, the inverse medal remained visible at about 18 × 18 pixels, the page kept equal 390-pixel client and scroll widths, and no horizontal overflow appeared.
- **Play Again** restored Level 1 at 0 points and hid the recovered medal.

### Recognition test still needed

Show the Level 2 and Level 3 medal states to first-time players. Ask whether they recognize the inverse object as the same recovered medal and whether the white rabbit still reads as the only object they need to find.
