import { useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/store/AppContext'
import { ACTION } from '@/store/appStore'
import { getWordDelay } from '@/engine/rsvp'

/**
 * useRsvpPlayer
 *
 * Manages the RSVP playback loop via a self-scheduling setTimeout.
 * Pauses automatically at the end of a chapter.
 */
export function useRsvpPlayer() {
  const { state, dispatch } = useApp()
  const timerRef = useRef(null)

  const currentChapter = state.book?.chapters[state.chapterIndex]
  const words = currentChapter?.words ?? []

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // ── Advance to next word ───────────────────────────────────
  const tick = useCallback(() => {
    // Read fresh state via a ref pattern — avoids stale closures
    stop()
  }, [stop])

  useEffect(() => {
    if (!state.isPlaying || words.length === 0) {
      stop()
      return
    }

    const word = words[state.wordIndex] ?? ''
    const delay = getWordDelay(word, state.wpm)

    timerRef.current = setTimeout(() => {
      const nextIndex = state.wordIndex + 1

      if (nextIndex >= words.length) {
        // End of chapter — pause
        dispatch({ type: ACTION.SET_PLAYING, payload: false })
        return
      }

      dispatch({ type: ACTION.SET_WORD_INDEX, payload: nextIndex })
    }, delay)

    return stop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isPlaying, state.wordIndex, state.wpm, words, stop])

  // ── Public controls ────────────────────────────────────────
  const play = useCallback(() => {
    dispatch({ type: ACTION.SET_PLAYING, payload: true })
  }, [dispatch])

  const pause = useCallback(() => {
    dispatch({ type: ACTION.SET_PLAYING, payload: false })
  }, [dispatch])

  const togglePlay = useCallback(() => {
    dispatch({ type: ACTION.SET_PLAYING, payload: !state.isPlaying })
  }, [dispatch, state.isPlaying])

  const skipWords = useCallback((delta) => {
    dispatch({ type: ACTION.SKIP_WORDS, payload: delta })
  }, [dispatch])

  const setChapter = useCallback((index) => {
    dispatch({ type: ACTION.SET_CHAPTER, payload: index })
  }, [dispatch])

  const setWpm = useCallback((wpm) => {
    dispatch({ type: ACTION.SET_WPM, payload: wpm })
  }, [dispatch])

  return {
    play,
    pause,
    togglePlay,
    skipWords,
    setChapter,
    setWpm,
    currentWord: words[state.wordIndex] ?? '',
    wordIndex:   state.wordIndex,
    totalWords:  words.length,
    chapterIndex: state.chapterIndex,
    totalChapters: state.book?.chapters.length ?? 0,
    isPlaying:   state.isPlaying,
    wpm:         state.wpm,
  }
}
