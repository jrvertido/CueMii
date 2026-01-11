import React, { useState } from 'react';
import { APP_VERSION } from '../data/initialData';
import { 
  validateLicense, 
  saveLicense, 
  formatExpirationDate,
  getLicenseStatus,
  getDaysUntilExpiration
} from '../utils/licenseUtils';

/**
 * About Modal - Shows app info, license details, and allows license editing
 */
const AboutModal = ({ 
  isOpen, 
  onClose, 
  isDarkMode = true, 
  licenseInfo,
  onLicenseUpdate,
  playerDatabaseCount = 0 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editLicenseKey, setEditLicenseKey] = useState('');
  const [editError, setEditError] = useState('');

  if (!isOpen) return null;

  const { expirationDate, maxPlayers, rawKey } = licenseInfo || {};
  const status = getLicenseStatus(expirationDate);
  const daysLeft = getDaysUntilExpiration(expirationDate);
  const remainingSlots = maxPlayers ? Math.max(0, maxPlayers - playerDatabaseCount) : 0;

  const handleStartEdit = () => {
    setEditLicenseKey(rawKey || '');
    setEditError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditLicenseKey('');
    setEditError('');
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    setEditError('');

    // Validate new license
    const result = validateLicense(editLicenseKey);
    
    if (!result.isValid) {
      setEditError(result.error);
      return;
    }

    // Check if expired
    if (new Date() > result.expirationDate) {
      setEditError('This license has expired. Please enter a valid license.');
      return;
    }

    // Save and update
    saveLicense(editLicenseKey);
    onLicenseUpdate(result);
    setIsEditing(false);
    setEditLicenseKey('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl border w-full max-w-md shadow-2xl ${
        isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b px-6 py-4 flex items-center justify-between rounded-t-2xl ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏸</span>
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                BADDIXX CueMii
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Version {APP_VERSION}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* License Status Card */}
          <div className={`rounded-xl border p-4 ${
            isDarkMode 
              ? daysLeft < 0 ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-800/50 border-slate-700' 
              : daysLeft < 0 ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                License Information
              </h3>
              <span className={`font-semibold text-sm ${status.colorClass}`}>
                {status.text}
              </span>
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    License Key
                  </label>
                  <input
                    type="text"
                    value={editLicenseKey}
                    onChange={(e) => setEditLicenseKey(e.target.value)}
                    placeholder="Enter license key"
                    className={`w-full px-3 py-2 rounded-lg text-sm ${
                      isDarkMode 
                        ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' 
                        : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                    } border focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                    autoFocus
                  />
                </div>
                
                {editError && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2">
                    <p className="text-red-400 text-xs">{editError}</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>License Key:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs truncate max-w-[150px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {rawKey ? `${rawKey.substring(0, 20)}...` : 'N/A'}
                    </span>
                    <button
                      onClick={handleStartEdit}
                      className={`p-1 rounded transition-colors ${
                        isDarkMode 
                          ? 'text-cyan-400 hover:bg-slate-700' 
                          : 'text-cyan-600 hover:bg-slate-200'
                      }`}
                      title="Edit license"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Expires:</span>
                  <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                    {formatExpirationDate(expirationDate)}
                  </span>
                </div>
                
                {daysLeft >= 0 && (
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Days Remaining:</span>
                    <span className={`font-semibold ${
                      daysLeft <= 7 ? 'text-red-400' : daysLeft <= 30 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {daysLeft}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Player Database Card */}
          <div className={`rounded-xl border p-4 ${
            isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Player Database
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Current Players:</span>
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                  {Math.min(playerDatabaseCount, maxPlayers || playerDatabaseCount)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Maximum Allowed:</span>
                <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>
                  {maxPlayers || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Remaining Slots:</span>
                <span className={`font-semibold ${
                  remainingSlots === 0 
                    ? 'text-red-400' 
                    : remainingSlots <= 10 
                      ? 'text-amber-400' 
                      : 'text-emerald-400'
                }`}>
                  {remainingSlots}
                </span>
              </div>
              
              {/* Progress Bar */}
              {maxPlayers && (
                <div className="mt-3">
                  <div className={`h-2 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-slate-700' : 'bg-slate-200'
                  }`}>
                    <div 
                      className={`h-full rounded-full transition-all ${
                        playerDatabaseCount >= maxPlayers
                          ? 'bg-red-500'
                          : playerDatabaseCount / maxPlayers >= 0.9
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (playerDatabaseCount / maxPlayers) * 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {Math.round((Math.min(playerDatabaseCount, maxPlayers) / maxPlayers) * 100)}% used
                  </p>
                </div>
              )}
              
              {playerDatabaseCount > maxPlayers && (
                <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-2 mt-2">
                  <p className="text-amber-400 text-xs">
                    ⚠️ {playerDatabaseCount - maxPlayers} player(s) are hidden due to license limit
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Creator Info */}
          <div className={`rounded-xl border p-4 ${
            isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Created By
            </h3>
            <div className="space-y-1">
              <p className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>Joseph Vertido</p>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>jrvertido@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t text-center ${
          isDarkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            © 2025 BADDIXX CueMii App. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
