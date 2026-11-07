import { Coffee, Moon, Sunrise, Utensils } from 'lucide-react';

export const SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

export const SLOT_META = [
  { slot: 'Morning (fasting)', short: 'Morning', icon: Sunrise },
  { slot: 'After breakfast', short: 'Breakfast', icon: Coffee },
  { slot: 'After lunch', short: 'Lunch', icon: Utensils },
  { slot: 'After dinner', short: 'Dinner', icon: Moon },
];
