import React from 'react';
import { LEVEL_COLORS } from '../data/initialData';

/**
 * Badge component displaying player skill level
 * @param {Object} props
 * @param {string} props.level - Player skill level
 */
const LevelBadge = ({ level }) => {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${LEVEL_COLORS[level]}`}>
      {level}
    </span>
  );
};

export default LevelBadge;
