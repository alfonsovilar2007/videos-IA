// Personajes del canal: estilo propio (cabeza de judía crema, contorno azul marino, brazos fideo).

const INK='#1F2A44', SKIN='#FFF1DC', BLUSH='#F6A5A0';
function face(expr){
  let f='';
  // ojos
  const eye=(x)=> expr==='sorprendido'
     ? `<ellipse cx="${x}" cy="-6" rx="9" ry="12" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="-5" r="4.5" fill="${INK}"/>`
     : expr==='eureka' ? `<path d="M${x-9},-4 q9,-11 18,0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
     : `<ellipse cx="${x}" cy="-4" rx="6.5" ry="9.5" fill="${INK}"/><circle cx="${x+2}" cy="-8" r="2.2" fill="#fff"/>`;
  f+=eye(-26)+eye(26);
  // cejas
  const br={neutral:['M-38,-27 l22,-3','M16,-30 l22,3'],
            sorprendido:['M-40,-36 q12,-10 24,-2','M16,-38 q12,-8 24,2'],
            preocupado:['M-38,-24 l22,-9','M16,-33 l22,9'],
            eureka:['M-40,-32 q12,-8 24,-2','M16,-34 q12,-6 24,2']}[expr];
  br.forEach(d=>f+=`<path d="${d}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`);
  // mejillas
  f+=`<ellipse cx="-40" cy="16" rx="10" ry="6" fill="${BLUSH}" opacity=".6"/><ellipse cx="40" cy="16" rx="10" ry="6" fill="${BLUSH}" opacity=".6"/>`;
  // boca
  const m={neutral:`<path d="M-9,26 q9,5 18,0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`,
    sorprendido:`<ellipse cx="0" cy="30" rx="8" ry="11" fill="${INK}"/>`,
    preocupado:`<path d="M-14,32 q5,-6 9,0 q5,6 10,0 q4,-6 9,0" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`,
    eureka:`<path d="M-20,20 q20,28 40,0 z" fill="${INK}"/><path d="M-11,30 q11,8 22,0" fill="#E8636B"/>`}[expr];
  return f+m;
}
function head(x,y,sc,expr,hat){
  let g=`<g transform="translate(${x},${y}) scale(${sc})">`;
  g+=`<path d="M-70,10 C-74,-60 -40,-92 2,-92 C46,-92 76,-58 72,6 C70,58 40,80 0,80 C-42,80 -68,56 -70,10 Z" fill="${SKIN}" stroke="${INK}" stroke-width="7"/>`;
  g+=face(expr);
  if(hat) g+=hat;
  return g+'</g>';
}
// accesorios
const GAFAS=`<g fill="none" stroke="${INK}" stroke-width="4"><circle cx="-26" cy="-4" r="17"/><circle cx="26" cy="-4" r="17"/><path d="M-9,-4 h18"/></g>`;
const SOMBRERO=`<g stroke="${INK}" stroke-width="6" stroke-linejoin="round"><path d="M-92,-62 q92,-22 184,0 q-92,16 -184,0z" fill="#6B4F3A"/><path d="M-52,-70 q2,-50 52,-52 q50,2 52,52 q-52,10 -104,0z" fill="#7D5C44"/><path d="M-50,-78 q50,8 100,0" fill="none" stroke="#2B2B2B" stroke-width="10"/></g>`;
const GORRA=`<g stroke="${INK}" stroke-width="6" stroke-linejoin="round"><path d="M-66,-60 q66,-58 132,0 z" fill="#22355E"/><rect x="-66" y="-66" width="132" height="16" rx="6" fill="#22355E"/><path d="M-60,-50 q60,22 120,0 q-10,14 -60,18 q-50,-4 -60,-18z" fill="#111"/><circle cx="0" cy="-80" r="9" fill="#F2C14E"/></g>`;
const PELO=`<path d="M-66,-30 C-74,-80 -30,-100 4,-96 C40,-96 72,-74 68,-34 C50,-60 20,-66 0,-58 C-20,-66 -48,-58 -66,-30Z" fill="#3A2A22" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
function personaje(x,y,sc,o){
  let g=`<g transform="translate(${x},${y}) scale(${sc})">`;
  g+=`<ellipse cx="0" cy="6" rx="70" ry="12" fill="#000" opacity=".12"/>`;
  // piernas fideo
  if(o.piernas) g+=o.piernas; else {
  g+=`<path d="M-16,-150 q-6,80 -20,148" fill="none" stroke="${o.pantalon}" stroke-width="20" stroke-linecap="round"/><path d="M16,-150 q8,80 20,148" fill="none" stroke="${o.pantalon}" stroke-width="20" stroke-linecap="round"/>`;
  g+=`<path d="M-16,-150 q-6,80 -20,148 M16,-150 q8,80 20,148" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round" opacity="0"/>`;
  g+=`<ellipse cx="-44" cy="-2" rx="22" ry="11" fill="#2B2B2B" stroke="${INK}" stroke-width="5"/><ellipse cx="44" cy="-2" rx="22" ry="11" fill="#2B2B2B" stroke="${INK}" stroke-width="5"/>`;
  }
  // brazos
  g+=`<path d="${o.brazoI}" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/><path d="${o.brazoI}" fill="none" stroke="${o.manga}" stroke-width="15" stroke-linecap="round"/>`;
  g+=`<path d="${o.brazoD}" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/><path d="${o.brazoD}" fill="none" stroke="${o.manga}" stroke-width="15" stroke-linecap="round"/>`;
  // torso
  g+=`<path d="M-50,-268 q50,-18 100,0 l10,118 q-60,16 -120,0 z" fill="${o.torso}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
  g+=o.detalle||'';
  // manos
  g+=o.manos.map(([a,b])=>`<circle cx="${a}" cy="${b}" r="15" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>`).join('');
  g+=o.objeto||'';
  g+='</g>';
  g+=head(x, y-370*sc, sc*1.0, o.expr, o.cabeza);
  return g;
}

// Vestuario de cada personaje (pose por defecto). Se puede sobrescribir expr, brazos, manos, objeto.
const PRESETS={
  toni:{expr:'neutral',pantalon:'#3C4A63',torso:'#FAFAF7',manga:'#FAFAF7',
    brazoI:'M-46,-250 q-40,60 -44,112', brazoD:'M46,-250 q44,30 70,-20', manos:[[-90,-136],[116,-272]],
    detalle:`<path d="M0,-266 l-14,40 14,70 14,-70z" fill="#5B8BD9" stroke="${INK}" stroke-width="5"/><rect x="22" y="-238" width="22" height="26" rx="4" fill="#E9E4DA" stroke="${INK}" stroke-width="4"/><path d="M28,-246 l0,22 M36,-248 l0,22" stroke="#D9534F" stroke-width="4"/>`,
    objeto:`<g transform="translate(116,-272) rotate(-20)"><rect x="-6" y="-60" width="12" height="60" rx="3" fill="#F2C14E" stroke="${INK}" stroke-width="4"/><path d="M-6,-60 l6,-14 6,14z" fill="#E8B07A" stroke="${INK}" stroke-width="4"/></g>`,
    cabeza:PELO+GAFAS},
  pasajero:{expr:'neutral',pantalon:'#55463A',torso:'#7A6450',manga:'#7A6450',
    brazoI:'M-46,-250 q-30,60 -34,112', brazoD:'M46,-250 q30,60 34,112', manos:[[-80,-136],[80,-136]],
    detalle:`<path d="M0,-266 l-10,30 10,40 10,-40z" fill="#C0392B" stroke="${INK}" stroke-width="4"/>`, cabeza:SOMBRERO},
  piloto:{expr:'eureka',pantalon:'#22355E',torso:'#22355E',manga:'#22355E',
    brazoI:'M-46,-250 q-30,60 -34,112', brazoD:'M46,-250 q50,-10 60,-80', manos:[[-80,-136],[106,-330]],
    detalle:`<path d="M-40,-240 h80" stroke="#F2C14E" stroke-width="5"/><circle cx="-26" cy="-200" r="5" fill="#F2C14E"/><circle cx="-26" cy="-175" r="5" fill="#F2C14E"/>`, cabeza:GORRA},
  // Operario: mono de trabajo y casco, para escenas de taller
  operario:{expr:'preocupado',pantalon:'#C9772E',torso:'#D9843A',manga:'#D9843A',
    brazoI:'M-46,-250 q-30,60 -34,112', brazoD:'M46,-250 q30,60 34,112', manos:[[-80,-136],[80,-136]],
    detalle:`<path d="M-30,-268 v60 M30,-268 v60" stroke="#8A4B17" stroke-width="7"/><rect x="-18" y="-215" width="36" height="22" rx="4" fill="#C9772E" stroke="${INK}" stroke-width="4"/>`,
    cabeza:`<g stroke="${INK}" stroke-width="6" stroke-linejoin="round"><path d="M-68,-50 q68,-80 136,0 z" fill="#F2C14E"/><rect x="-80" y="-56" width="160" height="14" rx="7" fill="#F2C14E"/></g>`},
};
// Devuelve el SVG (string) de un personaje con los pies en (x,y).
function dibujar(nombre,x,y,sc,cambios){if(PRESETS[nombre]&&PRESETS[nombre].svg)return `<g transform="translate(${x},${y}) scale(${sc})">${PRESETS[nombre].svg}</g>`;return personaje(x,y,sc,Object.assign({},PRESETS[nombre],cambios||{}));}

// ---------- Short "El pueblo que no existía" (Agloe) ----------
const VISERA = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-70,-44 q70,-24 140,0 l0,9 q-70,-22 -140,0z" fill="#2E7D4F"/><path d="M-64,-38 q64,-16 128,0 q-14,20 -64,22 q-50,-2 -64,-22z" fill="rgba(80,200,130,.55)"/></g>`;
const PELO_ROJO = PELO.replace('#3A2A22', '#B5532A');
const CALVO = `<g fill="#6B6B6B" stroke="${INK}" stroke-width="5"><path d="M-70,-10 q-6,-30 10,-46 q4,24 -2,52z"/><path d="M70,-10 q6,-30 -10,-46 q-4,24 2,52z"/></g>`;
const BIGOTE = (c = '#5A3B26') => `<path d="M-30,18 q15,-12 30,-2 q15,-10 30,2 q-14,14 -30,5 q-16,9 -30,-5z" fill="${c}" stroke="${INK}" stroke-width="3.5"/>`;
const ANTIFAZ = `<g><path d="M-74,-22 q74,-16 148,0 l0,28 q-34,8 -52,-6 q-22,-12 -44,0 q-18,14 -52,6z" fill="#151515" stroke="${INK}" stroke-width="4"/><ellipse cx="-26" cy="-6" rx="12" ry="8" fill="#fff"/><ellipse cx="26" cy="-6" rx="12" ry="8" fill="#fff"/><circle cx="-20" cy="-6" r="4.5" fill="${INK}"/><circle cx="32" cy="-6" r="4.5" fill="${INK}"/><path d="M-40,-30 l26,8 M40,-30 l-26,8" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>`;
const GORRO_NEGRO = `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round"><path d="M-68,-40 q-4,-60 68,-62 q72,2 68,62z" fill="#2B2B2B"/><rect x="-72" y="-48" width="144" height="18" rx="8" fill="#3A3A3A"/></g>`;
const GORRA_PLANA = `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round"><path d="M-66,-46 q66,-62 132,-4 q-66,-14 -132,4z" fill="#8A6A45"/><path d="M8,-52 q60,-6 84,10 q-40,8 -84,0z" fill="#6E5235"/></g>`;
const REGLA = `<g transform="rotate(-25)"><rect x="-8" y="-90" width="16" height="96" rx="3" fill="#E9D8A6" stroke="${INK}" stroke-width="4"/><path d="M-8,-80 h7 M-8,-66 h5 M-8,-52 h7 M-8,-38 h5 M-8,-24 h7" stroke="${INK}" stroke-width="3"/></g>`;
const ROLLO = `<g transform="rotate(30)"><rect x="-14" y="-80" width="28" height="100" rx="12" fill="#F3E7C9" stroke="${INK}" stroke-width="5"/><path d="M-14,-50 h28 M-14,-10 h28" stroke="#C9A96B" stroke-width="4"/></g>`;
const CALCO = `<g transform="rotate(-12)"><rect x="-55" y="-75" width="80" height="62" rx="4" fill="rgba(255,255,255,.75)" stroke="${INK}" stroke-width="4"/><path d="M-45,-55 q20,10 30,-5 t30,8 M-40,-30 l50,-10" stroke="#5B8BD9" stroke-width="3" fill="none"/></g>`;
const CARTEL_AGLOE = `<g><rect x="-70" y="-62" width="130" height="48" rx="6" fill="#B23A2E" stroke="${INK}" stroke-width="5"/><text x="-5" y="-29" font-size="24" font-weight="900" text-anchor="middle" fill="#FFF3D6" font-family="DejaVu Sans">AGLOE</text></g>`;
Object.assign(PRESETS, {
  cartografo1: { expr: 'neutral', pantalon: '#4A4F5A', torso: '#F1E9D8', manga: '#F1E9D8',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q44,30 70,-20', manos: [[-80, -136], [116, -272]],
    detalle: `<path d="M-40,-262 v100 M40,-262 v100" stroke="#7A5A3A" stroke-width="7"/><path d="M0,-266 l-9,22 9,30 9,-30z" fill="#7A3B2E" stroke="${INK}" stroke-width="4"/><rect x="-60" y="-222" width="16" height="8" fill="#C0392B" stroke="${INK}" stroke-width="2"/><rect x="44" y="-222" width="16" height="8" fill="#C0392B" stroke="${INK}" stroke-width="2"/>`,
    objeto: `<g transform="translate(116,-272)">${REGLA}</g>`, cabeza: PELO_ROJO + VISERA },
  cartografo2: { expr: 'neutral', pantalon: '#3E3A35', torso: '#6F7F5F', manga: '#E9E4D6',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,40 24,90', manos: [[-80, -136], [70, -160]],
    detalle: `<path d="M-50,-266 l26,110 M50,-266 l-26,110" stroke="#4F5D42" stroke-width="5"/><circle cx="0" cy="-200" r="5" fill="#F2C14E" stroke="${INK}" stroke-width="2"/><circle cx="0" cy="-176" r="5" fill="#F2C14E" stroke="${INK}" stroke-width="2"/>`,
    objeto: `<g transform="translate(70,-160)">${ROLLO}</g>`, cabeza: CALVO + BIGOTE('#6B6B6B') + VISERA },
  villano: { expr: 'eureka', pantalon: '#1E1E1E', torso: '#2B2B2B', manga: '#2B2B2B',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,-10 60,-70', manos: [[-80, -136], [106, -320]],
    detalle: `<path d="M-52,-240 h104 M-54,-212 h108 M-56,-184 h112" stroke="#EDEDED" stroke-width="9"/>`,
    objeto: `<g transform="translate(106,-320)">${CALCO}</g>`, cabeza: GORRO_NEGRO + ANTIFAZ },
  tendero: { expr: 'eureka', pantalon: '#4B3B2B', torso: '#C0392B', manga: '#C0392B',
    brazoI: 'M-46,-250 q-40,30 -44,60', brazoD: 'M46,-250 q40,30 44,60', manos: [[-92, -188], [92, -188]],
    detalle: `<path d="M-38,-250 h76 l8,106 h-92z" fill="#FAFAF5" stroke="${INK}" stroke-width="5"/><path d="M-38,-250 l-10,-14 M38,-250 l10,-14" stroke="#FAFAF5" stroke-width="5"/><rect x="-16" y="-200" width="32" height="20" rx="3" fill="none" stroke="#C9C2B0" stroke-width="3"/>`,
    objeto: `<g transform="translate(0,-150)">${CARTEL_AGLOE.replace('x="-70"', 'x="-100"').replace('width="130"', 'width="200"').replace('x="-5"', 'x="0"')}</g>`, cabeza: GORRA_PLANA + BIGOTE() },
});

