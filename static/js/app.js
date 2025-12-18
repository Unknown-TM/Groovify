// Groovify Music Player Logic

let queue = [];
let currentIndex = -1;
let selectedSource = "youtube"; // Current active source for NEW searches
let history = [];      // array of previously played songs
let repeatMode = "none"; // "none", "one", "infinite"
let shuffleMode = false;
let favoritesList = []; // Track current favorites

const player = document.getElementById("player");

// Audio player event listeners
player.addEventListener('play', () => {
  updatePlayPauseButton(true);
});

player.addEventListener('pause', () => {
  updatePlayPauseButton(false);
});

player.addEventListener('error', (e) => {
  console.error("Audio player error:", e);
  alert("Error playing this track. It might be unavailable or restricted.");
  updatePlayPauseButton(false);
});

player.addEventListener('ended', () => {
  if (repeatMode === "one") {
    player.currentTime = 0;
    player.play();
  } else if (repeatMode === "infinite") {
    nextTrack();
  } else if (currentIndex < queue.length - 1) {
    nextTrack();
  } else {
    updatePlayPauseButton(false);
  }
});

player.addEventListener('timeupdate', () => {
  updateProgressBar();
});

player.addEventListener('loadedmetadata', () => {
  updateTotalTime();
});

player.addEventListener('volumechange', () => {
  updateVolumeDisplay();
});

// Category definition for logic
const categories = {
  home: { query: 'trending music', icon: 'home' },
  explore: { query: 'new music', icon: 'compass' },
  rock: { query: 'rock music', icon: 'guitar' },
  pop: { query: 'pop music', icon: 'music-2' },
  jazz: { query: 'jazz music', icon: 'trumpet' },
  classical: { query: 'classical music', icon: 'mic-2' },
  electronic: { query: 'electronic music', icon: 'speaker' },
  favorites: { query: 'favorites', icon: 'heart' }
};

// Initialize favorites list when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadFavorites();
  // Set initial category active
  selectCategory('home');
});

// Global function for category selection
async function selectCategory(category) {
  // Update sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  // Update category cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.classList.remove('active');
  });

  // Activate selected items
  document.querySelectorAll(`[data-nav="${category}"]`).forEach(item => {
    item.classList.add('active');
  });

  const categoryCard = document.querySelector(`[data-category="${category}"]`);
  if (categoryCard) categoryCard.classList.add('active');

  // Handle category logic
  if (category === 'favorites') {
    await showFavorites();
  } else {
    await autoSearchCategory(category);
  }
}

async function autoSearchCategory(category) {
  const categoryInfo = categories[category];
  const searchInput = document.getElementById('q');

  if (!categoryInfo) return;

  searchInput.value = "";
  searchInput.placeholder = `Exploring ${category}...`;

  const titleEl = document.getElementById("results-title");
  titleEl.innerHTML = `<i data-lucide="${categoryInfo.icon}"></i> ${category.charAt(0).toUpperCase() + category.slice(1)} Music`;

  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: categoryInfo.query, source: selectedSource })
    });

    const data = await res.json();
    if (data.results && data.results.length > 0) {
      // Store the source on each result object
      data.results.forEach(r => r.source = selectedSource);
      displaySearchResults(data.results, categoryInfo.query, `<i data-lucide="${categoryInfo.icon}"></i> ${category.charAt(0).toUpperCase() + category.slice(1)} Music`);
    }
  } catch (error) {
    console.error("Category search error:", error);
  }
}

function selectSource(source) {
  selectedSource = source;
  document.querySelectorAll('.source-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`${source}-btn`);
  if (activeBtn) activeBtn.classList.add('active');

  const query = document.getElementById("q").value;
  if (query && query.length > 2) {
    search();
  }
}

async function search() {
  const query = document.getElementById("q").value;
  if (!query) return;

  const titleEl = document.getElementById("results-title");
  titleEl.textContent = `Searching for "${query}"...`;

  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, source: selectedSource })
    });
    const data = await res.json();
    if (data.results) {
      // Store source on results
      data.results.forEach(r => r.source = selectedSource);
      displaySearchResults(data.results, query);
    }
  } catch (err) {
    console.error(err);
    titleEl.textContent = "Search failed. Please try again.";
  }
}

function handleSearchKeypress(e) {
  if (e.key === 'Enter') search();
}

function handleSearchInput(e) { }

