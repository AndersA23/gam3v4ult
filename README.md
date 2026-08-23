# Gam3V4ult - Game Discovery & Backlog Tracker

A responsive single-page web app built with vanilla JavaScript that pulls live data from the RAWG Video Games Database API. Users can browse popular titles, search for specific games, filter by platform/genre, view system requirements, and save games to a local backlog that persists across sessions.

---

## Live Demo
* **Live Site:** `https://andersa23.github.io/gam3v4ult/` (or repository link)
* **Portfolio Integration:** Linked under the Featured Projects section on my main portfolio site.

---

## Features
* **Asynchronous REST API:** Fetches real-time game info (ratings, release dates, screenshots, genres) using `fetch()` and `async/await`.
* **Search & Debouncing:** Includes a live search bar that debounces user input to avoid spamming the RAWG API endpoints on every keystroke.
* **Platform & Genre Filters:** Query filters for PC, PS5, Xbox Series X, Switch, and major genres.
* **Modal Details View:** Clicking a game card opens a modal overlay displaying descriptions, ratings, and PC hardware requirements.
* **Local Persistence:** Backlog functionality powered by the `localStorage` API so saved games persist across browser reloads.
* **Responsive Dark UI:** Mobile-first layout using CSS Grid and Flexbox with responsive breakpoints for phone, tablet, and desktop screens.

---

## Tech Stack
* **HTML5:** Semantic markup and modal dialog structure.
* **CSS3:** Flexbox, Grid layout, CSS custom variables, and dark theme styling.
* **JavaScript (ES6):** Async/await `fetch()`, dynamic DOM rendering, event handling, and LocalStorage state management.
* **API:** [RAWG Video Games Database API](https://rawg.io/apidocs).
* **Deployment:** Hosted directly on GitHub Pages.

---

## Setup & Running Locally
1. Clone this repository:
   ```bash
   git clone [https://github.com/AndersA23/gam3v4ult.git](https://github.com/AndersA23/gam3v4ult.git)