// ---------- Short "Lágrimas del príncipe Rupert" ----------
const rizos = (color, sombra) => { let r = ''; for (const s of [-1, 1]) for (let i = 0; i < 5; i++) r += `<circle cx="${s * (74 - (i % 2) * 6)}" cy="${-40 + i * 28}" r="22" fill="${color}" stroke="${sombra}" stroke-width="4"/>`; return `<g>${r}<path d="M-76,-30 C-80,-100 80,-100 76,-30 C50,-70 -50,-70 -76,-30z" fill="${color}" stroke="${sombra}" stroke-width="5"/></g>`; };
const PELUCA_REY = rizos('#2A1E1A', '#1F2A44');
const PELUCA_BLANCA = rizos('#F2F0EA', '#1F2A44');
const CORONA = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-46,-84 l-6,-46 l24,22 l28,-36 l28,36 l24,-22 l-6,46z" fill="#F2C14E"/><circle cx="0" cy="-104" r="7" fill="#C0392B"/><circle cx="-30" cy="-96" r="5" fill="#3E7BD9"/><circle cx="30" cy="-96" r="5" fill="#3E7BD9"/></g>`;
const SUDOR = `<g fill="#7EC8F2" stroke="${INK}" stroke-width="3"><path d="M84,-40 q8,14 0,20 q-8,-6 0,-20z"/><path d="M96,-6 q7,12 0,17 q-7,-5 0,-17z"/><path d="M-90,-30 q7,12 0,17 q-7,-5 0,-17z"/></g>`;
const MARTILLO = `<g transform="rotate(35)"><rect x="-7" y="-110" width="14" height="110" rx="5" fill="#8A5A34" stroke="${INK}" stroke-width="5"/><rect x="-38" y="-138" width="76" height="34" rx="6" fill="#7D8790" stroke="${INK}" stroke-width="5"/></g>`;
const ALICATES = `<g transform="rotate(-20)" stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-6,0 l-16,70 l14,0 l12,-66z" fill="#D9534F"/><path d="M6,0 l16,70 l-14,0 l-12,-66z" fill="#D9534F"/><path d="M-6,0 l-4,-50 l8,0z M6,0 l4,-50 l-8,0z" fill="#9AA3AD"/><circle cx="0" cy="-2" r="7" fill="#9AA3AD"/></g>`;
const LUPA = `<g transform="rotate(-30)"><rect x="-6" y="0" width="12" height="60" rx="5" fill="#5A3B26" stroke="${INK}" stroke-width="4"/><circle cx="0" cy="-30" r="30" fill="rgba(190,230,255,.6)" stroke="#C9A24A" stroke-width="9"/></g>`;
const GOTA = `<g><path d="M0,-18 c14,0 22,10 22,22 c0,14 -10,22 -22,22 c-10,0 -16,-6 -20,-14 c-10,-6 -30,-12 -60,-14 c28,-4 46,-10 56,-16 c6,-0 14,0 24,0z" fill="rgba(210,240,255,.85)" stroke="${INK}" stroke-width="4"/></g>`;
Object.assign(PRESETS, {
  rey: { expr: 'eureka', pantalon: '#F2EEE4', torso: '#B3262E', manga: '#B3262E',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,-10 70,-60', manos: [[-80, -136], [116, -310]],
    detalle: `<path d="M-50,-268 q50,-18 100,0 l4,30 q-54,14 -108,0z" fill="#FAFAF5" stroke="${INK}" stroke-width="5"/><g fill="#1F2A44">${[-34, -12, 10, 32].map(x => `<path d="M${x},-252 l3,8 l-3,4 l-3,-4z"/>`).join('')}</g><path d="M-6,-232 v80 M6,-232 v80" stroke="#F2C14E" stroke-width="5"/><circle cx="0" cy="-200" r="8" fill="#F2C14E" stroke="${INK}" stroke-width="3"/>`,
    objeto: `<g transform="translate(116,-330)">${GOTA}</g>`, cabeza: PELUCA_REY + CORONA },
  cientifico1: { expr: 'preocupado', pantalon: '#E9E4D6', torso: '#2F3F66', manga: '#2F3F66',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,10 10,-60', manos: [[-80, -136], [50, -312]],
    detalle: `<path d="M-16,-266 l16,26 16,-26" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M0,-240 v90" stroke="#C9A24A" stroke-width="4"/><circle cx="0" cy="-215" r="5" fill="#C9A24A"/><circle cx="0" cy="-185" r="5" fill="#C9A24A"/>`,
    cabeza: PELUCA_BLANCA },
  cientifico2: { expr: 'sorprendido', pantalon: '#3E3A35', torso: '#6E2A3A', manga: '#6E2A3A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,-10 60,-70', manos: [[-80, -136], [106, -320]],
    detalle: `<path d="M-16,-266 l16,26 16,-26" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M0,-240 v90" stroke="#C9A24A" stroke-width="4"/>`,
    objeto: `<g transform="translate(106,-320)">${LUPA}</g>`, cabeza: PELUCA_BLANCA + GAFAS },
});
// Toni con martillo (sudando) y con alicates: variantes de pose para este short
PRESETS.toni_martillo = Object.assign({}, PRESETS.toni, { expr: 'preocupado', brazoD: 'M46,-250 q50,-10 60,-80', manos: [[-90, -136], [106, -330]], objeto: `<g transform="translate(106,-330)">${MARTILLO}</g>`, cabeza: PELO + GAFAS + SUDOR });
PRESETS.toni_alicates = Object.assign({}, PRESETS.toni, { expr: 'eureka', brazoD: 'M46,-250 q50,-10 70,-50', manos: [[-90, -136], [116, -300]], objeto: `<g transform="translate(116,-300)">${ALICATES}</g>` });

// ---------- Short "Por qué las monedas tienen rayas" ----------
const TRICORNIO = `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round"><path d="M-90,-52 q90,-70 180,0 q-30,-12 -90,-8 q-60,-4 -90,8z" fill="#222"/><path d="M-60,-62 q60,-60 120,0z" fill="#2c2c2c"/></g>`;
const SOMBRERO_PLUMA = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-96,-56 q96,-30 192,0 q-96,20 -192,0z" fill="#3B2350"/><path d="M-52,-62 q0,-48 52,-50 q52,2 52,50z" fill="#4A2D63"/><path d="M30,-100 q60,-40 70,10 q-30,-30 -70,-10z" fill="#F2F2F2"/></g>`;
const GORRO_MERCADER = `<g stroke="${INK}" stroke-width="5"><path d="M-66,-44 q-6,-56 66,-58 q72,2 66,58 q-66,-18 -132,0z" fill="#2E7D4F"/></g>`;
const PELO_NEWTON = `<g stroke="${INK}" stroke-width="4">${[-1, 1].map(s => [0, 1, 2, 3].map(i => `<path d="M${s * 60},${-50 + i * 34} q${s * 30},10 ${s * 22},40 q${-s * 22},-4 ${-s * 30},-30z" fill="#C9C4BC"/>`).join('')).join('')}<path d="M-72,-20 C-78,-104 78,-104 72,-20 C52,-66 -52,-66 -72,-20z" fill="#C9C4BC"/></g>`;
const LIMA = `<g transform="rotate(25)"><rect x="-6" y="-80" width="12" height="70" rx="2" fill="#9AA3AD" stroke="${INK}" stroke-width="4"/><path d="M-6,-70 h12 M-6,-60 h12 M-6,-50 h12 M-6,-40 h12 M-6,-30 h12" stroke="#5B6470" stroke-width="2"/><rect x="-8" y="-12" width="16" height="34" rx="5" fill="#8A5A34" stroke="${INK}" stroke-width="4"/></g>`;
const MONEDA = (r = 26, c = '#D9DEE5') => `<g><circle r="${r}" fill="${c}" stroke="${INK}" stroke-width="4"/><circle r="${r * .7}" fill="none" stroke="#9AA3AD" stroke-width="3"/></g>`;
const BALANZA = `<g stroke="${INK}" stroke-width="4"><path d="M0,0 v-90 M-50,-80 h100" fill="none"/><path d="M-50,-80 l-18,40 h36z M50,-80 l-18,40 h36z" fill="#F2C14E"/><circle cx="-50" cy="-44" r="9" fill="#D9DEE5"/></g>`;
const MANZANA = `<g stroke="${INK}" stroke-width="3"><circle r="13" fill="#D63A2F"/><path d="M0,-12 q2,-8 8,-10" fill="none"/><path d="M2,-16 q10,-6 14,0 q-8,4 -14,0z" fill="#4CAF50"/></g>`;
const BOLSA = `<g stroke="${INK}" stroke-width="4"><path d="M-30,0 q-10,-40 30,-46 q40,6 30,46 q-30,12 -60,0z" fill="#B08A4A"/><path d="M-10,-46 l10,-12 10,12" fill="none"/><text x="0" y="-12" font-size="26" font-weight="900" text-anchor="middle" fill="#5A3B1A" stroke="none" font-family="DejaVu Sans">£</text></g>`;
Object.assign(PRESETS, {
  ladron: { expr: 'eureka', pantalon: '#3A3A3A', torso: '#5B4636', manga: '#5B4636',
    brazoI: 'M-46,-250 q-40,30 -20,70', brazoD: 'M46,-250 q50,-10 60,-70', manos: [[-60, -180], [106, -320]],
    detalle: `<path d="M-52,-266 l-14,120 l30,0z M52,-266 l14,120 l-30,0z" fill="#2A2A2A" stroke="${INK}" stroke-width="4"/><g transform="translate(-60,-180)">${MONEDA(24)}</g>`,
    objeto: `<g transform="translate(106,-320)">${LIMA}</g>`, cabeza: TRICORNIO },
  mercader: { expr: 'neutral', pantalon: '#4B3B2B', torso: '#E7D9B8', manga: '#E7D9B8',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,20 70,60', manos: [[-80, -136], [116, -190]],
    detalle: `<path d="M-36,-250 h72 l6,104 h-84z" fill="#2E7D4F" stroke="${INK}" stroke-width="5"/>`,
    objeto: `<g transform="translate(130,-110)">${BALANZA}</g>`, cabeza: GORRO_MERCADER + BIGOTE('#6B4423') },
  newton: { expr: 'neutral', pantalon: '#E9E4D6', torso: '#6B4A2E', manga: '#6B4A2E',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,-10 60,-70', manos: [[-80, -136], [106, -320]],
    detalle: `<path d="M-14,-266 l14,24 14,-24" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M0,-240 v90" stroke="#C9A24A" stroke-width="4"/>${[-215, -190, -165].map(y => `<circle cx="0" cy="${y}" r="5" fill="#C9A24A"/>`).join('')}<g transform="translate(-30,-176)">${MANZANA}</g>`,
    objeto: `<g transform="translate(106,-320)">${LUPA}</g>`, cabeza: PELO_NEWTON },
  falsificador: { expr: 'eureka', pantalon: '#2B2B2B', torso: '#5E2B7A', manga: '#5E2B7A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,40 24,90', manos: [[-80, -136], [70, -160]],
    detalle: `<path d="M-14,-266 l14,24 14,-24" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M-50,-240 h100" stroke="#F2C14E" stroke-width="4"/>`,
    objeto: `<g transform="translate(70,-130)">${BOLSA}</g>`, cabeza: SOMBRERO_PLUMA + BIGOTE('#2A1E1A') },
});
PRESETS.toni_moneda = Object.assign({}, PRESETS.toni, { expr: 'eureka', brazoD: 'M46,-250 q80,-10 100,-50', manos: [[-90, -136], [146, -300]], objeto: `<g transform="translate(150,-350)">${MONEDA(46, '#E3B84A')}</g>` });

// ---------- Short "El edificio que giró" (Indianápolis, 1930) ----------
const MONYO = `<g stroke="${INK}" stroke-width="5"><path d="M-70,-20 C-76,-96 76,-96 70,-20 C60,-60 30,-70 0,-64 C-30,-70 -60,-60 -70,-20z" fill="#7A3B22"/><circle cx="0" cy="-96" r="24" fill="#7A3B22"/></g>`;
const CASCOS_TEL = `<g stroke="${INK}" stroke-width="5" fill="none"><path d="M-74,-6 C-80,-110 80,-110 74,-6"/><rect x="-86" y="-16" width="18" height="30" rx="6" fill="#2B2B2B"/><rect x="68" y="-16" width="18" height="30" rx="6" fill="#2B2B2B"/><path d="M-76,10 q-6,26 34,30" /><circle cx="-40" cy="40" r="7" fill="#2B2B2B"/></g>`;
const FEDORA = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-90,-58 q90,-26 180,0 q-90,18 -180,0z" fill="#5A6B7A"/><path d="M-54,-64 q2,-46 54,-48 q52,2 54,48 q-54,10 -108,0z" fill="#6E8193"/><path d="M-52,-70 q52,8 104,0" stroke="#2B2B2B" stroke-width="9"/></g>`;
const BOMBIN = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-80,-60 q80,-20 160,0 q-80,14 -160,0z" fill="#222"/><path d="M-50,-64 q0,-58 50,-58 q50,0 50,58z" fill="#2c2c2c"/></g>`;
const GORRA_OBRERO = GORRA_PLANA.replace('#8A6A45', '#4A5A6A').replace('#6E5235', '#3A4856');
const TAZA = `<g stroke="${INK}" stroke-width="4"><path d="M-16,-30 h32 l-4,34 h-24z" fill="#FAFAF5"/><path d="M16,-22 q14,0 12,12 q-2,8 -14,6" fill="none"/><path d="M-6,-40 q4,-8 0,-14 M6,-40 q4,-8 0,-14" stroke="#9AA3AD" fill="none"/></g>`;
const LLAVE = `<g transform="rotate(-30)" stroke="${INK}" stroke-width="5"><rect x="-8" y="-110" width="16" height="110" rx="5" fill="#9AA3AD"/><path d="M-26,-130 h52 v26 h-14 v-10 h-24 v10 h-14z" fill="#9AA3AD"/></g>`;
const RELOJ = `<g stroke="${INK}" stroke-width="4"><path d="M0,-30 q-20,-30 -40,-20" fill="none" stroke="#C9A24A"/><circle r="20" fill="#F2C14E"/><circle r="13" fill="#FFF8E0"/><path d="M0,0 v-9 M0,0 h7" stroke-width="3"/></g>`;
Object.assign(PRESETS, {
  operadora: { expr: 'eureka', pantalon: '#3B3B5A', torso: '#C7E0F4', manga: '#C7E0F4',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q40,30 50,-30', manos: [[-80, -136], [96, -280]],
    detalle: `<path d="M-16,-266 l16,22 16,-22" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M-48,-160 h96 l10,0 -2,10 h-112z" fill="#3B3B5A"/>`,
    objeto: `<g transform="translate(96,-280)"><path d="M0,0 q30,20 10,60" stroke="#2B2B2B" stroke-width="5" fill="none"/><circle cx="10" cy="62" r="7" fill="#C0392B" stroke="${INK}" stroke-width="3"/></g>`, cabeza: MONYO + CASCOS_TEL },
  oficinista: { expr: 'neutral', pantalon: '#4A4F5A', torso: '#F1EEE6', manga: '#F1EEE6',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q40,30 50,-10', manos: [[-80, -136], [96, -240]],
    detalle: `<path d="M0,-266 l-12,30 12,70 12,-70z" fill="#C0392B" stroke="${INK}" stroke-width="5"/><path d="M-40,-262 v100 M40,-262 v100" stroke="#5B4636" stroke-width="6"/>`,
    objeto: `<g transform="translate(100,-236)">${TAZA}</g>`, cabeza: FEDORA },
  obrero: { expr: 'neutral', pantalon: '#2F5D8A', torso: '#2F5D8A', manga: '#E7D9B8',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q80,0 100,-40', manos: [[-80, -136], [146, -290]],
    detalle: `<path d="M-30,-268 v60 M30,-268 v60" stroke="#244A70" stroke-width="7"/><rect x="-22" y="-218" width="44" height="30" rx="4" fill="#2F5D8A" stroke="${INK}" stroke-width="4"/>`,
    objeto: `<g transform="translate(146,-290)">${LLAVE.replace('rotate(-30)', 'rotate(15)')}</g>`, cabeza: GORRA_OBRERO + BIGOTE('#5A3B26') },
  directivo: { expr: 'preocupado', pantalon: '#2B2B2B', torso: '#3A3F4A', manga: '#3A3F4A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,-10 60,-70', manos: [[-80, -136], [106, -320]],
    detalle: `<path d="M-16,-266 l16,26 16,-26" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M0,-240 l-8,10 8,50 8,-50z" fill="#7A2A3A"/>`,
    objeto: `<g transform="translate(106,-320)">${RELOJ}</g>`, cabeza: BOMBIN + BIGOTE('#3A2A22') },
});

