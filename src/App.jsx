import { useApp } from '@/store/AppContext'
import { BookImporter } from '@/components/reader/BookImporter'
import { ReaderView } from '@/components/reader/ReaderView'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import styles from './App.module.css'

export default function App() {
  const { state } = useApp()

  return (
    <div className={`app ${styles.app}`}>
      <BookProgressBar />
      {state.book ? <ReaderView /> : <BookImporter />}
      {state.showSettings && <SettingsPanel />}
    </div>
  )
}

function BookProgressBar() {
  const { state } = useApp()
  if (!state.book) return null

  const totalWords = state.book.chapters.reduce((s, c) => s + c.words.length, 0)
  const wordsBeforeChapter = state.book.chapters
    .slice(0, state.chapterIndex)
    .reduce((s, c) => s + c.words.length, 0)
  const wordsRead = wordsBeforeChapter + state.wordIndex
  const percent = totalWords > 0 ? (wordsRead / totalWords) * 100 : 0

  return (
    <div
      className={styles.bookProgress}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progression du livre"
    >
      <div className={styles.bookProgressFill} style={{ width: `${percent}%` }} />
    </div>
  )
}
