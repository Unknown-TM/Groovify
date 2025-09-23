// ==================== SPARKLES SYSTEM ====================
class SparklesManager {
  constructor() {
    this.container = document.getElementById('sparkles-container');
    this.sparkles = [];
    this.maxSparkles = 50; // Performance limit
    this.sparkleTypes = ['normal', 'large', 'small', 'colorful', 'twinkle'];
    this.isActive = true;
    this.init();
  }

  init() {
    // Create initial sparkles
    this.createSparkles();
    
    // Add mouse interaction
    this.addMouseInteraction();
    
    // Performance monitoring
    this.monitorPerformance();
  }

  createSparkles() {
    for (let i = 0; i < this.maxSparkles; i++) {
      this.createSparkle();
    }
  }

  createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    
    // Random type
    const type = this.sparkleTypes[Math.floor(Math.random() * this.sparkleTypes.length)];
    if (type !== 'normal') {
      sparkle.classList.add(type);
    }
    
    // Random position
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.animationDelay = Math.random() * 8 + 's';
    sparkle.style.animationDuration = (6 + Math.random() * 4) + 's';
    
    this.container.appendChild(sparkle);
    this.sparkles.push(sparkle);
    
    // Remove sparkle after animation completes
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
        const index = this.sparkles.indexOf(sparkle);
        if (index > -1) {
          this.sparkles.splice(index, 1);
        }
      }
    }, 10000);
  }

  addMouseInteraction() {
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Create sparkles near mouse
      if (Math.random() < 0.1) { // 10% chance
        this.createMouseSparkle(mouseX, mouseY);
      }
    });
    
    document.addEventListener('click', (e) => {
      this.createClickSparkles(e.clientX, e.clientY);
    });
  }

  createMouseSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle twinkle';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.animationDuration = '2s';
    sparkle.style.animation = 'sparkleTwinkle 2s ease-out forwards';
    
    this.container.appendChild(sparkle);
    
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
    }, 2000);
  }

  createClickSparkles(x, y) {
    for (let i = 0; i < 5; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle colorful';
      sparkle.style.left = (x + (Math.random() - 0.5) * 100) + 'px';
      sparkle.style.top = (y + (Math.random() - 0.5) * 100) + 'px';
      sparkle.style.animationDuration = '1s';
      sparkle.style.animation = 'sparkleTwinkle 1s ease-out forwards';
      
      this.container.appendChild(sparkle);
      
      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      }, 1000);
    }
  }

  monitorPerformance() {
    // Continuously create new sparkles to maintain the effect
    setInterval(() => {
      if (this.sparkles.length < this.maxSparkles && this.isActive) {
        this.createSparkle();
      }
    }, 200);
    
    // Performance check - reduce sparkles if needed
    setInterval(() => {
      if (performance.now() > 100) { // If frame time > 100ms
        this.maxSparkles = Math.max(20, this.maxSparkles - 5);
      } else if (this.maxSparkles < 50) {
        this.maxSparkles = Math.min(50, this.maxSparkles + 1);
      }
    }, 5000);
  }

  toggle() {
    this.isActive = !this.isActive;
    if (!this.isActive) {
      this.sparkles.forEach(sparkle => {
        if (sparkle.parentNode) {
          sparkle.parentNode.removeChild(sparkle);
        }
      });
      this.sparkles = [];
    } else {
      this.createSparkles();
    }
  }

  setDensity(density) {
    this.maxSparkles = Math.max(10, Math.min(100, density));
  }
}

// Initialize sparkles manager
const sparklesManager = new SparklesManager();

// ==================== INTERACTIVE SELECTOR SYSTEM ====================
class MusicSelector {
  constructor() {
    this.currentCategory = 'rock';
    this.categories = {
      rock: { query: 'rock music', icon: '🎸', color: '#ff6b6b' },
      pop: { query: 'pop music', icon: '🎵', color: '#4ecdc4' },
      jazz: { query: 'jazz music', icon: '🎷', color: '#8b5cf6' },
      classical: { query: 'classical music', icon: '🎼', color: '#f59e0b' },
      electronic: { query: 'electronic music', icon: '🎛️', color: '#06b6d4' },
      favorites: { query: 'favorites', icon: '❤️', color: '#ef4444' }
    };
    this.init();
  }

