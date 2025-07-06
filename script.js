// Variable declarations - moved to top to prevent reference errors
const greetingDiv = document.getElementById('greeting');
const timezoneSelect = document.getElementById('timezone-select');

// Add this at the top of the file
let isNameModalOpen = false;

// Live Clock
function updateClock() {
  if (isNameModalOpen) return;
  const tz = timezoneSelect.value || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = getTimeInZone(tz);
  const clock = document.getElementById('clock');
  // Stylish time and date
  clock.innerHTML = `<span class="clock-time">${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span><span class="clock-date">${now.toLocaleDateString([], {weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'})}</span>`;
  const name = getName();
  greetingDiv.textContent = getGreeting(now.getHours(), name);
  setBackgroundByHour(now.getHours());
}

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
if(localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// To-Do List Enhanced Implementation
const newTaskInput = document.getElementById('new-task');
const tasksList = document.getElementById('tasks');
const filterAllBtn = document.getElementById('filter-all');
const filterActiveBtn = document.getElementById('filter-active');
const filterCompletedBtn = document.getElementById('filter-completed');
const clearAllBtn = document.getElementById('clear-all');
const taskCountSpan = document.getElementById('task-count');

let filter = 'all'; // all | active | completed

function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  let tasks = getTasks();
  const allTasks = getTasks();
  if (filter === 'active') tasks = tasks.filter(t => !t.completed);
  if (filter === 'completed') tasks = tasks.filter(t => t.completed);
  tasksList.innerHTML = '';
  tasks.forEach((task) => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!task.completed;
    checkbox.onchange = () => {
      const all = getTasks();
      const idx = all.findIndex(t => t.id === task.id);
      if (idx !== -1) {
        all[idx].completed = checkbox.checked;
        saveTasks(all);
        renderTasks();
      }
    };
    li.appendChild(checkbox);
    // Task text or edit input
    if (task.editing) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = task.text;
      editInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          finishEdit(task.id, editInput.value);
        }
      };
      editInput.onblur = () => finishEdit(task.id, editInput.value);
      li.appendChild(editInput);
      setTimeout(() => editInput.focus(), 0);
    } else {
      const span = document.createElement('span');
      span.textContent = escapeHtml(task.text);
      span.ondblclick = () => startEdit(task.id);
      li.appendChild(span);
    }
    // Actions
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✎';
    editBtn.className = 'edit';
    editBtn.onclick = () => startEdit(task.id);
    actions.appendChild(editBtn);
    // Up button
    const upBtn = document.createElement('button');
    upBtn.textContent = '↑';
    upBtn.className = 'up';
    upBtn.onclick = () => moveTask(task.id, -1);
    actions.appendChild(upBtn);
    // Down button
    const downBtn = document.createElement('button');
    downBtn.textContent = '↓';
    downBtn.className = 'down';
    downBtn.onclick = () => moveTask(task.id, 1);
    actions.appendChild(downBtn);
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.onclick = () => removeTask(task.id);
    actions.appendChild(removeBtn);
    li.appendChild(actions);
    tasksList.appendChild(li);
  });
  // Task count
  const activeCount = getTasks().filter(t => !t.completed).length;
  taskCountSpan.textContent = `${activeCount} left`;
  // Highlight filter
  [filterAllBtn, filterActiveBtn, filterCompletedBtn].forEach(btn => btn.classList.remove('active'));
  if (filter === 'all') filterAllBtn.classList.add('active');
  if (filter === 'active') filterActiveBtn.classList.add('active');
  if (filter === 'completed') filterCompletedBtn.classList.add('active');
}

function removeTask(id) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    tasks.splice(idx, 1);
    saveTasks(tasks);
    renderTasks();
  }
}

function moveTask(id, dir) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  const newIdx = idx + dir;
  if (idx === -1 || newIdx < 0 || newIdx >= tasks.length) return;
  const [moved] = tasks.splice(idx, 1);
  tasks.splice(newIdx, 0, moved);
  saveTasks(tasks);
  renderTasks();
}

function startEdit(id) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    tasks[idx].editing = true;
    saveTasks(tasks);
    renderTasks();
  }
}

