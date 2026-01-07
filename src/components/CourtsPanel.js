import React from 'react';
import { formatCourtTime } from '../utils/formatters';
import LevelBadge from './LevelBadge';
import GenderIcon from './GenderIcon';

/**
 * Courts panel displaying all courts and their current status
 */
const CourtsPanel = ({
  courts,
  newCourtName,
  setNewCourtName,
  addCourt,
  deleteCourt,
  editingCourtId,
  setEditingCourtId,
  editingCourtName,
  setEditingCourtName,
  renameCourt,
  endMatch,
  currentTime
}) => {
  return (
    <section className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Courts</h2>
              <p className="text-slate-400 text-sm">{courts.filter(c => c.match).length}/{courts.length} in use</p>
            </div>
          </div>
        </div>
        
        {/* Add Court */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newCourtName}
            onChange={(e) => setNewCourtName(e.target.value)}
            placeholder="New court name..."
            className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors text-sm"
            onKeyPress={(e) => e.key === 'Enter' && addCourt()}
          />
          <button
            onClick={addCourt}
            disabled={!newCourtName.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            Add
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {courts.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p>No courts created</p>
            <p className="text-sm mt-1">Add a court above</p>
          </div>
        ) : (
          courts.map(court => (
            <div
              key={court.id}
              className={`rounded-xl border overflow-hidden transition-all ${
                court.match 
                  ? 'bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-500/50' 
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
            >
              {/* Court Header */}
              <div className={`px-4 py-3 flex items-center justify-between ${
                court.match ? 'bg-emerald-500/10' : 'bg-slate-800/50'
              }`}>
                {editingCourtId === court.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editingCourtName}
                      onChange={(e) => setEditingCourtName(e.target.value)}
                      className="flex-1 bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-white text-sm"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && renameCourt(court.id, editingCourtName)}
                    />
                    <button
                      onClick={() => renameCourt(court.id, editingCourtName)}
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => { setEditingCourtId(null); setEditingCourtName(''); }}
                      className="text-slate-400 hover:text-slate-300"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${court.match ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                      <span className="font-semibold text-white">{court.name}</span>
                      {court.match && (
                        <span className="text-emerald-400 text-sm ml-2">
                          ⏱ {formatCourtTime(court.startTime, currentTime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingCourtId(court.id); setEditingCourtName(court.name); }}
                        className="text-slate-400 hover:text-slate-300 p-1 rounded hover:bg-slate-700/50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteCourt(court.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Court Content */}
              <div className="p-4">
                {court.match ? (
                  <>
                    {/* Players on Court */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {court.match.players.map((player) => (
                        <div
                          key={player.id}
                          className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50"
                        >
                          <div className="flex items-center gap-1.5">
                            <GenderIcon gender={player.gender} />
                            <span className={`text-sm truncate ${player.gender === 'male' ? 'text-blue-300' : 'text-pink-300'}`}>{player.name}</span>
                          </div>
                          <div className="mt-1">
                            <LevelBadge level={player.level} />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* End Match Button */}
                    <button
                      onClick={() => endMatch(court.id)}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                      </svg>
                      End Match
                    </button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-3 bg-slate-800/50 rounded-xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm">Court Available</p>
                    <p className="text-slate-600 text-xs mt-1">Assign a match from the queue</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default CourtsPanel;
