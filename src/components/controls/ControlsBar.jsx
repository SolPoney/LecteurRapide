import { useRef, useCallback } from 'react'
import {
  SkipBack, ChevronLeft, Play, Pause, ChevronRight, SkipForward, Settings,
} from 'lucide-react'
import { useRsvpPlayer } from '@/hooks/useRsvpPlayer'
import { useApp } from '@/store/AppContext'
import { ACTION } from '@/store/appStore'
import styles from './ControlsBar.module.css'

export function ControlsBar() {
  const {
    togglePlay, skipWords, setChapter, setWpm,
    wordIndex, totalWords, chapterIndex, totalChapters,
    isPlaying, wpm,
  } = useRsvpPlayer()

  const { dispatch } = useApp()
  const progressRef = useRef(null)

  const chapterProgress = totalWords > 0 ? (wordIndex / totalWords) * 100 : 0

  // Seek to position clicked on the progress bar
  const seekTo = useCallback((clientX) => {
    const el = progressRef.current
    if (!el || totalWords === 0) return
    const { left, width } = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - left) / width))
    const targetWord = Math.round(ratio * (totalWords - 1))
    dispatch({ type: ACTION.SET_WORD_INDEX, payload: targetWord })
  }, [totalWords, dispatch])

  const handleClick = (e) => seekTo(e.clientX)

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') dispatch({ type: ACTION.SKIP_WORDS, payload: Math.max(1, Math.round(totalWords * 0.05)) })
    if (e.key === 'ArrowLeft')  dispatch({ type: ACTION.SKIP_WORDS, payload: -Math.max(1, Math.round(totalWords * 0.05)) })
  }

  return (
    <footer className={styles.bar} role="toolbar" aria-label="Contrôles de lecture">

      {/* Chapter progress bar — clickable seek bar */}
      <div
        ref={progressRef}
        className={styles.chapterProgress}
        role="slider"
        tabIndex={0}
        aria-valuenow={Math.round(chapterProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progression du chapitre — mot ${wordIndex + 1} sur ${totalWords}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.chapterProgressFill} style={{ width: `${chapterProgress}%` }} />
        {/* Thumb indicator */}
        <div className={styles.chapterProgressThumb} style={{ left: `${chapterProgress}%` }} />
      </div>

      <div className={styles.inner}>
        {/* ── Playback controls ──────────────────────────── */}
        <div className={styles.playbackGroup}>
          <button
            className={styles.btn}
            onClick={() => setChapter(chapterIndex - 1)}
            disabled={chapterIndex === 0}
            aria-label="Chapitre précédent"
            title="Chapitre précédent"
          >
            <SkipBack size={20} />
          </button>

          <button
            className={styles.btn}
            onClick={() => skipWords(-5)}
            aria-label="Reculer de 5 mots"
            title="← Reculer 5 mots"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
            title="Espace"
          >
            {isPlaying
              ? <Pause size={22} fill="currentColor" />
              : <Play  size={22} fill="currentColor" />
            }
          </button>

          <button
            className={styles.btn}
            onClick={() => skipWords(5)}
            aria-label="Avancer de 5 mots"
            title="→ Avancer 5 mots"
          >
            <ChevronRight size={20} />
          </button>

          <button
            className={styles.btn}
            onClick={() => setChapter(chapterIndex + 1)}
            disabled={chapterIndex >= totalChapters - 1}
            aria-label="Chapitre suivant"
            title="Chapitre suivant"
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* ── WPM control ───────────────────────────────── */}
        <div className={styles.wpmGroup}>
          <label htmlFor="wpm-slider" className={styles.wpmLabel}>
            <span aria-live="polite" aria-atomic="true">{wpm}</span>
            <span className={styles.wpmUnit}>WPM</span>
          </label>
          <input
            id="wpm-slider"
            type="range"
            className={styles.wpmSlider}
            min={100}
            max={2000}
            step={25}
            value={wpm}
            onChange={e => {
              setWpm(Number(e.target.value))
              // Release focus after mouse interaction so ←/→ arrow keys
              // return to word navigation instead of staying on the slider
              e.target.blur()
            }}
            onKeyDown={e => {
              // Arrow keys on the slider → WPM ±25, then blur to restore navigation
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault()
                setWpm(wpm + (e.key === 'ArrowUp' ? 25 : -25))
                e.target.blur()
              }
            }}
            aria-label="Vitesse de lecture en mots par minute"
          />
        </div>

        {/* ── Position info ──────────────────────────────── */}
        <div className={styles.position} aria-live="polite" aria-atomic="true">
          <span>{wordIndex + 1} / {totalWords}</span>
          <span className={styles.chapterInfo}>Ch. {chapterIndex + 1}/{totalChapters}</span>
        </div>

        {/* ── Settings ──────────────────────────────────── */}
        <button
          className={styles.btn}
          onClick={() => dispatch({ type: ACTION.TOGGLE_SETTINGS })}
          aria-label="Paramètres"
          title="Paramètres"
        >
          <Settings size={20} />
        </button>
      </div>
    </footer>
  )
}