function finishEdit(id, value) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    tasks[idx].editing = false;
    if (value.trim()) tasks[idx].text = value.trim();
    saveTasks(tasks);
    renderTasks();
  }
}

newTaskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && newTaskInput.value.trim()) {
    const tasks = getTasks();
    tasks.push({ id: Date.now() + Math.random(), text: newTaskInput.value.trim(), completed: false });
    saveTasks(tasks);
    newTaskInput.value = '';
    renderTasks();
  } else if (e.key === 'Enter' && !newTaskInput.value.trim()) {
    // Show a brief visual feedback for empty input
    newTaskInput.style.borderColor = '#ff4444';
    setTimeout(() => {
      newTaskInput.style.borderColor = '';
    }, 1000);
  }
});

filterAllBtn.onclick = () => { filter = 'all'; renderTasks(); };
filterActiveBtn.onclick = () => { filter = 'active'; renderTasks(); };
filterCompletedBtn.onclick = () => { filter = 'completed'; renderTasks(); };
clearAllBtn.onclick = () => {
  saveTasks([]);
  renderTasks();
};

// On load, migrate old tasks if needed
(function migrateOldTasks() {
  const tasks = getTasks();
  if (tasks.length && typeof tasks[0] === 'string') {
    const migrated = tasks.map(t => ({ id: Date.now() + Math.random(), text: t, completed: false }));
    saveTasks(migrated);
  }
})();

renderTasks();

// Quick Notes Enhanced Implementation
const notesList = document.getElementById('notes-list');
const addNoteBtn = document.getElementById('add-note');
const exportNotesBtn = document.getElementById('export-notes');

const NOTE_COLORS = ['yellow', 'blue', 'green', 'pink', 'purple'];

