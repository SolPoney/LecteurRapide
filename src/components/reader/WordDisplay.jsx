import { useMemo, useRef, useEffect } from 'react'
import { splitWordAtOrp } from '@/engine/rsvp'
import styles from './WordDisplay.module.css'

/**
 * WordDisplay — RSVP word rendering zone.
 *
 * Splits the word into [before | pivot | after] and aligns
 * the pivot letter on the fixed ORP vertical axis.
 * The pivot letter is rendered in red (#DC2626 / #EF4444).
 */
export function WordDisplay({ word, wordSize = 'md' }) {
  const { before, pivot, after } = useMemo(() => splitWordAtOrp(word), [word])
  const displayRef = useRef(null)

  // Flash animation on word change
  useEffect(() => {
    const el = displayRef.current
    if (!el) return
    el.classList.remove(styles.flash)
    // Force reflow to restart animation
    void el.offsetWidth
    el.classList.add(styles.flash)
  }, [word])

  return (
    <div
      className={`${styles.zone} ${styles[`size-${wordSize}`]}`}
      aria-live="polite"
      aria-label={word}
    >
      {/* Fixed vertical fixation guide */}
      <div className={styles.fixationLine} aria-hidden="true" />

      <div className={styles.wordWrapper} ref={displayRef}>
        <div className={styles.wordRow}>
          {/* Letters before pivot — right-aligned */}
          <span className={styles.before} aria-hidden="true">{before}</span>

          {/* Pivot letter — ORP focal point, RED */}
          <span className={styles.pivot} aria-hidden="true">{pivot}</span>

          {/* Letters after pivot — left-aligned */}
          <span className={styles.after} aria-hidden="true">{after}</span>
        </div>
      </div>
    </div>
  )
}
