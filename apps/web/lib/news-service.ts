import { z } from 'zod'

// News API response schema
const newsArticleSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  publishedAt: z.string().datetime(),
  source: z.object({
    name: z.string()
  })
})

const newsResponseSchema = z.object({
  articles: z.array(newsArticleSchema)
})

type NewsArticle = z.infer<typeof newsArticleSchema>

// Categories we're interested in
const CATEGORIES = [
  'crypto',
  'technology',
  'business',
  'sports',
  'entertainment',
  'politics'
] as const

export class NewsService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = 'https://newsapi.org/v2'
  }

  async getLatestNews(category: typeof CATEGORIES[number], hours: number = 24): Promise<NewsArticle[]> {
    try {
      const fromDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
      
      const response = await fetch(
        `${this.baseUrl}/everything?` + 
        `q=${encodeURIComponent(category)}` +
        `&from=${fromDate}` +
        `&sortBy=publishedAt` +
        `&language=en` +
        `&apiKey=${this.apiKey}`,
        { next: { revalidate: 3600 } } // Cache for 1 hour
      )

      if (!response.ok) {
        throw new Error(`News API error: ${response.statusText}`)
      }

      const data = await response.json()
      const parsed = newsResponseSchema.parse(data)
      return parsed.articles
    } catch (error) {
      console.error('Failed to fetch news:', error)
      return []
    }
  }

  async validateMarket(question: string, description: string): Promise<{
    isValid: boolean
    reason?: string
  }> {
    try {
      // Search news for keywords from the question
      const keywords = this.extractKeywords(question)
      const articles = await this.getLatestNews(keywords.join(' OR '), 168) // Last 7 days
      
      // Check if any article indicates the event has already occurred
      for (const article of articles) {
        const titleMatch = this.checkEventResolution(article.title, question)
        const descMatch = article.description && this.checkEventResolution(article.description, question)
        
        if (titleMatch || descMatch) {
          return {
            isValid: false,
            reason: `Event already occurred according to: ${article.url}`
          }
        }
      }
      
      return { isValid: true }
    } catch (error) {
      console.error('Market validation error:', error)
      return { isValid: true } // Default to valid if validation fails
    }
  }

  private extractKeywords(text: string): string[] {
    // Remove common words and extract key terms
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !['will', 'the', 'and', 'for', 'that', 'this'].includes(word)
      )
  }

  private checkEventResolution(text: string, question: string): boolean {
    // Convert both to lowercase for comparison
    const normalizedText = text.toLowerCase()
    const normalizedQuestion = question.toLowerCase()
    
    // Extract the main event from the question (usually after "Will")
    const event = normalizedQuestion.split('will ')[1]?.split('?')[0]
    if (!event) return false
    
    // Check if the news text indicates the event has occurred
    const pastTenseIndicators = [
      'announced',
      'launched',
      'released',
      'completed',
      'acquired',
      'merged',
      'approved',
      'won',
      'reached',
      'achieved',
      'signed'
    ]
    
    return pastTenseIndicators.some(indicator => 
      normalizedText.includes(indicator) && 
      this.textSimilarity(normalizedText, event) > 0.7
    )
  }

  private textSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity between word sets
    const words1 = new Set(text1.split(/\s+/))
    const words2 = new Set(text2.split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }
}

// Export singleton instance
export const newsService = new NewsService(process.env.NEWS_API_KEY || '')
