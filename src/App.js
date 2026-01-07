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

  // ==================== Clear Idle Times ====================
  
  const clearIdleTimes = () => {
    const now = Date.now();
    // Reset joinedAt for all pool players to current time
    setPoolPlayers(prev => prev.map(p => ({
      ...p,
      joinedAt: now
    })));
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
      return [...prevPool, { 
        ...player, 
        joinedAt: Date.now(), 
        playCount: 0,
        noviceMatchCount: 0 // Track how many times Advanced players matched with Novice
      }];
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
    setMatches(prev => {
      const updatedMatches = [...prev, newMatch];
      // Find the first empty match and select it
      const firstEmptyMatch = updatedMatches.find(m => m.players.length === 0);
      if (firstEmptyMatch) {
        setSelectedMatchId(firstEmptyMatch.id);
      }
      return updatedMatches;
    });
  };

  const deleteMatch = (matchId) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    if (selectedMatchId === matchId) setSelectedMatchId(null);
  };

  const addPlayerToMatch = (matchId, player) => {
    setMatches(prev => {
      const updatedMatches = prev.map(m => {
        if (m.id === matchId && m.players.length < 4 && !m.players.find(p => p.id === player.id)) {
          return { ...m, players: [...m.players, player] };
        }
        return m;
      });
      
      // Check if the match is now complete (4 players)
      const updatedMatch = updatedMatches.find(m => m.id === matchId);
      if (updatedMatch && updatedMatch.players.length === 4) {
        // Find the first incomplete match and select it
        const firstIncomplete = updatedMatches.find(m => m.players.length < 4);
        if (firstIncomplete) {
          setSelectedMatchId(firstIncomplete.id);
        } else {
          setSelectedMatchId(null);
        }
      }
      
      return updatedMatches;
    });
  };

  const removePlayerFromMatch = (matchId, playerId) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return { ...m, players: m.players.filter(p => p.id !== playerId) };
      }
      return m;
    }));
  };

  const clearMatch = (matchId) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return { ...m, players: [] };
      }
      return m;
    }));
    // Select the cleared match
    setSelectedMatchId(matchId);
  };

  // ==================== Smart Match Algorithm ====================
  
  /**
   * Smart Match Algorithm v12
   * 
   * Priority Rules:
   * 1.  Players with least game counts
   * 2.  Longest idle time
   * 3.  If match has 1M + 1F, must complete with 1M + 1F
   * 4.  Expert males only with expert males (EXCEPT rule 3)
   * 5.  Expert females only with expert females (EXCEPT rule 3)
   * 6.  If < 4 expert males, allow advanced males
   * 7.  If < 4 expert females, allow advanced females
   * 8.  Advanced + Novice only once per Advanced player
   * 9.  Prefer mixing Advanced/Intermediate/Novice
   * 10. Half the time: same-gender (4M or 4F) - RANDOM at match time
   * 11. Half the time: mixed-gender (2M + 2F) - RANDOM at match time
   * 12. Balance by skill level
   * 13. Leave empty if not enough experts
   * 14. Leave empty if not enough players in pool
   * 15. FALLBACK: If same-gender not possible, try mixed-gender
   * 16. FALLBACK: If mixed-gender not possible, try same-gender
   */
  const smartMatch = (matchId) => {
    const availablePlayers = getAvailablePoolPlayers();
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const currentPlayers = match.players;
    const neededPlayers = 4 - currentPlayers.length;
    
    // Rule 14: Leave empty if not enough players
    if (neededPlayers <= 0 || availablePlayers.length === 0) return;

    // Rules 1 & 2: Sort by playCount (ascending), then by joinedAt (ascending = longest wait)
    const sortedPlayers = [...availablePlayers].sort((a, b) => {
      const playCountDiff = (a.playCount || 0) - (b.playCount || 0);
      if (playCountDiff !== 0) return playCountDiff;
      return a.joinedAt - b.joinedAt;
    });
    
    // Separate players by category
    const expertMales = sortedPlayers.filter(p => p.level === 'Expert' && p.gender === 'male');
    const expertFemales = sortedPlayers.filter(p => p.level === 'Expert' && p.gender === 'female');
    const advancedMales = sortedPlayers.filter(p => p.level === 'Advanced' && p.gender === 'male');
    const advancedFemales = sortedPlayers.filter(p => p.level === 'Advanced' && p.gender === 'female');
    const nonExpertPlayers = sortedPlayers.filter(p => p.level !== 'Expert');
    
    // Check current match composition
    const currentMales = currentPlayers.filter(p => p.gender === 'male').length;
    const currentFemales = currentPlayers.filter(p => p.gender === 'female').length;
    const hasExpertMale = currentPlayers.some(p => p.level === 'Expert' && p.gender === 'male');
    const hasExpertFemale = currentPlayers.some(p => p.level === 'Expert' && p.gender === 'female');
    
    // Helper: Check if Advanced can match with Novice (Rule 8)
    const canAdvancedMatchNovice = (player) => (player.noviceMatchCount || 0) < 1;
    
    let selectedPlayers = [];
    
    // ============================================================
    // RULE 3: If match has 1M + 1F, must complete with 1M + 1F
    // This overrides expert exclusivity rules (4 & 5)
    // ============================================================
    if (currentMales === 1 && currentFemales === 1) {
      const levels = ['Expert', 'Advanced', 'Intermediate', 'Novice'];
      const nonExpertLevels = ['Advanced', 'Intermediate', 'Novice'];
      
      // Get current levels in match
      const currentLevels = currentPlayers.map(p => p.level);
      const hasNoviceInMatch = currentLevels.includes('Novice');
      
      // Need exactly 1 male and 1 female
      const malesPool = sortedPlayers.filter(p => p.gender === 'male');
      const femalesPool = sortedPlayers.filter(p => p.gender === 'female');
      
      // Select best male
      let selectedMale = null;
      for (const player of malesPool) {
        // Rule 8: Check Advanced + Novice restriction
        if (player.level === 'Advanced' && hasNoviceInMatch && !canAdvancedMatchNovice(player)) {
          continue;
        }
        if (player.level === 'Novice') {
          const advancedInMatch = currentPlayers.filter(p => p.level === 'Advanced');
          if (advancedInMatch.some(p => !canAdvancedMatchNovice(p))) {
            continue;
          }
        }
        selectedMale = player;
        break;
      }
      
      // Select best female
      let selectedFemale = null;
      const updatedHasNovice = hasNoviceInMatch || (selectedMale && selectedMale.level === 'Novice');
      const updatedHasAdvancedWhoCannotMatchNovice = [...currentPlayers, ...(selectedMale ? [selectedMale] : [])]
        .filter(p => p.level === 'Advanced')
        .some(p => !canAdvancedMatchNovice(p));
      
      for (const player of femalesPool) {
        // Rule 8: Check Advanced + Novice restriction
        if (player.level === 'Advanced' && updatedHasNovice && !canAdvancedMatchNovice(player)) {
          continue;
        }
        if (player.level === 'Novice' && updatedHasAdvancedWhoCannotMatchNovice) {
          continue;
        }
        selectedFemale = player;
        break;
      }
      
      if (selectedMale) selectedPlayers.push(selectedMale);
      if (selectedFemale) selectedPlayers.push(selectedFemale);
      
    } else if (currentPlayers.length > 0) {
      // ============================================================
      // MATCH HAS PLAYERS (but not 1M + 1F case)
      // ============================================================
      
      const nonExpertLevels = ['Advanced', 'Intermediate', 'Novice'];
      const isExpertMatch = hasExpertMale || hasExpertFemale;
      
      // Get current levels
      const currentLevels = currentPlayers.map(p => p.level);
      const hasNoviceInMatch = currentLevels.includes('Novice');
      
      // Determine target gender mode
      let targetGenderMode;
      if (currentMales > 0 && currentFemales > 0) {
        // Already mixed - need to balance to 2M/2F
        targetGenderMode = 'mixed';
      } else if (currentMales > 0) {
        // Check if mixed mode or same-gender
        if (currentMales === 2) {
          // 2 males - can go 4M or needs 2F for mixed
          const availableMales = sortedPlayers.filter(p => p.gender === 'male').length;
          targetGenderMode = availableMales >= 2 ? 'male' : 'mixed';
        } else {
          // 1 or 3 males - try to make 4M
          const availableMales = nonExpertPlayers.filter(p => p.gender === 'male').length;
          const neededMales = 4 - currentMales;
          if (availableMales >= neededMales) {
            targetGenderMode = 'male';
          } else {
            // FALLBACK: Not enough males, try mixed if possible
            const availableFemales = nonExpertPlayers.filter(p => p.gender === 'female').length;
            const neededForMixed = 2 - currentMales; // males needed for 2M
            if (neededForMixed <= 0 || (availableMales >= neededForMixed && availableFemales >= 2)) {
              targetGenderMode = 'mixed';
            } else {
              targetGenderMode = 'male'; // Try anyway with what we have
            }
          }
        }
      } else if (currentFemales > 0) {
        // Check if mixed mode or same-gender
        if (currentFemales === 2) {
          // 2 females - can go 4F or needs 2M for mixed
          const availableFemales = sortedPlayers.filter(p => p.gender === 'female').length;
          targetGenderMode = availableFemales >= 2 ? 'female' : 'mixed';
        } else {
          // 1 or 3 females - try to make 4F
          const availableFemales = nonExpertPlayers.filter(p => p.gender === 'female').length;
          const neededFemales = 4 - currentFemales;
          if (availableFemales >= neededFemales) {
            targetGenderMode = 'female';
          } else {
            // FALLBACK: Not enough females, try mixed if possible
            const availableMales = nonExpertPlayers.filter(p => p.gender === 'male').length;
            const neededForMixed = 2 - currentFemales; // females needed for 2F
            if (neededForMixed <= 0 || (availableFemales >= neededForMixed && availableMales >= 2)) {
              targetGenderMode = 'mixed';
            } else {
              targetGenderMode = 'female'; // Try anyway with what we have
            }
          }
        }
      } else {
        targetGenderMode = (Math.random() < 0.5) ? 'mixed' : 'same';
        
        // Apply fallback logic for empty match section
        if (targetGenderMode === 'same') {
          // Will be handled in same-gender logic below
        } else {
          // Check if mixed is possible
          const availMales = nonExpertPlayers.filter(p => p.gender === 'male').length;
          const availFemales = nonExpertPlayers.filter(p => p.gender === 'female').length;
          if (availMales < 2 || availFemales < 2) {
            // Can't do mixed, try same-gender
            if (availMales >= availFemales) {
              targetGenderMode = 'male';
            } else {
              targetGenderMode = 'female';
            }
          }
        }
      }
      
      if (isExpertMatch) {
        // Rules 4-7: Expert match handling
        let eligiblePlayers;
        if (hasExpertMale) {
          // Rule 4 & 6: Expert males (allow advanced if < 4)
          eligiblePlayers = [...expertMales, ...advancedMales];
        } else {
          // Rule 5 & 7: Expert females (allow advanced if < 4)
          eligiblePlayers = [...expertFemales, ...advancedFemales];
        }
        eligiblePlayers.sort((a, b) => {
          const playCountDiff = (a.playCount || 0) - (b.playCount || 0);
          if (playCountDiff !== 0) return playCountDiff;
          return a.joinedAt - b.joinedAt;
        });
        // Rule 13: Fill with available, leave empty if not enough
        selectedPlayers = eligiblePlayers.slice(0, neededPlayers);
      } else {
        // Non-expert match
        const nonExpertMales = nonExpertPlayers.filter(p => p.gender === 'male');
        const nonExpertFemales = nonExpertPlayers.filter(p => p.gender === 'female');
        
        const playerPool = {};
        nonExpertLevels.forEach(level => {
          playerPool[`${level}_male`] = nonExpertMales.filter(p => p.level === level);
          playerPool[`${level}_female`] = nonExpertFemales.filter(p => p.level === level);
        });
        
        let selectedMales = 0;
        let selectedFemales = 0;
        const selectedLevelCounts = { Advanced: 0, Intermediate: 0, Novice: 0 };
        
        while (selectedPlayers.length < neededPlayers) {
          let bestPlayer = null;
          let bestScore = -Infinity;
          let bestKey = null;
          
          // Check Novice constraints (Rule 8)
          const hasNoviceInSelection = selectedPlayers.some(p => p.level === 'Novice') || hasNoviceInMatch;
          const advancedInMatch = [...currentPlayers, ...selectedPlayers].filter(p => p.level === 'Advanced');
          const hasAdvancedWhoCannotMatchNovice = advancedInMatch.some(p => !canAdvancedMatchNovice(p));
          
          // Determine allowed genders
          const totalMales = currentMales + selectedMales;
          const totalFemales = currentFemales + selectedFemales;
          
          let allowedGenders = [];
          if (targetGenderMode === 'mixed') {
            if (totalMales < 2 && nonExpertMales.some(p => !selectedPlayers.includes(p))) {
              allowedGenders.push('male');
            }
            if (totalFemales < 2 && nonExpertFemales.some(p => !selectedPlayers.includes(p))) {
              allowedGenders.push('female');
            }
            if (allowedGenders.length === 0) break;
          } else if (targetGenderMode === 'male') {
            if (nonExpertMales.some(p => !selectedPlayers.includes(p))) {
              allowedGenders = ['male'];
            } else {
              // Fall back to mixed if not enough males
              targetGenderMode = 'mixed';
              continue;
            }
          } else if (targetGenderMode === 'female') {
            if (nonExpertFemales.some(p => !selectedPlayers.includes(p))) {
              allowedGenders = ['female'];
            } else {
              // Fall back to mixed if not enough females
              targetGenderMode = 'mixed';
              continue;
            }
          } else {
            allowedGenders = ['male', 'female'];
          }
          
          for (const level of nonExpertLevels) {
            for (const gender of allowedGenders) {
              const key = `${level}_${gender}`;
              const availableInPool = playerPool[key].filter(p => !selectedPlayers.includes(p));
              if (availableInPool.length === 0) continue;
              
              const player = availableInPool[0];
              
              // Rule 8: Advanced + Novice check
              if (level === 'Advanced' && hasNoviceInSelection && !canAdvancedMatchNovice(player)) {
                continue;
              }
              if (level === 'Novice' && hasAdvancedWhoCannotMatchNovice) {
                continue;
              }
              
              // Calculate score
              const playCountPenalty = -(player.playCount || 0) * 100;
              const waitTimeBonus = (Date.now() - player.joinedAt) / 1000 / 60;
              
              // Rule 9: Prefer mixing levels
              let mixBonus = 0;
              const existingLevels = new Set([
                ...currentPlayers.map(p => p.level),
                ...selectedPlayers.map(p => p.level)
              ]);
              if (!existingLevels.has(level)) {
                mixBonus = 20;
              }
              
              // Rule 12: Balance levels
              const totalLevelCount = selectedLevelCounts[level] + currentLevels.filter(l => l === level).length;
              const levelBalanceScore = -totalLevelCount * 10;
              
              const score = playCountPenalty + (waitTimeBonus * 0.1) + mixBonus + levelBalanceScore;
              
              if (score > bestScore) {
                bestScore = score;
                bestPlayer = player;
                bestKey = key;
              }
            }
          }
          
          if (!bestPlayer) break;
          
          selectedPlayers.push(bestPlayer);
          selectedLevelCounts[bestPlayer.level]++;
          if (bestPlayer.gender === 'male') selectedMales++;
          else selectedFemales++;
          
          const poolArray = playerPool[bestKey];
          const idx = poolArray.indexOf(bestPlayer);
          if (idx > -1) poolArray.splice(idx, 1);
        }
        
        // Ensure valid gender composition for mixed
        if (targetGenderMode === 'mixed' && selectedPlayers.length > 0) {
          while (selectedPlayers.length > 0) {
            const checkMales = currentMales + selectedPlayers.filter(p => p.gender === 'male').length;
            const checkFemales = currentFemales + selectedPlayers.filter(p => p.gender === 'female').length;
            
            if (checkMales === checkFemales) break;
            
            if (checkMales > checkFemales) {
              const maleIdx = selectedPlayers.findIndex(p => p.gender === 'male');
              if (maleIdx > -1) selectedPlayers.splice(maleIdx, 1);
              else break;
            } else {
              const femaleIdx = selectedPlayers.findIndex(p => p.gender === 'female');
              if (femaleIdx > -1) selectedPlayers.splice(femaleIdx, 1);
              else break;
            }
          }
        }
      }
    } else {
      // ============================================================
      // EMPTY MATCH
      // ============================================================
      
      const longestWaiting = sortedPlayers[0];
      
      // Rules 4 & 5: Determine if Expert match
      const isExpertMaleMatch = longestWaiting?.level === 'Expert' && longestWaiting?.gender === 'male';
      const isExpertFemaleMatch = longestWaiting?.level === 'Expert' && longestWaiting?.gender === 'female';
      
      if (isExpertMaleMatch) {
        // Rules 4 & 6: Expert male match
        const totalExpertMales = expertMales.length;
        
        if (totalExpertMales >= neededPlayers) {
          selectedPlayers = expertMales.slice(0, neededPlayers);
        } else if (totalExpertMales > 0) {
          const eligiblePlayers = [...expertMales, ...advancedMales];
          eligiblePlayers.sort((a, b) => {
            const playCountDiff = (a.playCount || 0) - (b.playCount || 0);
            if (playCountDiff !== 0) return playCountDiff;
            return a.joinedAt - b.joinedAt;
          });
          selectedPlayers = eligiblePlayers.slice(0, neededPlayers);
        }
        // Rule 13: Leave empty if not enough
        
      } else if (isExpertFemaleMatch) {
        // Rules 5 & 7: Expert female match
        const totalExpertFemales = expertFemales.length;
        
        if (totalExpertFemales >= neededPlayers) {
          selectedPlayers = expertFemales.slice(0, neededPlayers);
        } else if (totalExpertFemales > 0) {
          const eligiblePlayers = [...expertFemales, ...advancedFemales];
          eligiblePlayers.sort((a, b) => {
            const playCountDiff = (a.playCount || 0) - (b.playCount || 0);
            if (playCountDiff !== 0) return playCountDiff;
            return a.joinedAt - b.joinedAt;
          });
          selectedPlayers = eligiblePlayers.slice(0, neededPlayers);
        }
        // Rule 13: Leave empty if not enough
        
      } else {
        // Non-expert match
        if (nonExpertPlayers.length === 0) return;
        
        const levels = ['Advanced', 'Intermediate', 'Novice'];
        
        // Rules 10 & 11: Determine gender mode (random 50/50)
        const isMixedGenderMatch = (Math.random() < 0.5);
        let targetGenderMode = isMixedGenderMatch ? 'mixed' : 'same';
        
        const nonExpertMales = nonExpertPlayers.filter(p => p.gender === 'male');
        const nonExpertFemales = nonExpertPlayers.filter(p => p.gender === 'female');
        
        // If 'same' gender mode, determine which gender based on priority
        if (targetGenderMode === 'same') {
          const firstMale = nonExpertMales[0];
          const firstFemale = nonExpertFemales[0];
          if (firstMale && firstFemale) {
            const maleScore = (firstMale.playCount || 0) * 1000000000 + firstMale.joinedAt;
            const femaleScore = (firstFemale.playCount || 0) * 1000000000 + firstFemale.joinedAt;
            targetGenderMode = maleScore <= femaleScore ? 'male' : 'female';
          } else if (firstMale) {
            targetGenderMode = 'male';
          } else if (firstFemale) {
            targetGenderMode = 'female';
          } else {
            return;
          }
          
          // FALLBACK: If not enough players for same-gender match, try mixed
          if (targetGenderMode === 'male' && nonExpertMales.length < 4) {
            // Not enough males for 4M, try mixed (need at least 2M + 2F)
            if (nonExpertMales.length >= 2 && nonExpertFemales.length >= 2) {
              targetGenderMode = 'mixed';
            }
          } else if (targetGenderMode === 'female' && nonExpertFemales.length < 4) {
            // Not enough females for 4F, try mixed (need at least 2M + 2F)
            if (nonExpertMales.length >= 2 && nonExpertFemales.length >= 2) {
              targetGenderMode = 'mixed';
            }
          }
        } else {
          // FALLBACK: If 'mixed' mode but not enough for 2M + 2F, try same-gender
          if (nonExpertMales.length < 2 || nonExpertFemales.length < 2) {
            // Can't do mixed, try same-gender
            if (nonExpertMales.length >= 4) {
              targetGenderMode = 'male';
            } else if (nonExpertFemales.length >= 4) {
              targetGenderMode = 'female';
            } else if (nonExpertMales.length > nonExpertFemales.length) {
              targetGenderMode = 'male'; // More males available
            } else if (nonExpertFemales.length > 0) {
              targetGenderMode = 'female'; // More females available
            } else {
              targetGenderMode = 'male'; // Default
            }
          }
        }
        
        const playerPool = {};
        levels.forEach(level => {
          playerPool[`${level}_male`] = nonExpertMales.filter(p => p.level === level);
          playerPool[`${level}_female`] = nonExpertFemales.filter(p => p.level === level);
        });
        
        const selectedLevelCounts = { Advanced: 0, Intermediate: 0, Novice: 0 };
        let selectedMales = 0;
        let selectedFemales = 0;
        
        while (selectedPlayers.length < neededPlayers) {
          let bestPlayer = null;
          let bestScore = -Infinity;
          let bestKey = null;
          
          // Rule 8: Check Advanced + Novice restrictions
          const hasNoviceInSelection = selectedPlayers.some(p => p.level === 'Novice');
          const advancedInSelection = selectedPlayers.filter(p => p.level === 'Advanced');
          const hasAdvancedWhoCannotMatchNovice = advancedInSelection.some(p => !canAdvancedMatchNovice(p));
          
          let allowedGenders = [];
          if (targetGenderMode === 'mixed') {
            if (selectedMales < 2 && nonExpertMales.some(p => !selectedPlayers.includes(p))) {
              allowedGenders.push('male');
            }
            if (selectedFemales < 2 && nonExpertFemales.some(p => !selectedPlayers.includes(p))) {
              allowedGenders.push('female');
            }
            if (allowedGenders.length === 0) break;
          } else {
            allowedGenders = [targetGenderMode];
          }
          
          for (const level of levels) {
            for (const gender of allowedGenders) {
              const key = `${level}_${gender}`;
              const availableInPool = playerPool[key].filter(p => !selectedPlayers.includes(p));
              if (availableInPool.length === 0) continue;
              
              const player = availableInPool[0];
              
              // Rule 8: Advanced + Novice check
              if (level === 'Advanced' && hasNoviceInSelection && !canAdvancedMatchNovice(player)) {
                continue;
              }
              if (level === 'Novice' && hasAdvancedWhoCannotMatchNovice) {
                continue;
              }
              
              // Rule 12: Balance levels
              const totalLevelCount = selectedLevelCounts[level];
              const playCountPenalty = -(player.playCount || 0) * 100;
              const waitTimeBonus = (Date.now() - player.joinedAt) / 1000 / 60;
              const levelScore = -totalLevelCount * 10;
              
              // Rule 9: Mix levels bonus
              let mixBonus = 0;
              const existingLevels = new Set(selectedPlayers.map(p => p.level));
              if (!existingLevels.has(level)) {
                mixBonus = 20;
              }
              
              const score = playCountPenalty + (waitTimeBonus * 0.1) + levelScore + mixBonus;
              
              if (score > bestScore) {
                bestScore = score;
                bestPlayer = player;
                bestKey = key;
              }
            }
          }
          
          if (!bestPlayer) {
            // Try switching gender mode if same-gender fails
            if (targetGenderMode !== 'mixed') {
              const otherGender = targetGenderMode === 'male' ? 'female' : 'male';
              const otherPlayers = nonExpertPlayers.filter(p => p.gender === otherGender && !selectedPlayers.includes(p));
              if (otherPlayers.length >= neededPlayers - selectedPlayers.length) {
                targetGenderMode = otherGender;
                continue;
              }
            }
            break;
          }
          
          selectedPlayers.push(bestPlayer);
          selectedLevelCounts[bestPlayer.level]++;
          if (bestPlayer.gender === 'male') selectedMales++;
          else selectedFemales++;
          
          const poolArray = playerPool[bestKey];
          const idx = poolArray.indexOf(bestPlayer);
          if (idx > -1) poolArray.splice(idx, 1);
        }
        
        // Ensure even gender for mixed matches
        if (targetGenderMode === 'mixed' && selectedMales !== selectedFemales) {
          while (selectedPlayers.length > 0) {
            const checkMales = selectedPlayers.filter(p => p.gender === 'male').length;
            const checkFemales = selectedPlayers.filter(p => p.gender === 'female').length;
            
            if (checkMales === checkFemales) break;
            
            if (checkMales > checkFemales) {
              const maleIdx = selectedPlayers.findIndex(p => p.gender === 'male');
              if (maleIdx > -1) selectedPlayers.splice(maleIdx, 1);
              else break;
            } else {
              const femaleIdx = selectedPlayers.findIndex(p => p.gender === 'female');
              if (femaleIdx > -1) selectedPlayers.splice(femaleIdx, 1);
              else break;
            }
          }
        }
      }
    }
    
    // Add selected players to match
    if (selectedPlayers.length > 0) {
      setMatches(prev => {
        const updatedMatches = prev.map(m => {
          if (m.id === matchId) {
            return { ...m, players: [...m.players, ...selectedPlayers] };
          }
          return m;
        });
        
        // Check if the match is now complete (4 players)
        const updatedMatch = updatedMatches.find(m => m.id === matchId);
        if (updatedMatch && updatedMatch.players.length === 4) {
          // Find the first incomplete match and select it
          const firstIncomplete = updatedMatches.find(m => m.players.length < 4);
          if (firstIncomplete) {
            setSelectedMatchId(firstIncomplete.id);
          } else {
            setSelectedMatchId(null);
          }
        }
        
        return updatedMatches;
      });
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
            .map(p => ({ 
              ...p, 
              joinedAt: Date.now(), 
              playCount: p.playCount || 0,
              noviceMatchCount: p.noviceMatchCount || 0
            }));
          
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
    
    // Get player IDs being sent to court
    const playerIds = matchToMove.players.map(p => p.id);
    
    // Check if match has both Advanced and Novice players
    const hasAdvanced = matchToMove.players.some(p => p.level === 'Advanced');
    const hasNovice = matchToMove.players.some(p => p.level === 'Novice');
    const advancedWithNovice = hasAdvanced && hasNovice;
    
    // Get IDs of Advanced players in this match
    const advancedPlayerIds = matchToMove.players
      .filter(p => p.level === 'Advanced')
      .map(p => p.id);
    
    // Update pool players: increment playCount and noviceMatchCount if applicable
    setPoolPlayers(prev => prev.map(p => {
      if (playerIds.includes(p.id)) {
        const updates = { playCount: (p.playCount || 0) + 1 };
        // Increment noviceMatchCount for Advanced players matched with Novice
        if (advancedWithNovice && advancedPlayerIds.includes(p.id)) {
          updates.noviceMatchCount = (p.noviceMatchCount || 0) + 1;
        }
        return { ...p, ...updates };
      }
      return p;
    }));
    
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
              // Reset wait time for players returning from match, preserve playCount and noviceMatchCount
              return { ...p, joinedAt: Date.now() };
            }
            return p;
          });
          
          // Add any players not already in pool (preserve their stats)
          const existingIds = new Set(prevPool.map(p => p.id));
          const newPlayers = matchPlayers
            .filter(p => !existingIds.has(p.id))
            .map(p => ({ 
              ...p, 
              joinedAt: Date.now(), 
              playCount: p.playCount || 0,
              noviceMatchCount: p.noviceMatchCount || 0
            }));
          
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
        <div className="flex gap-6 items-stretch h-[calc(100vh-120px)]">
          {/* Left Panel - Player Pool */}
          <div className="w-[450px] flex-shrink-0">
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
              clearIdleTimes={clearIdleTimes}
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
              clearMatch={clearMatch}
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