  init() {
    // Add animation delays to options
    const options = document.querySelectorAll('.selector-option');
    options.forEach((option, index) => {
      option.style.animationDelay = `${index * 0.1}s`;
      option.style.opacity = '0';
      option.style.transform = 'translateX(-60px)';
      
      setTimeout(() => {
        option.style.transition = 'all 0.7s ease-in-out';
        option.style.opacity = '1';
        option.style.transform = 'translateX(0)';
      }, index * 100);
    });
  }

  selectCategory(category) {
    if (category === this.currentCategory) return;

    // Update active state
    document.querySelectorAll('.selector-option').forEach(option => {
      option.classList.remove('active');
    });
    
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    this.currentCategory = category;
    
    // Category switched
    const categoryInfo = this.categories[category];
    
    // Handle different category actions
    this.handleCategorySelection(category);
  }

  handleCategorySelection(category) {
    switch (category) {
      case 'favorites':
        showFavorites();
        break;
      default:
        // Auto-search for the selected category
        this.autoSearchCategory(category);
        break;
    }
  }

  async autoSearchCategory(category) {
    const categoryInfo = this.categories[category];
    const searchInput = document.getElementById('q');
    
    // Set search input
    searchInput.value = categoryInfo.query;
    
    try {
      // Perform search
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: categoryInfo.query, source: selectedSource })
      });
      
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        // Update results
        this.displayCategoryResults(data.results, category);
      }
    } catch (error) {
      console.error("Category search error:", error);
    }
  }

  displayCategoryResults(results, category) {
    const el = document.getElementById("results");
    const titleEl = document.getElementById("results-title");
    
    titleEl.textContent = `${this.categories[category].icon} ${category.charAt(0).toUpperCase() + category.slice(1)} Music`;
    el.innerHTML = "";
    
    // Update queue
    queue = results;
    currentIndex = -1;
    
    // Display results
    results.forEach((r, i) => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
        <img class="result-thumbnail" src="${r.thumbnail || ''}" alt="${r.title}" />
        <div class="result-info">
          <div class="result-title">${r.title}</div>
          <div class="result-artist">${r.uploader || 'Unknown Artist'} • ${formatDuration(r.duration)}</div>
          <div class="result-actions">
            <button class="star-border" onclick="playAtIndex(${i})">
              <div class="star-border-content">▶ Play</div>
            </button>
            <button class="star-border" onclick="addFav('${r.id}')">
              <div class="star-border-content">🤍</div>
            </button>
          </div>
        </div>
      `;
      el.appendChild(card);
    });
    
    // Update favorite button states after a short delay to ensure DOM is ready
    setTimeout(updateFavoriteButtons, 100);
  }
}

// Initialize music selector
const musicSelector = new MusicSelector();

// Initialize favorites list when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadFavorites();
});

// Test function for debugging
window.testFavorites = async function() {
  console.log("Testing favorites functionality...");
  console.log("Current favoritesList:", favoritesList);
  console.log("Current selectedSource:", selectedSource);
  
  // Test showFavorites
  await showFavorites();
  
  // Test updateFavoriteButtons
  updateFavoriteButtons();
  
  console.log("Test completed");
};

// Function to ensure favorites state is properly synchronized
async function syncFavoritesState() {
  console.log("Syncing favorites state...");
  try {
    await loadFavorites();
    console.log("Favorites state synced:", favoritesList);
  } catch (error) {
    console.error("Error syncing favorites state:", error);
  }
}

// Global function for category selection
function selectCategory(category) {
  console.log("selectCategory called with:", category);
  
  // Update sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Update category cards
  document.querySelectorAll('.category-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Activate selected items
  const navItem = document.querySelector(`[onclick="selectCategory('${category}')"]`);
  if (navItem) navItem.classList.add('active');
  
  const categoryCard = document.querySelector(`[data-category="${category}"]`);
  if (categoryCard) categoryCard.classList.add('active');
  
  // Sync favorites state before switching categories
  if (category === 'favorites') {
    syncFavoritesState();
  }
  
  // Select category
  musicSelector.selectCategory(category);
}

// Source selection function
function selectSource(source) {
  selectedSource = source;
  
  // Update button states
  document.querySelectorAll('.source-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.getElementById(`${source}-btn`).classList.add('active');
  
  // Update search placeholder
  const searchInput = document.getElementById('q');
  if (source === 'youtube') {
    searchInput.placeholder = 'Search YouTube for songs, artists, or albums';
  } else {
    searchInput.placeholder = 'Search SoundCloud for songs, artists, or albums';
  }
}

// ==================== MUSIC PLAYER ====================
let queue = [];        // current list of songs (array of objects with .id, .title, etc.)
let currentIndex = -1; // current playing index in queue
let repeatMode = "none"; // "none", "one", "infinite"
let shuffleMode = false;
let selectedSource = "youtube"; // "youtube" or "soundcloud"
let history = [];      // array of previously played songs
const player = document.getElementById("player");

// Audio player event listeners
player.addEventListener('play', () => {
  updatePlayPauseButton(true);
});

player.addEventListener('pause', () => {
  updatePlayPauseButton(false);
});

player.addEventListener('ended', () => {
  if (repeatMode === "one") {
    player.currentTime = 0;
    player.play();
  } else if (repeatMode === "infinite" || currentIndex < queue.length - 1) {
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

// Initialize volume
player.volume = 0.7;

// ----------------- History Management -----------------
function loadHistory() {
  try {
    const savedHistory = localStorage.getItem('groovify_history');
    if (savedHistory) {
      history = JSON.parse(savedHistory);
    }
  } catch (error) {
    console.error("Error loading history:", error);
    history = [];
  }
}

function saveHistory() {
  try {
    localStorage.setItem('groovify_history', JSON.stringify(history));
  } catch (error) {
    console.error("Error saving history:", error);
  }
}

function addToHistory(song) {
  // Remove if already exists to avoid duplicates
  history = history.filter(item => item.id !== song.id);
  
  // Add to beginning of history
  history.unshift({
    ...song,
    playedAt: new Date().toISOString()
  });
  
  // Keep only last 100 songs
  if (history.length > 100) {
    history = history.slice(0, 100);
  }
  
  saveHistory();
}

// Load history on page load
loadHistory();

// ----------------- Search -----------------
async function doSearch(){
  const q = document.getElementById("q").value.trim();
  if(!q) return;
  
  try {
  const res = await fetch("/api/search", {
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({query:q, source:selectedSource})
  });
  const data = await res.json();
    
    displaySearchResults(data.results || [], q);
  } catch (error) {
    console.error("Search error:", error);
  }
}

function displaySearchResults(results, query, customTitle = null) {
  const el = document.getElementById("results");
  const titleEl = document.getElementById("results-title");
  
  if (customTitle) {
    titleEl.textContent = customTitle;
  } else {
    titleEl.textContent = `Search Results for "${query}"`;
  }
  el.innerHTML = "";
  
  queue = results; // update queue with search results
  currentIndex = -1;
  
  results.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "result-card fade-in";
    card.style.animationDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <img class="result-thumbnail" src="${r.thumbnail || ''}" alt="${r.title}" />
      <div class="result-info">
        <div class="result-title">${r.title}</div>
        <div class="result-artist">${r.uploader || 'Unknown Artist'} • ${formatDuration(r.duration)}</div>
        <div class="result-actions">
          <button class="star-border" onclick="playAtIndex(${i})">
            <div class="star-border-content">▶ Play</div>
          </button>
          <button class="star-border" onclick="addFav('${r.id}')">
            <div class="star-border-content">🤍</div>
          </button>
        </div>
      </div>
    `;
    el.appendChild(card);
  });
  
  // Update favorite button states after a short delay to ensure DOM is ready
  setTimeout(updateFavoriteButtons, 200);
}