// ---------- Short "Las jaulas de las tumbas" (Escocia, siglo XIX) ----------
const GORRO_LANA = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-68,-36 q-4,-70 68,-72 q72,2 68,72 q-68,-16 -136,0z" fill="#4A3B5C"/><path d="M-70,-40 q70,-16 140,0 l0,14 q-70,-16 -140,0z" fill="#3A2E4A"/><circle cx="0" cy="-110" r="12" fill="#3A2E4A"/></g>`;
const BUFANDA = `<g stroke="${INK}" stroke-width="4"><path d="M-48,-272 q48,22 96,0 l-4,22 q-44,18 -88,0z" fill="#7A2E2E"/><path d="M24,-262 l12,48 l-18,4 l-6,-46z" fill="#7A2E2E"/></g>`;
const PALA = `<g transform="rotate(20)"><rect x="-6" y="-150" width="12" height="150" rx="4" fill="#7A5634" stroke="${INK}" stroke-width="4"/><path d="M-22,-146 h44 l-5,-56 q-17,-18 -34,0z" fill="#8F99A3" stroke="${INK}" stroke-width="4"/><rect x="-18" y="6" width="36" height="12" rx="5" fill="#7A5634" stroke="${INK}" stroke-width="4"/></g>`;
const SACO = `<g stroke="${INK}" stroke-width="4"><path d="M-40,0 q-14,-70 26,-90 q30,-6 48,12 q30,40 6,78 q-40,14 -80,0z" fill="#B59A6A"/><path d="M-12,-88 l8,-16 10,14" fill="none"/></g>`;
const SOMBRERO_COPA = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-84,-58 q84,-20 168,0 q-84,14 -168,0z" fill="#1E1E1E"/><rect x="-48" y="-150" width="96" height="94" rx="8" fill="#252525"/><rect x="-48" y="-78" width="96" height="14" fill="#7A2A3A"/></g>`;
const VELO = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-74,-30 C-80,-110 80,-110 74,-30 L82,60 q-20,-50 -10,-80 C60,-70 -60,-70 -72,-20 q10,30 -10,80z" fill="#1d1d24"/><path d="M-60,-60 q60,-40 120,0" fill="none" stroke="#3a3a46"/></g>`;
const FLORES = `<g stroke="${INK}" stroke-width="3"><path d="M0,0 l-10,-50 M0,0 l0,-56 M0,0 l10,-50" stroke="#3E7B4F" stroke-width="4"/>${[[-10, -54], [0, -62], [10, -54], [-4, -46], [6, -44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#F5F5F0"/><circle cx="${x}" cy="${y}" r="3" fill="#F2C14E" stroke="none"/>`).join('')}</g>`;
const BISTURI = `<g transform="rotate(-35)"><rect x="-4" y="-70" width="8" height="54" rx="3" fill="#C9D1DA" stroke="${INK}" stroke-width="3"/><path d="M-4,-70 q4,-26 8,0z" fill="#E8EEF5" stroke="${INK}" stroke-width="3"/></g>`;
const PERGAMINO = `<g stroke="${INK}" stroke-width="4"><rect x="-34" y="-80" width="68" height="84" rx="4" fill="#F1E3BC"/><path d="M-24,-64 h48 M-24,-52 h48 M-24,-40 h40 M-24,-28 h44" stroke="#9A8A6A" stroke-width="3"/><circle cx="18" cy="-10" r="10" fill="#B3262E"/></g>`;
const DELANTAL_CUERO = `<path d="M-40,-250 h80 l8,108 h-96z" fill="#6B4423" stroke="${INK}" stroke-width="5"/>`;
const CAMARA = `<g stroke="${INK}" stroke-width="4"><rect x="-34" y="-26" width="68" height="44" rx="8" fill="#2B2B2B"/><circle cx="0" cy="-4" r="15" fill="#4A6A8A"/><circle cx="0" cy="-4" r="7" fill="#9FC3E8"/><rect x="14" y="-34" width="14" height="8" fill="#2B2B2B"/></g>`;
const PELO_RIZADO = `<g stroke="${INK}" stroke-width="5">${[-50, -25, 0, 25, 50].map((x, i) => `<circle cx="${x}" cy="${-72 + (i % 2) * 8}" r="22" fill="#2A1E1A"/>`).join('')}</g>`;
Object.assign(PRESETS, {
  resurreccionista: { expr: 'eureka', pantalon: '#3A3A3A', torso: '#4E5A4A', manga: '#4E5A4A',
    brazoI: 'M-46,-250 q-30,40 -10,90', brazoD: 'M46,-250 q50,-10 60,-70', manos: [[-56, -160], [106, -320]],
    detalle: BUFANDA + `<path d="M-30,-200 l10,8 M20,-180 l12,6" stroke="#2c2c2c" stroke-width="5"/>`,
    objeto: `<g transform="translate(106,-320)">${PALA}</g>`, cabeza: GORRO_LANA + BIGOTE('#3a2a22') },
  resurreccionista2: { expr: 'neutral', pantalon: '#2E2E38', torso: '#6A4A3A', manga: '#6A4A3A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q40,30 50,60', manos: [[-80, -136], [96, -170]],
    detalle: `<path d="M-46,-268 l-6,118 M46,-268 l6,118" stroke="#4A3428" stroke-width="6"/>`,
    objeto: `<g transform="translate(110,-120)">${SACO}</g>`, cabeza: GORRO_LANA.replaceAll('#4A3B5C', '#5A4A2E').replaceAll('#3A2E4A', '#4A3A20') },
  anatomista: { expr: 'preocupado', pantalon: '#2B2B2B', torso: '#1F1F26', manga: '#1F1F26',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,-10 60,-70', manos: [[-80, -136], [106, -320]],
    detalle: `<path d="M-18,-266 l18,30 18,-30" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M-10,-258 q10,10 20,0 l-4,10 q-6,4 -12,0z" fill="#FAFAF5" stroke="${INK}" stroke-width="3"/><path d="M-30,-232 v80 M30,-232 v80" stroke="#3a3a46" stroke-width="5"/>`,
    objeto: `<g transform="translate(106,-320)">${BISTURI}</g>`, cabeza: PELO_RIZADO + GAFAS },
  estudiante: { expr: 'sorprendido', pantalon: '#4A4F5A', torso: '#6B4A2E', manga: '#6B4A2E',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,60 34,112', manos: [[-80, -136], [80, -136]],
    detalle: `<path d="M-14,-266 l14,22 14,-22" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M-10,-246 q10,8 20,0" fill="none" stroke="#FAFAF5" stroke-width="6"/>`, cabeza: SOMBRERO_COPA },
  viuda: { expr: 'preocupado', pantalon: '#1d1d24', torso: '#24242c', manga: '#24242c',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,10 40,60', manos: [[-80, -136], [86, -190]],
    detalle: `<path d="M-50,-160 l-20,160 h140 l-20,-160z" fill="#24242c" stroke="${INK}" stroke-width="5"/><path d="M-10,-264 h20" stroke="#F5F5F0" stroke-width="6"/>`,
    objeto: `<g transform="translate(86,-190)">${FLORES}</g>`, cabeza: VELO },
  herrero: { expr: 'neutral', pantalon: '#3A3A3A', torso: '#C8B79A', manga: '#C8B79A',
    brazoI: 'M-46,-250 q-50,-20 -60,-90', brazoD: 'M46,-250 q50,-20 60,-90', manos: [[-106, -340], [106, -340]],
    detalle: DELANTAL_CUERO, cabeza: PELO + BIGOTE('#2A1E1A') },
});
PRESETS.anatomista_feliz = Object.assign({}, PRESETS.anatomista, { expr: 'eureka', objeto: `<g transform="translate(106,-320)">${PERGAMINO}</g>` });
PRESETS.toni_camara = Object.assign({}, PRESETS.toni, { expr: 'sorprendido', brazoD: 'M46,-250 q40,0 40,-40', brazoI: 'M-46,-250 q-10,10 30,-40', manos: [[-16, -290], [86, -290]], objeto: `<g transform="translate(36,-290)">${CAMARA}</g>` });

// ---------- Short "La ola de melaza" (Boston, 1919) ----------
const PERIODICOS = `<g stroke="${INK}" stroke-width="4"><rect x="-30" y="-30" width="60" height="44" rx="4" fill="#8A6A45"/><rect x="-24" y="-44" width="48" height="20" fill="#F2EEE2"/><path d="M-18,-38 h36 M-18,-31 h28" stroke="#888" stroke-width="3"/></g>`;
const GORRA_REPARTIDOR = GORRA_PLANA.replace('#8A6A45', '#6B7A5A').replace('#6E5235', '#55634A');
Object.assign(PRESETS, {
  repartidor: { expr: 'sorprendido', pantalon: '#4A4F5A', torso: '#C9A27A', manga: '#C9A27A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,-10 60,-70', manos: [[-80, -136], [106, -320]],
    detalle: `<path d="M-46,-262 l90,90" stroke="#5A3B26" stroke-width="7"/><g transform="translate(30,-160)">${PERIODICOS}</g>`,
    objeto: `<g transform="translate(106,-320) rotate(-10)"><rect x="-24" y="-30" width="48" height="36" fill="#F2EEE2" stroke="${INK}" stroke-width="4"/><path d="M-16,-20 h32 M-16,-12 h24 M-16,-4 h28" stroke="#888" stroke-width="3"/></g>`, cabeza: GORRA_REPARTIDOR },
  corredor: { expr: 'sorprendido', pantalon: '#3A3F4A', torso: '#7A5A3A', manga: '#7A5A3A',
    brazoI: 'M-46,-250 q-60,0 -70,-70', brazoD: 'M46,-250 q50,40 70,80', manos: [[-116, -320], [116, -170]],
    detalle: `<path d="M-16,-266 l16,26 16,-26" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/>`, cabeza: FEDORA },
  vecino_olor: { expr: 'preocupado', pantalon: '#4A4F5A', torso: '#5E7A9A', manga: '#5E7A9A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q20,-40 -30,-90', manos: [[-80, -136], [16, -340]],
    detalle: `<path d="M-16,-266 l16,26 16,-26" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/>`, cabeza: PELO.replace('#3A2A22', '#7A5A3A') + `<path d="M30,70 q10,-30 -6,-50" fill="none" stroke="#5E7A9A" stroke-width="16" stroke-linecap="round"/><circle cx="6" cy="16" r="17" fill="${SKIN}" stroke="${INK}" stroke-width="5"/><path d="M-8,10 h16" stroke="${INK}" stroke-width="3"/>` },
  rescatador: { expr: 'preocupado', pantalon: '#3a3a3a', torso: '#2F3F5A', manga: '#2F3F5A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,60 34,112', manos: [[-80, -136], [80, -136]],
    detalle: `<path d="M-50,-200 h100" stroke="#C9A24A" stroke-width="5"/><circle cx="-24" cy="-230" r="6" fill="#C9A24A"/><circle cx="24" cy="-230" r="6" fill="#C9A24A"/>`,
    cabeza: `<g stroke="${INK}" stroke-width="5"><path d="M-66,-44 q66,-70 132,0 z" fill="#2F3F5A"/><rect x="-74" y="-50" width="148" height="12" rx="6" fill="#1f2a3a"/><rect x="-10" y="-90" width="20" height="16" fill="#C9A24A"/></g>` + BIGOTE('#3a2a22') },
});

// ---------- Short "La bala que no paró a Roosevelt" (Milwaukee, 1912) ----------
const QUEVEDOS = `<g fill="none" stroke="${INK}" stroke-width="4"><circle cx="-24" cy="-4" r="14"/><circle cx="24" cy="-4" r="14"/><path d="M-10,-6 q10,-6 20,0"/><path d="M38,-4 q20,10 18,40" stroke-width="2"/></g>`;
const BIGOTE_TR = `<path d="M-40,14 q20,-16 40,-4 q20,-12 40,4 q-10,16 -40,8 q-30,8 -40,-8z" fill="#7A5A3A" stroke="${INK}" stroke-width="3.5"/>`;
const PELO_TR = `<path d="M-68,-28 C-74,-82 -30,-100 4,-96 C40,-96 72,-76 68,-30 C54,-56 26,-62 0,-58 C-24,-64 -52,-54 -68,-28Z" fill="#7A5A3A" stroke="${INK}" stroke-width="5"/>`;
const REVOLVER = `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round"><rect x="-4" y="-16" width="70" height="14" rx="3" fill="#3a3a3e"/><rect x="-10" y="-26" width="34" height="30" rx="6" fill="#4a4a50"/><path d="M-10,0 l-14,40 h22 l8,-36z" fill="#5a3a22"/></g>`;
const PAPELES = `<g stroke="${INK}" stroke-width="4"><rect x="-30" y="-50" width="60" height="76" rx="3" fill="#F2EEE2"/><path d="M-20,-36 h40 M-20,-24 h34 M-20,-12 h40 M-20,0 h30" stroke="#888" stroke-width="3"/><circle cx="6" cy="-10" r="7" fill="#1a1a1a" stroke="none"/></g>`;
Object.assign(PRESETS, {
  roosevelt: { expr: 'eureka', pantalon: '#2B2B2B', torso: '#3A3F4A', manga: '#3A3F4A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,-10 60,-80', manos: [[-80, -136], [106, -330]],
    detalle: `<path d="M-16,-266 l16,26 16,-26" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M0,-240 l-8,10 8,40 8,-40z" fill="#2a2a2a"/><path d="M-40,-232 q-6,40 -2,80 M40,-232 q6,40 2,80" stroke="#2a2a30" stroke-width="5" fill="none"/>`,
    cabeza: PELO_TR + QUEVEDOS + BIGOTE_TR },
  tirador: { expr: 'neutral', pantalon: '#1e1e22', torso: '#2a2a30', manga: '#2a2a30',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q60,-10 96,-30', manos: [[-80, -136], [142, -280]],
    detalle: `<path d="M-16,-266 l16,26 16,-26" fill="#d8d0c0" stroke="${INK}" stroke-width="4"/>`,
    objeto: `<g transform="translate(142,-290)">${REVOLVER}</g>`, cabeza: BOMBIN + `<path d="M-70,-30 q70,30 140,0 l0,60 q-70,24 -140,0z" fill="rgba(0,0,0,.35)"/>` },
});
PRESETS.roosevelt_papeles = Object.assign({}, PRESETS.roosevelt, { expr: 'neutral', brazoD: 'M46,-250 q50,-10 60,-90', manos: [[-80, -136], [106, -340]], objeto: `<g transform="translate(106,-360)">${PAPELES}</g>` });
PRESETS.roosevelt_sorpresa = Object.assign({}, PRESETS.roosevelt, { expr: 'sorprendido', brazoD: 'M46,-250 q20,20 -10,40', manos: [[-80, -136], [10, -200]] });

