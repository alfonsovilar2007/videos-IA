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
  g+=`<path d="M-16,-150 q-6,80 -20,148" fill="none" stroke="${o.pantalon}" stroke-width="20" stroke-linecap="round"/><path d="M16,-150 q8,80 20,148" fill="none" stroke="${o.pantalon}" stroke-width="20" stroke-linecap="round"/>`;
  g+=`<path d="M-16,-150 q-6,80 -20,148 M16,-150 q8,80 20,148" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round" opacity="0"/>`;
  g+=`<ellipse cx="-44" cy="-2" rx="22" ry="11" fill="#2B2B2B" stroke="${INK}" stroke-width="5"/><ellipse cx="44" cy="-2" rx="22" ry="11" fill="#2B2B2B" stroke="${INK}" stroke-width="5"/>`;
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
function dibujar(nombre,x,y,sc,cambios){return personaje(x,y,sc,Object.assign({},PRESETS[nombre],cambios||{}));}

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
