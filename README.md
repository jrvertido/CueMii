# BADDIXX CueMii App

**Version 1.8.2**

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

- **v1.8.2** - Reverted level abbreviations back to single letters (E, A, I, N)

- **v1.8.1** - Match Queue Player Card Cleanup
  - Removed gender icon (♂/♀) from player cards in Match Queue
  - Changed level abbreviations from single letters to 3-letter: Exp, Adv, Int, Nov

- **v1.8.0** - Match Queue Player Card Colors
  - Male players now have blue background (bg-blue-900/60) with blue border
  - Female players now have pink background (bg-pink-900/60) with pink border
  - Player names are bolder (font-semibold)
  - Level badges are more prominent with borders and stronger colors

- **v1.7.9** - UI Improvements
  - Clear button on match now also selects that match
  - Player Pool now shows 2 columns of players for better visibility
  - Player cards made more compact to fit 2-column layout
  - Player Pool width increased from 350px to 450px

- **v1.7.8** - Auto-select First Incomplete Match
  - When a match becomes complete (4 players), automatically selects the first incomplete match
  - Works for both Smart Match and manual player additions
  - If no incomplete matches exist, selection is cleared

- **v1.7.7** - Smart Match Algorithm v12 (Bidirectional Gender Fallback)
  - Rule 15: If same-gender (4M/4F) not possible → try mixed (2M + 2F)
  - Rule 16: If mixed (2M + 2F) not possible → try same-gender (4M/4F)
  - Ensures maximum match creation regardless of player pool composition

- **v1.7.6** - Smart Match Algorithm v11 (Same-Gender Fallback)
  - NEW Rule 15: If same-gender match (4M or 4F) not possible, falls back to mixed-gender (2M + 2F)
  - Applies to both empty matches and matches with existing players
  - Example: If random selects "same-gender male" but only 2 males available, tries mixed instead

- **v1.7.5** - Smart Match Algorithm v10 (Real-time Gender Mode)
  - Rules 10 & 11 now use real-time random selection (50/50 chance)
  - Previously used static match ID to determine gender mode
  - Now each Smart Match call randomly decides same-gender vs mixed-gender

- **v1.7.4** - UI Improvements
  - Match Queue: Complete matches (4 players) now show green color scheme
  - Match Queue: Incomplete matches show default orange/slate color scheme
  - Renamed "Clear Idle" button to "Clear Timers"
  - Clear Timers now prompts for confirmation before resetting
  - Player Pool: Split into two sections - "Available" and "In Match"
  - Each section shows player count and has distinct visual styling

- **v1.7.3** - Create Match selects first empty match
  - When clicking Create Match, the first empty match in the list is automatically selected

- **v1.7.2** - Reverted v1.7.1 change
  - New matches are added at the end of the list (original behavior)

- **v1.7.1** - Create Match UX Improvement (reverted)

- **v1.7.0** - Smart Match Algorithm v9 + Clear Idle Times
  - **NEW: Clear Idle Times button** in Player Pool header
    - Resets all player idle times to current time
  - **Smart Match v9 (14 rules)**:
    - 1. Least game counts (primary)
    - 2. Longest idle time (secondary)
    - 3. **1M + 1F rule**: Must complete with another 1M + 1F
    - 4. Expert males only with expert males (EXCEPT rule 3)
    - 5. Expert females only with expert females (EXCEPT rule 3)
    - 6. If < 4 expert males → allow Advanced males
    - 7. If < 4 expert females → allow Advanced females
    - 8. Advanced + Novice only once per Advanced player
    - 9. Prefer mixing Advanced/Intermediate/Novice
    - 10. Half the time: same-gender (4M or 4F)
    - 11. Half the time: mixed-gender
    - 12. Balance by skill level
    - 13. Leave empty if not enough experts
    - 14. Leave empty if not enough players in pool
  - Rule 3 exception allows mixed-gender expert matches

