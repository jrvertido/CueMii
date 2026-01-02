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
  removePlayerFromMatch,
  smartMatch,
  moveMatchToCourt,
  courts,
  getAvailablePoolPlayers
}) => {
  return (
    <section className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Match Queue</h2>
              <p className="text-slate-400 text-sm">{matches.length} matches pending</p>
            </div>
          </div>
          <button
            onClick={createMatch}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Match
          </button>
        </div>
      </div>
      
      <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
        {matches.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p>No matches in queue</p>
            <p className="text-sm mt-1">Create a match to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(match => (
              <div
                key={match.id}
                className={`bg-slate-800/50 rounded-xl border transition-all ${
                  selectedMatchId === match.id 
                    ? 'border-orange-500 shadow-lg shadow-orange-500/10' 
                    : 'border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedMatchId(selectedMatchId === match.id ? null : match.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          selectedMatchId === match.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {selectedMatchId === match.id ? 'Selected' : 'Select'}
                      </button>
                      <span className="text-slate-400 text-sm">
                        {match.players.length}/4 Players
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => smartMatch(match.id)}
                        disabled={match.players.length >= 4 || getAvailablePoolPlayers().length === 0}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Smart Match
                      </button>
                      <button
                        onClick={() => deleteMatch(match.id)}
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Players Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[0, 1, 2, 3].map(index => {
                      const player = match.players[index];
                      return (
                        <div
                          key={index}
                          className={`rounded-lg p-2 border ${
                            player 
                              ? 'bg-slate-700/50 border-slate-600' 
                              : 'bg-slate-800/30 border-dashed border-slate-700'
                          }`}
                        >
                          {player ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <GenderIcon gender={player.gender} />
                                <span className="text-sm text-white truncate">{player.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <LevelBadge level={player.level} />
                                <button
                                  onClick={() => removePlayerFromMatch(match.id, player.id)}
                                  className="text-red-400 hover:text-red-300 ml-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-slate-600 text-sm text-center py-1">
                              Empty Slot
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Move to Court */}
                  {match.players.length > 0 && (
                    <div className="flex gap-2">
                      {courts.filter(c => !c.match).map(court => (
                        <button
                          key={court.id}
                          onClick={() => moveMatchToCourt(match.id, court.id)}
                          className="flex-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          {court.name}
                        </button>
                      ))}
                      {courts.filter(c => !c.match).length === 0 && (
                        <div className="flex-1 text-center text-slate-500 text-sm py-2">
                          No courts available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MatchQueue;
