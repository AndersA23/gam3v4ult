
const RAWG_API_KEY = "baa7501ac8ba4cb988e4e384f7702f26";
const BASE_URL = "https://api.rawg.io/api";

// App State
let currentGames = [];
let backlog = JSON.parse(localStorage.getItem("gam3v4ult_backlog")) || [];
let activeView = "discover"; // 'discover' or 'backlog'
let searchTimeout = null;

// DOM Elements
const gamesGrid = document.getElementById("games-grid");
const searchInput = document.getElementById("search-input");
const genreSelect = document.getElementById("genre-select");
const platformSelect = document.getElementById("platform-select");
const sectionHeading = document.getElementById("section-heading");
const statusContainer = document.getElementById("status-container");
const statusMessage = document.getElementById("status-message");
const backlogCount = document.getElementById("backlog-count");
const viewAllBtn = document.getElementById("view-all-btn");
const viewBacklogBtn = document.getElementById("view-backlog-btn");
const modal = document.getElementById("game-modal");
const modalBody = document.getElementById("modal-body");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalOverlay = document.getElementById("modal-overlay");

// Init
document.addEventListener("DOMContentLoaded", () => {
  updateBacklogBadge();
  fetchGames();
  setupEventListeners();
});

function setupEventListeners() {
  // Search with debounce to prevent API spamming
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (activeView === "discover") {
        fetchGames();
      } else {
        filterBacklogLocal();
      }
    }, 400);
  });

  // Filter dropdowns
  genreSelect.addEventListener("change", () => {
    if (activeView === "discover") fetchGames();
  });

  platformSelect.addEventListener("change", () => {
    if (activeView === "discover") fetchGames();
  });

  // Navigation views
  viewAllBtn.addEventListener("click", () => switchView("discover"));
  viewBacklogBtn.addEventListener("click", () => switchView("backlog"));

  // Modal close handlers
  modalCloseBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });
}

// Fetch games from RAWG API
async function fetchGames() {
  showStatus("Loading games...");
  
  const query = searchInput.value.trim();
  const genre = genreSelect.value;
  const platform = platformSelect.value;

  let url = `${BASE_URL}/games?key=${RAWG_API_KEY}&page_size=15`;
  if (query) url += `&search=${encodeURIComponent(query)}`;
  if (genre) url += `&genres=${genre}`;
  if (platform) url += `&platforms=${platform}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    currentGames = data.results || [];

    if (currentGames.length === 0) {
      showStatus("No games found matching your criteria.");
      gamesGrid.innerHTML = "";
    } else {
      hideStatus();
      sectionHeading.textContent = query ? `Search Results for "${query}"` : "Discover Games";
      renderGames(currentGames);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    showStatus("Failed to load games. Check your network or API key.");
    gamesGrid.innerHTML = "";
  }
}

// Render game cards to grid
function renderGames(games) {
  gamesGrid.innerHTML = "";

  games.forEach((game) => {
    const isSaved = backlog.some((item) => item.id === game.id);
    const scoreClass = getScoreClass(game.metacritic);
    const imageSrc = game.background_image || "https://placehold.co/600x400/182234/94a3b8?text=No+Image";

    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${imageSrc}" alt="${game.name}" loading="lazy" />
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-genres">${game.genres?.map(g => g.name).slice(0, 2).join(", ") || "General"}</span>
          ${game.metacritic ? `<span class="score-badge ${scoreClass}">${game.metacritic}</span>` : ""}
        </div>
        <h3 class="card-title">${game.name}</h3>
        <p class="card-release">Released: ${game.released || "TBA"}</p>
        <div class="card-actions">
          <button class="card-btn btn-details" onclick="openGameModal(${game.id})">Details</button>
          <button class="card-btn btn-backlog ${isSaved ? "saved" : ""}" onclick="toggleBacklog(${game.id})">
            ${isSaved ? "Saved" : "+ Backlog"}
          </button>
        </div>
      </div>
    `;
    gamesGrid.appendChild(card);
  });
}

// Fetch single game details for modal overlay
async function openGameModal(id) {
  modalBody.innerHTML = "<p>Loading specs and details...</p>";
  modal.classList.remove("hidden");

  try {
    const res = await fetch(`${BASE_URL}/games/${id}?key=${RAWG_API_KEY}`);
    const game = await res.json();

    const pcPlatform = game.platforms?.find(p => p.platform.id === 4);
    const minSpecs = pcPlatform?.requirements?.minimum || "No specific PC minimum requirements listed.";
    const recSpecs = pcPlatform?.requirements?.recommended || "No specific recommended specs listed.";

    modalBody.innerHTML = `
      <h2 style="font-size: 1.4rem; margin-bottom: 0.5rem;">${game.name}</h2>
      <p style="color: var(--text-secondary); margin-bottom: 1rem;">
        Developer: ${game.developers?.map(d => d.name).join(", ") || "Unknown"} | 
        Rating: ${game.rating || "N/A"} / 5
      </p>
      <img src="${game.background_image || ""}" alt="${game.name}" style="width:100%; border-radius: var(--radius); margin-bottom: 1rem;" />
      <div style="margin-bottom: 1rem; font-size: 0.95rem; max-height: 150px; overflow-y: auto;">
        ${game.description_raw ? `<p>${game.description_raw.slice(0, 400)}...</p>` : "<p>No description available.</p>"}
      </div>
      <hr style="border-color: var(--border); margin-bottom: 1rem;" />
      <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: var(--accent);">PC Requirements</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;"><strong>Min:</strong> ${minSpecs}</p>
      <p style="font-size: 0.85rem; color: var(--text-secondary);"><strong>Rec:</strong> ${recSpecs}</p>
    `;
  } catch (err) {
    modalBody.innerHTML = "<p>Failed to load game details.</p>";
  }
}

function closeModal() {
  modal.classList.add("hidden");
}

// Backlog / LocalStorage management
function toggleBacklog(gameId) {
  const existingIndex = backlog.findIndex((g) => g.id === gameId);

  if (existingIndex > -1) {
    backlog.splice(existingIndex, 1);
  } else {
    const gameToAdd = currentGames.find((g) => g.id === gameId);
    if (gameToAdd) {
      backlog.push(gameToAdd);
    }
  }

  localStorage.setItem("gam3v4ult_backlog", JSON.stringify(backlog));
  updateBacklogBadge();

  if (activeView === "backlog") {
    renderGames(backlog);
  } else {
    renderGames(currentGames);
  }
}

function switchView(view) {
  activeView = view;
  if (view === "discover") {
    viewAllBtn.classList.add("active");
    viewBacklogBtn.classList.remove("active");
    document.getElementById("controls-section").classList.remove("hidden");
    fetchGames();
  } else {
    viewBacklogBtn.classList.add("active");
    viewAllBtn.classList.remove("active");
    document.getElementById("controls-section").classList.add("hidden");
    sectionHeading.textContent = "My Backlog";
    hideStatus();
    
    if (backlog.length === 0) {
      showStatus("Your backlog is empty. Add some games from the Discover tab!");
      gamesGrid.innerHTML = "";
    } else {
      renderGames(backlog);
    }
  }
}

function updateBacklogBadge() {
  backlogCount.textContent = backlog.length;
}

function getScoreClass(score) {
  if (!score) return "";
  if (score >= 75) return "score-high";
  if (score >= 50) return "score-med";
  return "score-low";
}

function showStatus(msg) {
  statusContainer.classList.remove("hidden");
  statusMessage.textContent = msg;
}

function hideStatus() {
  statusContainer.classList.add("hidden");
}