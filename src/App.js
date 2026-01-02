import React, { useState } from 'react';
import { initialPlayers, initialCourts } from './data/initialData';
import useCurrentTime from './hooks/useCurrentTime';
import useLocalStorage from './hooks/useLocalStorage';
import {
  Header,
  PlayerDatabaseModal,
  PlayerPool,
  MatchQueue,
  CourtsPanel
} from './components';

/**
 * Main Baddixx Queuing System Application
 */
function App() {
  // Persistent State (saved to localStorage)
  const [players, setPlayers] = useLocalStorage('baddixx_players', initialPlayers);
  const [poolPlayers, setPoolPlayers] = useLocalStorage('baddixx_pool', []);
  const [matches, setMatches] = useLocalStorage('baddixx_matches', []);
  const [courts, setCourts] = useLocalStorage('baddixx_courts', initialCourts);
  
  // UI State (not persisted)
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [poolSearch, setPoolSearch] = useState('');
  const [poolLevelFilter, setPoolLevelFilter] = useState('All');
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [newCourtName, setNewCourtName] = useState('');
  const [editingCourtId, setEditingCourtId] = useState(null);
  const [editingCourtName, setEditingCourtName] = useState('');
  
  const currentTime = useCurrentTime();

  // ==================== Reset Function ====================
  
  const resetAllData = () => {
    if (window.confirm('Are you sure you want to reset? This will clear the player pool, matches, and courts (player database will be preserved).')) {
      // Keep players, only reset pool, matches, and courts
      setPoolPlayers([]);
      setMatches([]);
      setCourts(initialCourts);
    }
  };

  // ==================== Player Database Functions ====================
  
  const addPlayer = (player) => {
    setPlayers([...players, player]);
  };

  const importPlayers = (newPlayers) => {
    const existingNames = new Set(players.map(p => p.name.toLowerCase()));
    const uniqueNewPlayers = newPlayers.filter(p => !existingNames.has(p.name.toLowerCase()));
    setPlayers([...players, ...uniqueNewPlayers]);
  };

  const editPlayer = (updatedPlayer) => {
    setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    setPoolPlayers(poolPlayers.map(p => p.id === updatedPlayer.id ? { ...updatedPlayer, joinedAt: p.joinedAt } : p));
  };

  const deletePlayer = (playerId) => {
    setPlayers(players.filter(p => p.id !== playerId));
    setPoolPlayers(poolPlayers.filter(p => p.id !== playerId));
    setMatches(matches.map(m => ({
      ...m,
      players: m.players.filter(p => p.id !== playerId)
    })));
  };

  // ==================== Pool Functions ====================
  
  const addToPool = (player) => {
    if (!poolPlayers.find(p => p.id === player.id)) {
      setPoolPlayers([...poolPlayers, { ...player, joinedAt: Date.now() }]);
    }
  };

  const removeFromPool = (playerId) => {
    setPoolPlayers(poolPlayers.filter(p => p.id !== playerId));
  };

  const isPlayerInMatch = (playerId) => {
    const inQueuedMatch = matches.some(m => m.players.some(p => p.id === playerId));
    const onCourt = courts.some(c => c.match && c.match.players.some(p => p.id === playerId));
    return inQueuedMatch || onCourt;
  };

  const getAvailablePoolPlayers = () => {
    return poolPlayers.filter(p => !isPlayerInMatch(p.id));
  };

  // ==================== Match Functions ====================
  
  const createMatch = () => {
    const newMatch = {
      id: Date.now(),
      players: [],
      createdAt: Date.now()
    };
    setMatches([...matches, newMatch]);
    setSelectedMatchId(newMatch.id);
  };

  const deleteMatch = (matchId) => {
    setMatches(matches.filter(m => m.id !== matchId));
    if (selectedMatchId === matchId) setSelectedMatchId(null);
  };

  const addPlayerToMatch = (matchId, player) => {
    setMatches(matches.map(m => {
      if (m.id === matchId && m.players.length < 4 && !m.players.find(p => p.id === player.id)) {
        return { ...m, players: [...m.players, player] };
      }
      return m;
    }));
  };

  const removePlayerFromMatch = (matchId, playerId) => {
    setMatches(matches.map(m => {
      if (m.id === matchId) {
        return { ...m, players: m.players.filter(p => p.id !== playerId) };
      }
      return m;
    }));
  };

  // ==================== Smart Match Algorithm ====================
  
  const smartMatch = (matchId) => {
    const availablePlayers = getAvailablePoolPlayers();
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const currentPlayers = match.players;
    const neededPlayers = 4 - currentPlayers.length;
    
    if (neededPlayers <= 0 || availablePlayers.length === 0) return;

    // Priority 1: Sort by wait time (longest first - smallest joinedAt timestamp)
    const sortedByWait = [...availablePlayers].sort((a, b) => a.joinedAt - b.joinedAt);
    
    // Separate expert and non-expert players (maintaining wait time order)
    const expertPlayers = sortedByWait.filter(p => p.level === 'Expert');
    const nonExpertPlayers = sortedByWait.filter(p => p.level !== 'Expert');
    
    // Priority 2: Check if this is/should be an expert-only match
    const hasExpertInMatch = currentPlayers.some(p => p.level === 'Expert');
    const longestWaitingIsExpert = sortedByWait[0]?.level === 'Expert';
    const isExpertMatch = hasExpertInMatch || (currentPlayers.length === 0 && longestWaitingIsExpert);
    
    let selectedPlayers = [];
    
    if (isExpertMatch) {
      // Priority 2 & 6: Expert players can only group with experts
      // If not enough experts, leave slots empty
      // Still try to balance gender among experts
      const expertsByGender = {
        male: expertPlayers.filter(p => p.gender === 'male'),
        female: expertPlayers.filter(p => p.gender === 'female')
      };
      
      let maleCount = currentPlayers.filter(p => p.gender === 'male').length;
      let femaleCount = currentPlayers.filter(p => p.gender === 'female').length;
      
      while (selectedPlayers.length < neededPlayers) {
        // Pick from gender with fewer players
        let targetGender;
        if (maleCount <= femaleCount && expertsByGender.male.length > 0) {
          targetGender = 'male';
        } else if (expertsByGender.female.length > 0) {
          targetGender = 'female';
        } else if (expertsByGender.male.length > 0) {
          targetGender = 'male';
        } else {
          break; // No more expert players available
        }
        
        const player = expertsByGender[targetGender].shift();
        if (player) {
          selectedPlayers.push(player);
          if (targetGender === 'male') maleCount++;
          else femaleCount++;
        }
      }
    } else {
      // Non-expert mode: Mix and balance Advanced, Intermediate, Novice
      // Priority 3: Prefer mixing different levels together
      // Priority 4: Balance male and female players
      // Priority 5: Balance skill levels in the group
      
      if (nonExpertPlayers.length === 0) return;
      
      const levels = ['Advanced', 'Intermediate', 'Novice'];
      const genders = ['male', 'female'];
      
      // Group players by level and gender, maintaining wait time order
      const playerPool = {};
      levels.forEach(level => {
        genders.forEach(gender => {
          playerPool[`${level}_${gender}`] = nonExpertPlayers.filter(
            p => p.level === level && p.gender === gender
          );
        });
      });
      
      // Count current players in match by level and gender
      const currentLevelCounts = {};
      const currentGenderCounts = { male: 0, female: 0 };
      
      levels.forEach(level => {
        currentLevelCounts[level] = currentPlayers.filter(p => p.level === level).length;
      });
      genders.forEach(gender => {
        currentGenderCounts[gender] = currentPlayers.filter(p => p.gender === gender).length;
      });
      
      // Track selected counts
      const selectedLevelCounts = { Advanced: 0, Intermediate: 0, Novice: 0 };
      const selectedGenderCounts = { male: 0, female: 0 };
      
      // Round-robin selection balancing both gender and skill level
      while (selectedPlayers.length < neededPlayers) {
        let bestPlayer = null;
        let bestScore = -Infinity;
        let bestKey = null;
        
        // Evaluate each available player
        for (const level of levels) {
          for (const gender of genders) {
            const key = `${level}_${gender}`;
            if (playerPool[key].length === 0) continue;
            
            const player = playerPool[key][0]; // Longest waiting in this category
            
            // Calculate balance score (prefer underrepresented combinations)
            const totalLevelCount = currentLevelCounts[level] + selectedLevelCounts[level];
            const totalGenderCount = currentGenderCounts[gender] + selectedGenderCounts[gender];
            
            // Lower counts = higher priority (we want to balance)
            // Negative values so lower counts give higher scores
            const levelScore = -totalLevelCount;
            const genderScore = -totalGenderCount;
            
            // Combined score: prioritize gender balance slightly, then level balance
            // Also factor in wait time (earlier joinedAt = higher priority)
            const waitTimeBonus = (Date.now() - player.joinedAt) / 1000 / 60 / 60; // Hours waiting as bonus
            const score = (genderScore * 2) + (levelScore * 1.5) + (waitTimeBonus * 0.1);
            
            if (score > bestScore) {
              bestScore = score;
              bestPlayer = player;
              bestKey = key;
            }
          }
        }
        
        if (!bestPlayer) break; // No more players available
        
        // Add best player
        selectedPlayers.push(bestPlayer);
        playerPool[bestKey].shift();
        selectedLevelCounts[bestPlayer.level]++;
        selectedGenderCounts[bestPlayer.gender]++;
      }
    }
    
    // Add selected players to match
    if (selectedPlayers.length > 0) {
      setMatches(matches.map(m => {
        if (m.id === matchId) {
          return { ...m, players: [...m.players, ...selectedPlayers] };
        }
        return m;
      }));
    }
  };

  // ==================== Court Functions ====================
  
  const addCourt = () => {
    if (newCourtName.trim()) {
      setCourts([...courts, { id: Date.now(), name: newCourtName.trim(), match: null, startTime: null }]);
      setNewCourtName('');
    }
  };

  const deleteCourt = (courtId) => {
    const court = courts.find(c => c.id === courtId);
    if (court && court.match) {
      const matchPlayerIds = court.match.players.map(p => p.id);
      
      // Update existing pool players' joinedAt time, or add them if not in pool
      setPoolPlayers(prev => {
        const updatedPool = prev.map(p => {
          if (matchPlayerIds.includes(p.id)) {
            return { ...p, joinedAt: Date.now() };
          }
          return p;
        });
        
        const existingIds = new Set(prev.map(p => p.id));
        const newPlayers = court.match.players
          .filter(p => !existingIds.has(p.id))
          .map(p => ({ ...p, joinedAt: Date.now() }));
        
        return [...updatedPool, ...newPlayers];
      });
    }
    setCourts(courts.filter(c => c.id !== courtId));
  };

  const renameCourt = (courtId, newName) => {
    if (newName.trim()) {
      setCourts(courts.map(c => c.id === courtId ? { ...c, name: newName.trim() } : c));
    }
    setEditingCourtId(null);
    setEditingCourtName('');
  };

  const moveMatchToCourt = (matchId, courtId) => {
    const match = matches.find(m => m.id === matchId);
    const court = courts.find(c => c.id === courtId);
    
    if (match && court && !court.match && match.players.length > 0) {
      setCourts(courts.map(c => 
        c.id === courtId ? { ...c, match: match, startTime: Date.now() } : c
      ));
      setMatches(matches.filter(m => m.id !== matchId));
      if (selectedMatchId === matchId) setSelectedMatchId(null);
    }
  };

  const endMatch = (courtId) => {
    const court = courts.find(c => c.id === courtId);
    if (court && court.match) {
      const matchPlayerIds = court.match.players.map(p => p.id);
      
      // Update existing pool players' joinedAt time, or add them if not in pool
      setPoolPlayers(prev => {
        const updatedPool = prev.map(p => {
          if (matchPlayerIds.includes(p.id)) {
            // Reset wait time for players returning from match
            return { ...p, joinedAt: Date.now() };
          }
          return p;
        });
        
        // Add any players not already in pool
        const existingIds = new Set(prev.map(p => p.id));
        const newPlayers = court.match.players
          .filter(p => !existingIds.has(p.id))
          .map(p => ({ ...p, joinedAt: Date.now() }));
        
        return [...updatedPool, ...newPlayers];
      });
      
      setCourts(courts.map(c => 
        c.id === courtId ? { ...c, match: null, startTime: null } : c
      ));
    }
  };

  // ==================== Derived State ====================
  
  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  // ==================== Render ====================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 bg-pattern" />

      {/* Header */}
      <Header 
        onOpenDatabase={() => setIsDbModalOpen(true)} 
        onResetData={resetAllData}
      />

      {/* Main Content */}
      <main className="relative max-w-[1920px] mx-auto p-6">
        <div className="flex gap-6">
          {/* Left Panel - Player Pool */}
          <div className="w-[350px] flex-shrink-0">
            <PlayerPool
              poolPlayers={poolPlayers}
              poolSearch={poolSearch}
              setPoolSearch={setPoolSearch}
              poolLevelFilter={poolLevelFilter}
              setPoolLevelFilter={setPoolLevelFilter}
              isPlayerInMatch={isPlayerInMatch}
              removeFromPool={removeFromPool}
              selectedMatch={selectedMatch}
              addPlayerToMatch={addPlayerToMatch}
              selectedMatchId={selectedMatchId}
            />
          </div>

          {/* Middle Panel - Match Queue */}
          <div className="flex-1">
            <MatchQueue
              matches={matches}
              selectedMatchId={selectedMatchId}
              setSelectedMatchId={setSelectedMatchId}
              createMatch={createMatch}
              deleteMatch={deleteMatch}
              removePlayerFromMatch={removePlayerFromMatch}
              smartMatch={smartMatch}
              moveMatchToCourt={moveMatchToCourt}
              courts={courts}
              getAvailablePoolPlayers={getAvailablePoolPlayers}
            />
          </div>

          {/* Right Panel - Courts */}
          <div className="w-[350px] flex-shrink-0">
            <CourtsPanel
              courts={courts}
              newCourtName={newCourtName}
              setNewCourtName={setNewCourtName}
              addCourt={addCourt}
              deleteCourt={deleteCourt}
              editingCourtId={editingCourtId}
              setEditingCourtId={setEditingCourtId}
              editingCourtName={editingCourtName}
              setEditingCourtName={setEditingCourtName}
              renameCourt={renameCourt}
              endMatch={endMatch}
              currentTime={currentTime}
            />
          </div>
        </div>
      </main>

      {/* Player Database Modal */}
      <PlayerDatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        players={players}
        onAddPlayer={addPlayer}
        onEditPlayer={editPlayer}
        onDeletePlayer={deletePlayer}
        onAddToPool={addToPool}
        onRemoveFromPool={removeFromPool}
        poolPlayers={poolPlayers}
        onImportPlayers={importPlayers}
      />
    </div>
  );
}

export default App;
