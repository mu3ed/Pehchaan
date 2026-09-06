// RAN (Rapid Automatized Naming) stimulus set.
// 8 distinct icons, each appearing multiple times in a 20-tile grid.
// No two adjacent tiles (horizontally or vertically) share the same icon.

export const RAN_ICONS: Record<string, string> = {
  sun: '<circle cx="12" cy="12" r="4.6"/><g stroke-linecap="round"><path d="M12 1.4v2.6M12 20v2.6M22.6 12H20M4 12H1.4M19.5 4.5l-1.8 1.8M6.3 17.7l-1.8 1.8M19.5 19.5l-1.8-1.8M6.3 6.3 4.5 4.5"/></g>',
  moon: '<path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8Z"/>',
  star: '<path d="M12 2.6l2.9 6.2 6.7.8-5 4.6 1.4 6.7L12 17.5l-6 3.4 1.4-6.7-5-4.6 6.7-.8L12 2.6Z"/>',
  tree: '<path d="M12 2.4 5.4 12h3.4L3.6 19.4h16.8L15.2 12h3.4L12 2.4Z"/><path d="M12 19.4v2.8" stroke-linecap="round"/>',
  house: '<path d="M3.2 10.6 12 3.4l8.8 7.2"/><path d="M5.4 12.2v8.4h13.2v-8.4"/><path d="M9.9 20.6v-5.2h4.2v5.2"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.3l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
  fish: '<path d="M6.5 12c2-4 6.5-7 12.5-7-1 3-1 6 0 10-6 0-10.5-3-12.5-7Z"/><circle cx="16" cy="11" r="1" fill="currentColor"/>',
  flower: '<circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.2 16.2l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.2 7.8l2.8-2.8"/>',
};

// 20-tile grid layout (4 rows x 5 columns).
// Indices into RAN_ICONS keys. No two neighbours share the same icon.
const ICON_KEYS = Object.keys(RAN_ICONS);

// Pre-arranged grid ensuring no adjacent duplicates
export const RAN_GRID: string[] = [
  "sun", "moon", "star", "tree", "house",
  "tree", "star", "house", "sun", "moon",
  "house", "sun", "moon", "star", "tree",
  "star", "moon", "tree", "house", "sun",
];

// Helper: get shuffled grid (keeps no-adjacent constraint by using the pre-arranged set)
export function getShuffledGrid(): string[] {
  // Shuffle icon-to-symbol mapping while keeping grid positions
  const keys = [...ICON_KEYS];
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  const mapping: Record<string, string> = {};
  ICON_KEYS.forEach((k, i) => {
    mapping[k] = keys[i];
  });
  return RAN_GRID.map((icon) => mapping[icon]);
}