function formatDuration(seconds) {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function handleSearchKeypress(event) {
  if (event.key === 'Enter') {
    doSearch();
    hideSuggestions();
  }
}

function handleSearchInput(event) {
  const query = event.target.value.trim();
  if (query.length > 2) {
    showSearchSuggestions(query);
  } else {
    hideSuggestions();
  }
}

function showSearchSuggestions(query) {
  const suggestions = [
    { text: `${query} - Rock Music`, type: 'Genre' },
    { text: `${query} - Pop Hits`, type: 'Genre' },
    { text: `${query} - Jazz`, type: 'Genre' },
    { text: `${query} - Classical`, type: 'Genre' },
    { text: `${query} - Electronic`, type: 'Genre' }
  ];
  
  const container = document.getElementById('search-suggestions');
  container.innerHTML = '';
  
  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.innerHTML = `
      <div class="suggestion-text">${suggestion.text}</div>
      <div class="suggestion-type">${suggestion.type}</div>
    `;
    item.onclick = () => {
      document.getElementById('q').value = suggestion.text;
      doSearch();
      hideSuggestions();
    };
    container.appendChild(item);
  });
  
  container.style.display = 'block';
}

function hideSuggestions() {
  document.getElementById('search-suggestions').style.display = 'none';
}


// ----------------- Playback -----------------
async function playAtIndex(i){
  if(!Array.isArray(queue) || i < 0 || i >= queue.length) return;
  
  currentIndex = i;
  const song = queue[i];
  
  // Add to history
  addToHistory(song);
  
  // Update now playing bar
  updateNowPlayingBar(song);
  
  // song should be an object with .id, now using source/id format
  player.src = `/stream/${selectedSource}/${encodeURIComponent(song.id)}`;
  try {
    await player.play();
    updatePlayPauseButton(true);
  } catch(e) {
    console.warn("play failed:", e);
  }
}

