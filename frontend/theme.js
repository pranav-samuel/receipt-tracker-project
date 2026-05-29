export const C = {
  // bgs, black theme
  bg:           '#0A0A0A',
  surface:      '#141414',
  surfaceHigh:  '#1C1C1C',
  surfacePress: '#222222',

  // borders, wont relly be that evident
  border:       '#222222',
  borderBright: '#303030',

  // gold accent for now, maybe ill change
  gold:         '#E8B84B',
  goldDim:      'rgba(232,184,75,0.10)',
  goldText:     '#0A0A0A',  // text ON gold backgrounds

  // words colors
  text:         '#F0F0F0',
  sub:          '#808080',
  muted:        '#404040',

  // semantics
  danger:       '#D95C5C',
  success:      '#4CAF82',

  // avatars
  avatars: ['#4A5568', '#553C9A', '#2C7A7B', '#744210', '#1A365D', '#3D2C8D'],
};

export const F = {
  xs:      11,
  sm:      13,
  base:    15,
  md:      17,
  lg:      20,
  xl:      26,
  display: 34,
};

export const R = {
  sm:  8,
  md:  14,
  lg:  20,
  xl:  28,
};

// keep avatar color
export const storeColor = (name = '') =>
  C.avatars[name.charCodeAt(0) % C.avatars.length];