function getNotes() {
  return JSON.parse(localStorage.getItem('notes') || '[]');
}
function saveNotes(notes) {
  localStorage.setItem('notes', JSON.stringify(notes));
}
function renderNotes() {
  let notes = getNotes();
  // Pin favorites to top
  notes = notes.slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  notesList.innerHTML = '';
  notes.forEach((note) => {
    const card = document.createElement('div');
    card.className = `note-card color-${note.color || 'yellow'}`;
    card.style.resize = 'none';
    // Actions
    const actions = document.createElement('div');
    actions.className = 'note-actions';
    // Pin
    const pinBtn = document.createElement('button');
    pinBtn.textContent = note.pinned ? '★' : '☆';
    pinBtn.className = 'pin';
    pinBtn.onclick = () => {
      const notes = getNotes();
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx !== -1) {
        notes[idx].pinned = !notes[idx].pinned;
        saveNotes(notes);
        renderNotes();
      }
    };
    actions.appendChild(pinBtn);
    // Color
    const colorBtn = document.createElement('button');
    colorBtn.textContent = '🎨';
    colorBtn.className = 'color';
    colorBtn.onclick = () => {
      const notes = getNotes();
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx !== -1) {
        const current = NOTE_COLORS.indexOf(notes[idx].color || 'yellow');
        notes[idx].color = NOTE_COLORS[(current + 1) % NOTE_COLORS.length];
        saveNotes(notes);
        renderNotes();
      }
    };
    actions.appendChild(colorBtn);
    // Delete
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'delete';
    deleteBtn.onclick = () => {
      const notes = getNotes();
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx !== -1) {
        notes.splice(idx, 1);
        saveNotes(notes);
        renderNotes();
      }
    };
    actions.appendChild(deleteBtn);
    card.appendChild(actions);
    // Content: always editable textarea
    const textarea = document.createElement('textarea');
    textarea.className = 'note-content';
    textarea.value = escapeHtml(note.text);
    textarea.onblur = () => {
      const notes = getNotes();
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx !== -1) {
        notes[idx].text = textarea.value;
        saveNotes(notes);
        renderNotes();
      }
    };
    card.appendChild(textarea);
    notesList.appendChild(card);
    // Make card resizable (CSS handles this)
  });
}
addNoteBtn.onclick = () => {
  const notes = getNotes();
  notes.unshift({ id: Date.now() + Math.random(), text: '', color: 'yellow', pinned: false });
  saveNotes(notes);
  renderNotes();
  setTimeout(() => {
    const firstNote = document.querySelector('.note-content');
    if (firstNote) firstNote.focus();
  }, 100);
};
exportNotesBtn.onclick = () => {
  // Export all notes, not just visible ones, and trim empty notes
  const notes = getNotes().filter(n => n.text.trim() !== '');
  const text = notes.map(n => n.text).join('\n---\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'notes.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
// Simple markdown parser (bold, italic, code, links, lists)
function markdownToHtml(md) {
  let html = md
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/^\s*\- (.*)$/gm, '<li>$1</li>');
  if (/\<li\>/.test(html)) html = '<ul>' + html + '</ul>';
  return html.replace(/\n/g, '<br>');
}
// On load
renderNotes();

// Weather Section Implementation
const weatherInfo = document.getElementById('weather-info');
const weatherCityInput = document.getElementById('weather-city');
const weatherSearchBtn = document.getElementById('weather-search');
const weatherUnitBtn = document.getElementById('weather-unit');

// In production, do NOT expose real API keys in client-side JS. Use a backend proxy for security.
// Weather API key is now imported from config.js
// Remove the old const WEATHER_API_KEY = ...
// (Assume config.js is loaded before script.js)
// Usage: fetchWeatherByCity(city) and fetchWeatherByCoords(lat, lon) use WEATHER_API_KEY from config.js

let weatherUnit = localStorage.getItem('weatherUnit') || 'metric'; // 'metric' (°C) or 'imperial' (°F)

function displayWeather(data) {
  if (!data || !data.weather) {
    weatherInfo.innerHTML = '<span>Weather not found.</span>';
    return;
  }
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  const temp = Math.round(data.main.temp);
  const unit = weatherUnit === 'metric' ? '°C' : '°F';
  weatherInfo.innerHTML = `
    <img class="weather-icon" src="${iconUrl}" alt="weather icon" />
    <div class="weather-details">
      <div><b>${data.name}, ${data.sys.country}</b></div>
      <div>${data.weather[0].main} (${data.weather[0].description})</div>
      <div><b>${temp}${unit}</b></div>
      <div>Humidity: ${data.main.humidity}%</div>
      <div>Wind: ${data.wind.speed} ${weatherUnit === 'metric' ? 'm/s' : 'mph'}</div>
    </div>
  `;
}

function fetchWeatherByCity(city) {
  weatherInfo.innerHTML = 'Loading...';
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=${weatherUnit}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.cod && data.cod !== 200) {
        throw new Error(data.message || 'City not found');
      }
      displayWeather(data);
    })
    .catch(error => {
      console.error('Weather API error:', error);
      weatherInfo.innerHTML = `<span>Error: ${error.message || 'Weather not found'}</span>`;
    });
}

function fetchWeatherByCoords(lat, lon) {
  weatherInfo.innerHTML = 'Loading...';
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=${weatherUnit}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.cod && data.cod !== 200) {
        throw new Error(data.message || 'Location not found');
      }
      displayWeather(data);
    })
    .catch(error => {
      console.error('Weather API error:', error);
      weatherInfo.innerHTML = `<span>Error: ${error.message || 'Weather not found'}</span>`;
    });
}

weatherSearchBtn.onclick = () => {
  const city = weatherCityInput.value.trim();
  if (city) {
    fetchWeatherByCity(city);
    localStorage.setItem('weatherCity', city);
  } else {
    weatherInfo.innerHTML = '<span>Please enter a city name</span>';
  }
};
weatherCityInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') weatherSearchBtn.onclick();
});
weatherUnitBtn.onclick = () => {
  weatherUnit = weatherUnit === 'metric' ? 'imperial' : 'metric';
  weatherUnitBtn.textContent = weatherUnit === 'metric' ? '°C' : '°F';
  localStorage.setItem('weatherUnit', weatherUnit);
  // Refetch for current city
  const city = localStorage.getItem('weatherCity');
  if (city) fetchWeatherByCity(city);
};
weatherUnitBtn.textContent = weatherUnit === 'metric' ? '°C' : '°F';