function updateNowPlayingBar(song) {
  const nowPlaying = document.getElementById("now-playing");
  const thumb = document.getElementById("now-playing-thumb");
  const title = document.getElementById("now-playing-title");
  const artist = document.getElementById("now-playing-artist");
  
  if (song) {
    thumb.src = song.thumbnail || '';
    thumb.alt = song.title;
    title.textContent = song.title;
    artist.textContent = song.uploader || 'Unknown Artist';
    nowPlaying.style.display = 'flex';
  } else {
    nowPlaying.style.display = 'none';
  }
}

function updatePlayPauseButton(isPlaying) {
  const btn = document.getElementById("play-pause-btn");
  btn.textContent = isPlaying ? "⏸" : "▶";
}

function togglePlayPause() {
  if (player.paused) {
    player.play();
    updatePlayPauseButton(true);
  } else {
    player.pause();
    updatePlayPauseButton(false);
  }
}

function toggleShuffle() {
  shuffleMode = !shuffleMode;
  const shuffleBtn = document.getElementById("shuffle-btn");
  shuffleBtn.style.color = shuffleMode ? "#ff0000" : "";
  shuffleBtn.title = shuffleMode ? "Shuffle On" : "Shuffle Off";
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
  const percentage = clickX / width;
  
  if (player.duration) {
    player.currentTime = player.duration * percentage;
  }
}

function setVolume(event) {
  const volumeSlider = event.currentTarget;
  const rect = volumeSlider.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  const percentage = Math.max(0, Math.min(1, clickX / width));
  
  player.volume = percentage;
  updateVolumeDisplay();
}

