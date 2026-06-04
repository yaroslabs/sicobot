import type { Category, Subtopic, ClassificationResult } from '../types'

const CONFIDENCE_THRESHOLD = 3
const STOPWORDS = new Set([
  'de', 'la', 'el', 'en', 'y', 'a', 'que', 'es', 'se', 'no', 'un', 'una',
  'con', 'por', 'para', 'los', 'las', 'del', 'al', 'le', 'lo', 'me', 'mi',
  'su', 'si', 'como', 'pero', 'hay', 'tiene', 'son', 'está', 'esta', 'este',
  'eso', 'ese', 'esa', 'o', 'e', 'u', 'ni', 'que', 'cual', 'cuando',
  'donde', 'quien', 'cuál', 'cómo', 'qué', 'sobre', 'más', 'muy',
])

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

function scoreText(queryTokens: string[], normalizedQuery: string, keywords: string[], name: string): number {
  let score = 0

  for (const keyword of keywords) {
    const nk = normalize(keyword)
    if (normalizedQuery.includes(nk)) {
      // Longer keywords are more specific
      score += nk.length > 7 ? 4 : nk.length > 4 ? 3 : 2
    }
  }

  // Also match against the entity name tokens
  const nameTokens = tokenize(name)
  for (const nt of nameTokens) {
    if (nt.length > 3 && queryTokens.includes(nt)) {
      score += 2
    }
  }

  // Partial token overlap from query against keywords
  for (const qt of queryTokens) {
    for (const keyword of keywords) {
      const nk = normalize(keyword)
      if (qt.length > 3 && nk.includes(qt)) {
        score += 1
      }
    }
  }

  return score
}

export function classifyQuery(
  query: string,
  categories: Category[],
  subtopics: Subtopic[]
): ClassificationResult {
  if (!query.trim() || categories.length === 0) {
    return { confident: false, suggestedCategories: categories, score: 0 }
  }

  const normalizedQuery = normalize(query)
  const queryTokens = tokenize(query)

  // Score every category
  const categoryScores = categories
    .map((cat) => ({
      category: cat,
      score: scoreText(queryTokens, normalizedQuery, cat.keywords, cat.name),
    }))
    .sort((a, b) => b.score - a.score)

  const topResult = categoryScores[0]

  if (!topResult || topResult.score === 0) {
    return {
      confident: false,
      suggestedCategories: categories,
      score: 0,
    }
  }

  if (topResult.score >= CONFIDENCE_THRESHOLD) {
    const catSubtopics = subtopics.filter(
      (s) => s.categoryId === topResult.category.id
    )

    // Score subtopics within the top category
    const subtopicScores = catSubtopics
      .map((sub) => ({
        subtopic: sub,
        score: scoreText(queryTokens, normalizedQuery, sub.keywords, sub.name),
      }))
      .sort((a, b) => b.score - a.score)

    return {
      confident: true,
      topCategory: topResult.category,
      suggestedSubtopics: subtopicScores.map((s) => s.subtopic),
      score: topResult.score,
    }
  }

  // Low confidence — return top 4 categories
  return {
    confident: false,
    suggestedCategories: categoryScores.slice(0, 4).map((r) => r.category),
    score: topResult.score,
  }
}

export function getSubtopicsForCategory(
  categoryId: string,
  subtopics: Subtopic[]
): Subtopic[] {
  return subtopics
    .filter((s) => s.categoryId === categoryId)
    .sort((a, b) => a.order - b.order)
}
