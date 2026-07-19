/**
 * Tests unitaires — Moteur RSVP
 * Couverture :
 *   1. Algorithme ORP (getOrpIndex / splitWordAtOrp)
 *   2. Conversion WPM → millisecondes
 *   3. Multiplicateurs de ponctuation (getWordDelay)
 *   4. Navigation d'index (clampIndex / advancePosition)
 *   5. Tokenisation (tokenise)
 */

import { describe, it, expect } from 'vitest'
import {
  getOrpIndex,
  splitWordAtOrp,
  wpmToMs,
  getWordDelay,
  clampIndex,
  advancePosition,
  tokenise,
} from './rsvp'

// ────────────────────────────────────────────────────────────────────────────
// 1. ORP — getOrpIndex
// ────────────────────────────────────────────────────────────────────────────
describe('getOrpIndex', () => {
  it('retourne 0 pour un mot d\'une lettre', () => {
    expect(getOrpIndex('a')).toBe(0)
  })

  it('retourne 0 pour un mot de 2 lettres', () => {
    expect(getOrpIndex('le')).toBe(0)
  })

  it('retourne 1 pour un mot de 3–5 lettres', () => {
    expect(getOrpIndex('mot')).toBe(1)   // 3
    expect(getOrpIndex('lire')).toBe(1)  // 4
    expect(getOrpIndex('livre')).toBe(1) // 5
  })

  it('retourne 1 pour un mot de 6 lettres', () => {
    expect(getOrpIndex('rapide')).toBe(1)
  })

  it('retourne 2 pour les mots de 7–9 lettres', () => {
    expect(getOrpIndex('lecture')).toBe(2)  // 7
    expect(getOrpIndex('lectures')).toBe(2) // 8
  })

  it('retourne 3 pour les mots de 10–12 lettres', () => {
    expect(getOrpIndex('compression')).toBe(3)  // 11
    expect(getOrpIndex('performance!')).toBe(3) // 12 avec ponctuation
  })

  it('retourne 4 pour les mots de 13+ lettres', () => {
    expect(getOrpIndex('extraordinaire')).toBe(4) // 14
    expect(getOrpIndex('incompréhensible')).toBe(4)
  })

  it('ignore les caractères non-alpha pour le calcul de longueur', () => {
    // "bien," → "bien" = 4 lettres → pivot 1
    expect(getOrpIndex('bien,')).toBe(1)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// 2. ORP — splitWordAtOrp
// ────────────────────────────────────────────────────────────────────────────
describe('splitWordAtOrp', () => {
  it('split correct pour un mot court (3 lettres)', () => {
    const r = splitWordAtOrp('mot')
    expect(r).toEqual({ before: 'm', pivot: 'o', after: 't' })
  })

  it('split correct pour un mot de 6 lettres', () => {
    const r = splitWordAtOrp('rapide')
    expect(r).toEqual({ before: 'r', pivot: 'a', after: 'pide' })
  })

  it('split correct pour un mot de 9 lettres', () => {
    // "ordinaire" = 9 lettres → pivot index 3 → before='ord', pivot='i', after='naire'
    const r = splitWordAtOrp('ordinaire')
    expect(r).toEqual({ before: 'ord', pivot: 'i', after: 'naire' })
  })

  it('split correct pour un mot avec ponctuation', () => {
    const r = splitWordAtOrp('lire.')
    // "lire." → longueur alphanumérique = 4 → pivot 1 → before: "l", pivot: "i", after: "re."
    expect(r.before + r.pivot + r.after).toBe('lire.')
    expect(r.pivot).toBe('i')
  })

  it('le mot complet est reconstituable depuis before+pivot+after', () => {
    const words = ['a', 'le', 'lit', 'livre', 'rapide', 'lecture', 'extraordinaire']
    for (const w of words) {
      const { before, pivot, after } = splitWordAtOrp(w)
      expect(before + pivot + after).toBe(w)
    }
  })
})

// ────────────────────────────────────────────────────────────────────────────
// 3. WPM → ms
// ────────────────────────────────────────────────────────────────────────────
describe('wpmToMs', () => {
  it('300 WPM → 200 ms', () => {
    expect(wpmToMs(300)).toBe(200)
  })

  it('600 WPM → 100 ms', () => {
    expect(wpmToMs(600)).toBe(100)
  })

  it('100 WPM → 600 ms', () => {
    expect(wpmToMs(100)).toBe(600)
  })

  it('1 WPM → 60 000 ms', () => {
    expect(wpmToMs(1)).toBe(60_000)
  })

  it('lève une erreur pour 0 WPM', () => {
    expect(() => wpmToMs(0)).toThrow(RangeError)
  })

  it('lève une erreur pour WPM négatif', () => {
    expect(() => wpmToMs(-100)).toThrow(RangeError)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// 4. Délais de ponctuation — getWordDelay
// ────────────────────────────────────────────────────────────────────────────
describe('getWordDelay', () => {
  const WPM = 300  // base = 200 ms

  it('mot sans ponctuation → délai de base', () => {
    expect(getWordDelay('bonjour', WPM)).toBe(200)
  })

  it('mot terminé par "." → délai ×1.8', () => {
    expect(getWordDelay('fin.', WPM)).toBe(360)
  })

  it('mot terminé par "," → délai ×1.8', () => {
    expect(getWordDelay('alors,', WPM)).toBe(360)
  })

  it('mot terminé par "!" → délai ×1.8', () => {
    expect(getWordDelay('incroyable!', WPM)).toBe(360)
  })

  it('mot terminé par "?" → délai ×1.8', () => {
    expect(getWordDelay('vraiment?', WPM)).toBe(360)
  })

  it('mot terminé par ";" → délai ×1.8', () => {
    expect(getWordDelay('soit;', WPM)).toBe(360)
  })

  it('mot terminé par ":" → délai ×1.8', () => {
    expect(getWordDelay('résultat:', WPM)).toBe(360)
  })

  it('mot terminé par "-" → délai ×1.2 (ponctuation faible)', () => {
    expect(getWordDelay('mot-', WPM)).toBe(240)
  })

  it('délai toujours entier (arrondi)', () => {
    // 250 WPM → base = 240 ms ; avec "." → 240*1.8 = 432 ms
    expect(Number.isInteger(getWordDelay('fin.', 250))).toBe(true)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// 5. clampIndex
// ────────────────────────────────────────────────────────────────────────────
describe('clampIndex', () => {
  it('retourne l\'index si dans les bornes', () => {
    expect(clampIndex(5, 10)).toBe(5)
  })

  it('retourne 0 si index négatif', () => {
    expect(clampIndex(-3, 10)).toBe(0)
  })

  it('retourne maxIndex si index dépasse', () => {
    expect(clampIndex(15, 10)).toBe(10)
  })

  it('accepte l\'index exactement égal à maxIndex', () => {
    expect(clampIndex(10, 10)).toBe(10)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// 6. advancePosition
// ────────────────────────────────────────────────────────────────────────────
describe('advancePosition', () => {
  const chapters = [
    { words: Array(10).fill('a') },  // ch.0 : 10 mots
    { words: Array(5).fill('b')  },  // ch.1 : 5 mots
    { words: Array(8).fill('c')  },  // ch.2 : 8 mots
  ]

  it('avance de 5 mots dans le même chapitre', () => {
    const r = advancePosition({ chapterIndex: 0, wordIndex: 0 }, chapters, 5)
    expect(r).toEqual({ chapterIndex: 0, wordIndex: 5 })
  })

  it('recule de 3 mots dans le même chapitre', () => {
    const r = advancePosition({ chapterIndex: 1, wordIndex: 4 }, chapters, -3)
    expect(r).toEqual({ chapterIndex: 1, wordIndex: 1 })
  })

  it('passe au chapitre suivant en avançant', () => {
    // ch.0 mot 8, +5 → 8+5 = 13 → 10 dépassement de ch.0, 3 dans ch.1
    const r = advancePosition({ chapterIndex: 0, wordIndex: 8 }, chapters, 5)
    expect(r).toEqual({ chapterIndex: 1, wordIndex: 3 })
  })

  it('revient au chapitre précédent en reculant', () => {
    // ch.1 mot 1, -3 → 1-3 = -2 → ch.0, 10+(-2)=8
    const r = advancePosition({ chapterIndex: 1, wordIndex: 1 }, chapters, -3)
    expect(r).toEqual({ chapterIndex: 0, wordIndex: 8 })
  })

  it('ne dépasse pas le début du premier chapitre', () => {
    const r = advancePosition({ chapterIndex: 0, wordIndex: 2 }, chapters, -100)
    expect(r).toEqual({ chapterIndex: 0, wordIndex: 0 })
  })

  it('ne dépasse pas la fin du dernier chapitre', () => {
    const r = advancePosition({ chapterIndex: 2, wordIndex: 5 }, chapters, 100)
    expect(r).toEqual({ chapterIndex: 2, wordIndex: 7 }) // maxIndex = 8-1 = 7
  })
})

// ────────────────────────────────────────────────────────────────────────────
// 7. tokenise
// ────────────────────────────────────────────────────────────────────────────
describe('tokenise', () => {
  it('split un texte simple en mots', () => {
    expect(tokenise('bonjour le monde')).toEqual(['bonjour', 'le', 'monde'])
  })

  it('filtre les espaces multiples', () => {
    expect(tokenise('un   deux    trois')).toEqual(['un', 'deux', 'trois'])
  })

  it('préserve la ponctuation attachée aux mots', () => {
    expect(tokenise('Hello, world!')).toEqual(['Hello,', 'world!'])
  })

  it('retourne un tableau vide pour une chaîne vide', () => {
    expect(tokenise('')).toEqual([])
  })

  it('filtre les chaînes blanches', () => {
    expect(tokenise('   ')).toEqual([])
  })

  it('filtre les URLs http://', () => {
    expect(tokenise('http://www.example.com bonjour')).toEqual(['bonjour'])
  })

  it('filtre les URLs www.', () => {
    expect(tokenise('www.ebooksgratu.fr lecture')).toEqual(['lecture'])
  })

  it('filtre les tokens composés uniquement de ponctuation', () => {
    expect(tokenise('— · • bonjour')).toEqual(['bonjour'])
  })

  it('filtre les tokens pathologiquement longs (>40 chars)', () => {
    const long = 'a'.repeat(41)
    expect(tokenise(`normal ${long} mot`)).toEqual(['normal', 'mot'])
  })
})
