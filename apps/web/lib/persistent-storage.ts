import fs from 'fs'
import path from 'path'

// Storage file paths
const STORAGE_DIR = path.join(process.cwd(), '.storage')
const MARKETS_FILE = path.join(STORAGE_DIR, 'markets.json')
const USERS_FILE = path.join(STORAGE_DIR, 'users.json')
const BETS_FILE = path.join(STORAGE_DIR, 'bets.json')
const FOMO_MARKETS_FILE = path.join(STORAGE_DIR, 'fomo-markets.json')

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true })
}

// Types
export interface User {
  id: string
  walletAddress: string
  role: string
  pointsBalance: number
  creditedInitial: boolean
  ipHash: string
  displayName?: string
  profilePicture?: string
  createdAt: Date
  totalBets: number
  totalWagered: number
  marketsCreated: number
}

export interface Market {
  id: string
  question: string
  description: string
  category: string
  image?: string
  slug: string
  status: 'OPEN' | 'CLOSED'
  yesPool: number
  noPool: number
  createdAt: Date
  closesAt: Date
  createdBy: string
}

export interface Bet {
  id: string
  userId: string
  marketId: string
  side: 'YES' | 'NO'
  amount: number
  createdAt: Date
}

// Interface for persistent storage
export interface IPersistentStorage<T> {
  get(key: string): T | undefined
  set(key: string, value: T): void
  delete(key: string): boolean
  has(key: string): boolean
  keys(): IterableIterator<string>
  values(): IterableIterator<T>
  entries(): IterableIterator<[string, T]>
  readonly size: number
  clear(): void
  getAll(): Map<string, T>
}

// Persistent storage class
class PersistentStorage<T> implements IPersistentStorage<T> {
  private filePath: string
  private cache: Map<string, T> = new Map()
  private loaded = false

  constructor(filePath: string) {
    this.filePath = filePath
  }

  private load() {
    if (this.loaded) return
    
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8')
        const parsed = JSON.parse(data)
        
        // Convert back to Map and restore Date objects
        for (const [key, value] of Object.entries(parsed)) {
          const item = value as any
          // Restore Date objects
          if (item.createdAt) item.createdAt = new Date(item.createdAt)
          if (item.closesAt) item.closesAt = new Date(item.closesAt)
          
          this.cache.set(key, item as T)
        }
        console.log(`📁 Loaded ${this.cache.size} items from ${path.basename(this.filePath)}`)
      }
    } catch (error) {
      console.error(`Failed to load ${this.filePath}:`, error)
    }
    
    this.loaded = true
  }

  private save() {
    try {
      const data = Object.fromEntries(this.cache.entries())
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error(`Failed to save ${this.filePath}:`, error)
    }
  }

  get(key: string): T | undefined {
    this.load()
    return this.cache.get(key)
  }

  set(key: string, value: T): void {
    this.load()
    this.cache.set(key, value)
    this.save()
  }

  delete(key: string): boolean {
    this.load()
    const result = this.cache.delete(key)
    if (result) this.save()
    return result
  }

  has(key: string): boolean {
    this.load()
    return this.cache.has(key)
  }

  keys(): IterableIterator<string> {
    this.load()
    return this.cache.keys()
  }

  values(): IterableIterator<T> {
    this.load()
    return this.cache.values()
  }

  entries(): IterableIterator<[string, T]> {
    this.load()
    return this.cache.entries()
  }

  get size(): number {
    this.load()
    return this.cache.size
  }

  clear(): void {
    this.load()
    this.cache.clear()
    this.save()
  }

  // Get all as Map for compatibility
  getAll(): Map<string, T> {
    this.load()
    return new Map(this.cache)
  }
}

// Export persistent storage instances
export const persistentUsers = new PersistentStorage<User>(USERS_FILE)
export const persistentMarkets = new PersistentStorage<Market>(MARKETS_FILE)
export const persistentBets = new PersistentStorage<Bet>(BETS_FILE)
export const persistentFomoMarkets = new PersistentStorage<Market>(FOMO_MARKETS_FILE)
