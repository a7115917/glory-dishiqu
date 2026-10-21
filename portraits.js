/* ==========================================================================
   荣耀 · 第十区  —   角色立绘（参数化生成）
   7 种体型 × 11 种头部 × 18 种武器 × 职业主色 = 26 个职业的剪影
   纯 SVG，无外部图源，任意尺寸不糊。
   ========================================================================== */

/* ------------------------------------------------------------ 头部样式 */
const PT_HEADS = {
  ponytail: (pb, c) => `
    <path d="M80 72 C58 68 42 90 46 114 C48 128 38 138 28 136 C44 150 64 138 66 118 C68 100 70 84 86 80 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".35" stroke-width="1.1"/>`,
  long: (pb, c) => `
    <path d="M74 76 C70 108 66 140 60 168 L84 160 C86 132 86 104 88 82 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".3" stroke-width="1"/>
    <path d="M126 76 C130 108 134 140 140 168 L116 160 C114 132 114 104 112 82 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".3" stroke-width="1"/>`,
  spiky: (pb, c) => `
    <path d="M76 76 L82 52 L88 68 L96 44 L102 66 L110 50 L116 68 L124 58 L124 80
             C124 84 118 78 100 78 C82 78 76 84 76 76 Z"
          fill="${c}" fill-opacity=".3"/>`,
  hood: (pb, c) => `
    <path d="M100 42 C126 42 143 68 143 96 L143 108 L100 120 L57 108 L57 96 C57 68 74 42 100 42 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".5" stroke-width="1.2"/>`,
  hat: (pb, c) => `
    <path d="M100 28 L126 62 L74 62 Z" fill="${pb}" stroke="${c}" stroke-opacity=".6" stroke-width="1.2"/>
    <path d="M64 62 L136 62 L136 69 L64 69 Z" fill="${pb}" stroke="${c}" stroke-opacity=".55" stroke-width="1.2"/>
    <path d="M100 34 L112 62" stroke="${c}" stroke-opacity=".3" stroke-width="1.1"/>`,
  goggles: (pb, c) => `
    <rect x="77" y="76" width="46" height="12" rx="6" fill="${c}" fill-opacity=".5"
          stroke="${c}" stroke-opacity=".8" stroke-width="1.1"/>
    <path d="M100 76 L100 88" stroke="#030707" stroke-opacity=".9" stroke-width="1.8"/>`,
  helmet: (pb, c) => `
    <path d="M76 74 C76 52 124 52 124 74 L124 88 L76 88 Z" fill="${pb}"
          stroke="${c}" stroke-opacity=".75" stroke-width="1.4"/>
    <path d="M94 62 L100 46 L106 62 Z" fill="${c}" fill-opacity=".85"/>
    <rect x="97" y="66" width="6" height="26" rx="3" fill="${c}" fill-opacity=".4"/>`,
  bandana: (pb, c) => `
    <path d="M76 78 C76 68 124 68 124 78 L124 86 L76 86 Z" fill="${c}" fill-opacity=".5"/>
    <path d="M124 80 C136 82 142 92 140 102 L132 96 Z" fill="${c}" fill-opacity=".4"/>`,
  short: (pb, c) => `
    <path d="M78 74 C78 56 122 56 122 74 C122 66 114 62 100 62 C86 62 78 66 78 74 Z"
          fill="${c}" fill-opacity=".3"/>`,
  bald: (pb, c) => `
    <path d="M80 66 A22 26 0 0 1 120 66" fill="none" stroke="${c}" stroke-opacity=".55" stroke-width="2"/>`,
  halo: (pb, c) => `
    <ellipse cx="100" cy="52" rx="26" ry="7" fill="none" stroke="${c}" stroke-opacity=".75" stroke-width="2"/>`
};