- **v1.6.0** - Smart Match Algorithm v8 (Two-Part Logic)
  - Complete restructure with separate logic for empty vs. existing matches
  - **PART 1: Empty Match (13 rules)**
    - 1.1-1.2: Least game counts, longest idle time
    - 1.3-1.6: Expert gender segregation with Advanced fallback
    - 1.7: Advanced + Novice only once
    - 1.8: Mix Advanced/Intermediate/Novice
    - 1.9-1.10: 50% same-gender, 50% mixed-gender
    - 1.11-1.12: Level balance, mixed requires 2M/2F
    - 1.13: Leave empty if not enough experts
  - **PART 2: Match with Players (7 rules)**
    - 2.1-2.2: Least game counts, longest idle time
    - 2.3: Gender balance (4M, 4F, or 2M/2F only)
    - 2.4: Prefer same or similar levels
    - 2.5: AVOID Advanced + Novice together
    - 2.6: AVOID Advanced + Intermediate together
    - 2.7: Balance levels
  - Fallback: Relaxes level restrictions if no valid players found

- **v1.5.3** - Smart Match Algorithm v7 (Rule 3 as Exception)
  - Reordered rules: Exception rule is now Rule 3
  - Rule 3 EXCEPTION: If match has players, balance gender AND prioritize same/similar levels
    - Same level gets highest priority (+100 score)
    - Adjacent levels get secondary priority (+75, +50)
    - Still balances genders for mixed matches (2M + 2F)
  - Cleaner rule numbering: 4-14 apply to empty matches

- **v1.5.2** - Smart Match Algorithm v6 (Rule 13 as Exception)
  - Rule 13 now functions as an EXCEPTION to all other rules
  - When match already has players:
    - Algorithm first checks existing player composition
    - Prioritizes balancing genders AND levels based on what's already there
    - For expert matches with existing players: fills with same gender experts/advanced
    - For non-expert matches with existing players: balances both gender and level
  - When match is empty: applies normal rules (3-12, 14)
  - Clearer separation of logic between "match has players" and "empty match" scenarios

- **v1.5.1** - Smart Match Algorithm v5 (Refined Rules)
  - Rule 12 changed: Mixed-gender matches now REQUIRE even split (2M + 2F), not just prefer
  - Rule 13 enhanced: More explicit gender balancing based on existing players
  - If match has males only → mixed mode adds females to balance
  - If match has females only → mixed mode adds males to balance
  - Removes excess players if even gender split cannot be achieved

- **v1.5.0** - Smart Match Algorithm v4 (14 Rules)
  1. Players with the least amount of game counts (priority)
  2. Longest idle time (secondary priority)
  3. Expert male players only grouped with expert male players
  4. Expert female players only grouped with expert female players
  5. If < 4 expert males available, allow advanced males with expert males
  6. If < 4 expert females available, allow advanced females with expert females
  7. Advanced players can only match with Novice once (noviceMatchCount tracking)
  8. Prefer mixing Advanced, Intermediate, Novice together
  9. Half the time, prefer same-gender matches (all male or all female)
  10. Half the time, prefer mixed-gender matches
  11. If mixed-gender, prefer even split (2M + 2F)
  12. Balance by skill level
  13. If match has 2 players, prioritize balancing levels and genders
  14. If not enough experts available, leave match empty

- **v1.4.8** - Updated player database
  - Updated from baddixx_players.csv (137 players)
  - Changed: Eloisa Pineda (Intermediate → Novice)
  - Changed: Nina San (Advanced → Expert)
  - Added: Raina Pepito (female, Expert)

- **v1.4.7** - Match Queue stats size increase
  - Increased gender, game count, and level size to text-sm (14px)

- **v1.4.6** - Match Queue player card improvements
  - Made gender, game count, and level smaller (text-xs)
  - Aligned gender, game count, and level to the right side of player cards

- **v1.4.5** - Equal panel heights
  - All three panels (Player Pool, Match Queue, Courts) now have equal heights
  - Used flexbox layout to ensure consistent sizing across the UI