// Try to load last city or use geolocation
window.addEventListener('DOMContentLoaded', () => {
  const lastCity = localStorage.getItem('weatherCity');
  if (lastCity) {
    weatherCityInput.value = lastCity;
    fetchWeatherByCity(lastCity);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeatherByCity('New York')
    );
  } else {
    fetchWeatherByCity('New York');
  }
});

// Quick Links Enhanced Implementation
const linksGroupsDiv = document.getElementById('links-groups');
const addLinkBtn = document.getElementById('add-link');
const newLinkName = document.getElementById('new-link-name');
const newLinkUrl = document.getElementById('new-link-url');
const newLinkGroup = document.getElementById('new-link-group');

const GROUP_COLORS = 10; // Number of color classes for groups
function groupColorClass(group) {
  // Simple hash for group name to color index
  let hash = 0;
  for (let i = 0; i < group.length; i++) hash = (hash * 31 + group.charCodeAt(i)) % GROUP_COLORS;
  return `color-${hash}`;
}

function getLinks() {
  return JSON.parse(localStorage.getItem('quickLinks') || '[]');
}
function saveLinks(links) {
  localStorage.setItem('quickLinks', JSON.stringify(links));
}
function getFavicon(url) {
  try {
    const u = new URL(url);
    // Use Google favicon proxy (works for most sites, including YouTube, Gmail, Netflix, etc.)
    return `https://www.google.com/s2/favicons?sz=64&domain_url=${u.origin}`;
  } catch {
    return '';
  }
}
function getCollapsedGroups() {
  return JSON.parse(localStorage.getItem('collapsedLinkGroups') || '{}');
}
function setCollapsedGroups(groups) {
  localStorage.setItem('collapsedLinkGroups', JSON.stringify(groups));
}
function renderLinks() {
  const links = getLinks();
  // Group by group name
  const groups = {};
  links.forEach((link) => {
    const group = link.group || 'Ungrouped';
    if (!groups[group]) groups[group] = [];
    groups[group].push(link);
  });
  const collapsedGroups = getCollapsedGroups();
  linksGroupsDiv.innerHTML = '';
  Object.entries(groups).forEach(([group, links]) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = `link-group ${groupColorClass(group)}`;
    const title = document.createElement('div');
    title.className = 'link-group-title';
    // Collapsible toggle
    const toggle = document.createElement('button');
    toggle.textContent = collapsedGroups[group] ? '▶' : '▼';
    toggle.style.marginRight = '0.5em';
    toggle.style.background = 'none';
    toggle.style.border = 'none';
    toggle.style.fontSize = '1em';
    toggle.style.cursor = 'pointer';
    toggle.onclick = () => {
      const collapsed = getCollapsedGroups();
      collapsed[group] = !collapsed[group];
      setCollapsedGroups(collapsed);
      renderLinks();
    };
    title.prepend(toggle);
    title.append(escapeHtml(group));
    groupDiv.appendChild(title);
    const list = document.createElement('div');
    list.className = 'links-list';
    if (!collapsedGroups[group]) {
      links.forEach((link, i) => {
        const card = document.createElement('div');
        card.className = 'link-card';
        card.draggable = true;
        card.ondragstart = e => {
          card.classList.add('dragging');
          e.dataTransfer.setData('text/plain', link.id);
        };
        card.ondragend = () => card.classList.remove('dragging');
        card.ondragover = e => e.preventDefault();
        card.ondrop = e => {
          e.preventDefault();
          const fromId = e.dataTransfer.getData('text/plain');
          moveLinkById(fromId, link.id);
        };
        // Icon (favicon only)
        const icon = document.createElement('img');
        icon.className = 'link-icon';
        icon.src = getFavicon(link.url);
        icon.alt = '';
        icon.onerror = function() {
          if (!this.dataset.fallback) {
            try {
              const u = new URL(link.url);
              this.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${u.origin}`;
              this.dataset.fallback = '1';
            } catch {
              this.src = '';
              this.alt = '🔗';
            }
          } else {
            this.style.display = 'none';
            const fallback = document.createElement('span');
            fallback.className = 'link-icon-fallback';
            fallback.textContent = '🔗';
            this.parentNode.insertBefore(fallback, this);
          }
        };
        card.appendChild(icon);
        // Name (editable)
        if (link.editing) {
          const nameInput = document.createElement('input');
          nameInput.type = 'text';
          nameInput.value = escapeHtml(link.name);
          nameInput.onkeydown = e => { if (e.key === 'Enter') finishEditById(link.id, nameInput.value, null, null); };
          card.appendChild(nameInput);
          const urlInput = document.createElement('input');
          urlInput.type = 'text';
          urlInput.value = escapeHtml(link.url);
          urlInput.onkeydown = e => { if (e.key === 'Enter') finishEditById(link.id, null, urlInput.value, null); };
          card.appendChild(urlInput);
          const groupInput = document.createElement('input');
          groupInput.type = 'text';
          groupInput.value = escapeHtml(link.group || '');
          groupInput.onkeydown = e => { if (e.key === 'Enter') finishEditById(link.id, null, null, groupInput.value); };
          card.appendChild(groupInput);
        } else {
          const a = document.createElement('a');
          a.href = escapeHtml(link.url);
          a.textContent = escapeHtml(link.name);
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          card.appendChild(a);
        }
        // Actions
        const actions = document.createElement('div');
        actions.className = 'link-actions';
        // Edit
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.className = 'edit';
        editBtn.onclick = () => startEditById(link.id);
        actions.appendChild(editBtn);
        // Up
        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.className = 'up';
        upBtn.onclick = () => moveLinkById(link.id, getRelativeLinkId(links, link.id, -1));
        actions.appendChild(upBtn);
        // Down
        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.className = 'down';
        downBtn.onclick = () => moveLinkById(link.id, getRelativeLinkId(links, link.id, 1));
        actions.appendChild(downBtn);
        // Delete
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✕';
        deleteBtn.className = 'delete';
        deleteBtn.onclick = () => {
          if (confirm('Are you sure you want to delete this link?')) {
            deleteLinkById(link.id);
          }
        };
        actions.appendChild(deleteBtn);
        card.appendChild(actions);
        list.appendChild(card);
      });
    }
    groupDiv.appendChild(list);
    linksGroupsDiv.appendChild(groupDiv);
  });
}
function addLink() {
  const name = newLinkName.value.trim();
  const url = newLinkUrl.value.trim();
  const group = newLinkGroup.value.trim();
  if (!name || !url) {
    if (!name) {
      newLinkName.style.borderColor = '#ff4444';
      setTimeout(() => { newLinkName.style.borderColor = ''; }, 1000);
    }
    if (!url) {
      newLinkUrl.style.borderColor = '#ff4444';
      setTimeout(() => { newLinkUrl.style.borderColor = ''; }, 1000);
    }
    return;
  }
  try {
    new URL(url);
  } catch {
    newLinkUrl.style.borderColor = '#ff4444';
    setTimeout(() => { newLinkUrl.style.borderColor = ''; }, 1000);
    return;
  }
  const links = getLinks();
  links.push({ id: Date.now() + Math.random(), name, url, group });
  saveLinks(links);
  newLinkName.value = '';
  newLinkUrl.value = '';
  newLinkGroup.value = '';
  renderLinks();
}
function deleteLink(idx) {
  const links = getLinks();
  links.splice(idx, 1);
  saveLinks(links);
  renderLinks();
}
function startEdit(idx) {
  const links = getLinks();
  links[idx].editing = true;
  saveLinks(links);
  renderLinks();
}
function finishEdit(idx, name, url, group) {
  const links = getLinks();
  links[idx].editing = false;
  if (name !== null) links[idx].name = name;
  if (url !== null) links[idx].url = url;
  if (group !== null) links[idx].group = group;
  saveLinks(links);
  renderLinks();
}
function moveLink(fromIdx, toIdx) {
  const links = getLinks();
  if (toIdx < 0 || toIdx >= links.length) return;
  const [moved] = links.splice(fromIdx, 1);
  links.splice(toIdx, 0, moved);
  saveLinks(links);
  renderLinks();
}
addLinkBtn.onclick = addLink;
[newLinkName, newLinkUrl, newLinkGroup].forEach(input => {
  input.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });
});
// On load
renderLinks();

// Auto-greeting, Timezone, and Dynamic Background

// Add modal HTML if not present
if (!document.getElementById('name-modal')) {
  const modal = document.createElement('div');
  modal.id = 'name-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'name-modal-label');
  modal.style.display = 'none';
  modal.innerHTML = `
    <div style="background: #fff; color: #222; border-radius: 12px; padding: 2em; max-width: 350px; margin: 10vh auto; box-shadow: 0 8px 32px rgba(31,38,135,0.18); text-align: center;">
      <h2 id="name-modal-label">Welcome!</h2>
      <label for="name-input">What is your name?</label><br>
      <input id="name-input" aria-label="Your name" style="margin: 1em 0; padding: 0.5em; width: 80%; border-radius: 6px; border: 1px solid #ccc;" />
      <br>
      <button id="name-submit" style="padding: 0.5em 1.5em; border-radius: 6px; background: #1976d2; color: #fff; border: none;">OK</button>
    </div>
  `;
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.25)';
  modal.style.zIndex = '9999';
  document.body.appendChild(modal);
}

function showNameModal() {
  isNameModalOpen = true;
  const modal = document.getElementById('name-modal');
  modal.style.display = 'block';
  const input = document.getElementById('name-input');
  input.value = '';
  input.focus();
  input.onkeydown = (e) => { if (e.key === 'Enter') submitName(); };
  document.getElementById('name-submit').onclick = submitName;
}
function hideNameModal() {
  isNameModalOpen = false;
  document.getElementById('name-modal').style.display = 'none';
}
function submitName() {
  const input = document.getElementById('name-input');
  const name = input.value.trim();
  if (name) {
    localStorage.setItem('userName', name);
    hideNameModal();
    updateGreeting();
  } else {
    input.focus();
  }
}
function updateGreeting() {
  if (isNameModalOpen) return;
  const name = localStorage.getItem('userName') || '';
  const now = new Date();
  const hour = now.getHours();
  greetingDiv.textContent = getGreeting(hour, name);
}
// Replace getName logic
function getName() {
  let name = localStorage.getItem('userName');
  if (!name && !isNameModalOpen) {
    showNameModal();
    return '';
  }
  return name;
}
// On load, update greeting
window.addEventListener('DOMContentLoaded', updateGreeting);

function getGreeting(hour, name) {
  if (hour < 5) return `Good Night${name ? ', ' + name : ''}`;
  if (hour < 12) return `Good Morning${name ? ', ' + name : ''}`;
  if (hour < 17) return `Good Afternoon${name ? ', ' + name : ''}`;
  if (hour < 21) return `Good Evening${name ? ', ' + name : ''}`;
  return `Good Night${name ? ', ' + name : ''}`;
}
function setBackgroundByHour(hour) {
  document.body.classList.remove('morning', 'afternoon', 'evening', 'night');
  if (hour < 5) document.body.classList.add('night');
  else if (hour < 12) document.body.classList.add('morning');
  else if (hour < 17) document.body.classList.add('afternoon');
  else if (hour < 21) document.body.classList.add('evening');
  else document.body.classList.add('night');
}
function getTimeInZone(tz) {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: tz }));
}
function populateTimezones() {
  const zones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [Intl.DateTimeFormat().resolvedOptions().timeZone];
  timezoneSelect.innerHTML = '';
  zones.forEach(tz => {
    const opt = document.createElement('option');
    opt.value = tz;
    opt.textContent = tz;
    timezoneSelect.appendChild(opt);
  });
  const savedTz = localStorage.getItem('userTimezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  timezoneSelect.value = savedTz;
}
timezoneSelect.onchange = () => {
  localStorage.setItem('userTimezone', timezoneSelect.value);
  updateClock();
};
window.addEventListener('DOMContentLoaded', () => {
  populateTimezones();
  updateClock();
  setInterval(updateClock, 1000);
});

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(tag) {
    const chars = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'};
    return chars[tag] || tag;
  });
}
// Use escapeHtml when rendering note text and link names/URLs
// Example: span.textContent = escapeHtml(task.text);
// For notes: textarea.value = escapeHtml(note.text);
// For links: a.textContent = escapeHtml(link.name); a.href = escapeHtml(link.url); 

// --- Migration: Ensure all links have a unique id on load ---
(function migrateQuickLinks() {
  const links = getLinks();
  let changed = false;
  links.forEach(link => {
    if (!link.id) {
      link.id = Date.now() + Math.random();
      changed = true;
    }
  });
  if (changed) saveLinks(links);
})();

// --- Add unique id to each new link ---
function addLink() {
  const name = newLinkName.value.trim();
  const url = newLinkUrl.value.trim();
  const group = newLinkGroup.value.trim();
  if (!name || !url) {
    if (!name) {
      newLinkName.style.borderColor = '#ff4444';
      setTimeout(() => { newLinkName.style.borderColor = ''; }, 1000);
    }
    if (!url) {
      newLinkUrl.style.borderColor = '#ff4444';
      setTimeout(() => { newLinkUrl.style.borderColor = ''; }, 1000);
    }
    return;
  }
  try {
    new URL(url);
  } catch {
    newLinkUrl.style.borderColor = '#ff4444';
    setTimeout(() => { newLinkUrl.style.borderColor = ''; }, 1000);
    return;
  }
  const links = getLinks();
  links.push({ id: Date.now() + Math.random(), name, url, group });
  saveLinks(links);
  newLinkName.value = '';
  newLinkUrl.value = '';
  newLinkGroup.value = '';
  renderLinks();
}

// --- Update renderLinks to use link.id for all actions ---
function renderLinks() {
  const links = getLinks();
  // Group by group name
  const groups = {};
  links.forEach((link) => {
    const group = link.group || 'Ungrouped';
    if (!groups[group]) groups[group] = [];
    groups[group].push(link);
  });
  const collapsedGroups = getCollapsedGroups();
  linksGroupsDiv.innerHTML = '';
  Object.entries(groups).forEach(([group, links]) => {
    const groupDiv = document.createElement('div');
    groupDiv.className = `link-group ${groupColorClass(group)}`;
    const title = document.createElement('div');
    title.className = 'link-group-title';
    // Collapsible toggle
    const toggle = document.createElement('button');
    toggle.textContent = collapsedGroups[group] ? '▶' : '▼';
    toggle.style.marginRight = '0.5em';
    toggle.style.background = 'none';
    toggle.style.border = 'none';
    toggle.style.fontSize = '1em';
    toggle.style.cursor = 'pointer';
    toggle.onclick = () => {
      const collapsed = getCollapsedGroups();
      collapsed[group] = !collapsed[group];
      setCollapsedGroups(collapsed);
      renderLinks();
    };
    title.prepend(toggle);
    title.append(escapeHtml(group));
    groupDiv.appendChild(title);
    const list = document.createElement('div');
    list.className = 'links-list';
    if (!collapsedGroups[group]) {
      links.forEach((link, i) => {
        const card = document.createElement('div');
        card.className = 'link-card';
        card.draggable = true;
        card.ondragstart = e => {
          card.classList.add('dragging');
          e.dataTransfer.setData('text/plain', link.id);
        };
        card.ondragend = () => card.classList.remove('dragging');
        card.ondragover = e => e.preventDefault();
        card.ondrop = e => {
          e.preventDefault();
          const fromId = e.dataTransfer.getData('text/plain');
          moveLinkById(fromId, link.id);
        };
        // Icon (favicon only)
        const icon = document.createElement('img');
        icon.className = 'link-icon';
        icon.src = getFavicon(link.url);
        icon.alt = '';
        icon.onerror = function() {
          if (!this.dataset.fallback) {
            try {
              const u = new URL(link.url);
              this.src = `https://www.google.com/s2/favicons?sz=64&domain_url=${u.origin}`;
              this.dataset.fallback = '1';
            } catch {
              this.src = '';
              this.alt = '🔗';
            }
          } else {
            this.style.display = 'none';
            const fallback = document.createElement('span');
            fallback.className = 'link-icon-fallback';
            fallback.textContent = '🔗';
            this.parentNode.insertBefore(fallback, this);
          }
        };
        card.appendChild(icon);
        // Name (editable)
        if (link.editing) {
          const nameInput = document.createElement('input');
          nameInput.type = 'text';
          nameInput.value = escapeHtml(link.name);
          nameInput.onkeydown = e => { if (e.key === 'Enter') finishEditById(link.id, nameInput.value, null, null); };
          card.appendChild(nameInput);
          const urlInput = document.createElement('input');
          urlInput.type = 'text';
          urlInput.value = escapeHtml(link.url);
          urlInput.onkeydown = e => { if (e.key === 'Enter') finishEditById(link.id, null, urlInput.value, null); };
          card.appendChild(urlInput);
          const groupInput = document.createElement('input');
          groupInput.type = 'text';
          groupInput.value = escapeHtml(link.group || '');
          groupInput.onkeydown = e => { if (e.key === 'Enter') finishEditById(link.id, null, null, groupInput.value); };
          card.appendChild(groupInput);
        } else {
          const a = document.createElement('a');
          a.href = escapeHtml(link.url);
          a.textContent = escapeHtml(link.name);
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          card.appendChild(a);
        }
        // Actions
        const actions = document.createElement('div');
        actions.className = 'link-actions';
        // Edit
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.className = 'edit';
        editBtn.onclick = () => startEditById(link.id);
        actions.appendChild(editBtn);
        // Up
        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.className = 'up';
        upBtn.onclick = () => moveLinkById(link.id, getRelativeLinkId(links, link.id, -1));
        actions.appendChild(upBtn);
        // Down
        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.className = 'down';
        downBtn.onclick = () => moveLinkById(link.id, getRelativeLinkId(links, link.id, 1));
        actions.appendChild(downBtn);
        // Delete
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✕';
        deleteBtn.className = 'delete';
        deleteBtn.onclick = () => {
          if (confirm('Are you sure you want to delete this link?')) {
            deleteLinkById(link.id);
          }
        };
        actions.appendChild(deleteBtn);
        card.appendChild(actions);
        list.appendChild(card);
      });
    }
    groupDiv.appendChild(list);
    linksGroupsDiv.appendChild(groupDiv);
  });
}