// ---------- Short "La explosión de Halifax" (1917) ----------
const GORRO_MAR = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-70,-40 C-70,-110 70,-110 70,-40 z" fill="#2c3550"/><rect x="-74" y="-52" width="148" height="22" rx="8" fill="#384466"/><path d="M-60,-48 v14 M-40,-48 v14 M-20,-48 v14 M0,-48 v14 M20,-48 v14 M40,-48 v14 M60,-48 v14" stroke="#252c44" stroke-width="3"/></g><path d="M-30,56 q30,22 60,0" fill="none" stroke="#6a5040" stroke-width="5" stroke-dasharray="3 5"/>`;
Object.assign(PRESETS, {
  marinero: { expr: 'sorprendido', pantalon: '#1e2436', torso: '#1f2740', manga: '#1f2740',
    brazoI: 'M-46,-250 q-60,-20 -70,-100', brazoD: 'M46,-250 q60,-20 70,-100', manos: [[-116, -350], [116, -350]],
    detalle: `<path d="M-50,-262 l40,60 M50,-262 l-40,60" stroke="#141a2c" stroke-width="6"/><g fill="#C9A24A" stroke="${INK}" stroke-width="2"><circle cx="-18" cy="-200" r="6"/><circle cx="18" cy="-200" r="6"/><circle cx="-18" cy="-172" r="6"/><circle cx="18" cy="-172" r="6"/></g>`,
    cabeza: GORRO_MAR },
});
PRESETS.marinero_remando = Object.assign({}, PRESETS.marinero, { expr: 'preocupado', brazoI: 'M-46,-250 q40,40 80,40', brazoD: 'M46,-250 q30,40 40,40', manos: [[34, -210], [86, -210]] });


// ---------- Short "Los 70 barcos que cruzaron una montaña" (Constantinopla, 1453) ----------
const TURBANTE = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-30,-118 q30,-52 60,0z" fill="#B3262E"/><path d="M-84,-34 C-100,-130 100,-130 84,-34 q-84,22 -168,0z" fill="#F6F2E8"/><path d="M-80,-60 q80,-40 160,6 M-86,-42 q90,-36 170,10 M-70,-86 q70,-34 142,8" fill="none" stroke="#d8d0c0" stroke-width="5"/><path d="M-84,-34 q84,22 168,0" fill="none"/><g transform="translate(-6,-92)"><ellipse cx="0" cy="0" rx="10" ry="12" fill="#2E8B57"/><path d="M0,-10 q-6,-40 14,-62 q-2,30 -6,62z" fill="#F2EEE2" stroke-width="3"/></g></g>`;
const BARBA = c => `<path d="M-48,40 q48,22 96,0 q-6,34 -48,44 q-42,-10 -48,-44z" fill="${c}" stroke="${INK}" stroke-width="4"/><path d="M-30,14 q15,-12 30,-2 q15,-10 30,2 q-14,10 -30,4 q-16,6 -30,-4z" fill="${c}" stroke="${INK}" stroke-width="3"/>`;
const BORK = c => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M40,-96 q78,26 70,170 q-26,-60 -58,-120z" fill="${c}"/><path d="M-62,-40 q-10,-72 20,-118 q66,-30 82,36 q6,40 -6,82 q-48,10 -96,0z" fill="${c}"/><rect x="-74" y="-50" width="148" height="20" rx="8" fill="#C9A24A"/><path d="M-12,-50 l12,-46 12,46z" fill="#C9A24A"/></g>`;
const BIGOTE_J = `<path d="M-44,16 q22,-18 44,-4 q22,-14 44,4 q-6,22 -22,14 q-12,-6 -22,-4 q-10,-2 -22,4 q-16,8 -22,-14z" fill="#2a1d16" stroke="${INK}" stroke-width="3.5"/>`;
const CASCO_BIZ = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-76,-36 l-4,66 q14,12 28,2 l2,-60z M76,-36 l4,66 q-14,12 -28,2 l-2,-60z" fill="#7d8691"/><path d="M-76,-36 q76,-120 152,0z" fill="#A9B2BC"/><rect x="-80" y="-44" width="160" height="14" rx="6" fill="#8A6A3A"/><path d="M-4,-112 h8 v-14 h-8z" fill="#8A6A3A"/><path d="M-5,-36 h10 v36 h-10z" fill="#A9B2BC"/></g>`;
const CORONA_BIZ = `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round"><path d="M-66,-46 q66,-70 132,0z" fill="#E7C14B"/><rect x="-70" y="-52" width="140" height="18" rx="5" fill="#C99A2E"/><circle cx="0" cy="-74" r="9" fill="#B3262E"/><circle cx="-36" cy="-58" r="6" fill="#1f6fb2"/><circle cx="36" cy="-58" r="6" fill="#1f6fb2"/><path d="M-66,-36 v40 M66,-36 v40" stroke="#C99A2E" stroke-width="6"/></g>`;
const TUNICA = (c, borde) => `<path d="M-56,-170 l-10,128 q66,18 132,0 l-10,-128z" fill="${c}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M-62,-52 q62,16 124,0" fill="none" stroke="${borde}" stroke-width="8"/><path d="M-50,-160 h100" stroke="${borde}" stroke-width="12"/>`;
const LANZA = `<g stroke="${INK}" stroke-width="4"><path d="M0,60 V-300" stroke="#7a5a3a" stroke-width="8"/><path d="M-10,-298 l10,-40 10,40z" fill="#c8ccd2"/></g>`;
const CUERDA_MANO = `<path d="M-120,4 L120,-4" stroke="#C8A266" stroke-width="10" stroke-linecap="round"/>`;
Object.assign(PRESETS, {
  mehmed: { expr: 'eureka', pantalon: '#7a1620', torso: '#9C1F2A', manga: '#9C1F2A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,60 34,112', manos: [[-80, -136], [80, -136]],
    detalle: TUNICA('#9C1F2A', '#E7C14B') + `<path d="M0,-268 v226" stroke="#E7C14B" stroke-width="7"/><path d="M-54,-176 h108" stroke="#2E8B57" stroke-width="14"/>`,
    cabeza: TURBANTE + BARBA('#2a1d16') },
  jenizaro: { expr: 'neutral', pantalon: '#1f2f55', torso: '#2F4A7A', manga: '#2F4A7A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q20,50 30,100', manos: [[-80, -136], [76, -150]],
    detalle: TUNICA('#2F4A7A', '#C9A24A') + `<path d="M-54,-176 h108" stroke="#B3262E" stroke-width="14"/>`, objeto: `<g transform="translate(76,-150)">${LANZA}</g>`,
    cabeza: BORK('#F2EFE6') + BIGOTE_J },
  soldado_biz: { expr: 'sorprendido', pantalon: '#5a3a2a', torso: '#8E2A2A', manga: '#8a929c',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q60,-20 90,-90', manos: [[-80, -136], [136, -340]],
    detalle: `<path d="M-50,-262 h100 M-52,-236 h104 M-54,-210 h108" stroke="#8a929c" stroke-width="6" stroke-dasharray="6 4"/>` + TUNICA('#8E2A2A', '#E7C14B'),
    cabeza: CASCO_BIZ },
  constantino: { expr: 'preocupado', pantalon: '#3a1f48', torso: '#5B2A6E', manga: '#5B2A6E',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,60 34,112', manos: [[-80, -136], [80, -136]],
    detalle: TUNICA('#5B2A6E', '#E7C14B') + `<path d="M-40,-262 l80,110 M40,-262 l-80,110" stroke="#E7C14B" stroke-width="10"/>`,
    cabeza: CORONA_BIZ + BARBA('#6a4a2a') },
});
PRESETS.mehmed_senala = Object.assign({}, PRESETS.mehmed, { brazoD: 'M46,-250 q70,-10 120,-60', manos: [[-80, -136], [166, -310]] });
PRESETS.jenizaro_tira = Object.assign({}, PRESETS.jenizaro, { expr: 'preocupado', brazoI: 'M-46,-250 q50,10 100,30', brazoD: 'M46,-250 q50,10 100,30', manos: [[54, -220], [146, -220]], objeto: `<g transform="translate(100,-220)">${CUERDA_MANO}</g>` });
PRESETS.jenizaro_rojo = Object.assign({}, PRESETS.jenizaro, { torso: '#9C3A2A', manga: '#9C3A2A', detalle: TUNICA('#9C3A2A', '#C9A24A') + `<path d="M-54,-176 h108" stroke="#2F4A7A" stroke-width="14"/>`, expr: 'eureka' });
PRESETS.jenizaro_tira2 = Object.assign({}, PRESETS.jenizaro_tira, { torso: '#9C3A2A', manga: '#9C3A2A', detalle: TUNICA('#9C3A2A', '#C9A24A') + `<path d="M-54,-176 h108" stroke="#2F4A7A" stroke-width="14"/>` });
PRESETS.jenizaro_tronco = Object.assign({}, PRESETS.jenizaro, { expr: 'preocupado', brazoI: 'M-46,-250 q-40,-40 -30,-100', brazoD: 'M46,-250 q40,-40 30,-100', manos: [[-76, -350], [76, -350]], objeto: `<g stroke="${INK}" stroke-width="5"><rect x="-150" y="-388" width="300" height="40" rx="20" fill="#8a6440"/><ellipse cx="150" cy="-368" rx="12" ry="20" fill="#c9a46a"/></g>` });
PRESETS.soldado_biz2 = Object.assign({}, PRESETS.soldado_biz, { expr: 'preocupado', brazoD: 'M46,-250 q20,50 30,100', manos: [[-80, -136], [76, -150]], objeto: `<g transform="translate(76,-150)">${LANZA}</g>`, torso: '#2a5a8e', detalle: `<path d="M-50,-262 h100 M-52,-236 h104 M-54,-210 h108" stroke="#8a929c" stroke-width="6" stroke-dasharray="6 4"/>` + TUNICA('#2a5a8e', '#E7C14B') });
PRESETS.mehmed_serio = Object.assign({}, PRESETS.mehmed, { expr: 'neutral' });
PRESETS.buey = { svg: `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
  <ellipse cx="0" cy="2" rx="150" ry="12" fill="#000" opacity=".12" stroke="none"/>
  <path d="M-110,-110 v108 M-70,-100 v100 M60,-100 v100 M100,-110 v108" stroke="${INK}" stroke-width="26"/>
  <path d="M-110,-110 v108 M-70,-100 v100 M60,-100 v100 M100,-110 v108" stroke="#8a6a4a" stroke-width="16"/>
  <path d="M-150,-150 q-30,40 -20,70" fill="none" stroke-width="8"/>
  <ellipse cx="-10" cy="-150" rx="150" ry="74" fill="#A9845C"/>
  <path d="M-60,-210 q40,40 20,110" fill="none" stroke="#8a6a4a" stroke-width="8"/>
  <path d="M110,-170 q40,-6 60,10 q30,30 10,70 q-30,26 -66,4 q-24,-30 -4,-84z" fill="#B8936A"/>
  <path d="M120,-176 q-30,-50 6,-70 M168,-168 q40,-40 14,-76" fill="none" stroke="#F2EEE2" stroke-width="12"/>
  <path d="M120,-176 q-30,-50 6,-70 M168,-168 q40,-40 14,-76" fill="none" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="170" cy="-110" rx="26" ry="18" fill="#E8C8A8"/><circle cx="162" cy="-112" r="4" fill="${INK}"/><circle cx="180" cy="-108" r="4" fill="${INK}"/>
  <ellipse cx="128" cy="-150" rx="9" ry="11" fill="#fff"/><circle cx="131" cy="-149" r="5" fill="${INK}"/>
  <path d="M92,-200 q30,-10 40,20" fill="#8a6a4a"/>
  <rect x="70" y="-232" width="30" height="96" rx="8" fill="#6a4a2a"/>
</g>` };

// ---------- Short "El metal que se derrite en tu mano" (galio) ----------
PRESETS.toni_manos = Object.assign({}, PRESETS.toni, { expr: 'sorprendido', brazoI: 'M-46,-250 q10,50 34,56', brazoD: 'M46,-250 q-10,50 -34,56', manos: [[-14, -194], [14, -194]], objeto: '' });
PRESETS.toni_barra = Object.assign({}, PRESETS.toni, { expr: 'eureka', brazoI: 'M-46,-250 q-34,30 -50,24', brazoD: 'M46,-250 q34,30 50,24', manos: [[-96, -226], [96, -226]], objeto: '' });
PRESETS.toni_piensa = Object.assign({}, PRESETS.toni, { expr: 'eureka', brazoD: 'M46,-250 q50,0 30,-90', manos: [[-90, -136], [76, -340]], objeto: '' });
const PELO_MENDE = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-74,-6 C-110,-60 -96,-120 -40,-112 C-20,-140 30,-140 46,-112 C100,-120 112,-60 76,-6 C70,-50 50,-70 30,-74 C10,-60 -14,-60 -30,-74 C-50,-70 -70,-50 -74,-6Z" fill="#c9c4bc"/></g>`;
const BARBAZA = `<path d="M-62,20 q62,30 124,0 q10,60 -20,120 q-20,40 -42,64 q-22,-24 -42,-64 q-30,-60 -20,-120z" fill="#bdb6ac" stroke="${INK}" stroke-width="5"/><path d="M-34,16 q17,-12 34,-2 q17,-10 34,2 q-16,12 -34,4 q-18,8 -34,-4z" fill="#a8a096" stroke="${INK}" stroke-width="3"/>`;
const PELO_LECOQ = `<path d="M-68,-28 C-74,-82 -30,-100 4,-96 C40,-96 72,-76 68,-30 C40,-60 -10,-70 -30,-48 C-46,-60 -60,-50 -68,-28Z" fill="#3a2a1e" stroke="${INK}" stroke-width="5"/>`;
const CARTA = `<g stroke="${INK}" stroke-width="4"><rect x="-34" y="-46" width="68" height="84" rx="3" fill="#F7F1E1"/><path d="M-24,-30 h48 M-24,-18 h40 M-24,-6 h48 M-24,6 h30 M-24,18 h44" stroke="#5a6a8a" stroke-width="3"/></g>`;
Object.assign(PRESETS, {
  mendeleiev: { expr: 'eureka', pantalon: '#2a2a30', torso: '#3a3530', manga: '#3a3530',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q60,-20 90,-90', manos: [[-80, -136], [136, -340]],
    detalle: `<path d="M-50,-268 l50,80 50,-80" fill="none" stroke="#22201c" stroke-width="8"/><path d="M-60,-160 l-8,110 q68,16 136,0 l-8,-110z" fill="#3a3530" stroke="${INK}" stroke-width="6"/>`,
    cabeza: PELO_MENDE + BARBAZA },
  lecoq: { expr: 'sorprendido', pantalon: '#2a2a34', torso: '#2f3346', manga: '#2f3346',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,10 50,-50', manos: [[-80, -136], [96, -300]],
    detalle: `<path d="M-16,-266 l16,26 16,-26" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M-10,-246 l10,8 10,-8 -10,-8z" fill="#8E2A2A"/>`,
    objeto: `<g transform="translate(96,-330)">${CARTA}</g>`, cabeza: PELO_LECOQ + BIGOTE('#3a2a1e') },
});
PRESETS.mendeleiev_serio = Object.assign({}, PRESETS.mendeleiev, { expr: 'neutral', brazoD: 'M46,-250 q30,60 34,112', manos: [[-80, -136], [80, -136]] });
PRESETS.lecoq_mira = Object.assign({}, PRESETS.lecoq, { expr: 'neutral', brazoD: 'M46,-250 q30,60 34,112', manos: [[-80, -136], [80, -136]], objeto: '' });

