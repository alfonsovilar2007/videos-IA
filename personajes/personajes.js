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
