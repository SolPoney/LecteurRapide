import { createContext, useContext, useReducer, useEffect } from 'react'
import { appReducer, INITIAL_STATE, ACTION } from './appStore'
import { loadSession, saveSession } from '@/utils/storage'
import { PALETTES } from '@/styles/palettes'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE)

  // ── Restore persisted session on mount ───────────────────
  useEffect(() => {
    const session = loadSession()
    if (session) {
      dispatch({ type: ACTION.RESTORE_SESSION, payload: session })
    }
  }, [])

  // ── Persist session on relevant state changes ─────────────
  useEffect(() => {
    if (!state.book) return
    saveSession({
      chapterIndex:    state.chapterIndex,
      wordIndex:       state.wordIndex,
      wpm:             state.wpm,
      theme:           state.theme,
      font:            state.font,
      wordSize:        state.wordSize,
      palette:         state.palette,
      customBarColor:  state.customBarColor,
      customTextColor: state.customTextColor,
    })
  }, [
    state.book,
    state.chapterIndex,
    state.wordIndex,
    state.wpm,
    state.theme,
    state.font,
    state.wordSize,
    state.palette,
    state.customBarColor,
    state.customTextColor,
  ])

  // ── Apply theme to <html> ─────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme)
  }, [state.theme])

  // ── Apply reading font ────────────────────────────────────
  useEffect(() => {
    const fontMap = {
      sans:     'var(--font-sans)',
      serif:    'var(--font-serif)',
      mono:     'var(--font-mono)',
      dyslexic: 'var(--font-dyslexic)',
      luciole:  'var(--font-luciole)',
    }
    document.documentElement.style.setProperty(
      '--font-reading',
      fontMap[state.font] ?? fontMap.sans
    )
  }, [state.font])

  // ── Apply color palette + custom overrides to CSS vars ───
  useEffect(() => {
    const palette = PALETTES[state.palette] ?? PALETTES.default
    const isDark  = state.theme === 'dark'
    const base    = isDark && palette.dark ? palette.dark : palette

    const root = document.documentElement
    root.style.setProperty('--color-word-bg',  base.bg)
    root.style.setProperty('--color-word-text', state.customTextColor ?? base.text)
    root.style.setProperty('--color-orp',       base.orp)

    // Custom bar color overrides --color-primary (progress bars, play button, slider)
    const barColor = state.customBarColor ?? base.primary ?? null
    if (barColor) {
      root.style.setProperty('--color-primary', barColor)
    } else {
      // Restore theme default
      root.style.removeProperty('--color-primary')
    }
  }, [state.palette, state.theme, state.customBarColor, state.customTextColor])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
