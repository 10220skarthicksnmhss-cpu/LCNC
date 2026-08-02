export const C = {
  bg:      '#0F0E0C',
  card:    '#161614',
  card2:   '#1C1B18',
  border:  'rgba(255,255,255,0.07)',
  cream:   '#F5F0E8',
  muted:   'rgba(245,240,232,0.45)',
  subtle:  'rgba(245,240,232,0.18)',
  saffron: '#E8793A',
  mint:    '#2ECC8F',
  danger:  '#C0392B',
};

export const F = {
  display: '"Playfair Display", Georgia, serif',
  body:    '"Inter", system-ui, sans-serif',
  mono:    '"JetBrains Mono", "Courier New", monospace',
};

export const card = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  overflow: 'hidden',
};

export const cardInner = {
  background: C.card2,
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  overflow: 'hidden',
};