function updateVolumeDisplay() {
  const volumeFill = document.getElementById('volume-fill');
  volumeFill.style.width = (player.volume * 100) + '%';
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
  if (event.target.tagName === 'INPUT') return;
  
  switch(event.code) {
    case 'Space':
      event.preventDefault();
      togglePlayPause();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      prevTrack();
      break;
    case 'ArrowRight':
      event.preventDefault();
      nextTrack();
      break;
    case 'KeyM':
      event.preventDefault();
      player.muted = !player.muted;
      break;
    case 'KeyR':
      event.preventDefault();
      toggleRepeat();
      break;
    case 'KeyS':
      event.preventDefault();
      toggleShuffle();
      break;
  }
});

function nextTrack(){
  if(queue.length === 0) return;
  // if nothing playing start at 0
  if(currentIndex === -1){
    playAtIndex(0);
    return;
  }
  if(currentIndex + 1 < queue.length){
    playAtIndex(currentIndex + 1);
  } else if(repeatMode === "infinite"){
    playAtIndex(0);
  } else {
    // reached end and no repeat -> stop playback (let it end)
    currentIndex = queue.length - 1;
  }
}

function prevTrack(){
  if(queue.length === 0) return;

  // if nothing is currently playing -> play last track
  if(currentIndex === -1){
    playAtIndex(queue.length - 1);
    return;
  }

  const thresholdSeconds = 3;
  const pos = player.currentTime || 0;

  // If we're more than threshold seconds into the track, restart current
  if(pos > thresholdSeconds){
    playAtIndex(currentIndex);
    return;
  }

  // Otherwise try to go to previous track
  if(currentIndex > 0){
    playAtIndex(currentIndex - 1);
    return;
  }

  // We're at the first track (index 0)
  if(repeatMode === "infinite"){
    // wrap to last
    playAtIndex(queue.length - 1);
  } else {
    // restart current track
    playAtIndex(0);
  }
}

// ----------------- Repeat -----------------
function toggleRepeat(){
  const repeatBtn = document.getElementById("repeat-btn");
  
  if (repeatMode === "none") {
    repeatMode = "one";
    player.loop = false; // we handle repeat-one manually
    repeatBtn.textContent = "🔂";
    repeatBtn.title = "Repeat One";
  } else if (repeatMode === "one") {
    repeatMode = "infinite";
    player.loop = false; // use nextTrack to wrap around
    repeatBtn.textContent = "🔁";
    repeatBtn.title = "Repeat All";
  } else {
    repeatMode = "none";
    player.loop = false;
    repeatBtn.textContent = "🔁";
    repeatBtn.title = "Repeat Off";
  }
}

// handle track end
player.addEventListener("ended", () => {
  if(repeatMode === "one"){
    // replay once, then reset mode so next end moves on
    player.play().catch(e=>console.warn(e));
    repeatMode = "none";
    repeatBtn.querySelector('.star-border-content').textContent = "🔁 Repeat: Off";
  } else {
    nextTrack();
  }
});

// ----------------- Favorites -----------------
let favoritesList = []; // Track current favorites

async function loadFavorites() {
  console.log("loadFavorites called");
  try {
    const res = await fetch("/api/favorites");
    const data = await res.json();
    favoritesList = data.favorites || [];
    console.log("Favorites loaded in loadFavorites:", favoritesList);
  } catch (error) {
    console.error("Error loading favorites:", error);
    favoritesList = [];
  }
}

function isFavorited(id, source = selectedSource) {
  const result = favoritesList.some(fav => fav.id === id && fav.source === source);
  console.log(`isFavorited(${id}, ${source}): ${result}`, "favoritesList:", favoritesList);
  return result;
}

