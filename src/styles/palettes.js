/**
 * Palettes de lecture RSVP — zone d'affichage du mot
 *
 * Chaque palette définit :
 *   bg    → fond de la zone mot
 *   text  → couleur du texte
 *   orp   → couleur de la lettre pivot (WCAG AA garanti)
 *
 * Nommage : garder les labels courts pour le sélecteur UI.
 */
export const PALETTES = {
  default: {
    label: 'Défaut',
    bg:   '#FFFBEB',
    text: '#1C1917',
    orp:  '#DC2626',
    dark: { bg: '#1C1917', text: '#F5F5F4', orp: '#EF4444' },
  },
  white: {
    label: 'Blanc pur',
    bg:   '#FFFFFF',
    text: '#111111',
    orp:  '#DC2626',
    dark: { bg: '#111111', text: '#FFFFFF', orp: '#EF4444' },
  },
  sepia: {
    label: 'Sépia',
    bg:   '#F4ECD8',
    text: '#3B2A1A',
    orp:  '#B84A2A',
    dark: { bg: '#2A1A0A', text: '#F4ECD8', orp: '#F97316' },
  },
  yellow: {
    label: 'Jaune',
    bg:   '#FFFDE7',
    text: '#1A1200',
    orp:  '#B45309',
    dark: { bg: '#1A1200', text: '#FFFDE7', orp: '#FCD34D' },
  },
  blue: {
    label: 'Bleu nuit',
    bg:   '#0F172A',
    text: '#E2E8F0',
    orp:  '#60A5FA',
    dark: { bg: '#0F172A', text: '#E2E8F0', orp: '#60A5FA' },
  },
  green: {
    label: 'Vert forêt',
    bg:   '#052E16',
    text: '#DCFCE7',
    orp:  '#4ADE80',
    dark: { bg: '#052E16', text: '#DCFCE7', orp: '#4ADE80' },
  },
  contrast: {
    label: 'Contraste max',
    bg:   '#000000',
    text: '#FFFFFF',
    orp:  '#FFD600',
    dark: { bg: '#000000', text: '#FFFFFF', orp: '#FFD600' },
  },
  rose: {
    label: 'Rose pâle',
    bg:   '#FFF0F3',
    text: '#1A0A0E',
    orp:  '#BE123C',
    dark: { bg: '#1A0A0E', text: '#FFE4E6', orp: '#FB7185' },
  },
}
