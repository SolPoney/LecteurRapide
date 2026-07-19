/**
 * LecteurRapide — Application State Store
 *
 * Central state managed with useReducer + Context.
 * No external state library needed for this SPA scope.
 */

export const INITIAL_STATE = {
  // ── Book data ──────────────────────────────────────────
  book: null,           // { title, author, chapters: [{ title, words: string[] }] }
  chapterIndex: 0,      // current chapter index
  wordIndex: 0,         // current word index within chapter

  // ── Playback ───────────────────────────────────────────
  isPlaying: false,
  wpm: 300,             // words per minute (100–2000)

  // ── UI Preferences ─────────────────────────────────────
  theme: 'light',       // 'light' | 'dark'
  font: 'sans',         // 'sans' | 'serif' | 'mono' | 'dyslexic' | 'luciole'
  wordSize: 'md',       // 'sm' | 'md' | 'lg'
  palette: 'default',   // clé dans PALETTES
  customBarColor: null, // null = couleur de la palette | '#rrggbb' = couleur perso
  customTextColor: null,// null = couleur de la palette | '#rrggbb' = couleur perso
  showSettings: false,

  // ── Status ─────────────────────────────────────────────
  isLoading: false,
  error: null,
}

export const ACTION = {
  LOAD_BOOK:         'LOAD_BOOK',
  SET_LOADING:       'SET_LOADING',
  SET_ERROR:         'SET_ERROR',
  SET_PLAYING:       'SET_PLAYING',
  SET_WPM:           'SET_WPM',
  SET_WORD_INDEX:    'SET_WORD_INDEX',
  SET_CHAPTER:       'SET_CHAPTER',
  SKIP_WORDS:        'SKIP_WORDS',
  SET_THEME:         'SET_THEME',
  SET_FONT:          'SET_FONT',
  SET_WORD_SIZE:     'SET_WORD_SIZE',
  SET_PALETTE:          'SET_PALETTE',
  SET_CUSTOM_BAR_COLOR:  'SET_CUSTOM_BAR_COLOR',
  SET_CUSTOM_TEXT_COLOR: 'SET_CUSTOM_TEXT_COLOR',
  TOGGLE_SETTINGS:   'TOGGLE_SETTINGS',
  RESTORE_SESSION:   'RESTORE_SESSION',
}

/**
 * Pure reducer — no side effects.
 * All localStorage persistence is handled by a dedicated hook.
 */
export function appReducer(state, action) {
  switch (action.type) {

    case ACTION.LOAD_BOOK:
      return {
        ...state,
        book: action.payload,
        chapterIndex: 0,
        wordIndex: 0,
        isPlaying: false,
        isLoading: false,
        error: null,
      }

    case ACTION.SET_LOADING:
      return { ...state, isLoading: action.payload, error: null }

    case ACTION.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false }

    case ACTION.SET_PLAYING:
      return { ...state, isPlaying: action.payload }

    case ACTION.SET_WPM:
      return {
        ...state,
        wpm: Math.min(2000, Math.max(100, action.payload)),
      }

    case ACTION.SET_WORD_INDEX: {
      const chapter = state.book?.chapters[state.chapterIndex]
      if (!chapter) return state
      const clamped = Math.min(chapter.words.length - 1, Math.max(0, action.payload))
      return { ...state, wordIndex: clamped }
    }

    case ACTION.SKIP_WORDS: {
      const chapter = state.book?.chapters[state.chapterIndex]
      if (!chapter) return state
      const next = Math.min(
        chapter.words.length - 1,
        Math.max(0, state.wordIndex + action.payload)
      )
      return { ...state, wordIndex: next }
    }

    case ACTION.SET_CHAPTER: {
      if (!state.book) return state
      const clamped = Math.min(
        state.book.chapters.length - 1,
        Math.max(0, action.payload)
      )
      return { ...state, chapterIndex: clamped, wordIndex: 0, isPlaying: false }
    }

    case ACTION.SET_THEME:
      return { ...state, theme: action.payload }

    case ACTION.SET_FONT:
      return { ...state, font: action.payload }

    case ACTION.SET_WORD_SIZE:
      return { ...state, wordSize: action.payload }

    case ACTION.SET_PALETTE:
      return { ...state, palette: action.payload }

    case ACTION.SET_CUSTOM_BAR_COLOR:
      return { ...state, customBarColor: action.payload }

    case ACTION.SET_CUSTOM_TEXT_COLOR:
      return { ...state, customTextColor: action.payload }

    case ACTION.TOGGLE_SETTINGS:
      return { ...state, showSettings: !state.showSettings }

    case ACTION.RESTORE_SESSION:
      return { ...state, ...action.payload }

    default:
      return state
  }
}
