# Self Care - Workout Tracker

A beautiful, minimalist desktop application for tracking your daily workouts. Built with Electron, React, TypeScript, and SQLite for local data persistence.

## Features

- 📅 Calendar-based workout tracking
- ✅ Simple click-to-toggle interface
- 💾 Local SQLite database (data persists between sessions)
- 🎨 Modern, Apple-inspired UI design
- 🖥️ Cross-platform desktop application

## Tech Stack

- **Electron** - Desktop app framework
- **React** - UI library
- **TypeScript** - Type safety
- **SQLite (better-sqlite3)** - Local database
- **Tailwind CSS** - Styling
- **Vite** - Build tooling
- **date-fns** - Date utilities

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

This will start:
- Vite dev server for the React app (http://localhost:3000)
- Electron app window

### Building

```bash
# Build for production
npm run build

# Package as distributable
npm run package
```

## Project Structure

```
self-care/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts    # Main entry point
│   │   ├── preload.ts  # Preload script (IPC bridge)
│   │   └── database.ts # SQLite database layer
│   ├── renderer/        # React UI
│   │   ├── components/ # React components
│   │   ├── App.tsx     # Main app component
│   │   └── main.tsx    # React entry point
│   └── shared/         # Shared types
├── dist/               # Build output
└── release/            # Packaged apps
```

## Data Storage

Workout data is stored in a SQLite database located at:
- **macOS**: `~/Library/Application Support/self-care/workouts.db`
- **Windows**: `%APPDATA%/self-care/workouts.db`
- **Linux**: `~/.config/self-care/workouts.db`

The database persists between app sessions, so your workout history is always saved.

## License

MIT


