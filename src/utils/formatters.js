/**
 * Format wait time from joinedAt timestamp
 * @param {number} joinedAt - Timestamp when player joined
 * @returns {string} Formatted wait time (e.g., "5m" or "1h 30m")
 */
export const formatWaitTime = (joinedAt) => {
  if (!joinedAt) return '0m';
  const diff = Math.floor((Date.now() - joinedAt) / 1000 / 60);
  if (diff < 60) return `${diff}m`;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Format court time from startTime timestamp
 * @param {number} startTime - Timestamp when match started
 * @param {number} currentTime - Current timestamp
 * @returns {string} Formatted court time
 */
export const formatCourtTime = (startTime, currentTime) => {
  if (!startTime) return '';
  const diff = Math.floor((currentTime - startTime) / 1000 / 60);
  return `${diff}m`;
};
