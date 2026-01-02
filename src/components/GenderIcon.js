import React from 'react';

/**
 * Icon component displaying gender symbol
 * @param {Object} props
 * @param {string} props.gender - 'male' or 'female'
 */
const GenderIcon = ({ gender }) => (
  <span className={`${gender === 'male' ? 'text-blue-400' : 'text-pink-400'} font-bold`}>
    {gender === 'male' ? '♂' : '♀'}
  </span>
);

export default GenderIcon;