function displaySearchResults(results, query, customTitle = null) {
  const el = document.getElementById("results");
  const titleEl = document.getElementById("results-title");

  if (customTitle) {
    titleEl.innerHTML = customTitle;
  } else {
    titleEl.textContent = `Search Results for "${query}"`;
  }
  el.innerHTML = "";
  queue = results;
  currentIndex = -1;

  results.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "result-card fade-in";
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="result-thumbnail-container" onclick="playAtIndex(${i})">
        <img class="result-thumbnail" src="${r.thumbnail || ''}" alt="${r.title}" />
        <div class="thumbnail-overlay">
          <div class="play-icon-overlay">
            <i data-lucide="play" fill="currentColor"></i>
          </div>
        </div>
      </div>
      <div class="result-info">
        <div class="result-title" onclick="playAtIndex(${i})">${r.title}</div>
        <div class="result-artist">${r.uploader || 'Unknown Artist'} • ${formatDuration(r.duration)}</div>
        <div class="result-actions">
          <button class="star-border" onclick="playAtIndex(${i})">
            <div class="star-border-content"><i data-lucide="play"></i> Play</div>
          </button>
          <button class="star-border" onclick="addFav('${r.id}')">
            <div class="star-border-content" id="fav-btn-${r.id}">
              <i data-lucide="heart"></i>
            </div>
          </button>
        </div>
      </div>
    `;
    el.appendChild(card);
  });

  setTimeout(() => {
    updateFavoriteButtons();
    if (window.lucide) lucide.createIcons();
  }, 100);
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function playAtIndex(i) {
  currentIndex = i;
  const song = queue[currentIndex];
  if (!song) return;

  const bar = document.getElementById("now-playing");
  bar.style.display = "flex";

  document.getElementById("now-playing-title").textContent = song.title;
  document.getElementById("now-playing-artist").textContent = song.uploader || 'Unknown Artist';
  document.getElementById("now-playing-thumb").src = song.thumbnail || '';

  addToHistory(song);

  try {
    // Show a loading state or just try to play
    console.log("Fetching stream for:", song.title, "Source:", song.source);

    const res = await fetch("/api/stream", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: song.id,
        url: song.url || song.webpage_url,
        source: song.source || selectedSource
      })
    });

    if (!res.ok) throw new Error("Stream fetch failed");

    const data = await res.json();
    if (data.stream_url) {
      player.src = data.stream_url;
      const playPromise = player.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          alert("Auto-play was blocked or failed. Please click the play button manually.");
        });
      }
    } else {
      throw new Error("No stream URL in response");
    }
  } catch (err) {
    console.error("Play error:", err);
    alert("Streaming error: " + err.message);
  }
}

function togglePlayPause() {
  if (player.paused) {
    const playPromise = player.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => console.error("Play failed:", err));
    }
  } else {
    player.pause();
  }
}

function updatePlayPauseButton(isPlaying) {
  const btn = document.getElementById("play-pause-btn");
  const bar = document.getElementById("now-playing");

  if (isPlaying) {
    if (btn) btn.setAttribute('data-lucide', 'pause');
    if (bar) bar.classList.add('playing');
  } else {
    if (btn) btn.setAttribute('data-lucide', 'play');
    if (bar) bar.classList.remove('playing');
  }
  if (window.lucide) lucide.createIcons();
}

function nextTrack() {
  if (shuffleMode && queue.length > 1) {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * queue.length);
    } while (nextIndex === currentIndex);
    playAtIndex(nextIndex);
  } else if (currentIndex < queue.length - 1) {
    playAtIndex(currentIndex + 1);
  } else if (repeatMode === "infinite" && queue.length > 0) {
    playAtIndex(0);
  }
}

function prevTrack() {
  if (currentIndex > 0) playAtIndex(currentIndex - 1);
}

function toggleShuffle() {
  shuffleMode = !shuffleMode;
  const shuffleBtn = document.getElementById("shuffle-btn");
  if (shuffleBtn) {
    shuffleBtn.style.color = shuffleMode ? "var(--primary)" : "";
    shuffleBtn.title = shuffleMode ? "Shuffle On" : "Shuffle Off";
  }
}

function toggleRepeat() {
  const repeatBtn = document.getElementById("repeat-btn");
  if (!repeatBtn) return;

  if (repeatMode === "none") {
    repeatMode = "one";
    repeatBtn.setAttribute('data-lucide', 'repeat-1');
    repeatBtn.style.color = "var(--primary)";
  } else if (repeatMode === "one") {
    repeatMode = "infinite";
    repeatBtn.setAttribute('data-lucide', 'repeat');
    repeatBtn.style.color = "var(--primary)";
  } else {
    repeatMode = "none";
    repeatBtn.setAttribute('data-lucide', 'repeat');
    repeatBtn.style.color = "";
  }
  if (window.lucide) lucide.createIcons();
}

function updateProgressBar() {
  if (player.duration) {
    const progress = (player.currentTime / player.duration) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('current-time').textContent = formatDuration(player.currentTime);
  }
}

function updateTotalTime() {
  if (player.duration) {
    document.getElementById('total-time').textContent = formatDuration(player.duration);
  }
}

function seekTo(event) {
  const progressBar = event.currentTarget;
  const rect = progressBar.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  const seekTime = (clickX / width) * player.duration;
  player.currentTime = seekTime;
}

function setVolume(event) {
  const slider = event.currentTarget;
  const rect = slider.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  const volume = Math.max(0, Math.min(1, clickX / width));
  player.volume = volume;
  updateVolumeDisplay();
}

function updateVolumeDisplay() {
  const fill = document.getElementById('volume-fill');
  if (fill) fill.style.width = (player.volume * 100) + '%';
}

async function loadFavorites() {
  try {
    const res = await fetch("/api/favorites");
    const data = await res.json();
    favoritesList = data.favorites || [];
    // If favorites have no source, assume youtube as default for legacy
    favoritesList.forEach(f => { if (!f.source) f.source = 'youtube'; });
  } catch (err) {
    console.error("Load favorites error:", err);
  }
}

async function addFav(id) {
  const song = queue.find(s => s.id === id);
  if (!song) return;
  try {
    await fetch("/api/favorites", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song)
    });
    await loadFavorites();
    updateFavoriteButtons();
  } catch (err) {
    console.error(err);
  }
}

async function removeFav(id) {
  try {
    await fetch(`/api/favorites/${id}`, { method: "DELETE" });
    await loadFavorites();
    updateFavoriteButtons();
    if (document.getElementById("results-title").innerHTML.includes("heart")) {
      showFavorites();
    }
  } catch (err) {
    console.error(err);
  }
}

function updateFavoriteButtons() {
  const allFavButtons = document.querySelectorAll('[id^="fav-btn-"]');
  allFavButtons.forEach(btn => {
    const id = btn.id.replace('fav-btn-', '');
    const isFav = favoritesList.some(f => f.id === id);
    const icon = btn.querySelector('i');
    if (icon) {
      if (isFav) {
        icon.setAttribute('fill', 'var(--primary)');
        btn.style.color = "var(--primary)";
      } else {
        icon.removeAttribute('fill');
        btn.style.color = "";
      }
    }
  });
  if (window.lucide) lucide.createIcons();
}

async function showFavorites() {
  const titleEl = document.getElementById("results-title");
  const el = document.getElementById("results");
  titleEl.innerHTML = `<i data-lucide="heart"></i> Favorite Songs`;
  el.innerHTML = "";
  if (favoritesList.length === 0) {
    el.innerHTML = "<p class='text-muted text-center'>No favorites yet.</p>";
    return;
  }
  queue = favoritesList;
  currentIndex = -1;
  favoritesList.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "result-card fade-in";
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="result-thumbnail-container" onclick="playAtIndex(${i})">
        <img class="result-thumbnail" src="${r.thumbnail || ''}" alt="${r.title}" />
        <div class="thumbnail-overlay">
          <div class="play-icon-overlay"><i data-lucide="play" fill="currentColor"></i></div>
        </div>
      </div>
      <div class="result-info">
        <div class="result-title" onclick="playAtIndex(${i})">${r.title}</div>
        <div class="result-artist">${r.uploader || 'Unknown Artist'} • ${formatDuration(r.duration)}</div>
        <div class="result-actions">
          <button class="star-border" onclick="playAtIndex(${i})">
            <div class="star-border-content"><i data-lucide="play"></i> Play</div>
          </button>
          <button class="star-border" onclick="removeFav('${r.id}')">
            <div class="star-border-content" id="fav-btn-${r.id}"><i data-lucide="heart" fill="var(--primary)"></i></div>
          </button>
        </div>
      </div>
    `;
    el.appendChild(card);
  });
  if (window.lucide) lucide.createIcons();
}