// --- Helper functions for id-based actions ---
function getRelativeLinkId(links, id, offset) {
  const idx = links.findIndex(l => l.id === id);
  if (idx === -1) return null;
  const newIdx = idx + offset;
  if (newIdx < 0 || newIdx >= links.length) return null;
  return links[newIdx].id;
}
function moveLinkById(fromId, toId) {
  if (!toId) return;
  const links = getLinks();
  const fromIdx = links.findIndex(l => l.id == fromId);
  const toIdx = links.findIndex(l => l.id == toId);
  if (fromIdx === -1 || toIdx === -1) return;
  const [moved] = links.splice(fromIdx, 1);
  links.splice(toIdx, 0, moved);
  saveLinks(links);
  renderLinks();
}
function startEditById(id) {
  const links = getLinks();
  const idx = links.findIndex(l => l.id === id);
  if (idx !== -1) {
    links[idx].editing = true;
    saveLinks(links);
    renderLinks();
  }
}
function finishEditById(id, name, url, group) {
  const links = getLinks();
  const idx = links.findIndex(l => l.id === id);
  if (idx !== -1) {
    links[idx].editing = false;
    if (name !== null) links[idx].name = name;
    if (url !== null) links[idx].url = url;
    if (group !== null) links[idx].group = group;
    saveLinks(links);
    renderLinks();
  }
}
function deleteLinkById(id) {
  const links = getLinks();
  const idx = links.findIndex(l => l.id === id);
  if (idx !== -1) {
    links.splice(idx, 1);
    saveLinks(links);
    renderLinks();
  }
} 