/* ------------------------------------------------------------ 体型 */
const PT_BODIES = {
  sanren: (pb, c) => `
    <path d="M48 262 C48 206 56 170 65 152 C75 132 86 124 100 124 C114 124 125 132 135 152
             C144 170 152 206 152 262 Z" fill="${pb}" stroke="${c}" stroke-opacity=".45" stroke-width="1.2"/>
    <path d="M90 86 L110 86 L112 126 L88 126 Z" fill="${pb}"/>`,
  sword: (pb, c) => `
    <path d="M40 262 C38 198 48 156 68 138 L132 138 C152 156 162 198 160 262 Z"
          fill="${c}" fill-opacity=".07"/>
    <path d="M50 262 C50 208 56 172 64 154 C74 134 86 126 100 126 C114 126 126 134 136 154
             C144 172 150 208 150 262 Z" fill="${pb}" stroke="${c}" stroke-opacity=".45" stroke-width="1.2"/>
    <path d="M90 88 L110 88 L112 126 L88 126 Z" fill="${pb}"/>
    <path d="M66 160 C78 172 88 180 100 196 C112 180 122 172 134 160"
          fill="none" stroke="${c}" stroke-opacity=".2" stroke-width="1.2"/>`,
  gun: (pb, c) => `
    <path d="M48 262 C48 206 55 168 65 150 C76 132 87 124 100 124 C113 124 124 132 135 150
             C145 168 152 206 152 262 L136 250 L120 262 L100 248 L80 262 L64 250 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".45" stroke-width="1.2"/>
    <path d="M82 118 L118 118 L122 140 L78 140 Z" fill="${c}" fill-opacity=".1"
          stroke="${c}" stroke-opacity=".3" stroke-width="1.1"/>
    <path d="M100 148 L100 248" stroke="${c}" stroke-opacity=".18" stroke-width="1.2"/>`,
  mage: (pb, c) => `
    <path d="M40 262 C42 202 54 166 66 148 C78 130 88 122 100 122
             C112 122 122 130 134 148 C146 166 158 202 160 262 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".45" stroke-width="1.2"/>
    <path d="M62 150 C44 164 34 196 34 228 L56 224 C54 198 60 172 72 158 Z"
          fill="${c}" fill-opacity=".1" stroke="${c}" stroke-opacity=".28" stroke-width="1.1"/>
    <path d="M138 150 C156 164 166 196 166 228 L144 224 C146 198 140 172 128 158 Z"
          fill="${c}" fill-opacity=".1" stroke="${c}" stroke-opacity=".28" stroke-width="1.1"/>
    <path d="M100 138 C94 172 92 216 94 262 M100 138 C106 172 108 216 106 262"
          fill="none" stroke="${c}" stroke-opacity=".18" stroke-width="1.2"/>`,
  fighter: (pb, c) => `
    <path d="M62 162 C46 154 34 140 32 120" fill="none" stroke="${pb}" stroke-width="22" stroke-linecap="round"/>
    <path d="M138 162 C154 154 166 140 168 120" fill="none" stroke="${pb}" stroke-width="22" stroke-linecap="round"/>
    <path d="M62 162 C46 154 34 140 32 120" fill="none" stroke="${c}" stroke-opacity=".2" stroke-width="1.2"/>
    <path d="M138 162 C154 154 166 140 168 120" fill="none" stroke="${c}" stroke-opacity=".2" stroke-width="1.2"/>
    <path d="M38 262 C40 204 48 166 58 148 C70 130 84 122 100 122
             C116 122 130 130 142 148 C152 166 160 204 162 262 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".45" stroke-width="1.2"/>
    <circle cx="32" cy="114" r="13" fill="${pb}" stroke="${c}" stroke-opacity=".6" stroke-width="1.3"/>
    <circle cx="168" cy="114" r="13" fill="${pb}" stroke="${c}" stroke-opacity=".6" stroke-width="1.3"/>
    <path d="M72 146 C82 158 90 164 100 165 C110 164 118 158 128 146"
          fill="none" stroke="${c}" stroke-opacity=".28" stroke-width="1.4"/>`,
  night: (pb, c) => `
    <path d="M42 262 C42 202 50 160 62 142 L138 142 C150 160 158 202 158 262
             L144 252 L130 262 L114 250 L98 262 L82 250 L66 262 L54 252 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".45" stroke-width="1.2"/>`,
  holy: (pb, c) => `
    <path d="M38 262 C40 202 50 164 60 148 C72 130 86 122 100 122
             C114 122 128 130 140 148 C150 164 160 202 162 262 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".45" stroke-width="1.2"/>
    <path d="M26 158 C26 136 44 124 62 130 L64 160 C48 166 32 166 26 158 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".65" stroke-width="1.3"/>
    <path d="M174 158 C174 136 156 124 138 130 L136 160 C152 166 168 166 174 158 Z"
          fill="${pb}" stroke="${c}" stroke-opacity=".65" stroke-width="1.3"/>`
};

