import React from 'react';

/**
 * Application header with logo and manage players button
 * @param {Object} props
 * @param {Function} props.onOpenDatabase - Callback to open player database modal
 * @param {Function} props.onResetData - Callback to reset all application data
 */
const Header = ({ onOpenDatabase, onResetData }) => {
  return (
    <header className="relative bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 border-b border-pink-500/20 backdrop-blur-sm">
      <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/banner.jpg" 
            alt="Baddixx" 
            className="h-12 w-auto object-contain"
          />
          <div className="h-8 w-px bg-slate-700" />
          <div>
            <p className="text-pink-400 font-semibold tracking-wide">CueMii App</p>
            <p className="text-slate-500 text-xs">Created by Joseph Vertido</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onResetData}
            className="bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 text-slate-300 hover:text-white"
            title="Reset all data"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
          <button
            onClick={onOpenDatabase}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-pink-500/25 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Manage Players
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