// ---------- Short "Si alguien se atraganta" (formato guía práctica) ----------
const MELENA = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-72,10 C-84,-70 -44,-104 4,-100 C50,-100 84,-66 74,10 C78,50 70,80 60,96 L40,96 C58,40 64,-20 44,-56 C14,-46 -26,-48 -58,-40 C-64,10 -60,70 -44,96 L-64,96 C-80,70 -80,40 -72,10Z" fill="#7a3f22"/></g>`;
const VESTIDO = c => `<path d="M-52,-170 l-30,140 q82,22 164,0 l-30,-140z" fill="${c}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M-36,-150 q36,10 72,0" fill="none" stroke="#ffffff" stroke-width="5" opacity=".6"/>`;
Object.assign(PRESETS, {
  amiga: { expr: 'eureka', pantalon: '#F2C14E', torso: '#F2C14E', manga: '#F2C14E',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,60 34,112', manos: [[-80, -136], [80, -136]],
    detalle: VESTIDO('#F2C14E'), cabeza: MELENA },
});
PRESETS.amiga_tose = Object.assign({}, PRESETS.amiga, { expr: 'preocupado', brazoD: 'M46,-250 q40,-10 10,-40', manos: [[-80, -136]], cabeza: PRESETS.amiga.cabeza + `<circle cx="6" cy="34" r="18" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>` });
PRESETS.amiga_ahoga = Object.assign({}, PRESETS.amiga, { expr: 'sorprendido', brazoI: 'M-46,-250 q-6,-20 22,-14', brazoD: 'M46,-250 q6,-20 -22,-14', manos: [[-24, -262], [24, -262]] });
PRESETS.amiga_feliz = Object.assign({}, PRESETS.amiga, { expr: 'eureka', brazoI: 'M-46,-250 q-60,-20 -70,-100', brazoD: 'M46,-250 q60,-20 70,-100', manos: [[-116, -350], [116, -350]] });
PRESETS.amiga_sola = Object.assign({}, PRESETS.amiga, { expr: 'preocupado', brazoI: 'M-46,-250 q20,50 40,40', brazoD: 'M46,-250 q-20,50 -40,40', manos: [[-6, -212], [6, -212]] });
PRESETS.toni_golpe = Object.assign({}, PRESETS.toni, { expr: 'preocupado', brazoD: 'M46,-250 q60,-30 70,-110', manos: [[-90, -136], [116, -360]], objeto: '' });
PRESETS.toni_anima = Object.assign({}, PRESETS.toni, { expr: 'sorprendido', brazoI: 'M-46,-250 q-50,-10 -66,-70', brazoD: 'M46,-250 q50,-10 66,-70', manos: [[-112, -320], [112, -320]], objeto: '' });
PRESETS.toni_movil = Object.assign({}, PRESETS.toni, { expr: 'preocupado', brazoD: 'M46,-250 q40,-40 10,-110', manos: [[-90, -136], [56, -360]], objeto: `<g transform="translate(64,-380) rotate(15)"><rect x="-14" y="-32" width="28" height="56" rx="6" fill="#222" stroke="${INK}" stroke-width="4"/><rect x="-9" y="-24" width="18" height="36" fill="#6fb8ff"/></g>` });
PRESETS.toni_feliz = Object.assign({}, PRESETS.toni, { expr: 'eureka', objeto: '' });
// maniobra de compresiones: Toni detrás abrazando a la amiga, puño encima del ombligo
PRESETS.heimlich = { svg: personaje(62, -4, 1, Object.assign({}, PRESETS.toni, { expr: 'preocupado', brazoI: 'M-46,-250 q0,0 0,0', brazoD: 'M46,-250 q0,0 0,0', manos: [], objeto: '' }))
  + personaje(-6, 0, 1, Object.assign({}, PRESETS.amiga, { expr: 'sorprendido', brazoI: 'M-46,-250 q-30,40 -50,60', brazoD: 'M46,-250 q30,40 50,60', manos: [[-96, -190], [96, -190]] }))
  + `<path d="M-40,-236 q20,40 40,46 M150,-236 q-60,40 -144,46" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/><path d="M-40,-236 q20,40 40,46 M150,-236 q-60,40 -144,46" fill="none" stroke="#FAFAF7" stroke-width="15" stroke-linecap="round"/><circle cx="0" cy="-192" r="20" fill="${SKIN}" stroke="${INK}" stroke-width="6"/><circle cx="12" cy="-186" r="16" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>` };

// ---------- Reanimación dibujada de verdad: ella tumbada boca arriba y Toni DE RODILLAS con las manos en su pecho ----------
const PIERNAS_RODILLAS = (c) => `<path d="M-16,-150 q-10,70 -6,120 q50,14 110,14" fill="none" stroke="${INK}" stroke-width="27" stroke-linecap="round" stroke-linejoin="round"/><path d="M-16,-150 q-10,70 -6,120 q50,14 110,14" fill="none" stroke="${c}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><path d="M16,-150 q4,70 10,120 q40,12 96,12" fill="none" stroke="${INK}" stroke-width="27" stroke-linecap="round" stroke-linejoin="round"/><path d="M16,-150 q4,70 10,120 q40,12 96,12" fill="none" stroke="${c}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="112" cy="-14" rx="12" ry="20" fill="#2B2B2B" stroke="${INK}" stroke-width="5"/><ellipse cx="128" cy="-18" rx="12" ry="20" fill="#2B2B2B" stroke="${INK}" stroke-width="5"/>`;
const rcp = (baja) => {
  const dy = baja ? 7 : 0;
  // Toni de rodillas detrás de ella (las rodillas quedan tapadas por su cuerpo, como en la realidad vista de frente); brazos de fideo rectos hasta el pecho
  const toni = personaje(40, -10 + dy, .62, Object.assign({}, PRESETS.toni, { expr: 'preocupado', piernas: PIERNAS_RODILLAS('#3C4A63'), brazoI: 'M-46,-250 q8,100 46,185', brazoD: 'M46,-250 q-8,100 -36,185', manos: [], objeto: '' }));
  // ella tumbada boca arriba con los ojos cerrados (dibujo girado 90º)
  const ella = `<g transform="translate(176,-50) rotate(-90)">${personaje(0, 0, .58, Object.assign({}, PRESETS.amiga, { expr: 'eureka', brazoI: 'M-46,-250 q-40,40 -44,100', brazoD: 'M46,-250 q40,40 44,100', manos: [[-90, -150], [90, -150]] }))}</g>`;
  const manos = `<g transform="translate(43,${-52 + dy})"><circle cx="-5" cy="0" r="11" fill="${SKIN}" stroke="${INK}" stroke-width="4"/><circle cx="5" cy="-4" r="11" fill="${SKIN}" stroke="${INK}" stroke-width="4"/></g>`;
  return toni + ella + manos;
};
PRESETS.rcp_arriba = { svg: rcp(false) };
PRESETS.rcp_abajo = { svg: rcp(true) };

// ---------- Short "El elefante y la cuerda" (fábula) — todo dibujado, de perfil ----------
function elefante({ esc = 1, x = 0, inclina = 0, tumbado = false, esfuerzo = false, triste = false, cuerda = 'floja', estaca = 'clavada' } = {}) {
  const G = '#9aa3ad', G2 = '#7f8893', P = (d, w, c) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  let g = `<g transform="translate(${x},0) scale(${esc}) rotate(${inclina} 0 0)" stroke-linejoin="round">`;
  g += `<ellipse cx="0" cy="4" rx="170" ry="14" fill="#000" opacity=".15"/>`;
  if (!tumbado) {
    for (const [lx, c] of [[-100, G2], [80, G2]]) g += `<rect x="${lx}" y="-130" width="40" height="130" rx="16" fill="${c}" stroke="${INK}" stroke-width="6"/>`;
    g += `<ellipse cx="-10" cy="-175" rx="155" ry="102" fill="${G}" stroke="${INK}" stroke-width="7"/>`;
    for (const [lx, c] of [[-130, G], [110, G]]) g += `<rect x="${lx}" y="-130" width="44" height="132" rx="16" fill="${c}" stroke="${INK}" stroke-width="6"/>`;
  } else {
    g += `<ellipse cx="-10" cy="-70" rx="160" ry="72" fill="${G}" stroke="${INK}" stroke-width="7"/>`;
    for (const lx of [-110, -40, 50]) g += `<ellipse cx="${lx}" cy="-8" rx="34" ry="16" fill="${G2}" stroke="${INK}" stroke-width="6"/>`;
  }
  const hy = tumbado ? -70 : -205;
  g += P(`M-160,${hy + 10} q-20,30 -14,70`, 6, G2);
  g += `<circle cx="125" cy="${hy}" r="72" fill="${G}" stroke="${INK}" stroke-width="7"/>`;
  g += P(tumbado ? `M178,${hy + 20} q40,30 20,60 q-10,10 -30,6` : `M178,${hy + 20} q30,60 10,140 q-4,16 -20,14`, 26, G);
  g += `<path d="M160,${hy + 36} q22,10 30,-8" fill="#F2EEE2" stroke="${INK}" stroke-width="4"/>`;
  g += `<ellipse cx="86" cy="${hy + 4}" rx="48" ry="64" fill="${G2}" stroke="${INK}" stroke-width="6"/><ellipse cx="90" cy="${hy + 6}" rx="30" ry="44" fill="#d9a3a8" opacity=".6"/>`;
  if (esfuerzo) g += `<path d="M132,${hy - 18} l14,8 -14,8 M150,${hy - 20} l-6,2" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M168,${hy - 50} q6,-14 0,-24 M182,${hy - 40} q8,-12 4,-22" fill="none" stroke="#6fc3ff" stroke-width="6" stroke-linecap="round"/>`;
  else if (triste) g += `<ellipse cx="146" cy="${hy - 6}" rx="7" ry="9" fill="${INK}"/><path d="M132,${hy - 28} l26,10" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M150,${hy + 8} q2,10 -2,18" stroke="#6fc3ff" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  else g += `<ellipse cx="146" cy="${hy - 8}" rx="8" ry="11" fill="${INK}"/><circle cx="149" cy="${hy - 12}" r="3" fill="#fff"/><path d="M134,${hy - 30} q12,-6 24,0" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  g += `<ellipse cx="160" cy="${hy + 16}" rx="10" ry="6" fill="${BLUSH}" opacity=".6"/>`;
  g += '</g>';
  // cuerda y estaca (en coordenadas del sprite, sin girar)
  const pie = [x - 110 * esc, -12 * esc];
  let est = `<rect x="-192" y="-42" width="13" height="46" rx="3" fill="#7a5634" stroke="${INK}" stroke-width="4"/>`, sx = -186, sy = -34;
  if (estaca === 'volando') { est = `<g transform="translate(-150,-150) rotate(-40)"><rect x="-6" y="-23" width="13" height="46" rx="3" fill="#7a5634" stroke="${INK}" stroke-width="4"/></g>` + [...Array(7)].map((_, i) => `<circle cx="${-190 + i * 9}" cy="${-8 - (i % 3) * 14}" r="${5 + (i % 2) * 3}" fill="#6a4a30"/>`).join('') + `<path d="M-200,2 q14,-12 28,0z" fill="#3a2a1e"/>`; sx = -150; sy = -150; }
  const cu = cuerda === 'tensa' ? `M${pie[0]},${pie[1]} L${sx},${sy}` : `M${pie[0]},${pie[1]} q${(sx - pie[0]) / 2},${30} ${sx - pie[0]},${sy - pie[1]}`;
  return g + `<path d="${cu}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="${cu}" fill="none" stroke="#d8b478" stroke-width="3.5" stroke-linecap="round"/>` + est;
}
PRESETS.ele_grande = { svg: elefante({ esc: .82, x: -8 }) };
PRESETS.ele_grande_tira = { svg: elefante({ esc: .82, x: 4, inclina: 7, esfuerzo: true, cuerda: 'tensa', estaca: 'volando' }) };
PRESETS.ele_bebe_tira = { svg: elefante({ esc: .62, x: 40, inclina: 9, esfuerzo: true, cuerda: 'tensa' }) };
PRESETS.ele_bebe_triste = { svg: elefante({ esc: .62, x: 30, tumbado: true, triste: true }) };
const ESTACA_TONI = (estado) => estado === 'volando' ? `<path d="M-36,-6 L-150,-130" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M-36,-6 L-150,-130" fill="none" stroke="#d8b478" stroke-width="3.5"/><g transform="translate(-150,-130) rotate(-40)"><rect x="-6" y="-23" width="13" height="46" rx="3" fill="#7a5634" stroke="${INK}" stroke-width="4"/></g><path d="M-190,2 q14,-12 28,0z" fill="#3a2a1e"/>` : `<path d="M-36,-6 q-60,22 -134,-14" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M-36,-6 q-60,22 -134,-14" fill="none" stroke="#d8b478" stroke-width="3.5"/><rect x="-182" y="-42" width="13" height="46" rx="3" fill="#7a5634" stroke="${INK}" stroke-width="4"/><circle cx="-40" cy="-8" r="9" fill="none" stroke="#d8b478" stroke-width="5"/>`;
PRESETS.toni_estaca = Object.assign({}, PRESETS.toni, { expr: 'preocupado', objeto: ESTACA_TONI('clavada'), brazoD: 'M46,-250 q30,60 34,112', manos: [[-90, -136], [80, -136]] });
PRESETS.toni_tira = Object.assign({}, PRESETS.toni, { expr: 'eureka', objeto: ESTACA_TONI('volando'), brazoI: 'M-46,-250 q-60,-20 -70,-100', brazoD: 'M46,-250 q60,-20 70,-100', manos: [[-116, -350], [116, -350]] });
PRESETS.toni_examen = Object.assign({}, PRESETS.toni, { expr: 'preocupado', brazoD: 'M46,-250 q40,10 40,-50', manos: [[-90, -136], [86, -300]], objeto: `<g transform="translate(86,-330)"><rect x="-34" y="-44" width="68" height="84" rx="3" fill="#F7F1E1" stroke="${INK}" stroke-width="4"/><path d="M-24,-30 h40 M-24,-20 h34 M-24,-10 h40" stroke="#8a9aaa" stroke-width="3"/><circle cx="4" cy="16" r="18" fill="none" stroke="#E8322A" stroke-width="5"/><text x="4" y="25" font-size="26" font-weight="900" text-anchor="middle" fill="#E8322A" stroke="none" font-family="DejaVu Sans">2</text></g>` });
PRESETS.toni_mira = Object.assign({}, PRESETS.toni, { expr: 'neutral', objeto: '', brazoD: 'M46,-250 q30,60 34,112', manos: [[-90, -136], [80, -136]] });
PRESETS.toni_nino = Object.assign({}, PRESETS.toni, { expr: 'preocupado', objeto: '', brazoD: 'M46,-250 q30,60 34,112', manos: [[-90, -136], [80, -136]], torso: '#E9C46A', manga: '#E9C46A', detalle: '' });
PRESETS.adulto_senala = Object.assign({}, PRESETS.directivo, { expr: 'preocupado', brazoD: 'M46,-250 q60,0 100,20', manos: [[-80, -136], [146, -230]] });

