import type { Texture } from '../data/products';

/*
 * Brand artwork that stands in for a product photo, drawn from the texture itself.
 * Each texture gets its own line pattern in blush/rose-gold over cocoa or espresso.
 */

const GROUNDS: Record<Texture, string> = {
  straight: '#2c2523',
  'body-wave': '#4a1d15',
  'deep-wave': '#2c2523',
  'water-wave': '#4a1d15',
  curly: '#2c2523',
  bob: '#4a1d15',
};

function rows(texture: Texture) {
  const out: string[] = [];
  const W = 400;
  if (texture === 'straight') {
    for (let x = 40; x <= 360; x += 22) out.push(`M${x} 20 C ${x + 6} 180, ${x - 6} 320, ${x + 4} 480`);
  } else if (texture === 'curly') {
    for (let y = 50; y < 480; y += 46)
      for (let x = 40 + ((y / 46) % 2) * 23; x < 380; x += 46) out.push(`M${x} ${y} a14 14 0 1 1 0.1 0`);
  } else {
    const r = texture === 'deep-wave' ? 10 : texture === 'water-wave' ? 16 : texture === 'bob' ? 18 : 26;
    const pitch = texture === 'deep-wave' ? 26 : texture === 'water-wave' ? 34 : 44;
    const end = texture === 'bob' ? 300 : 480;
    for (let y = 40; y < end; y += pitch) {
      let d = `M0 ${y}`;
      for (let x = 0, k = 0; x < W; x += r * 2, k++) d += ` a${r} ${r} 0 0 ${k % 2} ${r * 2} 0`;
      out.push(d);
    }
  }
  return out;
}

export function TextureArt({ texture, label, ground }: { texture: Texture; label?: string; ground?: string }) {
  return (
    <svg className="texture-art" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label ?? `${texture} texture`}>
      <rect width="400" height="500" fill={ground ?? GROUNDS[texture]} />
      <g fill="none" stroke="#c99a80" strokeWidth="2" strokeLinecap="round" opacity="0.85">
        {rows(texture).map((d, i) => (
          <path key={i} d={d} stroke={i % 3 === 1 ? '#fae3e3' : undefined} />
        ))}
      </g>
    </svg>
  );
}