function addToHistory(song) {
  const existingIndex = history.findIndex(s => s.id === song.id);
  if (existingIndex > -1) history.splice(existingIndex, 1);
  history.unshift({ ...song, playedAt: new Date() });
  if (history.length > 50) history.pop();
}

function showHistory() {
  const titleEl = document.getElementById("results-title");
  const el = document.getElementById("results");
  titleEl.innerHTML = `<i data-lucide="history"></i> Recently Played`;
  el.innerHTML = "";
  if (history.length === 0) {
    el.innerHTML = "<p class='text-muted text-center'>Your history is empty.</p>";
    return;
  }
  queue = history;
  currentIndex = -1;
  history.forEach((song, i) => {
    const card = document.createElement("div");
    card.className = "result-card fade-in";
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="result-thumbnail-container" onclick="playAtIndex(${i})">
        <img class="result-thumbnail" src="${song.thumbnail || ''}" alt="${song.title}" />
        <div class="thumbnail-overlay">
          <div class="play-icon-overlay"><i data-lucide="play" fill="currentColor"></i></div>
        </div>
      </div>
      <div class="result-info">
        <div class="result-title" onclick="playAtIndex(${i})">${song.title}</div>
        <div class="result-artist">${song.uploader || 'Unknown Artist'} • ${formatDuration(song.duration)}</div>
        <div class="result-actions">
          <button class="star-border" onclick="playAtIndex(${i})">
            <div class="star-border-content"><i data-lucide="play"></i> Play</div>
          </button>
          <button class="star-border" onclick="addFav('${song.id}')">
            <div class="star-border-content" id="fav-btn-${song.id}"><i data-lucide="heart"></i></div>
          </button>
        </div>
      </div>
    `;
    el.appendChild(card);
  });
  updateFavoriteButtons();
  if (window.lucide) lucide.createIcons();
}

async function showPlaylists() {
  const titleEl = document.getElementById("results-title");
  const el = document.getElementById("results");
  titleEl.innerHTML = `<i data-lucide="list-music"></i> Your Playlists`;
  el.innerHTML = "<p class='text-muted text-center'>Coming soon!</p>";
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('open');
}
