# Personal Productivity Dashboard

A modern, customizable productivity dashboard for your browser.  
Track your tasks, notes, weather, and quick links—all in one place!

## Features

- 📝 **To-Do List:** Add, edit, complete, and organize your daily tasks.
- 🗒️ **Quick Notes:** Jot down ideas, pin favorites, and export your notes.
- ☀️ **Weather Widget:** Get real-time weather updates for any city, with dynamic backgrounds.
- 🔗 **Quick Links:** Organize and access your favorite sites by group, with automatic favicons.
- 🕒 **Live Clock & Greeting:** Personalized greeting and timezone-aware clock.
- 🌙 **Dark/Light Mode:** Toggle between beautiful themes.
- 💾 **Local Storage:** All your data stays private in your browser.

## Screenshots

<!-- Add your screenshot file if you want -->
<!-- ![Dashboard Screenshot](screenshot.png) -->

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Ignatiusf07/Personal-Productivity-Dashboar.git
cd Personal-Productivity-Dashboar
```

### 2. Run Locally

#### Option 1: Using PowerShell (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File start-server.ps1
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

#### Option 2: Using Python (Any OS)

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

#### Option 3: Open `index.html` directly

Some features may not work due to browser security restrictions.

## Customization

- **API Key:** The weather widget uses OpenWeatherMap. Replace the API key in `config.js` with your own for production use.
- **Themes:** Easily switch between light and dark mode.
- **Quick Links:** Add your own favorite sites and groups.

## Security Note

**Do not expose real API keys in public repositories.**  
For production, use a backend proxy to keep your keys secure.

## License

MIT License

---

Made with ❤️ by [Ignatius](https://github.com/Ignatiusf07)
