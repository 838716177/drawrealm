import { useMemo } from 'react';

interface AnimePortraitProps {
  name: string;
  gender: string;
  appearance?: string;
  size?: number;
  rarity?: 'N' | 'R' | 'SR' | 'SSR' | 'UR';
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function extractColors(appearance: string, seed: number): {
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  hairStyle: 'spiky' | 'short' | 'long' | 'bun' | 'twintail';
} {
  const colors = [
    '#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560',
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff',
    '#5f27cd', '#00d2d3', '#ff9f43', '#ee5a24', '#009432',
    '#0652dd', '#9980fa', '#833471', '#f79f1f', '#a3cb38',
    '#c0392b', '#8e44ad', '#2980b9', '#16a085', '#d35400',
    '#2c3e50', '#7f8c8d', '#27ae60', '#e74c3c', '#9b59b6',
  ];
  const eyeColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#e67e22', '#34495e', '#c0392b', '#8e44ad',
    '#16a085', '#d35400', '#27ae60', '#2980b9', '#c0392b',
  ];
  const skinTones = ['#fce4d6', '#f5d0b0', '#e8c4a0', '#d4a574', '#c8956c', '#a67c52', '#8d5524'];
  const styles: ('spiky' | 'short' | 'long' | 'bun' | 'twintail')[] = ['spiky', 'short', 'long', 'bun', 'twintail'];

  const h = hashString(appearance || '');
  return {
    hairColor: colors[(h + seed) % colors.length],
    eyeColor: eyeColors[(h + seed * 3) % eyeColors.length],
    skinTone: skinTones[(h + seed * 7) % skinTones.length],
    hairStyle: styles[(h + seed * 11) % styles.length],
  };
}

