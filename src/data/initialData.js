// Initial player database
export const initialPlayers = [
  { id: 1, name: 'Alex Chen', gender: 'male', level: 'Expert' },
  { id: 2, name: 'Sarah Kim', gender: 'female', level: 'Expert' },
  { id: 3, name: 'Mike Johnson', gender: 'male', level: 'Advanced' },
  { id: 4, name: 'Emma Wilson', gender: 'female', level: 'Advanced' },
  { id: 5, name: 'David Lee', gender: 'male', level: 'Intermediate' },
  { id: 6, name: 'Lisa Park', gender: 'female', level: 'Intermediate' },
  { id: 7, name: 'James Brown', gender: 'male', level: 'Novice' },
  { id: 8, name: 'Amy Zhang', gender: 'female', level: 'Novice' },
  { id: 9, name: 'Chris Taylor', gender: 'male', level: 'Expert' },
  { id: 10, name: 'Jenny Liu', gender: 'female', level: 'Advanced' },
  { id: 11, name: 'Tom Harris', gender: 'male', level: 'Intermediate' },
  { id: 12, name: 'Nina Patel', gender: 'female', level: 'Expert' },
];

// Initial courts
export const initialCourts = [
  { id: 1, name: 'Court 1', match: null, startTime: null },
  { id: 2, name: 'Court 2', match: null, startTime: null },
  { id: 3, name: 'Court 3', match: null, startTime: null },
];

// Skill levels configuration
export const SKILL_LEVELS = ['Expert', 'Advanced', 'Intermediate', 'Novice'];

// Valid genders
export const VALID_GENDERS = ['male', 'female'];

// Level badge colors
export const LEVEL_COLORS = {
  Expert: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Intermediate: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Novice: 'bg-green-500/20 text-green-400 border-green-500/30'
};