/* ------------------------------------------------------------ 武器 */
const PT_WEAPONS = {
  umbrella: (pb, c) => `
    <g transform="translate(152 208) rotate(11)">
      <rect x="-3" y="-124" width="6" height="160" rx="3" fill="#0e1720"
            stroke="${c}" stroke-opacity=".7" stroke-width="1.2"/>
      <path d="M-13 -106 C-17 -46 -11 26 -4 52 L4 52 C11 26 17 -46 13 -106
               C6 -116 -6 -116 -13 -106 Z"
            fill="${pb}" stroke="${c}" stroke-opacity=".7" stroke-width="1.3"/>
      <path d="M0 -112 L0 50 M-9 -60 L9 -60 M-11 -10 L11 -10"
            stroke="${c}" stroke-opacity=".3" stroke-width="1.1"/>
      <path d="M0 -124 L0 -138" stroke="${c}" stroke-opacity=".75" stroke-width="2.4"/>
      <rect x="-5" y="52" width="10" height="18" rx="4" fill="#0e1720"
            stroke="${c}" stroke-opacity=".6" stroke-width="1.1"/>
    </g>`,

  blade: (pb, c, w) => {
    const L = w.len || 74, W = (w.w || 5) / 2, cv = w.curve || 0;
    const tip = `M${-W} -34 L${W} -34 L${W * 0.8} ${L - 12} L0 ${L} L${-W * 0.8} ${L - 12} Z`;
    return `
    <g transform="translate(100 198) rotate(38)">
      <path d="${cv ? `M${-W} -34 Q${cv} ${L / 2} 0 ${L} Q${-cv} ${L / 2} ${-W} -34 Z` : tip}"
            fill="${pb}" stroke="${c}" stroke-opacity=".55" stroke-width="1.2"/>
      <path d="M0 -30 L1 ${L - 14}" stroke="${c}" stroke-opacity=".45" stroke-width="1"/>
      <rect x="-16" y="-40" width="32" height="${W + 3}" rx="2.5"
            fill="#0e1720" stroke="${c}" stroke-opacity=".65" stroke-width="1.2"/>
      <rect x="-4.5" y="-78" width="9" height="40" rx="3" fill="#0e1720"
            stroke="${c}" stroke-opacity=".5" stroke-width="1"/>
      <circle cx="0" cy="-82" r="4" fill="${c}" fill-opacity=".6"/>
      ${w.rune ? `<circle cx="0" cy="10" r="7" fill="none" stroke="${c}" stroke-opacity=".7" stroke-width="1.4"/>
                  <circle cx="0" cy="46" r="5" fill="none" stroke="${c}" stroke-opacity=".5" stroke-width="1.2"/>` : ''}
      ${w.glow ? `<path d="M-2 -20 L2 40" stroke="${c}" stroke-opacity=".5" stroke-width="3" filter="blur(2px)"/>` : ''}
    </g>`;
  },

  spear: (pb, c, w) => {
    const L = w.len || 92;
    return `
    <g transform="translate(104 200) rotate(20)">
      <rect x="-3" y="-${L}" width="6" height="${L + 90}" rx="3" fill="#0e1720"
            stroke="${c}" stroke-opacity=".6" stroke-width="1.2"/>
      <path d="M0 -${L - 20} L10 -${L - 6} L0 -${L + 22} L-10 -${L - 6} Z"
            fill="${pb}" stroke="${c}" stroke-opacity=".75" stroke-width="1.3"/>
      <path d="M-9 -${L - 12} L9 -${L - 12}" stroke="${c}" stroke-opacity=".6" stroke-width="1.4"/>
    </g>`;
  },

  broom: (pb, c, w) => `
    <g transform="translate(158 232) rotate(8)">
      <rect x="-3" y="-118" width="6" height="130" rx="3" fill="#0e1720"
            stroke="${c}" stroke-opacity=".6" stroke-width="1.2"/>
      <path d="M-16 6 L16 6 L24 46 L-22 46 Z" fill="${pb}"
            stroke="${c}" stroke-opacity=".6" stroke-width="1.3"/>
      <path d="M-16 6 L-22 46 M0 6 L0 46 M16 6 L22 46"
            stroke="${c}" stroke-opacity=".35" stroke-width="1.1"/>
    </g>`,

  orbstaff: (pb, c, w) => {
    const L = w.len || 88, oc = w.orb || c;
    return `
    <g transform="translate(164 246) rotate(9)">
      <rect x="-3" y="-${L}" width="6" height="${L + 8}" rx="3" fill="#0e1720"
            stroke="${c}" stroke-opacity=".55" stroke-width="1.2"/>
      <circle cx="0" cy="-${L + 14}" r="28" fill="${oc}" fill-opacity=".16"/>
      <circle cx="0" cy="-${L + 14}" r="12" fill="${oc}" fill-opacity=".9"/>
      <path d="M-14 -${L + 14} Q0 -${L + 32} 14 -${L + 14}" fill="none"
            stroke="${c}" stroke-opacity=".85" stroke-width="1.4"/>
    </g>`;
  },

  pistols: (pb, c, w) => `
    <g transform="translate(36 152) rotate(-32)">
      <path d="M-6 -6 L14 -6 L14 3 L4 3 L4 26 L-6 26 L-6 3 L-13 3 Z" fill="${pb}"
            stroke="${c}" stroke-opacity=".7" stroke-width="1.3"/>
      <path d="M-6 -6 L-6 -13 L3 -13 L3 -6 Z" fill="${c}" fill-opacity=".35"/>
      <path d="M14 -2 L26 -2" stroke="${c}" stroke-opacity=".6" stroke-width="2"/>
    </g>
    <g transform="translate(164 152) rotate(32) scale(-1 1)">
      <path d="M-6 -6 L14 -6 L14 3 L4 3 L4 26 L-6 26 L-6 3 L-13 3 Z" fill="${pb}"
            stroke="${c}" stroke-opacity=".7" stroke-width="1.3"/>
      <path d="M-6 -6 L-6 -13 L3 -13 L3 -6 Z" fill="${c}" fill-opacity=".35"/>
      <path d="M14 -2 L26 -2" stroke="${c}" stroke-opacity=".6" stroke-width="2"/>
    </g>
    ${w && w.grenade ? `<circle cx="176" cy="206" r="9" fill="${pb}" stroke="${c}" stroke-opacity=".65" stroke-width="1.2"/>
      <path d="M176 197 L176 190" stroke="${c}" stroke-opacity=".6" stroke-width="1.4"/>` : ''}`,

  gadget: (pb, c) => `
    <g transform="translate(160 130)">
      <rect x="-12" y="-8" width="24" height="16" rx="4" fill="${pb}"
            stroke="${c}" stroke-opacity=".7" stroke-width="1.3"/>
      <circle cx="0" cy="0" r="4" fill="${c}" fill-opacity=".8"/>
      <path d="M-20 0 L-12 0 M12 0 L20 0" stroke="${c}" stroke-opacity=".5" stroke-width="1.6"/>
      <path d="M0 -8 L0 -20" stroke="${c}" stroke-opacity=".4" stroke-width="1.2"/>
    </g>
    <g transform="translate(34 168) rotate(-20)">
      <rect x="-5" y="-5" width="30" height="11" rx="3" fill="${pb}"
            stroke="${c}" stroke-opacity=".65" stroke-width="1.2"/>
      <rect x="18" y="-2" width="10" height="4" rx="2" fill="${c}" fill-opacity=".55"/>
    </g>`,

  cannon: (pb, c) => `
    <g transform="translate(38 176) rotate(-16)">
      <rect x="-22" y="-15" width="70" height="30" rx="7" fill="${pb}"
            stroke="${c}" stroke-opacity=".7" stroke-width="1.4"/>
      <rect x="44" y="-9" width="26" height="18" rx="4" fill="${pb}"
            stroke="${c}" stroke-opacity=".7" stroke-width="1.3"/>
      <circle cx="-12" cy="0" r="8" fill="${c}" fill-opacity=".28"/>
      <path d="M-22 15 L-30 34 M64 9 L70 26" stroke="${c}" stroke-opacity=".45" stroke-width="2"/>
    </g>`,

  fists: (pb, c) => `
    <path d="M26 106 L42 106 M25 113 L43 113 M26 120 L42 120" stroke="${c}" stroke-opacity=".45" stroke-width="1.3"/>
    <path d="M158 106 L174 106 M157 113 L175 113 M158 120 L174 120" stroke="${c}" stroke-opacity=".45" stroke-width="1.3"/>`,

  brick: (pb, c) => `
    <g transform="translate(166 186) rotate(-14)">
      <rect x="-14" y="-9" width="28" height="18" rx="2" fill="${pb}"
            stroke="${c}" stroke-opacity=".7" stroke-width="1.3"/>
      <path d="M-14 -3 L14 -3 M0 -9 L0 9" stroke="${c}" stroke-opacity=".4" stroke-width="1"/>
    </g>`,

  qiorb: (pb, c) => `
    <circle cx="100" cy="176" r="34" fill="${c}" fill-opacity=".1"/>
    <circle cx="100" cy="176" r="20" fill="${c}" fill-opacity=".55"/>
    <circle cx="100" cy="176" r="28" fill="none" stroke="${c}" stroke-opacity=".6" stroke-width="1.4"
            stroke-dasharray="5 6"/>
    <circle cx="62" cy="150" r="12" fill="${pb}" stroke="${c}" stroke-opacity=".5" stroke-width="1.2"/>
    <circle cx="138" cy="150" r="12" fill="${pb}" stroke="${c}" stroke-opacity=".5" stroke-width="1.2"/>`,

  kunai: (pb, c) => `
    <g transform="translate(74 176) rotate(-34)">
      <path d="M-5 -10 L5 -10 L2 30 L0 40 L-2 30 Z" fill="${pb}"
            stroke="${c}" stroke-opacity=".75" stroke-width="1.2"/>
      <rect x="-3" y="-26" width="6" height="16" rx="2" fill="#0e0609"
            stroke="${c}" stroke-opacity=".5" stroke-width="1"/>
      <circle cx="0" cy="-28" r="4" fill="none" stroke="${c}" stroke-opacity=".6" stroke-width="1.2"/>
    </g>`,

  daggers: (pb, c) => `
    <g transform="translate(74 188) rotate(-40)">
      <path d="M-5 -8 L5 -8 L3 38 L0 48 L-3 38 Z" fill="${pb}"
            stroke="${c}" stroke-opacity=".8" stroke-width="1.3"/>
      <rect x="-13" y="-15" width="26" height="7" rx="2.5" fill="#0e0609"
            stroke="${c}" stroke-opacity=".75" stroke-width="1.2"/>
    </g>
    <g transform="translate(126 188) rotate(40)">
      <path d="M-5 -8 L5 -8 L3 38 L0 48 L-3 38 Z" fill="${pb}"
            stroke="${c}" stroke-opacity=".8" stroke-width="1.3"/>
      <rect x="-13" y="-15" width="26" height="7" rx="2.5" fill="#0e0609"
            stroke="${c}" stroke-opacity=".75" stroke-width="1.2"/>
    </g>`,

  curseorb: (pb, c) => `
    <g transform="translate(150 132)">
      <circle cx="0" cy="0" r="22" fill="${c}" fill-opacity=".12"/>
      <circle cx="0" cy="0" r="13" fill="${c}" fill-opacity=".65"/>
      <path d="M0 -26 C-18 -14 -18 14 0 26 M0 -26 C18 -14 18 14 0 26"
            fill="none" stroke="${c}" stroke-opacity=".5" stroke-width="1.2"/>
      <circle cx="0" cy="0" r="19" fill="none" stroke="${c}" stroke-opacity=".45"
              stroke-width="1.2" stroke-dasharray="4 6"/>
    </g>`,

  holystaff: (pb, c) => `
    <g transform="translate(160 244) rotate(8)">
      <rect x="-3" y="-130" width="6" height="138" rx="3" fill="#0e1720"
            stroke="${c}" stroke-opacity=".6" stroke-width="1.2"/>
      <path d="M0 -156 L0 -118 M-19 -137 L19 -137" stroke="${c}" stroke-opacity=".85" stroke-width="4"/>
      <circle cx="0" cy="-137" r="26" fill="${c}" fill-opacity=".1"/>
    </g>`,

  shieldsword: (pb, c) => `
    <g transform="translate(38 216)">
      <path d="M-22 -36 L22 -36 L22 14 L0 34 L-22 14 Z" fill="${pb}"
            stroke="${c}" stroke-opacity=".75" stroke-width="1.5"/>
      <path d="M0 -24 L0 22 M-13 0 L13 0" stroke="${c}" stroke-opacity=".6" stroke-width="2.4"/>
    </g>
    <g transform="translate(150 178) rotate(24)">
      <path d="M-5 -30 L5 -30 L3 40 L0 52 L-3 40 Z" fill="${pb}"
            stroke="${c}" stroke-opacity=".7" stroke-width="1.2"/>
      <rect x="-13" y="-36" width="26" height="7" rx="2" fill="#0e1720"
            stroke="${c}" stroke-opacity=".65" stroke-width="1.1"/>
    </g>`,

  wings: (pb, c) => `
    <path d="M50 150 C20 130 8 96 16 66 C36 82 56 112 62 142 Z" fill="${c}" fill-opacity=".14"
          stroke="${c}" stroke-opacity=".4" stroke-width="1.2"/>
    <path d="M150 150 C180 130 192 96 184 66 C164 82 144 112 138 142 Z" fill="${c}" fill-opacity=".14"
          stroke="${c}" stroke-opacity=".4" stroke-width="1.2"/>
    <path d="M40 128 L62 104 M36 108 L58 88" stroke="${c}" stroke-opacity=".3" stroke-width="1.1"/>
    <path d="M160 128 L138 104 M164 108 L142 88" stroke="${c}" stroke-opacity=".3" stroke-width="1.1"/>`,

  talisman: (pb, c) => `
    <g transform="translate(150 128)">
      <rect x="-9" y="-26" width="18" height="52" rx="2" fill="${c}" fill-opacity=".14"
            stroke="${c}" stroke-opacity=".7" stroke-width="1.3"/>
      <path d="M0 -18 L0 18 M-5 -8 L5 -8 M-5 4 L5 4" stroke="${c}" stroke-opacity=".7" stroke-width="1.3"/>
    </g>
    <g transform="translate(52 158) rotate(-12)">
      <rect x="-7" y="-20" width="14" height="40" rx="2" fill="${c}" fill-opacity=".1"
            stroke="${c}" stroke-opacity=".5" stroke-width="1.2"/>
      <path d="M0 -14 L0 14" stroke="${c}" stroke-opacity=".5" stroke-width="1.2"/>
    </g>`
};

