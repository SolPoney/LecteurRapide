import { useRef } from 'react'
import { X, Sun, Moon, RotateCcw } from 'lucide-react'
import { useApp } from '@/store/AppContext'
import { ACTION } from '@/store/appStore'
import { clearStorage } from '@/utils/storage'
import { PALETTES } from '@/styles/palettes'
import styles from './SettingsPanel.module.css'

const FONTS = [
  { value: 'sans',     label: 'Sans-serif',  sub: 'Inter',        family: 'var(--font-sans)'     },
  { value: 'serif',    label: 'Serif',       sub: 'Playfair',     family: 'var(--font-serif)'    },
  { value: 'mono',     label: 'Mono',        sub: 'JetBrains',    family: 'var(--font-mono)'     },
  { value: 'luciole',  label: 'Luciole',     sub: 'Accessibilité',family: 'var(--font-luciole)'  },
  { value: 'dyslexic', label: 'OpenDyslexic',sub: 'Dyslexie',     family: 'var(--font-dyslexic)' },
]

const SIZES = [
  { value: 'sm', label: 'Petit' },
  { value: 'md', label: 'Moyen' },
  { value: 'lg', label: 'Grand' },
]

export function SettingsPanel() {
  const { state, dispatch } = useApp()
  const barPickerRef  = useRef(null)
  const textPickerRef = useRef(null)

  const close      = () => dispatch({ type: ACTION.TOGGLE_SETTINGS })
  const setTheme   = (t) => dispatch({ type: ACTION.SET_THEME,            payload: t })
  const setFont    = (f) => dispatch({ type: ACTION.SET_FONT,             payload: f })
  const setSize    = (s) => dispatch({ type: ACTION.SET_WORD_SIZE,        payload: s })
  const setPalette = (p) => dispatch({ type: ACTION.SET_PALETTE,          payload: p })
  const setBarColor  = (c) => dispatch({ type: ACTION.SET_CUSTOM_BAR_COLOR,  payload: c })
  const setTextColor = (c) => dispatch({ type: ACTION.SET_CUSTOM_TEXT_COLOR, payload: c })

  const resetBarColor  = () => dispatch({ type: ACTION.SET_CUSTOM_BAR_COLOR,  payload: null })
  const resetTextColor = () => dispatch({ type: ACTION.SET_CUSTOM_TEXT_COLOR, payload: null })

  const handleReset = () => {
    clearStorage()
    dispatch({ type: ACTION.LOAD_BOOK, payload: null })
    close()
    window.location.reload()
  }

  // Derive current palette colors for display
  const currentPalette = PALETTES[state.palette] ?? PALETTES.default
  const isDark = state.theme === 'dark'
  const paletteColors = isDark && currentPalette.dark ? currentPalette.dark : currentPalette
  const currentBarColor  = state.customBarColor  ?? paletteColors.primary ?? 'var(--color-primary)'
  const currentTextColor = state.customTextColor ?? paletteColors.text

  return (
    <>
      <div className={styles.overlay} onClick={close} aria-hidden="true" />

      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Paramètres">

        {/* ── Header ──────────────────────────────────────── */}
        <header className={styles.header}>
          <h2 className={styles.title}>Paramètres</h2>
          <button className={styles.closeBtn} onClick={close} aria-label="Fermer">
            <X size={18} />
          </button>
        </header>

        {/* ── Thème ───────────────────────────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Thème</h3>
          <div className={styles.themeGroup}>
            <button
              className={`${styles.themeBtn} ${state.theme === 'light' ? styles.active : ''}`}
              onClick={() => setTheme('light')}
              aria-pressed={state.theme === 'light'}
            >
              <Sun size={15} aria-hidden="true" /> Clair
            </button>
            <button
              className={`${styles.themeBtn} ${state.theme === 'dark' ? styles.active : ''}`}
              onClick={() => setTheme('dark')}
              aria-pressed={state.theme === 'dark'}
            >
              <Moon size={15} aria-hidden="true" /> Sombre
            </button>
          </div>
        </section>

        {/* ── Palettes ─────────────────────────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Fond de lecture</h3>
          <div className={styles.paletteGrid}>
            {Object.entries(PALETTES).map(([key, pal]) => {
              const colors  = isDark && pal.dark ? pal.dark : pal
              const isActive = state.palette === key
              return (
                <button
                  key={key}
                  className={`${styles.paletteSwatch} ${isActive ? styles.paletteActive : ''}`}
                  onClick={() => setPalette(key)}
                  aria-pressed={isActive}
                  aria-label={pal.label}
                  title={pal.label}
                >
                  <span
                    className={styles.swatchBg}
                    style={{ background: colors.bg }}
                  >
                    <span className={styles.swatchWord}>
                      <span style={{ color: colors.text }}>A</span>
                      <span style={{ color: colors.orp }}>a</span>
                    </span>
                  </span>
                  <span className={styles.swatchName}>{pal.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Couleurs personnalisées ───────────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Couleurs personnalisées</h3>

          <div className={styles.colorPickerRow}>
            {/* Bar color */}
            <div className={styles.colorPickerItem}>
              <span className={styles.colorPickerLabel}>Barre & boutons</span>
              <div className={styles.colorPickerGroup}>
                <button
                  className={styles.colorCircle}
                  style={{ background: state.customBarColor ?? 'var(--color-primary)' }}
                  onClick={() => barPickerRef.current?.click()}
                  aria-label="Choisir la couleur de la barre"
                  title="Cliquer pour ouvrir le sélecteur de couleur"
                />
                <input
                  ref={barPickerRef}
                  type="color"
                  className={styles.hiddenColorInput}
                  value={state.customBarColor ?? '#0D9488'}
                  onChange={e => setBarColor(e.target.value)}
                  aria-label="Couleur de la barre de progression"
                />
                {state.customBarColor && (
                  <button className={styles.resetColorBtn} onClick={resetBarColor} aria-label="Réinitialiser">
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Text color */}
            <div className={styles.colorPickerItem}>
              <span className={styles.colorPickerLabel}>Couleur du texte</span>
              <div className={styles.colorPickerGroup}>
                <button
                  className={styles.colorCircle}
                  style={{ background: state.customTextColor ?? currentTextColor }}
                  onClick={() => textPickerRef.current?.click()}
                  aria-label="Choisir la couleur du texte"
                  title="Cliquer pour ouvrir le sélecteur de couleur"
                />
                <input
                  ref={textPickerRef}
                  type="color"
                  className={styles.hiddenColorInput}
                  value={state.customTextColor ?? '#1C1917'}
                  onChange={e => setTextColor(e.target.value)}
                  aria-label="Couleur du texte des mots"
                />
                {state.customTextColor && (
                  <button className={styles.resetColorBtn} onClick={resetTextColor} aria-label="Réinitialiser">
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div
            className={styles.colorPreview}
            style={{ background: paletteColors.bg }}
          >
            <span style={{ color: state.customTextColor ?? paletteColors.text }}>app</span>
            <span style={{ color: paletteColors.orp }}>r</span>
            <span style={{ color: state.customTextColor ?? paletteColors.text }}>endre</span>
          </div>
        </section>

        {/* ── Police de lecture ────────────────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Police de lecture</h3>
          <div className={styles.fontGrid}>
            {FONTS.map(f => (
              <button
                key={f.value}
                className={`${styles.fontBtn} ${state.font === f.value ? styles.active : ''}`}
                onClick={() => setFont(f.value)}
                aria-pressed={state.font === f.value}
              >
                <span className={styles.fontSample} style={{ fontFamily: f.family }}>Aa</span>
                <span className={styles.fontLabel}>{f.label}</span>
                <span className={styles.fontSub}>{f.sub}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Taille du mot ────────────────────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Taille du mot</h3>
          <div className={styles.sizeGroup}>
            {SIZES.map(s => (
              <button
                key={s.value}
                className={`${styles.sizeBtn} ${state.wordSize === s.value ? styles.active : ''}`}
                onClick={() => setSize(s.value)}
                aria-pressed={state.wordSize === s.value}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Raccourcis clavier ───────────────────────────── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Raccourcis clavier</h3>
          <dl className={styles.shortcuts}>
            <div className={styles.shortcut}><dt><kbd>Espace</kbd></dt><dd>Play / Pause</dd></div>
            <div className={styles.shortcut}><dt><kbd>→</kbd></dt><dd>+5 mots</dd></div>
            <div className={styles.shortcut}><dt><kbd>←</kbd></dt><dd>−5 mots</dd></div>
            <div className={styles.shortcut}><dt><kbd>↑</kbd></dt><dd>WPM +25</dd></div>
            <div className={styles.shortcut}><dt><kbd>↓</kbd></dt><dd>WPM −25</dd></div>
          </dl>
        </section>

        {/* ── Danger zone ─────────────────────────────────── */}
        <section className={styles.section}>
          <button className={styles.resetBtn} onClick={handleReset}>
            Effacer les données et changer de livre
          </button>
        </section>
      </div>
    </>
  )
}
