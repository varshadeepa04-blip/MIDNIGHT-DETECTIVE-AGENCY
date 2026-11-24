# Code Study Guide: understand it, own it

Read the files in this order. Each section says what to look for and what to try changing.

## 1. The big idea (say this in interviews)
> "It is a single-page app with no framework. All game state lives in one object `S`. A `render()` function rebuilds the screen from that state, and click handlers only modify the state and call `render()` again."

This is the same idea as React (UI = function of state), implemented by hand.

## 2. `index.html`
Loads CSS, then three scripts **in order**: `cases.js` (defines `CASES`), `art.js` (defines `scene`, `avatar`), `game.js` (uses both). Scripts share global variables, so order matters. Try: swap two script tags and read the console error.

## 2b. `server.js` and `package.json`
`package.json` defines `npm run dev` / `npm run server`, which just run `node server.js` (with `--dev` for live reload).
`server.js` uses only Node's built-in `http`, `fs` and `path`: it maps a URL to a file, sets the right `Content-Type`, and returns 404 for missing files. It also blocks `../` path traversal (a real security concern).
In dev mode it watches files with `fs.watch` and tells the browser to reload through **Server-Sent Events** (a one-way, long-lived HTTP connection).
**Exercise:** change the 404 response to send a custom page, or add `.woff2` to the `TYPES` map.

## 3. `js/cases.js`: data separated from logic
`CASES` is an array of objects. Clues are tuples `[label, text, isKey]`. `cul` is the index of the culprit in `sus`.
**Why it matters:** adding a case needs zero code changes. That is the *data-driven design* principle.
**Exercise:** add a 6th case (copy one, change the text).

## 4. `js/art.js`: generated SVG
`scene(theme)` returns an SVG string. It picks gradient colours, adds theme extras (lamp, sun, train windows, rain), and a detective figure. `avatar(i)` uses `i % 3` to vary skin, hair and hat.
Animation is **not** here. It is CSS classes (`drift`, `rain`, `blink` ...) in `style.css`.
**Exercise:** add a 5th theme "snow" with falling circles.

## 5. `css/style.css`
- **Custom properties** (`--paper`, `--string`) hold the palette. Dark mode just redefines them inside `@media (prefers-color-scheme: dark)`.
- **Animations:** every `@keyframes` block at the bottom drives one effect. `animation-delay` staggers raindrops.
- `prefers-reduced-motion` turns animation off for accessibility.
- **Grid** (`.cases`, `.board`) does the responsive layout.

## 6. `js/game.js`: the engine
| Part | What it does | Concept |
|---|---|---|
| `S` | the single state object | state management |
| `VIEWS[]` | array of functions returning HTML strings, one per screen | template literals, view = f(state) |
| `render()` | writes HTML, updates the progress bar, runs after-render effects | rendering pipeline |
| `ACT{}` + one `click` listener | handlers looked up by `data-a` attribute | event delegation, dispatch table |
| `lookup(id)` | regex parses ids like `s2_0` back to clue data | regex, encoding |
| `acc()` | scoring formula | pure logic you can unit-test |
| `drawStrings()` | measures DOM boxes with `getBoundingClientRect` and draws SVG Bezier curves | DOM geometry |
| `typewriter()` | recursive `setTimeout` | async timing |
| `load/save` | `localStorage` with try/catch | persistence |

**Trace one click** (best way to learn): click an *Examine* button -> the `click` listener finds `data-a="ex"` -> `ACT.ex("l0_1")` -> `lookup()` returns clue data -> stored in `S.found`, `S.used++` -> `render()` -> `VIEWS[3]()` now shows the clue as a note instead of a button.

## 7. Experiments to prove you understand it
1. Change `acts` on a case to 5 and play. Does it still work?
2. Change scoring so a wrong accusation loses stars.
3. Make `S.done` store the best score, not just stars.
4. Add a timer that ends the case after 5 minutes.
5. Move `render()` output to `textContent`/DOM nodes instead of `innerHTML` (and think about why: XSS).

## 8. Likely interview questions
- **Why no framework?** To show I understand the fundamentals; I'd move to React for a bigger app.
- **How would you scale it?** Fetch cases from a JSON API, add a Node/Express backend, store scores in a database, add a leaderboard.
- **How would you test it?** Extract scoring into a pure function and unit-test it with Jest.
- **Any security concern?** `innerHTML` with untrusted data is XSS-prone. Here data is static, but with user-created cases I would sanitize.
- **What did you use AI for?** Be honest: scaffolding and content drafting. Then explain a function from section 6 in your own words, which this guide prepares you to do.

## 9. Possible upgrades (good resume bullets)
More cases, sound effects, difficulty timer, React/TypeScript port, Express + MongoDB leaderboard, case editor, automated tests, deployment on GitHub Pages or Netlify.