// ---------- Short "Las ratas sin cola" (Hanói, 1902) ----------
function rata({ cola = true, esc = 1, bebe = false, susto = false } = {}) {
  const c = bebe ? '#e8a8a8' : '#8a7a70', c2 = bebe ? '#f2c0c0' : '#a89888';
  let g = `<g transform="translate(-20,0) scale(${esc})" stroke="${INK}" stroke-linejoin="round" stroke-linecap="round">`;
  g += `<ellipse cx="0" cy="2" rx="110" ry="9" fill="#000" opacity=".15" stroke="none"/>`;
  if (cola) g += `<path d="M-80,-40 q-60,10 -80,-30 q-14,-30 -40,-20" fill="none" stroke="${INK}" stroke-width="13"/><path d="M-80,-40 q-60,10 -80,-30 q-14,-30 -40,-20" fill="none" stroke="#e8a0a0" stroke-width="7"/>`;
  else g += `<path d="M-84,-42 l-14,-4" stroke="${INK}" stroke-width="13"/><path d="M-84,-42 l-14,-4" stroke="#e8a0a0" stroke-width="7"/><path d="M-100,-52 l-10,-8 M-104,-40 l-12,0" stroke="#E8322A" stroke-width="4"/>`;
  for (const x of [-50, 40]) g += `<path d="M${x},-20 l-6,20 M${x + 18},-20 l6,20" stroke="${INK}" stroke-width="12"/><path d="M${x},-20 l-6,20 M${x + 18},-20 l6,20" stroke="#e8a0a0" stroke-width="6"/>`;
  g += `<path d="M-90,-40 C-90,-100 20,-110 60,-70 C90,-60 120,-46 110,-26 C100,-14 60,-12 40,-14 L-60,-14 C-84,-14 -90,-24 -90,-40Z" fill="${c}" stroke-width="6"/>`;
  g += `<ellipse cx="30" cy="-86" rx="22" ry="26" fill="${c2}" stroke-width="5"/><ellipse cx="30" cy="-84" rx="12" ry="15" fill="#e8a0a0" stroke="none"/>`;
  g += `<circle cx="112" cy="-30" r="8" fill="#e86a7a" stroke-width="3"/>`;
  g += susto ? `<ellipse cx="72" cy="-58" rx="9" ry="11" fill="#fff" stroke-width="3"/><circle cx="74" cy="-57" r="4" fill="${INK}" stroke="none"/>` : `<ellipse cx="74" cy="-58" rx="6" ry="8" fill="${INK}" stroke="none"/><circle cx="76" cy="-61" r="2.2" fill="#fff" stroke="none"/>`;
  g += `<path d="M104,-36 l34,-10 M104,-30 l36,0 M104,-24 l32,8" stroke="${INK}" stroke-width="2.5"/>`;
  return g + '</g>';
}
PRESETS.rata = { svg: rata() };
PRESETS.rata_sin_cola = { svg: rata({ cola: false }) };
PRESETS.rata_bebe = { svg: rata({ bebe: true, esc: .55 }) };
PRESETS.rata_susto = { svg: rata({ susto: true }) };
const NON_LA = c => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-128,-26 L0,-150 L128,-26 Q0,-6 -128,-26Z" fill="${c}"/><path d="M-90,-42 L0,-128 M90,-42 L0,-128 M-40,-24 L0,-128 M40,-24 L0,-128" stroke="#b89a58" stroke-width="3" fill="none"/><path d="M-60,-24 q-10,60 0,110 M60,-24 q10,60 0,110" stroke="#6a5030" stroke-width="2" fill="none" opacity=".5"/></g>`;
const QUEPIS = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-58,-44 L-52,-126 L52,-126 L58,-44 Z" fill="#2a3a6a"/><rect x="-60" y="-62" width="120" height="18" fill="#c99a2e"/><path d="M-52,-126 L52,-126" stroke="#c99a2e" stroke-width="6"/><path d="M-66,-44 q66,-14 132,0 q-10,22 -66,24 q-56,-2 -66,-24z" fill="#111"/></g>`;
const SALACOT = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-104,-34 q104,-36 208,0 q-104,22 -208,0z" fill="#efe8d4"/><path d="M-66,-44 q0,-80 66,-82 q66,2 66,82 q-66,16 -132,0z" fill="#f4eedc"/><path d="M-66,-50 q66,14 132,0" stroke="#8a6a3a" stroke-width="8" fill="none"/></g>`;
const BIGOTE_FR = `<path d="M-46,16 q22,-16 46,-4 q24,-12 46,4 q10,6 18,-6 q-4,22 -26,16 q-20,-2 -38,-6 q-18,4 -38,6 q-22,6 -26,-16 q8,12 18,6z" fill="#5a3a22" stroke="${INK}" stroke-width="3.5"/>`;
const FAROL = `<g stroke="${INK}" stroke-width="4"><path d="M0,-40 v-20" /><rect x="-16" y="-40" width="32" height="44" rx="5" fill="#ffe08a"/><path d="M-16,-40 h32 M-16,4 h32" stroke-width="7"/></g>`;
const COLA_MANO = `<path d="M0,0 q30,40 10,90 q-10,30 16,50" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M0,0 q30,40 10,90 q-10,30 16,50" fill="none" stroke="#e8a0a0" stroke-width="6" stroke-linecap="round"/>`;
const TIJERAS = `<g stroke="${INK}" stroke-width="4"><path d="M0,0 l46,-22 M0,0 l46,22" stroke="#c8ccd2" stroke-width="9"/><circle cx="-10" cy="-10" r="10" fill="none" stroke="#E8322A" stroke-width="6"/><circle cx="-10" cy="10" r="10" fill="none" stroke="#E8322A" stroke-width="6"/></g>`;
Object.assign(PRESETS, {
  funcionario: { expr: 'preocupado', pantalon: '#efe9dc', torso: '#f6f1e6', manga: '#f6f1e6',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q60,-30 70,-110', manos: [[-80, -136], [116, -360]],
    detalle: `<g fill="#c99a2e" stroke="${INK}" stroke-width="2"><circle cx="0" cy="-236" r="5"/><circle cx="0" cy="-210" r="5"/><circle cx="0" cy="-184" r="5"/></g><path d="M-50,-262 h100" stroke="#c99a2e" stroke-width="5"/>`,
    cabeza: QUEPIS + BIGOTE_FR },
  inspector: { expr: 'sorprendido', pantalon: '#c8b48a', torso: '#d8c49a', manga: '#d8c49a',
    brazoI: 'M-46,-250 q-60,-10 -70,-80', brazoD: 'M46,-250 q60,-10 70,-80', manos: [[-116, -330], [116, -330]],
    detalle: `<path d="M-30,-250 v40 M30,-250 v40" stroke="#a8946a" stroke-width="6"/>`, cabeza: SALACOT + BIGOTE('#6a4a2a') },
  cazador: { expr: 'eureka', pantalon: '#2a3448', torso: '#3a4a6a', manga: '#3a4a6a',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q50,-10 60,-70', manos: [[-80, -136], [106, -320]],
    objeto: `<g transform="translate(106,-320)">${FAROL}</g>`, cabeza: NON_LA('#e6cf8a') },
});
PRESETS.cazador_cola = Object.assign({}, PRESETS.cazador, { objeto: `<g transform="translate(106,-330)">${COLA_MANO}</g>`, brazoD: 'M46,-250 q50,-10 60,-80' });
PRESETS.vecina_cola = Object.assign({}, PRESETS.cazador, { torso: '#5a8ac8', manga: '#5a8ac8', pantalon: '#2a2a34', expr: 'eureka', detalle: `<path d="M-50,-170 l-8,120 q58,16 116,0 l-8,-120z" fill="#5a8ac8" stroke="${INK}" stroke-width="6"/>`, objeto: `<g transform="translate(106,-330)">${COLA_MANO}</g>`, brazoD: 'M46,-250 q50,-10 60,-80', cabeza: NON_LA('#ecd89a') });
PRESETS.cazador_tijeras = Object.assign({}, PRESETS.cazador, { expr: 'eureka', brazoD: 'M46,-250 q60,10 80,-20', manos: [[-80, -136], [126, -270]], objeto: `<g transform="translate(126,-270)">${TIJERAS}</g>` });
PRESETS.granjero = Object.assign({}, PRESETS.cazador, { expr: 'eureka', torso: '#6a5a3a', manga: '#6a5a3a', brazoD: 'M46,-250 q30,60 34,112', manos: [[-80, -136], [80, -136]], objeto: '', cabeza: NON_LA('#d8c07a') });
PRESETS.funcionario_nariz = Object.assign({}, PRESETS.funcionario, { brazoD: 'M46,-250 q40,-20 10,-40', manos: [[-80, -136]], cabeza: QUEPIS + `<circle cx="6" cy="10" r="18" fill="${SKIN}" stroke="${INK}" stroke-width="6"/>` + BIGOTE_FR });
PRESETS.cobra = { svg: `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="0" cy="2" rx="110" ry="10" fill="#000" opacity=".15" stroke="none"/><path d="M-100,-10 q60,-30 120,-6 q60,20 40,-40" fill="none" stroke="${INK}" stroke-width="40"/><path d="M-100,-10 q60,-30 120,-6 q60,20 40,-40" fill="none" stroke="#7aa63a" stroke-width="30"/><path d="M60,-56 q-20,-80 0,-150" fill="none" stroke="${INK}" stroke-width="44"/><path d="M60,-56 q-20,-80 0,-150" fill="none" stroke="#7aa63a" stroke-width="34"/><path d="M0,-200 q-60,-10 -60,-80 q20,-60 60,-60 q40,0 60,60 q0,70 -60,80z" fill="#8ab84a"/><path d="M0,-210 q-30,-10 -34,-60 q14,-30 34,-30 q20,0 34,30 q-4,50 -34,60z" fill="#e8d08a"/><ellipse cx="0" cy="-300" rx="40" ry="34" fill="#8ab84a"/><ellipse cx="-16" cy="-306" rx="8" ry="10" fill="#fff"/><circle cx="-14" cy="-305" r="5" fill="${INK}" stroke="none"/><ellipse cx="16" cy="-306" rx="8" ry="10" fill="#fff"/><circle cx="18" cy="-305" r="5" fill="${INK}" stroke="none"/><path d="M0,-270 v20 l-8,10 M0,-250 l8,10" stroke="#E8322A" stroke-width="4" fill="none"/></g>` };

// ---------- Short "El efecto Streisand" (2003) ----------
const CAMARA_FOTO = `<g stroke="${INK}" stroke-width="4" stroke-linejoin="round"><rect x="-34" y="-24" width="68" height="46" rx="6" fill="#2a2a30"/><rect x="-14" y="-32" width="24" height="10" rx="2" fill="#2a2a30"/><circle cx="0" cy="0" r="17" fill="#4a5a7a"/><circle cx="0" cy="0" r="9" fill="#9ac8ff"/><circle cx="24" cy="-14" r="4" fill="#ffd93b"/></g>`;
const CASCOS = `<g stroke="${INK}" stroke-width="5"><path d="M-74,-6 q0,-110 74,-110 q74,0 74,110" fill="none" stroke="#2a2a30" stroke-width="12"/><rect x="-86" y="-16" width="22" height="40" rx="8" fill="#2a2a30"/><rect x="64" y="-16" width="22" height="40" rx="8" fill="#2a2a30"/><path d="M-76,20 q20,30 50,22" fill="none" stroke="#2a2a30" stroke-width="5"/><circle cx="-24" cy="42" r="6" fill="#2a2a30"/></g>`;
const MELENA_RIZOS = `<g stroke="${INK}" stroke-width="4">${[...Array(16)].map((_, i) => { const a = Math.PI * (1.05 + i / 15 * .9); return `<circle cx="${Math.cos(a) * 82}" cy="${Math.sin(a) * 82 - 6}" r="28" fill="#c8843a"/>`; }).join('')}${[-1, 1].map(s => [0, 1, 2].map(k => `<circle cx="${s * (78 - k * 4)}" cy="${20 + k * 30}" r="24" fill="#c8843a"/>`).join('')).join('')}</g>`;
const GAFAS_SOL = `<g stroke="${INK}" stroke-width="4"><rect x="-50" y="-22" width="40" height="28" rx="10" fill="#1a1a2a"/><rect x="10" y="-22" width="40" height="28" rx="10" fill="#1a1a2a"/><path d="M-10,-10 h20"/><path d="M-44,-16 l10,-4" stroke="#ffffff" stroke-width="3" opacity=".6"/></g>`;
const MALETIN = `<g stroke="${INK}" stroke-width="4"><rect x="-34" y="-24" width="68" height="48" rx="6" fill="#5a3420"/><path d="M-12,-24 v-10 h24 v10" fill="none" stroke-width="6"/><rect x="-6" y="-6" width="12" height="8" fill="#c99a2e"/></g>`;
const MAZO = `<g stroke="${INK}" stroke-width="4" transform="rotate(-30)"><rect x="-6" y="-10" width="12" height="70" rx="4" fill="#7a4a2a"/><rect x="-30" y="-34" width="60" height="28" rx="8" fill="#6a3a1e"/></g>`;
const PERIODICO = `<g stroke="${INK}" stroke-width="4"><rect x="-70" y="-56" width="140" height="96" fill="#f2efe6"/><rect x="-62" y="-48" width="124" height="18" fill="#1a1a1a"/><path d="M-62,-20 h56 M-62,-10 h56 M-62,0 h56 M-62,10 h56 M-62,20 h40" stroke="#888" stroke-width="3"/><rect x="4" y="-22" width="56" height="44" fill="#9ab8d8"/></g>`;
Object.assign(PRESETS, {
  fotografo: { expr: 'eureka', pantalon: '#4a5a3a', torso: '#d8c49a', manga: '#d8c49a',
    brazoI: 'M-46,-250 q40,-30 30,-70', brazoD: 'M46,-250 q-30,-30 -16,-76', manos: [[-16, -320], [30, -326]],
    detalle: `<path d="M-50,-262 l40,40 M50,-262 l-40,40" stroke="#b8a47a" stroke-width="6"/><rect x="-40" y="-200" width="24" height="20" fill="#b8a47a" stroke="${INK}" stroke-width="3"/>`,
    objeto: '', cabeza: PELO.replace('#3A2A22', '#8a6a3a') + CASCOS + `<g transform="translate(30,-6) scale(1.3)">${CAMARA_FOTO}</g><circle cx="-8" cy="18" r="17" fill="${SKIN}" stroke="${INK}" stroke-width="5"/><circle cx="70" cy="20" r="17" fill="${SKIN}" stroke="${INK}" stroke-width="5"/>` },
  cantante: { expr: 'preocupado', pantalon: '#6a2a7a', torso: '#7a3a8a', manga: '#7a3a8a',
    brazoI: 'M-46,-250 q-30,40 -60,40', brazoD: 'M46,-250 q50,-10 60,-80', manos: [[-106, -210], [106, -330]],
    detalle: `<path d="M-56,-170 l-30,140 q86,22 172,0 l-30,-140z" fill="#7a3a8a" stroke="${INK}" stroke-width="6"/><g fill="#ffe08a" stroke="none">${[...Array(12)].map((_, i) => `<circle cx="${-60 + (i % 6) * 24}" cy="${-140 + Math.floor(i / 6) * 60}" r="4"/>`).join('')}</g><path d="M-30,-262 q30,30 60,0" fill="none" stroke="#f2f2f2" stroke-width="8"/>`,
    cabeza: MELENA_RIZOS + GAFAS_SOL },
  abogado: { expr: 'preocupado', pantalon: '#1e1e26', torso: '#2a2a34', manga: '#2a2a34',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q70,-10 100,-40', manos: [[-80, -136], [146, -290]],
    detalle: `<path d="M-16,-266 l16,26 16,-26" fill="#FAFAF5" stroke="${INK}" stroke-width="4"/><path d="M0,-240 l-8,10 8,50 8,-50z" fill="#8E2A2A"/>`,
    objeto: `<g transform="translate(-80,-110)">${MALETIN}</g>`, cabeza: PELO.replace('#3A2A22', '#2a2a2a') + GAFAS },
  juez: { expr: 'neutral', pantalon: '#111', torso: '#151518', manga: '#151518',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q60,-10 70,-90', manos: [[-80, -136], [116, -340]],
    detalle: `<path d="M-56,-170 l-16,150 q72,18 144,0 l-16,-150z" fill="#151518" stroke="${INK}" stroke-width="6"/><path d="M-20,-266 l20,30 20,-30" fill="#f2f2f2" stroke="${INK}" stroke-width="4"/>`,
    objeto: `<g transform="translate(116,-350)">${MAZO}</g>`, cabeza: CALVO + `<path d="M-30,30 q30,14 60,0" fill="none" stroke="#9a9a9a" stroke-width="6"/>` },
});
PRESETS.cantante_furiosa = Object.assign({}, PRESETS.cantante, { expr: 'sorprendido', brazoI: 'M-46,-250 q-60,-20 -70,-100', brazoD: 'M46,-250 q60,-20 70,-100', manos: [[-116, -350], [116, -350]] });
PRESETS.fotografo_feliz = Object.assign({}, PRESETS.fotografo, { cabeza: PELO.replace('#3A2A22', '#8a6a3a') + CASCOS, brazoI: 'M-46,-250 q-60,-20 -70,-100', brazoD: 'M46,-250 q60,-20 70,-100', manos: [[-116, -350], [116, -350]], objeto: `<g transform="translate(0,-170)">${CAMARA_FOTO}</g>` });
PRESETS.lector = Object.assign({}, PRESETS.vecino1 || PRESETS.toni, { expr: 'sorprendido', brazoI: 'M-46,-250 q20,30 20,40', brazoD: 'M46,-250 q-20,30 -20,40', manos: [[-30, -216], [30, -216]], objeto: `<g transform="translate(0,-236)">${PERIODICO}</g>` });
PRESETS.lectora = Object.assign({}, PRESETS.amiga, { expr: 'sorprendido', brazoI: 'M-46,-250 q20,30 20,40', brazoD: 'M46,-250 q-20,30 -20,40', manos: [[-30, -216], [30, -216]], objeto: `<g transform="translate(0,-236)">${PERIODICO}</g>` });

