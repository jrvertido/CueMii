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
    setPlayers(prev => [...prev, player]);
  };

  const importPlayers = (newPlayers) => {
    setPlayers(prev => {
      const existingNames = new Set(prev.map(p => p.name.toLowerCase()));
      const uniqueNewPlayers = newPlayers.filter(p => !existingNames.has(p.name.toLowerCase()));
      return [...prev, ...uniqueNewPlayers];
    });
  };

  const editPlayer = (updatedPlayer) => {
    setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    setPoolPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? { ...updatedPlayer, joinedAt: p.joinedAt } : p));
  };

  const deletePlayer = (playerId) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    setPoolPlayers(prev => prev.filter(p => p.id !== playerId));
    setMatches(prev => prev.map(m => ({
      ...m,
      players: m.players.filter(p => p.id !== playerId)
    })));
  };

  // ==================== Pool Functions ====================
  
  const addToPool = (player) => {
    setPoolPlayers(prevPool => {
      // Check if player already exists in the pool
      if (prevPool.find(p => p.id === player.id)) {
        return prevPool; // Return unchanged if already in pool
      }
      return [...prevPool, { ...player, joinedAt: Date.now() }];
    });
  };

  const removeFromPool = (playerId) => {
    setPoolPlayers(prevPool => prevPool.filter(p => p.id !== playerId));
  };

  const removeAllFromPool = () => {
    setPoolPlayers([]);
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
    setMatches(prev => [...prev, newMatch]);
    setSelectedMatchId(newMatch.id);
  };

  const deleteMatch = (matchId) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    if (selectedMatchId === matchId) setSelectedMatchId(null);
  };

  const addPlayerToMatch = (matchId, player) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId && m.players.length < 4 && !m.players.find(p => p.id === player.id)) {
        return { ...m, players: [...m.players, player] };
      }
      return m;
    }));
  };

  const removePlayerFromMatch = (matchId, playerId) => {
    setMatches(prev => prev.map(m => {
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
    
    // Separate players by category
    const expertMales = sortedByWait.filter(p => p.level === 'Expert' && p.gender === 'male');
    const expertFemales = sortedByWait.filter(p => p.level === 'Expert' && p.gender === 'female');
    const nonExpertMales = sortedByWait.filter(p => p.level !== 'Expert' && p.gender === 'male');
    const nonExpertFemales = sortedByWait.filter(p => p.level !== 'Expert' && p.gender === 'female');
    const nonExpertPlayers = sortedByWait.filter(p => p.level !== 'Expert');
    
    // Check current match composition
    const hasExpertMale = currentPlayers.some(p => p.level === 'Expert' && p.gender === 'male');
    const hasExpertFemale = currentPlayers.some(p => p.level === 'Expert' && p.gender === 'female');
    const hasNonExpert = currentPlayers.some(p => p.level !== 'Expert');
    
    // Determine match type based on longest waiting player or current composition
    const longestWaiting = sortedByWait[0];
    const isExpertMaleMatch = hasExpertMale || (!hasExpertFemale && !hasNonExpert && currentPlayers.length === 0 && longestWaiting?.level === 'Expert' && longestWaiting?.gender === 'male');
    const isExpertFemaleMatch = hasExpertFemale || (!hasExpertMale && !hasNonExpert && currentPlayers.length === 0 && longestWaiting?.level === 'Expert' && longestWaiting?.gender === 'female');
    
    let selectedPlayers = [];
    
    if (isExpertMaleMatch) {
      // Rule 2: Expert male players only with expert male players
      selectedPlayers = expertMales.slice(0, neededPlayers);
    } else if (isExpertFemaleMatch) {
      // Rule 3: Expert female players only with expert female players
      selectedPlayers = expertFemales.slice(0, neededPlayers);
    } else {
      // Non-expert match: Rules 4-8
      if (nonExpertPlayers.length === 0) return;
      
      const levels = ['Advanced', 'Intermediate', 'Novice'];
      
      // Determine current gender composition
      const currentMales = currentPlayers.filter(p => p.gender === 'male').length;
      const currentFemales = currentPlayers.filter(p => p.gender === 'female').length;
      
      // Rule 5 & 6: Half the time same-gender, half the time mixed
      // Use a deterministic approach based on match ID to be consistent
      const isMixedGenderMatch = (match.id % 2 === 0);
      
      // If match already has players, respect their gender pattern
      let targetGenderMode;
      if (currentPlayers.length > 0) {
        if (currentMales > 0 && currentFemales > 0) {
          targetGenderMode = 'mixed';
        } else if (currentMales > 0) {
          targetGenderMode = 'male';
        } else if (currentFemales > 0) {
          targetGenderMode = 'female';
        } else {
          targetGenderMode = isMixedGenderMatch ? 'mixed' : (nonExpertMales[0]?.joinedAt < nonExpertFemales[0]?.joinedAt ? 'male' : 'female');
        }
      } else {
        targetGenderMode = isMixedGenderMatch ? 'mixed' : (nonExpertMales[0]?.joinedAt <= (nonExpertFemales[0]?.joinedAt || Infinity) ? 'male' : 'female');
      }
      
      // Group players by level and gender
      const playerPool = {};
      levels.forEach(level => {
        playerPool[`${level}_male`] = nonExpertMales.filter(p => p.level === level);
        playerPool[`${level}_female`] = nonExpertFemales.filter(p => p.level === level);
      });
      
      // Track counts
      const selectedLevelCounts = { Advanced: 0, Intermediate: 0, Novice: 0 };
      let selectedMales = 0;
      let selectedFemales = 0;
      
      // Current level counts
      const currentLevelCounts = {};
      levels.forEach(level => {
        currentLevelCounts[level] = currentPlayers.filter(p => p.level === level).length;
      });
      
      while (selectedPlayers.length < neededPlayers) {
        let bestPlayer = null;
        let bestScore = -Infinity;
        let bestKey = null;
        
        // Determine allowed genders for this pick
        let allowedGenders = [];
        if (targetGenderMode === 'mixed') {
          // Rule 7: Prefer even amount of male and female
          const totalMales = currentMales + selectedMales;
          const totalFemales = currentFemales + selectedFemales;
          const targetTotal = currentPlayers.length + selectedPlayers.length + 1;
          const idealMales = Math.ceil(targetTotal / 2);
          const idealFemales = Math.floor(targetTotal / 2);
          
          if (totalMales < idealMales && nonExpertMales.some(p => !selectedPlayers.includes(p))) {
            allowedGenders.push('male');
          }
          if (totalFemales < idealFemales && nonExpertFemales.some(p => !selectedPlayers.includes(p))) {
            allowedGenders.push('female');
          }
          if (allowedGenders.length === 0) {
            allowedGenders = ['male', 'female'];
          }
        } else {
          allowedGenders = [targetGenderMode];
        }
        
        // Evaluate each available player
        for (const level of levels) {
          for (const gender of allowedGenders) {
            const key = `${level}_${gender}`;
            const availableInPool = playerPool[key].filter(p => !selectedPlayers.includes(p));
            if (availableInPool.length === 0) continue;
            
            const player = availableInPool[0]; // Longest waiting in this category
            
            // Rule 8: Balance skill levels
            const totalLevelCount = currentLevelCounts[level] + selectedLevelCounts[level];
            
            // Calculate score
            const levelScore = -totalLevelCount * 10; // Prefer underrepresented levels
            const waitTimeBonus = (Date.now() - player.joinedAt) / 1000 / 60; // Minutes waiting
            
            // Gender balance bonus for mixed mode
            let genderBonus = 0;
            if (targetGenderMode === 'mixed') {
              const totalMales = currentMales + selectedMales;
              const totalFemales = currentFemales + selectedFemales;
              if (gender === 'male' && totalMales <= totalFemales) genderBonus = 5;
              if (gender === 'female' && totalFemales <= totalMales) genderBonus = 5;
            }
            
            const score = levelScore + (waitTimeBonus * 0.1) + genderBonus;
            
            if (score > bestScore) {
              bestScore = score;
              bestPlayer = player;
              bestKey = key;
            }
          }
        }
        
        if (!bestPlayer) {
          // If no player found with allowed genders, try any gender (fallback)
          if (targetGenderMode !== 'mixed') {
            targetGenderMode = 'mixed';
            continue;
          }
          break;
        }
        
        // Add best player
        selectedPlayers.push(bestPlayer);
        selectedLevelCounts[bestPlayer.level]++;
        if (bestPlayer.gender === 'male') selectedMales++;
        else selectedFemales++;
        
        // Remove from pool
        const poolArray = playerPool[bestKey];
        const idx = poolArray.indexOf(bestPlayer);
        if (idx > -1) poolArray.splice(idx, 1);
      }
    }
    
    // Add selected players to match
    if (selectedPlayers.length > 0) {
      setMatches(prev => prev.map(m => {
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
      setCourts(prev => [...prev, { id: Date.now(), name: newCourtName.trim(), match: null, startTime: null }]);
      setNewCourtName('');
    }
  };

  const deleteCourt = (courtId) => {
    setCourts(prev => {
      const court = prev.find(c => c.id === courtId);
      if (court && court.match) {
        const matchPlayerIds = court.match.players.map(p => p.id);
        
        // Update existing pool players' joinedAt time, or add them if not in pool
        setPoolPlayers(prevPool => {
          const updatedPool = prevPool.map(p => {
            if (matchPlayerIds.includes(p.id)) {
              return { ...p, joinedAt: Date.now() };
            }
            return p;
          });
          
          const existingIds = new Set(prevPool.map(p => p.id));
          const newPlayers = court.match.players
            .filter(p => !existingIds.has(p.id))
            .map(p => ({ ...p, joinedAt: Date.now() }));
          
          return [...updatedPool, ...newPlayers];
        });
      }
      return prev.filter(c => c.id !== courtId);
    });
  };

  const renameCourt = (courtId, newName) => {
    if (newName.trim()) {
      setCourts(prev => prev.map(c => c.id === courtId ? { ...c, name: newName.trim() } : c));
    }
    setEditingCourtId(null);
    setEditingCourtName('');
  };

  const moveMatchToCourt = (matchId, courtId) => {
    // Get the match first before we modify state
    const matchToMove = matches.find(m => m.id === matchId);
    if (!matchToMove || matchToMove.players.length === 0) return;
    
    setCourts(prev => {
      const court = prev.find(c => c.id === courtId);
      if (!court || court.match) return prev; // Court not found or already occupied
      
      return prev.map(c => 
        c.id === courtId ? { ...c, match: matchToMove, startTime: Date.now() } : c
      );
    });
    
    setMatches(prev => prev.filter(m => m.id !== matchId));
    if (selectedMatchId === matchId) setSelectedMatchId(null);
  };

  const endMatch = (courtId) => {
    setCourts(prev => {
      const court = prev.find(c => c.id === courtId);
      if (court && court.match) {
        const matchPlayerIds = court.match.players.map(p => p.id);
        const matchPlayers = court.match.players;
        
        // Update existing pool players' joinedAt time, or add them if not in pool
        setPoolPlayers(prevPool => {
          const updatedPool = prevPool.map(p => {
            if (matchPlayerIds.includes(p.id)) {
              // Reset wait time for players returning from match
              return { ...p, joinedAt: Date.now() };
            }
            return p;
          });
          
          // Add any players not already in pool
          const existingIds = new Set(prevPool.map(p => p.id));
          const newPlayers = matchPlayers
            .filter(p => !existingIds.has(p.id))
            .map(p => ({ ...p, joinedAt: Date.now() }));
          
          return [...updatedPool, ...newPlayers];
        });
        
        return prev.map(c => 
          c.id === courtId ? { ...c, match: null, startTime: null } : c
        );
      }
      return prev;
    });
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
        onRemoveAllFromPool={removeAllFromPool}
        poolPlayers={poolPlayers}
        onImportPlayers={importPlayers}
      />
    </div>
  );
}

export default App;
