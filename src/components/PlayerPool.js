import React from 'react';
import { SKILL_LEVELS } from '../data/initialData';
import { formatWaitTime } from '../utils/formatters';
import LevelBadge from './LevelBadge';
import GenderIcon from './GenderIcon';

/**
 * Player pool section displaying all players waiting to be matched
 */
const PlayerPool = ({ 
  poolPlayers,
  poolSearch,
  setPoolSearch,
  poolLevelFilter,
  setPoolLevelFilter,
  isPlayerInMatch,
  removeFromPool,
  selectedMatch,
  addPlayerToMatch,
  selectedMatchId,
  clearIdleTimes
}) => {
  // Filter pool players based on search and level filter
  const filteredPoolPlayers = poolPlayers
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(poolSearch.toLowerCase());
      const matchesLevel = poolLevelFilter === 'All' || p.level === poolLevelFilter;
      return matchesSearch && matchesLevel;
    });

  // Split into available and in-match players
  const availablePlayers = filteredPoolPlayers
    .filter(p => !isPlayerInMatch(p.id))
    .sort((a, b) => a.joinedAt - b.joinedAt); // Longest wait first
  
  const playersInMatch = filteredPoolPlayers
    .filter(p => isPlayerInMatch(p.id))
    .sort((a, b) => a.joinedAt - b.joinedAt);

  // Handle Clear Timers with confirmation
  const handleClearTimers = () => {
    if (window.confirm('Are you sure you want to clear all player idle times? This will reset everyone\'s wait time to now.')) {
      clearIdleTimes();
    }
  };

  // Player card component - compact for 2-column layout
  const PlayerCard = ({ player, inMatch }) => (
    <div
      className={`group bg-slate-800/50 rounded-lg p-2 border transition-all ${
        inMatch 
          ? 'border-yellow-500/30 opacity-70' 
          : 'border-slate-700/50 hover:border-cyan-500/50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <GenderIcon gender={player.gender} />
          <span className={`font-medium text-sm truncate ${player.gender === 'male' ? 'text-blue-300' : 'text-pink-300'}`}>{player.name}</span>
        </div>
        {!inMatch && (
          <button
            onClick={() => removeFromPool(player.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-0.5 rounded transition-all flex-shrink-0"
            title="Remove from pool"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-1">
        <LevelBadge level={player.level} />
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500" title="Wait time">
            ⏱{formatWaitTime(player.joinedAt)}
          </span>
          <span className="text-emerald-400" title="Games played">
            🎮{player.playCount || 0}
          </span>
        </div>
      </div>
      {selectedMatch && !inMatch && selectedMatch.players.length < 4 && (
        <button
          onClick={() => addPlayerToMatch(selectedMatchId, player)}
          className="mt-1.5 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs py-1 rounded transition-colors"
        >
          + Add to Match
        </button>
      )}
    </div>
  );

  return (
    <section className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-cyan-600/20 to-teal-600/20 border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Player Pool</h2>
              <p className="text-slate-400 text-sm">{poolPlayers.length} players waiting</p>
            </div>
          </div>
          {/* Clear Timers Button */}
          <button
            onClick={handleClearTimers}
            disabled={poolPlayers.length === 0}
            className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-300 hover:text-white disabled:text-slate-500 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            title="Reset all idle times to now"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Clear Timers
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="mt-4 flex gap-3">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={poolSearch}
              onChange={(e) => setPoolSearch(e.target.value)}
              placeholder="Search players..."
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
          <select
            value={poolLevelFilter}
            onChange={(e) => setPoolLevelFilter(e.target.value)}
            className="bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
          >
            <option value="All">All Levels</option>
            {SKILL_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {filteredPoolPlayers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>No players in pool</p>
            <p className="text-sm mt-1">Add players from the database</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Available Players Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">
                  Available ({availablePlayers.length})
                </h3>
              </div>
              {availablePlayers.length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-sm bg-slate-800/30 rounded-lg">
                  No available players
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availablePlayers.map(player => (
                    <PlayerCard key={player.id} player={player} inMatch={false} />
                  ))}
                </div>
              )}
            </div>
            
            {/* Players In Match Section */}
            {playersInMatch.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 pt-2 border-t border-slate-700/50">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
                    In Match ({playersInMatch.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {playersInMatch.map(player => (
                    <PlayerCard key={player.id} player={player} inMatch={true} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PlayerPool;