// ---------- Short "La guerra de los emús" (Australia, 1932) ----------
function emu({ corre = false, burla = false, esc = 1 } = {}) {
  const P = (d, w, c) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let g = `<g transform="scale(${esc})" stroke-linejoin="round">`;
  g += `<ellipse cx="0" cy="2" rx="90" ry="10" fill="#000" opacity=".15"/>`;
  const piernas = corre ? [`M-20,-170 l-40,70 l-30,90`, `M10,-170 l40,60 l50,70`] : [`M-20,-170 l-6,80 l-14,86`, `M14,-170 l6,80 l14,86`];
  piernas.forEach((d, i) => g += P(d, 12, i ? '#7a8088' : '#8a9098'));
  for (const d of piernas) { const fin = d.split(' ').reduce((a, s) => s, ''); }
  const pies = corre ? [[-90, -4], [100, -6]] : [[-40, -4], [40, -4]];
  pies.forEach(([x, y]) => g += `<path d="M${x - 16},${y} l16,-8 l18,6 M${x},${y - 8} l2,10" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`);
  g += `<ellipse cx="-10" cy="-215" rx="105" ry="72" fill="#5a4636" stroke="${INK}" stroke-width="7"/>`;
  for (let i = 0; i < 26; i++) { const a = Math.PI * (.05 + i / 26 * .95), r = 80; g += `<path d="M${-10 + Math.cos(a) * r * .9},${-215 + Math.sin(a) * 50} q${-12 - (i % 3) * 4},18 ${-24 - (i % 4) * 4},30" fill="none" stroke="#3a2a20" stroke-width="5" stroke-linecap="round"/>`; }
  g += `<path d="M-115,-230 q-30,10 -36,40" fill="none" stroke="#3a2a20" stroke-width="10" stroke-linecap="round"/>`;
  const cuello = corre ? 'M70,-250 q50,-50 70,-130' : 'M70,-250 q20,-80 10,-160';
  g += P(cuello, 22, '#6a8aa8');
  const [hx, hy] = corre ? [140, -380] : [80, -410];
  g += `<ellipse cx="${hx}" cy="${hy}" rx="34" ry="26" fill="#3a3a44" stroke="${INK}" stroke-width="6"/>`;
  g += burla ? `<path d="M${hx + 26},${hy - 4} l40,-8 l-38,10 l40,10 l-42,-2z" fill="#6a5a48" stroke="${INK}" stroke-width="4"/><path d="M${hx + 30},${hy + 4} q20,10 30,30" fill="none" stroke="#e86a7a" stroke-width="8" stroke-linecap="round"/>` : `<path d="M${hx + 26},${hy - 6} l42,4 l-42,8z" fill="#6a5a48" stroke="${INK}" stroke-width="4"/>`;
  g += `<circle cx="${hx + 8}" cy="${hy - 6}" r="9" fill="#e8582a" stroke="${INK}" stroke-width="3"/><circle cx="${hx + 10}" cy="${hy - 7}" r="4" fill="${INK}"/>`;
  if (burla) g += `<path d="M${hx - 6},${hy - 22} l20,6" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  return g + '</g>';
}
PRESETS.emu = { svg: emu() };
PRESETS.emu_corre = { svg: emu({ corre: true }) };
PRESETS.emu_burla = { svg: emu({ corre: true, burla: true }) };
const SOMBRERO_AUS = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-110,-40 q110,-26 220,0 q-110,22 -220,0z" fill="#8a7450"/><path d="M-66,-48 q0,-60 66,-62 q66,2 66,62 q-66,12 -132,0z" fill="#9a8458"/><path d="M-66,-56 q66,10 132,0" stroke="#5a4a30" stroke-width="10" fill="none"/><path d="M40,-46 q50,-60 70,-20 q-30,0 -70,20z" fill="#9a8458"/><circle cx="62" cy="-56" r="9" fill="#c99a2e"/></g>`;
const SOMBRERO_GRANJA = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-116,-36 q116,-26 232,0 q-116,20 -232,0z" fill="#d8c08a"/><path d="M-64,-44 q0,-56 64,-58 q64,2 64,58 q-64,12 -128,0z" fill="#e2cc96"/><path d="M-64,-52 q64,10 128,0" stroke="#8a5a2a" stroke-width="8" fill="none"/></g>`;
Object.assign(PRESETS, {
  meredith: { expr: 'eureka', pantalon: '#7a6a48', torso: '#8a7a54', manga: '#8a7a54',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q60,-30 80,-100', manos: [[-80, -136], [126, -350]],
    detalle: `<path d="M-50,-262 l50,40 50,-40" fill="none" stroke="#6a5a3a" stroke-width="6"/><g fill="#c99a2e" stroke="${INK}" stroke-width="2"><circle cx="0" cy="-200" r="5"/><circle cx="0" cy="-176" r="5"/></g><path d="M-50,-160 h100" stroke="#5a3a20" stroke-width="12"/><rect x="-36" y="-250" width="20" height="10" fill="#c0302a"/>`,
    cabeza: SOMBRERO_AUS + BIGOTE_FR },
  soldado_aus: { expr: 'preocupado', pantalon: '#7a6a48', torso: '#8a7a54', manga: '#8a7a54',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,60 34,112', manos: [[-80, -136], [80, -136]],
    detalle: `<path d="M-50,-160 h100" stroke="#5a3a20" stroke-width="12"/>`, cabeza: SOMBRERO_AUS },
  granjero_aus: { expr: 'preocupado', pantalon: '#3a5a8a', torso: '#c8a868', manga: '#c8a868',
    brazoI: 'M-46,-250 q-60,-20 -70,-100', brazoD: 'M46,-250 q60,-20 70,-100', manos: [[-116, -350], [116, -350]],
    detalle: `<path d="M-40,-262 v110 M40,-262 v110" stroke="#3a5a8a" stroke-width="12"/><rect x="-44" y="-180" width="88" height="40" fill="#3a5a8a" stroke="${INK}" stroke-width="4"/>`, cabeza: SOMBRERO_GRANJA + BIGOTE('#8a6a3a') },
});
PRESETS.meredith_susto = Object.assign({}, PRESETS.meredith, { expr: 'sorprendido', brazoI: 'M-46,-250 q-60,-20 -70,-100', brazoD: 'M46,-250 q60,-20 70,-100', manos: [[-116, -350], [116, -350]] });
PRESETS.soldado_susto = Object.assign({}, PRESETS.soldado_aus, { expr: 'sorprendido', brazoI: 'M-46,-250 q-60,-20 -70,-100', brazoD: 'M46,-250 q60,-20 70,-100', manos: [[-116, -350], [116, -350]] });

// ---------- Short "La guerra del cerdo" (San Juan, 1859) ----------
const Pc = (d, w, c) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 7}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
function cerdo({ come = false, angel = false, susto = false } = {}) {
  const R = '#F4A6B4', R2 = '#E58A9C';
  let g = `<g stroke-linejoin="round">`;
  if (!angel) g += `<ellipse cx="0" cy="2" rx="120" ry="12" fill="#000" opacity=".15"/>`;
  if (angel) g += `<g stroke="${INK}" stroke-width="5"><path d="M-30,-190 q-90,-120 -170,-60 q40,10 60,40 q-50,0 -70,30 q60,-6 100,20z" fill="#fff"/><path d="M30,-190 q90,-120 170,-60 q-40,10 -60,40 q50,0 70,30 q-60,-6 -100,20z" fill="#fff"/></g>`;
  for (const [x, a] of [[-70, -6], [-40, 6], [50, -6], [80, 6]]) g += Pc(`M${x},-80 l${a},74`, 20, R2);
  g += `<path d="M-115,-130 q-30,-20 -24,-44 q8,-16 20,-2 q4,14 -12,16" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
  g += `<ellipse cx="0" cy="-130" rx="125" ry="78" fill="${R}" stroke="${INK}" stroke-width="7"/>`;
  g += `<ellipse cx="-30" cy="-110" rx="30" ry="18" fill="${R2}" opacity=".5"/>`;
  const [hx, hy] = come ? [118, -70] : [120, -170];
  g += `<g transform="translate(${hx},${hy}) rotate(${come ? 30 : 0})">`;
  g += `<path d="M-40,-50 l-6,-46 l34,26z M20,-56 l22,-40 l6,44z" fill="${R2}" stroke="${INK}" stroke-width="6"/>`;
  g += `<circle r="62" fill="${R}" stroke="${INK}" stroke-width="7"/>`;
  g += `<ellipse cx="44" cy="12" rx="26" ry="20" fill="${R2}" stroke="${INK}" stroke-width="6"/><ellipse cx="38" cy="12" rx="4" ry="7" fill="${INK}"/><ellipse cx="52" cy="12" rx="4" ry="7" fill="${INK}"/>`;
  if (angel) g += `<path d="M-14,-14 q8,-8 16,0 M14,-16 q8,-8 16,0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M0,30 q14,10 28,0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  else if (susto) g += `<ellipse cx="-4" cy="-16" rx="10" ry="13" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="-3" cy="-15" r="5" fill="${INK}"/><ellipse cx="22" cy="-18" rx="10" ry="13" fill="#fff" stroke="${INK}" stroke-width="4"/><circle cx="23" cy="-17" r="5" fill="${INK}"/><ellipse cx="20" cy="40" rx="8" ry="10" fill="${INK}"/>`;
  else g += `<ellipse cx="-2" cy="-14" rx="6" ry="9" fill="${INK}"/><ellipse cx="22" cy="-16" rx="6" ry="9" fill="${INK}"/><circle cx="0" cy="-18" r="2" fill="#fff"/><circle cx="24" cy="-20" r="2" fill="#fff"/><path d="M4,36 q12,8 24,0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  g += `<ellipse cx="-30" cy="14" rx="10" ry="6" fill="#E8607A" opacity=".5"/>`;
  if (come) g += `<g transform="translate(40,58)"><ellipse rx="26" ry="18" fill="#C99A5A" stroke="${INK}" stroke-width="5"/><circle cx="-8" cy="-4" r="3" fill="#8a6a3a"/><circle cx="8" cy="5" r="3" fill="#8a6a3a"/></g>`;
  g += `</g>`;
  if (angel) g += `<ellipse cx="${hx}" cy="${hy - 92}" rx="50" ry="13" fill="none" stroke="#F2C14E" stroke-width="10"/>`;
  return `<g transform="translate(0,0) scale(.95)">${g}</g></g>`;
}
PRESETS.cerdo = { svg: cerdo() };
PRESETS.cerdo_come = { svg: cerdo({ come: true }) };
PRESETS.cerdo_susto = { svg: cerdo({ susto: true }) };
PRESETS.cerdo_angel = { svg: cerdo({ angel: true }) };
const FUSIL = (x, y, rot) => `<g transform="translate(${x},${y}) rotate(${rot})" stroke="${INK}" stroke-width="5" stroke-linejoin="round"><rect x="-10" y="-14" width="80" height="26" rx="8" fill="#7a4a2a"/><rect x="60" y="-9" width="170" height="12" rx="4" fill="#3a3a40"/><rect x="40" y="-16" width="70" height="12" rx="3" fill="#8a5a34"/></g>`;
const SOMBRERO_PAJA = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-104,-46 q104,-24 208,0 q-104,18 -208,0z" fill="#E6C77A"/><path d="M-58,-52 q0,-52 58,-54 q58,2 58,54 q-58,10 -116,0z" fill="#EDD38E"/><path d="M-58,-60 q58,10 116,0" stroke="#B0452E" stroke-width="10" fill="none"/></g>`;
const BARBA_C = `<path d="M-60,18 q60,40 120,0 q-4,52 -60,62 q-56,-10 -60,-62z" fill="#8a5a2e" stroke="${INK}" stroke-width="4"/>`;
const CUADROS = `<g opacity=".55"><path d="M-44,-250 v100 M-22,-260 v110 M0,-262 v112 M22,-260 v110 M44,-250 v100" stroke="#7a1a1a" stroke-width="6"/><path d="M-50,-236 h100 M-52,-210 h104 M-54,-184 h108 M-56,-160 h112" stroke="#7a1a1a" stroke-width="6"/></g><path d="M-30,-268 v118 M30,-268 v118" stroke="#3a2a1e" stroke-width="9"/>`;
const KEPI = (c = '#2a3a6a') => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-62,-44 q-6,-60 54,-62 l64,14 q10,24 8,48z" fill="${c}"/><path d="M-66,-44 h138 q-10,16 -40,14 h-98z" fill="#1a1a1a"/><circle cx="-30" cy="-66" r="9" fill="#d8b440"/></g>`;
const SHAKO = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><rect x="-56" y="-120" width="112" height="78" rx="6" fill="#1a1a22"/><path d="M-64,-44 h128 q-10,16 -40,14 h-48 q-30,2 -40,-14z" fill="#111"/><circle cx="0" cy="-90" r="14" fill="#d8b440"/><path d="M0,-124 v-26" stroke="#fff" stroke-width="10"/></g>`;
const BICORNIO = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-130,-40 q130,-130 260,0 q-130,-30 -260,0z" fill="#1a1e2e"/><path d="M-124,-42 q124,-32 248,0" fill="none" stroke="#d8b440" stroke-width="7"/><circle cx="40" cy="-72" r="14" fill="#c0302a"/></g>`;
const PATILLAS = `<g fill="#6a6a6a" stroke="${INK}" stroke-width="4"><path d="M-70,-10 q-8,40 16,62 q6,-30 4,-64z"/><path d="M70,-10 q8,40 -16,62 q-6,-30 -4,-64z"/></g>`;
const CHARRETERAS = `<g fill="#d8b440" stroke="${INK}" stroke-width="4"><ellipse cx="-56" cy="-262" rx="26" ry="11"/><ellipse cx="56" cy="-262" rx="26" ry="11"/><path d="M-78,-256 v14 M-68,-254 v16 M-58,-254 v16 M-48,-254 v16 M78,-256 v14 M68,-254 v16 M58,-254 v16 M48,-254 v16" stroke="#d8b440" stroke-width="4"/></g>`;
Object.assign(PRESETS, {
  granjero_us: { expr: 'neutral', pantalon: '#4a5a7a', torso: '#C0392B', manga: '#C0392B',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q30,60 34,112', manos: [[-80, -136], [80, -136]],
    detalle: CUADROS, cabeza: SOMBRERO_PAJA + BARBA_C },
  soldado_us: { expr: 'neutral', pantalon: '#6a86b0', torso: '#2a3a6a', manga: '#2a3a6a',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q20,40 10,90', manos: [[-80, -136], [56, -160]],
    detalle: `<g fill="#d8b440" stroke="${INK}" stroke-width="2"><circle cx="0" cy="-236" r="5"/><circle cx="0" cy="-210" r="5"/><circle cx="0" cy="-184" r="5"/></g><path d="M-50,-160 h100" stroke="#1a1a1a" stroke-width="12"/>`,
    objeto: FUSIL(56, -160, -80), cabeza: KEPI() },
  marine_uk: { expr: 'neutral', pantalon: '#1a1e2e', torso: '#C0302A', manga: '#C0302A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q20,40 10,90', manos: [[-80, -136], [56, -160]],
    detalle: `<path d="M-46,-264 l92,104 M46,-264 l-92,104" stroke="#f2f2ea" stroke-width="12"/><path d="M-50,-160 h100" stroke="#f2f2ea" stroke-width="12"/>`,
    objeto: FUSIL(56, -160, -80), cabeza: SHAKO },
  britanico: { expr: 'preocupado', pantalon: '#3a3a44', torso: '#2a2a34', manga: '#2a2a34',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q60,-30 80,-100', manos: [[-80, -136], [126, -350]],
    detalle: `<path d="M-14,-266 l14,30 14,-30z" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M-50,-262 l50,40 50,-40" fill="none" stroke="#1a1a22" stroke-width="6"/><path d="M-6,-238 l6,8 6,-8z" fill="#7a2a3a"/>`,
    objeto: `<path d="M126,-366 v-34" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M126,-366 v-34" stroke="${SKIN}" stroke-width="8" stroke-linecap="round"/>`,
    cabeza: SOMBRERO_COPA + PATILLAS },
  almirante: { expr: 'neutral', pantalon: '#f2f0e8', torso: '#1a1e3e', manga: '#1a1e3e',
    brazoI: 'M-46,-250 q20,50 50,40', brazoD: 'M46,-250 q-20,50 -50,40', manos: [[4, -210], [-4, -206]],
    detalle: `<g fill="#d8b440" stroke="${INK}" stroke-width="2"><circle cx="-16" cy="-236" r="5"/><circle cx="16" cy="-236" r="5"/><circle cx="-16" cy="-170" r="5"/><circle cx="16" cy="-170" r="5"/></g>` + CHARRETERAS,
    cabeza: BICORNIO + PATILLAS.replace(/#6a6a6a/g, '#d8d4cc') },
});
PRESETS.granjero_dispara = Object.assign({}, PRESETS.granjero_us, { expr: 'preocupado', brazoI: 'M-46,-250 q50,30 90,10', brazoD: 'M46,-250 q50,10 90,-4', manos: [[-6, -240], [96, -254]], objeto: FUSIL(-40, -250, -4), brazoI: 'M-46,-250 q20,20 40,10', brazoD: 'M46,-250 q30,10 50,-4' });
PRESETS.granjero_grita = Object.assign({}, PRESETS.granjero_us, { expr: 'sorprendido', brazoI: 'M-46,-250 q-60,-20 -70,-100', brazoD: 'M46,-250 q60,-20 70,-100', manos: [[-116, -350], [116, -350]] });
PRESETS.granjero_paga = Object.assign({}, PRESETS.granjero_us, { expr: 'eureka', brazoD: 'M46,-250 q60,10 84,-40', manos: [[-80, -136], [130, -290]], objeto: `<g transform="translate(130,-300) rotate(-10)"><rect x="-34" y="-20" width="68" height="36" rx="4" fill="#9ACD8A" stroke="${INK}" stroke-width="4"/><text x="0" y="8" font-size="26" font-weight="900" text-anchor="middle" fill="#2a5a2a" font-family="DejaVu Sans">$10</text></g>` });
PRESETS.britanico_cien = Object.assign({}, PRESETS.britanico, { expr: 'sorprendido', objeto: `<g transform="translate(126,-380)"><rect x="-44" y="-26" width="88" height="40" rx="4" fill="#9ACD8A" stroke="${INK}" stroke-width="4"/><text x="0" y="6" font-size="28" font-weight="900" text-anchor="middle" fill="#2a5a2a" font-family="DejaVu Sans">$100</text></g>` });
PRESETS.almirante_no = Object.assign({}, PRESETS.almirante, { expr: 'preocupado', brazoD: 'M46,-250 q60,-10 74,-80', manos: [[4, -210], [120, -330]], brazoI: 'M-46,-250 q20,50 50,40', objeto: `<path d="M120,-346 v-30" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M120,-346 v-30" stroke="${SKIN}" stroke-width="8" stroke-linecap="round"/>` });
PRESETS.soldado_us_susto = Object.assign({}, PRESETS.soldado_us, { expr: 'sorprendido' });
PRESETS.marine_uk_susto = Object.assign({}, PRESETS.marine_uk, { expr: 'sorprendido' });

// ---------- Short "Onoda" (Lubang, 1944-1974) ----------
const GORRA_JAP = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-70,-30 q-4,-70 70,-72 q74,2 70,72z" fill="#8a7a4a"/><path d="M-72,-34 h144 l2,10 h-148z" fill="#6a5a34"/><path d="M-10,-40 q60,-4 84,6 q-40,8 -84,4z" fill="#5a4a2a"/><path d="M-8,-74 l8,-8 8,8 -8,8z" fill="#d8b440"/><path d="M-74,-28 l-14,90 q20,6 26,-10 l4,-80z M74,-28 l14,90 q-20,6 -26,-10 l-4,-80z" fill="#9a8a5a"/></g>`;
const PARCHES = `<g stroke="${INK}" stroke-width="3"><rect x="-40" y="-230" width="26" height="22" fill="#6a6a3a" transform="rotate(-8,-27,-219)"/><rect x="14" y="-190" width="28" height="24" fill="#7a5a3a" transform="rotate(10,28,-178)"/><path d="M-40,-160 l8,-14 8,14 8,-14 8,14" fill="none"/></g>`;
const BARBA_CORTA = `<path d="M-56,20 q56,40 112,0 q-6,40 -56,48 q-50,-8 -56,-48z" fill="#3a3a3a" opacity=".55"/>`;
const PELO_LARGO = `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-72,40 C-90,-60 -50,-104 4,-100 C58,-100 92,-60 74,40 C70,0 64,-30 50,-56 C20,-66 -20,-66 -50,-56 C-64,-30 -70,0 -72,40Z" fill="#2a1e16"/><path d="M-74,-40 q74,-30 148,0" stroke="#c0302a" stroke-width="10" fill="none"/></g>`;
const MOCHILA = `<g stroke="${INK}" stroke-width="5"><rect x="-64" y="-280" width="34" height="110" rx="10" fill="#C0602A"/><rect x="30" y="-280" width="34" height="110" rx="10" fill="#C0602A"/></g>`;
const PELO_CANO = `<path d="M-68,-28 C-74,-80 -30,-98 4,-94 C40,-94 72,-76 68,-30 C50,-56 20,-60 0,-54 C-20,-60 -48,-56 -68,-28Z" fill="#d8d4cc" stroke="${INK}" stroke-width="5"/>`;
const OCTAVILLA = `<g transform="rotate(-8)" stroke="${INK}" stroke-width="4"><rect x="-40" y="-56" width="80" height="62" rx="3" fill="#F7F1E1"/><path d="M-30,-42 h60 M-30,-30 h50 M-30,-18 h60 M-30,-6 h40" stroke="#8a3a2a" stroke-width="3"/></g>`;
Object.assign(PRESETS, {
  onoda: { expr: 'neutral', pantalon: '#7a7048', torso: '#8a8050', manga: '#8a8050',
    brazoI: 'M-46,-250 q20,40 40,60', brazoD: 'M46,-250 q30,40 20,80', manos: [[-6, -190], [66, -170]],
    detalle: `<g fill="#d8b440" stroke="${INK}" stroke-width="2"><circle cx="0" cy="-230" r="5"/><circle cx="0" cy="-200" r="5"/></g><path d="M-50,-160 h100" stroke="#4a3a20" stroke-width="12"/><rect x="-46" y="-266" width="18" height="10" fill="#c0302a"/>`,
    objeto: FUSIL(-40, -150, -50), cabeza: GORRA_JAP },
});
PRESETS.onoda_lee = Object.assign({}, PRESETS.onoda, { expr: 'preocupado', brazoI: 'M-46,-250 q30,10 40,-30', brazoD: 'M46,-250 q-10,10 -30,-30', brazoI: 'M-46,-250 q20,30 34,10', brazoD: 'M46,-250 q-20,30 -34,10', manos: [[-12, -232], [12, -232]], objeto: `<g transform="translate(0,-200)">${OCTAVILLA}</g>` });
PRESETS.onoda_viejo = Object.assign({}, PRESETS.onoda, { expr: 'preocupado', pantalon: '#6a6038', torso: '#7a7040', manga: '#7a7040', detalle: PRESETS.onoda.detalle + PARCHES, cabeza: GORRA_JAP.replace('#8a7a4a', '#7a6a3a') + BARBA_CORTA });
PRESETS.onoda_saluda = Object.assign({}, PRESETS.onoda_viejo, { expr: 'neutral', brazoD: 'M46,-250 q80,-40 46,-160', manos: [[-6, -190], [92, -410]], objeto: FUSIL(-40, -150, -50) });
PRESETS.onoda_rinde = Object.assign({}, PRESETS.onoda_viejo, { expr: 'eureka', brazoI: 'M-46,-250 q20,40 60,40', brazoD: 'M46,-250 q-20,40 -36,40', manos: [[14, -210], [10, -210]], objeto: FUSIL(-110, -216, 0) });
PRESETS.onoda_susto = Object.assign({}, PRESETS.onoda_viejo, { expr: 'sorprendido' });
Object.assign(PRESETS, {
  suzuki: { expr: 'eureka', pantalon: '#3a5a8a', torso: '#E8C23A', manga: '#E8C23A',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q60,-30 80,-100', manos: [[-80, -136], [126, -350]],
    detalle: MOCHILA + `<path d="M-40,-266 l20,110 M40,-266 l-20,110" stroke="#8a4a1a" stroke-width="8"/>`, cabeza: PELO_LARGO },
  comandante: { expr: 'neutral', pantalon: '#4a4a52', torso: '#5a5a64', manga: '#5a5a64',
    brazoI: 'M-46,-250 q-30,60 -34,112', brazoD: 'M46,-250 q60,0 70,-60', manos: [[-80, -136], [116, -310]],
    detalle: `<path d="M-14,-266 l14,30 14,-30z" fill="#fff" stroke="${INK}" stroke-width="4"/><path d="M-6,-238 l6,40 6,-40z" fill="#2a4a7a" stroke="${INK}" stroke-width="3"/><path d="M-50,-262 l50,40 50,-40" fill="none" stroke="#3a3a44" stroke-width="6"/>`,
    objeto: `<g transform="translate(116,-300)">${PERGAMINO}</g>`, cabeza: PELO_CANO + GAFAS },
});
function panda() {
  return `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round"><ellipse cx="0" cy="2" rx="90" ry="10" fill="#000" opacity=".15" stroke="none"/>
  <ellipse cx="-40" cy="-30" rx="34" ry="30" fill="#1e1e22"/><ellipse cx="40" cy="-30" rx="34" ry="30" fill="#1e1e22"/>
  <ellipse cx="0" cy="-130" rx="96" ry="104" fill="#fafaf5"/><path d="M-96,-160 q-40,40 -10,90 q30,0 30,-60z M96,-160 q40,40 10,90 q-30,0 -30,-60z" fill="#1e1e22"/>
  <circle cx="-70" cy="-352" r="30" fill="#1e1e22"/><circle cx="70" cy="-352" r="30" fill="#1e1e22"/>
  <ellipse cx="0" cy="-290" rx="96" ry="84" fill="#fafaf5"/>
  <ellipse cx="-36" cy="-296" rx="24" ry="30" fill="#1e1e22" transform="rotate(20,-36,-296)" stroke="none"/><ellipse cx="36" cy="-296" rx="24" ry="30" fill="#1e1e22" transform="rotate(-20,36,-296)" stroke="none"/>
  <circle cx="-32" cy="-298" r="7" fill="#fff" stroke="none"/><circle cx="32" cy="-298" r="7" fill="#fff" stroke="none"/>
  <ellipse cx="0" cy="-260" rx="14" ry="9" fill="#1e1e22"/><path d="M-14,-242 q14,10 28,0" fill="none" stroke-width="5"/>
  <g transform="translate(60,-170) rotate(-30)"><rect x="-6" y="-80" width="12" height="120" rx="5" fill="#7ab04a" stroke-width="4"/><path d="M-6,-40 h12 M-6,0 h12" stroke-width="3"/><path d="M6,-70 q30,-20 40,0 q-20,6 -40,0z" fill="#8ac05a" stroke-width="3"/></g></g>`;
}
function yeti() {
  let g = `<g stroke="${INK}" stroke-width="6" stroke-linejoin="round"><ellipse cx="0" cy="2" rx="100" ry="10" fill="#000" opacity=".15" stroke="none"/>`;
  g += `<path d="M-50,-140 l-14,130 h40 l10,-100 h28 l10,100 h40 l-14,-130z" fill="#e8eef4"/>`;
  g += `<path d="M-100,-380 q-60,90 -40,200 q40,30 40,-40 M100,-380 q60,90 40,200 q-40,30 -40,-40" fill="#e8eef4"/>`;
  g += `<path d="M-96,-400 C-110,-500 110,-500 96,-400 L84,-140 q-84,30 -168,0z" fill="#f2f6fa"/>`;
  for (let i = 0; i < 14; i++) { const x = -80 + (i % 7) * 26, y = -360 + Math.floor(i / 7) * 120; g += `<path d="M${x},${y} q6,14 0,26" fill="none" stroke="#b8c4d0" stroke-width="4"/>`; }
  g += `<ellipse cx="0" cy="-420" rx="54" ry="40" fill="#a8b4c8"/><ellipse cx="-20" cy="-428" rx="8" ry="10" fill="${INK}" stroke="none"/><ellipse cx="20" cy="-428" rx="8" ry="10" fill="${INK}" stroke="none"/><path d="M-20,-400 q20,14 40,0" fill="none" stroke-width="5"/><path d="M-12,-402 l4,8 4,-8 M8,-402 l4,8 4,-8" fill="#fff" stroke-width="2"/>`;
  return g + '</g>';
}
PRESETS.panda = { svg: panda() };
PRESETS.yeti = { svg: yeti() };
