/**
 * localStorage persistence — graceful fallback for private mode
 */

const SESSION_KEY = 'lecteurrapide:session'
const BOOK_KEY    = 'lecteurrapide:book'

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage quota exceeded or private mode — silent fail
  }
}

export function saveSession(data) {
  safeSet(SESSION_KEY, data)
}

export function loadSession() {
  return safeGet(SESSION_KEY)
}

export function saveBook(bookData) {
  safeSet(BOOK_KEY, bookData)
}

export function loadBook() {
  return safeGet(BOOK_KEY)
}

export function clearStorage() {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(BOOK_KEY)
  } catch {
    // silent
  }
}