/* ------------------------------------------------------------ 组装 */
const PT_HEAD_OF = {
  sanren: 'hood', jianke: 'ponytail', kuangjian: 'spiky', mojian: 'long',
  zhangui: 'long', zhengui: 'hood',
  zhanfa: 'ponytail', modao: 'hat', yuansu: 'hood', zhaohuan: 'hood',
  shenqiang: 'goggles', danyao: 'goggles', jixie: 'goggles', qiangpao: 'helmet',
  quanfa: 'spiky', liumang: 'bandana', roudao: 'short', qigong: 'bald',
  renzhe: 'hood', daozei: 'hood', cike: 'hood', shushi: 'hood',
  mushi: 'halo', qishi: 'helmet', shouhu: 'halo', qumo: 'bandana'
};

let ptSeq = 0;

function portraitSVG(clsId, mode) {
  const c = CLASSES[clsId];
  if (!c) return '';

  const sfx = ++ptSeq;
  const pb = `url(#ptb-${sfx})`;
  const col = c.color;

  const headKey = PT_HEAD_OF[clsId] || 'short';
  const head = (PT_HEADS[headKey] || PT_HEADS.short)(pb, col);
  const body = (PT_BODIES[c.body] || PT_BODIES.sword)(pb, col);
  const weapon = (PT_WEAPONS[c.weapon.t] || PT_WEAPONS.blade)(pb, col, c.weapon);
  const faceDark = (c.body === 'mage' || c.body === 'night' || headKey === 'hood')
    ? `<ellipse cx="100" cy="88" rx="16" ry="19" fill="#050308"/>
       <circle cx="94" cy="85" r="2" fill="${col}"/><circle cx="106" cy="85" r="2" fill="${col}"/>`
    : '';

  const vb = mode === 'face' ? '46 26 108 108' : '0 0 200 260';

  return `<svg class="pt-svg" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ptg-${sfx}" cx="50%" cy="36%" r="64%">
      <stop offset="0" stop-color="${col}" stop-opacity=".40"/>
      <stop offset="1" stop-color="${col}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ptb-${sfx}" x1=".2" y1="0" x2=".8" y2="1">
      <stop offset="0" stop-color="${shade(col, 0.55)}"/>
      <stop offset=".45" stop-color="${shade(col, 0.16)}"/>
      <stop offset="1" stop-color="#04070b"/>
    </linearGradient>
  </defs>
  <rect width="200" height="260" fill="url(#ptg-${sfx})"/>
  <circle cx="100" cy="110" r="78" fill="none" stroke="${col}" stroke-opacity=".12"/>
  <circle cx="100" cy="110" r="96" fill="none" stroke="${col}" stroke-opacity=".055"/>
  ${weaponBehind(c, pb, col)}
  <path d="M90 86 L110 86 L112 126 L88 126 Z" fill="${pb}"/>
  ${body}
  <ellipse cx="100" cy="86" rx="22" ry="26" fill="${pb}"
           stroke="${col}" stroke-opacity=".45" stroke-width="1.2"/>
  ${faceDark}
  ${head}
  ${weaponFront(c, pb, col)}
</svg>`;
}

/* 武器画在身体前面还是后面 */
function weaponBehind(c, pb, col) {
  const t = c.weapon.t;
  if (t === 'wings') return PT_WEAPONS.wings(pb, col);
  if (t === 'curseorb' || t === 'talisman' || t === 'gadget') return PT_WEAPONS[t](pb, col);
  return '';
}
function weaponFront(c, pb, col) {
  const t = c.weapon.t;
  if (t === 'wings' || t === 'curseorb' || t === 'talisman' || t === 'gadget') return '';
  return (PT_WEAPONS[t] || PT_WEAPONS.blade)(pb, col, c.weapon);
}

/* 颜色明暗 */
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

function portraitColor(clsId) {
  const c = CLASSES[clsId];
  return c ? c.color : '#4fe3c8';
}

function portraitName(clsId) {
  const c = CLASSES[clsId];
  return c ? c.name : '';
}