- **v1.4.4** - Consistent panel heights
  - Added sticky positioning to Match Queue section
  - All three panels (Player Pool, Match Queue, Courts) now have consistent height

- **v1.4.3** - Gender-colored player names
  - Player names now colored by gender (blue for male, pink for female)
  - Applied across all UI sections: Player Pool, Match Queue, Courts, Player Database

- **v1.4.2** - Gender icon visibility across all sections
  - Updated GenderIcon component with larger size and brighter colors
  - Consistent styling in Player Pool, Match Queue, and Courts

- **v1.4.1** - Improved gender icon visibility
  - Made gender icons (♂/♀) larger (text-lg, 18px)
  - Brighter colors (blue-300/pink-300) for better visibility

- **v1.4.0** - Match header improvements
  - Changed "Auto" button to "Smart Match"
  - Increased match header text size (Select, Smart Match, player count, Clear, delete icon)
  - Larger buttons and icons for better visibility

- **v1.3.9** - Match and court improvements
  - Added "Clear" button to matches (returns all players to pool)
  - Changed "Sel" button to show full "Select"/"Selected" text
  - Default courts changed to: Court 15, Court 16, Court 17, Court 18
  - Match player card font increased to 16px (text-base)

- **v1.3.8** - Header styling
  - Made "CueMii App" text larger (text-2xl, bold)
  - Combined creator credit and version on same line: "Created by Joseph Vertido · v1.3.8"

- **v1.3.7** - UI improvements
  - Increased font size for match player cards to 14px (text-sm)
  - Players assigned to matches now appear at bottom of Player Pool list
  - Available players sorted by wait time, matched players sorted separately below

- **v1.3.6** - Larger font for match player cards
  - Increased font size from 9px to 12px (text-xs)
  - Better readability while maintaining compact layout

- **v1.3.5** - Ultra-compact match cards
  - Each player displayed in single line: "Joseph V. ♂ 🎮3 E"
  - All 4 players in one horizontal row
  - Maximum vertical space efficiency

- **v1.3.4** - Horizontal player layout
  - All 4 players now displayed in a single horizontal row
  - Two-line format per player: Name on top, stats below
  - Single letter level indicator (E/A/I/N)
  - Remove button appears on hover
  - Maximum space efficiency for matches

- **v1.3.3** - Single-line player cards
  - Player cards in Match Queue now display in single line format
  - Format: "FirstName L. ♂ 🎮3 [Exp]" 
  - More compact vertical layout

- **v1.3.2** - Compact Match Queue UI
  - Condensed match cards to show more matches on screen
  - 4-column player layout (instead of 2x2 grid)
  - Smaller padding, fonts, and buttons
  - Shows first name only to save space
  - Abbreviated level badges (Exp, Adv, Int, Nov)
  - Hover to reveal remove button on players

- **v1.3.1** - UI improvement
  - Play counter (🎮) now displayed in Match Queue player cards

- **v1.3.0** - Smart Match Algorithm v3
  - Complete algorithm rewrite with 12 rules:
    1. Longest idle time priority
    2. Expert male players only with expert males
    3. Expert female players only with expert females
    4. Allow Advanced males with Expert males if < 4 Expert males available
    5. Allow Advanced females with Expert females if < 4 Expert females available
    6. Advanced players can only match with Novice players once (tracked via noviceMatchCount)
    7. Prefer mixing Advanced, Intermediate, and Novice together
    8. Half matches prefer same-gender (all male or all female)
    9. Half matches prefer mixed gender
    10. Mixed gender matches prefer 2M + 2F balance
    11. Skill level balancing across the match
    12. Leave match empty if not enough expert players available
  - Added noviceMatchCount tracking for Advanced players

- **v1.2.0** - Play counter feature
  - Added play counter for each player in the pool
  - Counter increments every time a player is sent to a court
  - Play count displayed with 🎮 icon in Player Pool
  - Play count persists when players return from matches

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
