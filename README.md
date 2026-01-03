# BADDIXX CueMii App

**Version 1.1.4**

A comprehensive badminton queuing and court management system built with React and Tailwind CSS.

**Created by Joseph Vertido**

## Features

- **Player Database Management**: Add, edit, delete players with CSV import/export
- **Player Pool**: Searchable and filterable player waiting area with wait time tracking
- **Match Queue**: Create matches and add players manually or use Smart Match
- **Smart Match Algorithm**: Automatically selects players based on wait time and skill level
- **Court Management**: Create, rename, delete courts with active match tracking
- **Gender & Skill Indicators**: Visual indicators for player gender and skill level
- **Persistent State**: All data is saved to localStorage and persists across browser refreshes
- **Reset Function**: Easily reset all data to defaults with the Reset button

## Project Structure

```
baddixx-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── index.js              # Component exports
│   │   ├── Header.js             # App header with logo
│   │   ├── PlayerDatabaseModal.js # Player management modal
│   │   ├── PlayerPool.js         # Player pool section
│   │   ├── MatchQueue.js         # Match creation/management
│   │   ├── CourtsPanel.js        # Courts panel
│   │   ├── LevelBadge.js         # Skill level badge component
│   │   └── GenderIcon.js         # Gender icon component
│   ├── data/
│   │   └── initialData.js        # Initial data and constants
│   ├── hooks/
│   │   ├── useCurrentTime.js     # Custom hook for time updates
│   │   └── useLocalStorage.js    # Custom hook for localStorage persistence
│   ├── utils/
│   │   ├── formatters.js         # Time formatting utilities
│   │   └── csvUtils.js           # CSV import/export utilities
│   ├── App.js                    # Main application component
│   ├── index.js                  # React entry point
│   └── index.css                 # Tailwind CSS + custom styles
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Installation

1. Navigate to the project directory:
   ```bash
   cd baddixx-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Managing Players
1. Click "Manage Players" to open the database modal
2. Add new players with name, gender, and skill level
3. Import players via CSV (columns: name, gender, level)
4. Export player database to CSV

### Using the Player Pool
1. Add players to the pool from the database modal
2. Search and filter players by level
3. Remove players from pool using the X button

### Creating Matches
1. Click "Create Match" to start a new match
2. Select a match and click players to add them
3. Use "Smart Match" to auto-fill based on wait time and skill
4. Move completed matches to available courts

### Managing Courts
1. Add new courts with custom names
2. Rename or delete courts as needed
3. End active matches to return players to pool

## Smart Match Algorithm

The Smart Match feature selects players with the following priority:

1. **Longest Idle Time**: Players waiting longest are prioritized first
2. **Expert Male Exclusivity**: Expert male players can ONLY be grouped with other Expert male players
3. **Expert Female Exclusivity**: Expert female players can ONLY be grouped with other Expert female players
4. **Mixed Skill Levels**: For non-Expert matches, the algorithm prefers mixing Advanced, Intermediate, and Novice players together
5. **Gender Mode (50/50)**: Half the time matches are single-gender (all male or all female), half the time mixed
6. **Gender Balance in Mixed**: When mixed gender, prefers even split (2 male + 2 female)
7. **Skill Level Balance**: Even distribution across skill levels
8. **Leave Empty for Experts**: If not enough Expert players of the same gender available, slots stay empty

### How it works:

- **Expert matches**: Determined by longest-waiting player or existing players. Expert males only with expert males, expert females only with expert females.
- **Non-expert matches**: Uses match ID to determine gender mode (even ID = mixed, odd ID = single-gender)
- **Mixed gender**: Alternates picks to achieve 2M+2F balance
- **Single gender**: Picks from the same gender as the longest-waiting player

### Example Scenarios:

- **Expert male waiting longest**: Only selects other Expert male players, leaves slots empty if insufficient
- **Expert female in match**: Only adds Expert female players
- **Match ID is even (mixed mode)**: Selects players alternating genders for 2M+2F balance
- **Match ID is odd (single gender)**: Selects all male or all female based on longest wait

## CSV Format

For importing players, use this CSV format:
```
name,gender,level
John Doe,male,Advanced
Jane Smith,female,Expert
```

- **name** (required): Player name
- **gender** (optional): male/female (default: male)
- **level** (optional): Expert/Advanced/Intermediate/Novice (default: Intermediate)

## Technologies

- React 18
- Tailwind CSS 3
- ES6+ JavaScript

## Data Persistence

All application data is automatically saved to your browser's localStorage:

- **baddixx_players**: Player database
- **baddixx_pool**: Current player pool
- **baddixx_matches**: Queued matches
- **baddixx_courts**: Court configurations and active matches

Data persists across browser refreshes and sessions. Use the **Reset** button in the header to clear all saved data and restore defaults.

## Version History

- **v1.1.4** - CSV import fix
  - Fixed bug where importing CSV caused duplicate entries in UI when sorting
  - Improved ID generation for imported players (unique sequential IDs)
  - Added stable sorting with ID tiebreaker

- **v1.1.3** - Data improvements
  - Restored default player database (136 players from baddixx_players.csv)
  - CSV export now only includes name, gender, and level (no id)

- **v1.1.2** - Clean slate
  - Removed default player database (app starts empty)
  - Import your players via CSV or add them manually

- **v1.1.1** - Bug fixes
  - Fixed bug where adding a player to pool could sometimes add duplicates
  - Improved state management with functional updates throughout the app
  
- **v1.1.0** - Smart Match algorithm overhaul
  - Expert males only with expert males
  - Expert females only with expert females
  - 50/50 single-gender vs mixed-gender matches
  - Improved gender and skill balancing
  - Added "Clear Pool" button in Player Database
  
- **v1.0.0** - Initial release
  - Player database management with 136 pre-loaded players
  - Player pool with idle time tracking
  - Smart Match algorithm with gender and skill balancing
  - Court management with match timer
  - CSV import/export
  - localStorage persistence
