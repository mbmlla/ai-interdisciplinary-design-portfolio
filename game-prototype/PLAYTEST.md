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