async function addFav(id){
  console.log("addFav called with ID:", id, "Source:", selectedSource);
  try {
    const res = await fetch("/api/favorites", {
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id, source: selectedSource})
  });
    
    if (res.ok) {
      const responseData = await res.json();
      console.log("Add favorite response:", responseData);
      
      // Reload favorites list and update UI
      await loadFavorites();
      updateFavoriteButtons();
      alert("Added to favorites");
    } else {
      const errorData = await res.json();
      console.error("Add favorite failed:", errorData);
      throw new Error("Failed to add to favorites");
    }
  } catch (error) {
    console.error("Add favorite error:", error);
    alert("Failed to add to favorites");
  }
}

async function showFavorites(){
  console.log("showFavorites called");
  try {
    // Always reload favorites from server to ensure we have the latest data
    const res = await fetch("/api/favorites");
    const data = await res.json();
    const favs = data.favorites || [];
    console.log("Favorites loaded:", favs);
    
    // Update the global favorites list
    favoritesList = favs;
    console.log("Updated global favoritesList:", favoritesList);
    
    // Display favorites with remove buttons
    displayFavoritesResults(favs);
    
    // load favorites into queue (they must have .id)
    queue = favs;
    currentIndex = -1;
    
    // Update button states after a delay to ensure DOM is ready
    setTimeout(() => {
      console.log("Updating favorite buttons after showFavorites");
      updateFavoriteButtons();
    }, 300);
    
  } catch (error) {
    console.error("Error loading favorites:", error);
    document.getElementById("results-title").textContent = "Error loading favorites";
    document.getElementById("results").innerHTML = "<p>Failed to load favorite songs.</p>";
  }
}

function displayFavoritesResults(favorites) {
  console.log("displayFavoritesResults called with:", favorites);
  const el = document.getElementById("results");
  const titleEl = document.getElementById("results-title");
  
  if (!el || !titleEl) {
    console.error("Could not find results elements");
    return;
  }
  
  titleEl.textContent = "Favorite Songs";
  el.innerHTML = "";
  
  queue = favorites; // update queue with favorites
  currentIndex = -1;
  
  console.log("Displaying", favorites.length, "favorites");
  
  favorites.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "result-card fade-in";
    card.style.animationDelay = `${i * 0.1}s`;
    card.innerHTML = `
      <img class="result-thumbnail" src="${r.thumbnail || ''}" alt="${r.title}" />
      <div class="result-info">
        <div class="result-title">${r.title}</div>
        <div class="result-artist">${r.uploader || 'Unknown Artist'} • ${formatDuration(r.duration)}</div>
        <div class="result-actions">
          <button class="star-border" onclick="playAtIndex(${i})">
            <div class="star-border-content">▶ Play</div>
          </button>
          <button class="star-border" onclick="removeFav('${r.id}')">
            <div class="star-border-content">❤️</div>
          </button>
        </div>
      </div>
    `;
    el.appendChild(card);
  });
}

function showHistory(){
  console.log("showHistory called");
  
  // Sync favorites state to ensure it's up to date
  syncFavoritesState();
  
  // Update the results title
  document.getElementById("results-title").textContent = "Recently Played";
  
  if (history.length === 0) {
    document.getElementById("results").innerHTML = `
      <div style="text-align: center; padding: 40px; color: #b3b3b3;">
        <div style="font-size: 48px; margin-bottom: 16px;">🕒</div>
        <h3 style="margin-bottom: 8px;">No history yet</h3>
        <p>Start playing some music to see your history here!</p>
      </div>
    `;
    return;
  }
  
  // Display history in the main results area
  displayHistoryResults(history);
  
  // Load history into queue
  queue = history;
  currentIndex = -1;
}

