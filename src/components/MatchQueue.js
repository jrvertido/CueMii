import React from 'react';
import LevelBadge from './LevelBadge';
import GenderIcon from './GenderIcon';

/**
 * Match queue section for creating and managing matches
 */
const MatchQueue = ({
  matches,
  selectedMatchId,
  setSelectedMatchId,
  createMatch,
  deleteMatch,
  clearMatch,
  removePlayerFromMatch,
  smartMatch,
  moveMatchToCourt,
  courts,
  getAvailablePoolPlayers
}) => {
  return (
    <section className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Match Queue</h2>
              <p className="text-slate-400 text-xs">{matches.length} pending</p>
            </div>
          </div>
          <button
            onClick={createMatch}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 px-3 py-1.5 rounded-lg font-semibold transition-all shadow-lg shadow-orange-500/25 flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create
          </button>
        </div>
      </div>
      
      <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
        {matches.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className="text-sm">No matches in queue</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map(match => {
              const isComplete = match.players.length === 4;
              return (
              <div
                key={match.id}
                className={`rounded-lg border transition-all ${
                  isComplete 
                    ? 'bg-emerald-900/30 border-emerald-500/50' 
                    : 'bg-slate-800/50 border-slate-700/50'
                } ${
                  selectedMatchId === match.id 
                    ? isComplete 
                      ? 'border-emerald-400 shadow-lg shadow-emerald-500/20' 
                      : 'border-orange-500 shadow-lg shadow-orange-500/10'
                    : 'hover:border-slate-600'
                }`}
              >
                <div className="p-2">
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedMatchId(selectedMatchId === match.id ? null : match.id)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          selectedMatchId === match.id
                            ? isComplete 
                              ? 'bg-emerald-500 text-white'
                              : 'bg-orange-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {selectedMatchId === match.id ? 'Selected' : 'Select'}
                      </button>
                      <span className={`text-sm font-medium ${isComplete ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {match.players.length}/4 {isComplete && '✓'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => smartMatch(match.id)}
                        disabled={match.players.length >= 4 || getAvailablePoolPlayers().length === 0}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed px-3 py-1 rounded text-sm font-medium transition-all flex items-center gap-1"
                        title="Smart Match"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Smart Match
                      </button>
                      {match.players.length > 0 && (
                        <button
                          onClick={() => clearMatch(match.id)}
                          className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-sm font-medium transition-colors text-slate-200"
                          title="Clear all players from match"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={() => deleteMatch(match.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                        title="Delete match"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Players - All 4 in a single horizontal line, each player single line */}
                  <div className="flex gap-1 mb-2">
                    {[0, 1, 2, 3].map(index => {
                      const player = match.players[index];
                      // Format name as "FirstName L."
                      const formatName = (name) => {
                        const parts = name.split(' ');
                        if (parts.length > 1) {
                          return `${parts[0]} ${parts[parts.length - 1][0]}.`;
                        }
                        return parts[0];
                      };
                      return (
                        <div
                          key={index}
                          className={`flex-1 rounded px-2 py-1.5 border ${
                            player 
                              ? player.gender === 'male'
                                ? 'bg-blue-900/60 border-blue-500/50'
                                : 'bg-pink-900/60 border-pink-500/50'
                              : 'bg-slate-800/30 border-dashed border-slate-700'
                          }`}
                        >
                          {player ? (
                            <div className="relative group flex items-center justify-between gap-1">
                              <span className={`truncate font-semibold text-base ${player.gender === 'male' ? 'text-blue-200' : 'text-pink-200'}`} title={player.name}>
                                {formatName(player.name)}
                              </span>
                              <div className="flex items-center gap-1 text-sm flex-shrink-0">
                                <span className="text-emerald-400">🎮{player.playCount || 0}</span>
                                <span className={`px-1.5 py-0.5 rounded font-bold text-xs ${
                                  player.level === 'Expert' ? 'bg-purple-500/50 text-purple-200 border border-purple-400/50' :
                                  player.level === 'Advanced' ? 'bg-orange-500/50 text-orange-200 border border-orange-400/50' :
                                  player.level === 'Intermediate' ? 'bg-cyan-500/50 text-cyan-200 border border-cyan-400/50' :
                                  'bg-green-500/50 text-green-200 border border-green-400/50'
                                }`}>
                                  {player.level[0]}
                                </span>
                                <button
                                  onClick={() => removePlayerFromMatch(match.id, player.id)}
                                  className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-600 text-base text-center">—</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Move to Court - Compact */}
                  {match.players.length > 0 && (
                    <div className="flex gap-1">
                      {courts.filter(c => !c.match).map(court => (
                        <button
                          key={court.id}
                          onClick={() => moveMatchToCourt(match.id, court.id)}
                          className="flex-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-xs py-1 rounded transition-colors flex items-center justify-center gap-0.5"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          {court.name}
                        </button>
                      ))}
                      {courts.filter(c => !c.match).length === 0 && (
                        <div className="flex-1 text-center text-slate-500 text-xs py-1">
                          No courts
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MatchQueue;
