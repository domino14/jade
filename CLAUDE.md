# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend Development
- `cd frontend && npm run dev` - Start Vite development server for frontend hot-reloading
- `cd frontend && npm run build` - Build frontend production bundle with TypeScript compilation
- `cd frontend && npm run preview` - Preview production build locally

### Wails Application Development
- `wails dev` - Start live development mode with hot-reload for both frontend and backend
- `wails build` - Build redistributable production package
- Development server runs on http://localhost:34115 for browser-based development

### Configuration
- Config file location: `~/.config/jadexw/config.yaml`
- Environment variables prefix: `JADEXW_`
- Key config options: `data-path`, `kwg-path-prefix`, `montecarlo-plies`, `ttable-mem-fraction`

## Architecture Overview

### Technology Stack
- **Backend**: Go with Wails v2 framework for desktop app development
- **Frontend**: React with TypeScript, Vite for bundling
- **UI Framework**: Mantine v7 with dark theme support
- **3D Graphics**: Three.js with React Three Fiber for 3D board rendering
- **Game Engine Integration**: UCGI protocol for communication with crossword game engines (primarily Macondo)

### Core Components

#### Backend (Go)
- `main.go`: Application entry point with Wails setup and menu configuration
- `app.go`: Main app struct with game management and frontend bridge methods
- `config.go`: Configuration management using Viper with YAML persistence
- Integration with `github.com/woogles-io/liwords` for crossword game logic
- Uses `github.com/domino14/word-golib` for word/lexicon handling

#### Frontend Structure
- `App.tsx`: Main application shell with Mantine AppShell layout
- `board/`: Board rendering components
  - `board.tsx`: 2D SVG board implementation
  - `three/board_scene.tsx`: 3D board scene with Three.js/React Three Fiber
  - `three/tile.tsx`: 3D tile rendering component
  - `three/rack.tsx`: 3D tile rack component
- `utils/cwgame/`: Crossword game utilities (board logic, scoring, tile placement)
- `constants/`: Game constants (alphabets, board layouts)
- `wailsjs/`: Auto-generated Wails bindings for Go backend communication

### Key Features
- 2D/3D board visualization toggle
- File operations for .gcg and .gdoc crossword game files
- Real-time game state management
- Data directory selection for external game resources
- Menu system with keyboard shortcuts (Cmd+N for new game, Cmd+O for open)

### UCGI Protocol
The application implements the Universal Crossword Game Interface (UCGI) protocol for communication with external game engines. This enables pluggable analyzer backends while maintaining a consistent frontend.

### Development Notes
- Frontend uses strict TypeScript configuration
- React Three Fiber manages 3D scene rendering with orbit controls
- Mantine provides consistent dark/light theme support
- Configuration persists to user config directory with automatic creation
- Wails provides native desktop integration with file dialogs and menus