function displayHistoryResults(historyItems) {
  const el = document.getElementById("results");
  el.innerHTML = "";
  
  historyItems.forEach((song, i) => {
    const card = document.createElement("div");
    card.className = "result-card fade-in";
    card.style.animationDelay = `${i * 0.05}s`;
    
    // Format the time played
    const playedAt = new Date(song.playedAt);
    const timeAgo = getTimeAgo(playedAt);
    
    card.innerHTML = `
      <img class="result-thumbnail" src="${song.thumbnail || ''}" alt="${song.title}" />
      <div class="result-info">
        <div class="result-title">${song.title}</div>
        <div class="result-artist">${song.uploader || 'Unknown Artist'} • ${formatDuration(song.duration)}</div>
        <div class="result-time" style="font-size: 11px; color: #888; margin-bottom: 8px;">Played ${timeAgo}</div>
        <div class="result-actions">
          <button class="star-border" onclick="playAtIndex(${i})">
            <div class="star-border-content">▶ Play</div>
          </button>
          <button class="star-border" onclick="addFav('${song.id}')">
            <div class="star-border-content">🤍</div>
          </button>
          <button class="star-border" onclick="removeFromHistory('${song.id}')">
            <div class="star-border-content">🗑</div>
          </button>
        </div>
      </div>
    `;
    el.appendChild(card);
  });
  
  // Update favorite button states after a short delay to ensure DOM is ready
  setTimeout(updateFavoriteButtons, 200);
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

function removeFromHistory(songId) {
  history = history.filter(item => item.id !== songId);
  saveHistory();
  showHistory(); // Refresh the display
}

function playFav(i){ playAtIndex(i); }

async function removeFav(id){
  console.log("removeFav called with ID:", id, "Source:", selectedSource);
  try {
    const res = await fetch("/api/favorites", {
    method:"DELETE",
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id, source: selectedSource})
  });
    
    if (res.ok) {
      const responseData = await res.json();
      console.log("Remove favorite response:", responseData);
      
      // Reload favorites list and update UI
      await loadFavorites();
      console.log("Favorites reloaded after removal");
      
      // Refresh the favorites display
      showFavorites();
    } else {
      const errorData = await res.json();
      console.error("Remove favorite failed:", errorData);
      throw new Error("Failed to remove from favorites");
    }
  } catch (error) {
    console.error("Remove favorite error:", error);
    alert("Failed to remove from favorites");
  }
}

function updateFavoriteButtons() {
  console.log("updateFavoriteButtons called");
  // Update all heart buttons in the current results
  const heartButtons = document.querySelectorAll('button[onclick*="addFav"]');
  console.log("Found", heartButtons.length, "addFav buttons");
  
  heartButtons.forEach(button => {
    const onclick = button.getAttribute('onclick');
    const idMatch = onclick.match(/addFav\('([^']+)'\)/);
    if (idMatch) {
      const id = idMatch[1];
      const isFav = isFavorited(id);
      const heartIcon = button.querySelector('.star-border-content');
      console.log(`Button for ID ${id}: isFavorited = ${isFav}`);
      
      if (heartIcon) {
        heartIcon.textContent = isFav ? '❤️' : '🤍';
        heartIcon.style.color = isFav ? '#ff6b6b' : '#666';
      }
    }
  });
  
  // Also update any buttons that might be in the favorites page itself
  const favButtons = document.querySelectorAll('button[onclick*="removeFav"]');
  console.log("Found", favButtons.length, "removeFav buttons");
  
  favButtons.forEach(button => {
    const onclick = button.getAttribute('onclick');
    const idMatch = onclick.match(/removeFav\('([^']+)'\)/);
    if (idMatch) {
      const id = idMatch[1];
      const isFav = isFavorited(id);
      const heartIcon = button.querySelector('.star-border-content');
      console.log(`Remove button for ID ${id}: isFavorited = ${isFav}`);
      
      if (heartIcon) {
        heartIcon.textContent = isFav ? '❤️' : '🤍';
        heartIcon.style.color = isFav ? '#ff6b6b' : '#666';
      }
    }
  });
}

// ----------------- Playlists (view only) -----------------
async function showPlaylists(){
  const res = await fetch("/api/playlists");
  const data = await res.json();
  const side = document.getElementById("side");
  side.innerHTML = "<h4>Playlists</h4><pre>"+JSON.stringify(data.playlists||{},null,2)+"</pre>";
}
