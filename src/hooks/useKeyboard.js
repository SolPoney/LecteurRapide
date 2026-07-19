import { useEffect } from 'react'
import { useApp } from '@/store/AppContext'
import { ACTION } from '@/store/appStore'

/**
 * useKeyboard
 *
 * Global keyboard shortcuts for RSVP playback control.
 *
 * Space        → Play / Pause
 * ArrowRight   → +5 words
 * ArrowLeft    → -5 words
 * ArrowUp      → WPM +25
 * ArrowDown    → WPM -25
 */
export function useKeyboard() {
  const { state, dispatch } = useApp()

  useEffect(() => {
    function handleKey(e) {
      // Don't intercept when user is typing in an input
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) return

      if (!state.book) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          dispatch({ type: ACTION.SET_PLAYING, payload: !state.isPlaying })
          break

        case 'ArrowRight':
          e.preventDefault()
          dispatch({ type: ACTION.SKIP_WORDS, payload: 5 })
          break

        case 'ArrowLeft':
          e.preventDefault()
          dispatch({ type: ACTION.SKIP_WORDS, payload: -5 })
          break

        case 'ArrowUp':
          e.preventDefault()
          dispatch({ type: ACTION.SET_WPM, payload: state.wpm + 25 })
          break

        case 'ArrowDown':
          e.preventDefault()
          dispatch({ type: ACTION.SET_WPM, payload: state.wpm - 25 })
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [state.book, state.isPlaying, state.wpm, dispatch])
}
