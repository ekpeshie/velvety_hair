import type { Texture } from '../data/products';

/* Small line icons for the filter dock. All 24px, drawn in currentColor. */

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const UndoIcon = () => (
  <svg {...base}>
    <path d="M9 7L5 11l4 4" />
    <path d="M5 11h9a5 5 0 0 1 0 10h-2" />
  </svg>
);
export const RedoIcon = () => (
  <svg {...base}>
    <path d="M15 7l4 4-4 4" />
    <path d="M19 11h-9a5 5 0 0 0 0 10h2" />
  </svg>
);
export const MoreIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="5.5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="18.5" r="1" fill="currentColor" />
  </svg>
);
export const LengthIcon = () => (
  <svg {...base}>
    <path d="M12 3v18M8.5 6.5L12 3l3.5 3.5M8.5 17.5L12 21l3.5-3.5" />
  </svg>
);
export const LaceIcon = () => (
  <svg {...base}>
    <path d="M4 9c4-5 12-5 16 0" />
    <path d="M5 12.5c4-4 10-4 14 0M7 15.5c3-2.5 7-2.5 10 0" strokeDasharray="1.5 2" />
  </svg>
);
export const PriceIcon = () => (
  <svg {...base}>
    <path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </svg>
);
export const SortIcon = () => (
  <svg {...base}>
    <path d="M7 4v16M3.5 7.5L7 4l3.5 3.5M17 20V4M13.5 16.5L17 20l3.5-3.5" />
  </svg>
);
export const SparkleIcon = () => (
  <svg {...base}>
    <path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5z" />
    <path d="M18.5 16v4M16.5 18h4" />
  </svg>
);
export const ClearIcon = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** A little drawing of each hair texture. */
export function TextureGlyph({ texture }: { texture: Texture | 'any' }) {
  const paths: Record<Texture | 'any', string> = {
    straight: 'M8 4v16M12 4v16M16 4v16',
    'body-wave': 'M8 4c-2 4 2 8 0 16M12 4c-2 4 2 8 0 16M16 4c-2 4 2 8 0 16',
    'deep-wave': 'M8 4c-3 2 3 4 0 6s3 4 0 6 3 3 0 4M12 4c-3 2 3 4 0 6s3 4 0 6 3 3 0 4M16 4c-3 2 3 4 0 6s3 4 0 6 3 3 0 4',
    'water-wave': 'M7 4c-2 3 2 5 0 8s2 5 0 8M11 4c-2 3 2 5 0 8s2 5 0 8M15 4c-2 3 2 5 0 8s2 5 0 8M18 6c-1 3 1 6 0 10',
    curly: 'M7 7a2 2 0 1 0 4 0 2 2 0 1 0-4 0M13 9a2 2 0 1 0 4 0 2 2 0 1 0-4 0M6 14a2 2 0 1 0 4 0 2 2 0 1 0-4 0M12 16a2 2 0 1 0 4 0 2 2 0 1 0-4 0M15.5 12.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0',
    bob: 'M5 15c0-7 3-11 7-11s7 4 7 11M5 15h14M9 9c1 2 4 2 6 0',
    any: 'M7 5c-2 4 2 8 0 14M12 5c-2 4 2 8 0 14M17 5c-2 4 2 8 0 14',
  };
  return (
    <svg {...base}>
      <path d={paths[texture]} />
    </svg>
  );
}