function generatePortraitSVG(props: AnimePortraitProps): string {
  const { name, gender, appearance, size = 200, rarity = 'N' } = props;
  const seed = hashString(name);
  const colors = extractColors(appearance || name, seed);

  const isFemale = gender === '女';
  const w = size;
  const h = size;
  const cx = w / 2;
  const cy = h / 2 + size * 0.05;
  const faceR = size * 0.28;

  const rarityGradients: Record<string, { bg1: string; bg2: string; accent: string; glow: string }> = {
    UR: { bg1: '#ff2d55', bg2: '#ff6b81', accent: '#ffd700', glow: 'rgba(255,45,85,0.5)' },
    SSR: { bg1: '#ff9500', bg2: '#ffb347', accent: '#ffe0a0', glow: 'rgba(255,149,0,0.4)' },
    SR: { bg1: '#7c3aed', bg2: '#a855f7', accent: '#c084fc', glow: 'rgba(124,58,237,0.35)' },
    R: { bg1: '#2563eb', bg2: '#3b82f6', accent: '#93c5fd', glow: 'rgba(37,99,235,0.3)' },
    N: { bg1: '#4b5563', bg2: '#6b7280', accent: '#d1d5db', glow: 'rgba(107,114,128,0.25)' },
  };
  const rg = rarityGradients[rarity] || rarityGradients.N;

  const bgGradient = `linear-gradient(135deg, ${rg.bg1}22, ${rg.bg2}18)`;

  let hairPath = '';
  const hairY = cy - faceR * 0.6;
  const hairColor = colors.hairColor;

  if (colors.hairStyle === 'spiky') {
    const spikes = 7;
    let d = `M ${cx - faceR * 1.2} ${hairY + faceR * 0.3}`;
    for (let i = 0; i <= spikes; i++) {
      const angle = Math.PI + (i / spikes) * Math.PI;
      const sx = cx + Math.cos(angle) * faceR * 1.3;
      const sy = hairY + Math.sin(angle) * faceR * 0.4 - (i % 2 === 0 ? faceR * 0.5 : faceR * 0.2);
      d += ` L ${sx} ${sy}`;
    }
    d += ` L ${cx + faceR * 1.2} ${hairY + faceR * 0.3} Z`;
    hairPath = d;
  } else if (colors.hairStyle === 'long') {
    hairPath = `
      M ${cx - faceR * 1.15} ${hairY + faceR * 0.2}
      C ${cx - faceR * 1.3} ${hairY - faceR * 0.5}, ${cx - faceR * 0.8} ${hairY - faceR * 1.1}, ${cx} ${hairY - faceR * 1.05}
      C ${cx + faceR * 0.8} ${hairY - faceR * 1.1}, ${cx + faceR * 1.3} ${hairY - faceR * 0.5}, ${cx + faceR * 1.15} ${hairY + faceR * 0.2}
      L ${cx + faceR * 1.25} ${cy + faceR * 1.6}
      Q ${cx + faceR * 0.6} ${cy + faceR * 1.8}, ${cx + faceR * 0.3} ${cy + faceR * 1.3}
      L ${cx - faceR * 0.3} ${cy + faceR * 1.3}
      Q ${cx - faceR * 0.6} ${cy + faceR * 1.8}, ${cx - faceR * 1.25} ${cy + faceR * 1.6}
      Z
    `;
  } else if (colors.hairStyle === 'bun') {
    hairPath = `
      M ${cx - faceR * 1.1} ${hairY + faceR * 0.2}
      C ${cx - faceR * 1.2} ${hairY - faceR * 0.4}, ${cx - faceR * 0.6} ${hairY - faceR * 0.95}, ${cx} ${hairY - faceR * 0.9}
      C ${cx + faceR * 0.6} ${hairY - faceR * 0.95}, ${cx + faceR * 1.2} ${hairY - faceR * 0.4}, ${cx + faceR * 1.1} ${hairY + faceR * 0.2}
      Z
      M ${cx - faceR * 0.5} ${hairY - faceR * 0.85}
      A ${faceR * 0.35} ${faceR * 0.35} 0 1 1 ${cx + faceR * 0.5} ${hairY - faceR * 0.85}
      A ${faceR * 0.35} ${faceR * 0.35} 0 1 1 ${cx - faceR * 0.5} ${hairY - faceR * 0.85}
    `;
  } else if (colors.hairStyle === 'twintail') {
    hairPath = `
      M ${cx - faceR * 1.1} ${hairY + faceR * 0.1}
      C ${cx - faceR * 1.2} ${hairY - faceR * 0.5}, ${cx - faceR * 0.5} ${hairY - faceR * 1}, ${cx} ${hairY - faceR * 0.95}
      C ${cx + faceR * 0.5} ${hairY - faceR * 1}, ${cx + faceR * 1.2} ${hairY - faceR * 0.5}, ${cx + faceR * 1.1} ${hairY + faceR * 0.1}
      Z
      M ${cx - faceR * 0.9} ${hairY}
      Q ${cx - faceR * 1.6} ${cy + faceR * 0.3}, ${cx - faceR * 1.3} ${cy + faceR * 1.2}
      Q ${cx - faceR * 0.9} ${cy + faceR * 1.4}, ${cx - faceR * 0.7} ${cy + faceR * 0.8}
      Z
      M ${cx + faceR * 0.9} ${hairY}
      Q ${cx + faceR * 1.6} ${cy + faceR * 0.3}, ${cx + faceR * 1.3} ${cy + faceR * 1.2}
      Q ${cx + faceR * 0.9} ${cy + faceR * 1.4}, ${cx + faceR * 0.7} ${cy + faceR * 0.8}
      Z
    `;
  } else {
    hairPath = `
      M ${cx - faceR * 1.1} ${hairY + faceR * 0.2}
      C ${cx - faceR * 1.2} ${hairY - faceR * 0.5}, ${cx - faceR * 0.5} ${hairY - faceR * 1}, ${cx} ${hairY - faceR * 0.95}
      C ${cx + faceR * 0.5} ${hairY - faceR * 1}, ${cx + faceR * 1.2} ${hairY - faceR * 0.5}, ${cx + faceR * 1.1} ${hairY + faceR * 0.2}
      Z
    `;
  }

  const eyeRx = faceR * 0.22;
  const eyeRy = faceR * 0.28;
  const eyeY = cy - faceR * 0.05;
  const leftEyeX = cx - faceR * 0.38;
  const rightEyeX = cx + faceR * 0.38;

  const pupilR = faceR * 0.12;
  const highlightR = faceR * 0.04;

  const blushOpacity = isFemale ? 0.35 : 0.15;

  const sparkles = Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 + seed * 0.1;
    const dist = faceR * (1.4 + (i % 3) * 0.15);
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist * 0.8;
    const sr = 1.5 + (i % 3);
    return `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${rg.accent}" opacity="0.6"><animate attributeName="opacity" values="0.3;0.8;0.3" dur="${2 + i * 0.3}s" repeatCount="indefinite"/></circle>`;
  }).join('');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${rg.bg2}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${rg.bg1}" stop-opacity="0.05"/>
    </radialGradient>
    <radialGradient id="faceGrad" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="${colors.skinTone}"/>
      <stop offset="80%" stop-color="${colors.skinTone}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${colors.skinTone}" stop-opacity="0.7"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#bgGrad)"/>

  ${sparkles}

  <ellipse cx="${cx}" cy="${cy + faceR * 0.15}" rx="${faceR * 1.15}" ry="${faceR * 1.05}" fill="${rg.glow}" opacity="0.3" filter="url(#glow)">
    <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite"/>
  </ellipse>

  <path d="${hairPath}" fill="${hairColor}" filter="url(#softShadow)"/>

  <ellipse cx="${cx}" cy="${cy}" rx="${faceR}" ry="${faceR * 1.05}" fill="url(#faceGrad)"/>

  <ellipse cx="${leftEyeX}" cy="${eyeY}" rx="${eyeRx}" ry="${eyeRy}" fill="#fff"/>
  <ellipse cx="${rightEyeX}" cy="${eyeY}" rx="${eyeRx}" ry="${eyeRy}" fill="#fff"/>

  <ellipse cx="${leftEyeX}" cy="${eyeY + pupilR * 0.2}" rx="${pupilR}" ry="${pupilR * 1.15}" fill="${colors.eyeColor}"/>
  <ellipse cx="${rightEyeX}" cy="${eyeY + pupilR * 0.2}" rx="${pupilR}" ry="${pupilR * 1.15}" fill="${colors.eyeColor}"/>

  <circle cx="${leftEyeX - pupilR * 0.3}" cy="${eyeY - pupilR * 0.3}" r="${highlightR}" fill="#fff" opacity="0.9"/>
  <circle cx="${rightEyeX - pupilR * 0.3}" cy="${eyeY - pupilR * 0.3}" r="${highlightR}" fill="#fff" opacity="0.9"/>
  <circle cx="${leftEyeX + pupilR * 0.4}" cy="${eyeY + pupilR * 0.5}" r="${highlightR * 0.6}" fill="#fff" opacity="0.5"/>
  <circle cx="${rightEyeX + pupilR * 0.4}" cy="${eyeY + pupilR * 0.5}" r="${highlightR * 0.6}" fill="#fff" opacity="0.5"/>

  <path d="M ${cx - faceR * 0.15} ${cy + faceR * 0.35} Q ${cx} ${cy + faceR * 0.45} ${cx + faceR * 0.15} ${cy + faceR * 0.35}" 
    stroke="#c0392b" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>

  <ellipse cx="${leftEyeX + eyeRx * 0.3}" cy="${cy + faceR * 0.22}" rx="${faceR * 0.18}" ry="${faceR * 0.1}" fill="#e74c3c" opacity="${blushOpacity}"/>
  <ellipse cx="${rightEyeX - eyeRx * 0.3}" cy="${cy + faceR * 0.22}" rx="${faceR * 0.18}" ry="${faceR * 0.1}" fill="#e74c3c" opacity="${blushOpacity}"/>

  ${isFemale ? `
  <path d="M ${cx - faceR * 0.08} ${cy + faceR * 0.38} Q ${cx} ${cy + faceR * 0.42} ${cx + faceR * 0.08} ${cy + faceR * 0.38}" 
    stroke="#c0392b" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.5"/>
  ` : ''}

  <path d="M ${cx - faceR * 0.55} ${cy - faceR * 0.35} Q ${cx - faceR * 0.35} ${cy - faceR * 0.45} ${cx - faceR * 0.15} ${cy - faceR * 0.38}" 
    stroke="${hairColor}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
  <path d="M ${cx + faceR * 0.55} ${cy - faceR * 0.35} Q ${cx + faceR * 0.35} ${cy - faceR * 0.45} ${cx + faceR * 0.15} ${cy - faceR * 0.38}" 
    stroke="${hairColor}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>

  <path d="M ${cx - faceR * 0.65} ${cy + faceR * 0.85} Q ${cx - faceR * 0.4} ${cy + faceR * 1.15} ${cx - faceR * 0.1} ${cy + faceR * 0.95}
           Q ${cx + faceR * 0.1} ${cy + faceR * 1.15} ${cx + faceR * 0.4} ${cy + faceR * 0.95}
           Q ${cx + faceR * 0.65} ${cy + faceR * 1.15} ${cx + faceR * 0.85} ${cy + faceR * 0.85}" 
    fill="${hairColor}" opacity="0.85" filter="url(#softShadow)"/>

  <circle cx="${cx - faceR * 0.75}" cy="${cy - faceR * 0.1}" r="${faceR * 0.12}" fill="${hairColor}" opacity="0.7"/>
  <circle cx="${cx + faceR * 0.75}" cy="${cy - faceR * 0.1}" r="${faceR * 0.12}" fill="${hairColor}" opacity="0.7"/>

  ${rarity !== 'N' ? `
  <polygon points="${cx - faceR * 0.9},${cy - faceR * 0.75} ${cx - faceR * 0.82},${cy - faceR * 0.6} ${cx - faceR * 0.98},${cy - faceR * 0.6}" fill="${rg.accent}" opacity="0.8">
    <animateTransform attributeName="transform" type="rotate" from="0 ${cx - faceR * 0.9} ${cy - faceR * 0.65}" to="360 ${cx - faceR * 0.9} ${cy - faceR * 0.65}" dur="4s" repeatCount="indefinite"/>
  </polygon>
  ` : ''}
</svg>`;

  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

export default function AnimePortrait(props: AnimePortraitProps) {
  const dataUrl = useMemo(() => generatePortraitSVG(props), [props.name, props.gender, props.appearance, props.size, props.rarity]);
  return (
    <img
      src={dataUrl}
      alt={props.name}
      width={props.size}
      height={props.size}
      style={{ display: 'block', imageRendering: 'auto' }}
    />
  );
}
