# MIDNIGHT DETECTIVE AGENCY: Detective Casebook

A browser-based mystery game. Pure HTML, CSS and JavaScript. No build step, no dependencies.

## Run it (needs Node.js 18+, no `npm install` required)
Open the folder in VS Code, open the terminal (Ctrl+`) and run:
```
npm run dev       # development: auto-reloads the browser when you save a file
npm run server    # plain server (also: npm start)
```
Then visit http://localhost:5177. If 5177 is busy it automatically tries 5178, 5179... To pick one yourself: `PORT=4000 npm run dev` (macOS/Linux) or `set PORT=4000 && npm run dev` (Windows cmd).

No Node? Double-click `index.html`, or use the Live Server extension.

## Structure
```
server.js           tiny Node web server (+ live reload in dev)
package.json        npm scripts
index.html          page shell, loads the scripts
css/style.css       look, layout and ALL animations
js/cases.js         case data (suspects, clues, answers)
js/art.js           animated SVG scenes and suspect portraits
js/game.js          game engine: state, screens, scoring
docs/USER_GUIDE.md  how to play
docs/CODE_STUDY_GUIDE.md  how the code works + interview prep
```
Internet is only needed for the Google Fonts; the game falls back to system fonts offline.
