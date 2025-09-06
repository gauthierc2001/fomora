import { markets } from '../lib/storage'
import { createHash } from 'crypto'

// Create deterministic market ID
function createMarketId(question: string, category: string, coinSymbol?: string): string {
  // For meme coin markets, use symbol for consistency
  if (coinSymbol && category === 'Memes') {
    return `market_meme_${coinSymbol.toLowerCase()}_pump`
  }
  
  // For other markets, use normalized question
  const normalizedQuestion = question
    .replace(/\$[\d,]+\.?\d*/g, '$PRICE') // Replace any price with $PRICE
    .replace(/[\d,]+\.?\d*%/g, 'X%') // Replace percentages with X%
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  const hash = createHash('sha256').update(normalizedQuestion + category).digest('hex').slice(0, 12)
  return `market_${category.toLowerCase().replace(/\s+/g, '_')}_${hash}`
}

// Function to get crypto data from CoinGecko
async function getCryptoData() {
  try {
    console.log('Fetching live crypto data from CoinGecko...')
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d,30d')
    if (!response.ok) throw new Error('Failed to fetch crypto data')
    const data = await response.json()
    console.log(`Fetched data for ${data.length} cryptocurrencies`)
    return data
  } catch (error) {
    console.error('Error fetching crypto data, using fallback:', error)
    // Fallback data with approximate current prices (September 2024)
    return [
      { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 65000, price_change_percentage_24h: 2.5, market_cap_rank: 1 },
      { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3500, price_change_percentage_24h: 1.8, market_cap_rank: 2 },
      { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 140, price_change_percentage_24h: 3.2, market_cap_rank: 5 },
      { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.12, price_change_percentage_24h: 5.1, market_cap_rank: 8 },
      { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', current_price: 0.000018, price_change_percentage_24h: 7.3, market_cap_rank: 15 },
      { id: 'pepe', symbol: 'pepe', name: 'Pepe', current_price: 0.0000085, price_change_percentage_24h: 12.4, market_cap_rank: 25 }
    ]
  }
}

// Helper function to format price based on the value
function formatPrice(price: number): string {
  if (price < 0.000001) {
    return price.toFixed(8)
  } else if (price < 0.0001) {
    return price.toFixed(6)
  } else if (price < 0.01) {
    return price.toFixed(4)
  } else if (price < 1) {
    return price.toFixed(3)
  } else if (price < 100) {
    return price.toFixed(2)
  } else {
    return Math.round(price).toLocaleString()
  }
}

// Generate realistic price targets based on current price and volatility
function generatePriceTargets(crypto: any) {
  const currentPrice = crypto.current_price
  const change24h = crypto.price_change_percentage_24h || 0
  const volatility = Math.abs(change24h)
  
  // Base multipliers on recent volatility
  const baseMultiplier = 0.05 + (volatility / 100) * 0.02 // 5-7% base change
  
  return {
    bullish: currentPrice * (1 + baseMultiplier + 0.02), // +7-9%
    bearish: currentPrice * (1 - baseMultiplier - 0.01), // -6-8%
    conservative: currentPrice * (1 + baseMultiplier * 0.5), // +2.5-3.5%
    aggressive: currentPrice * (1 + baseMultiplier * 2), // +10-14%
  }
}

// Get appropriate image for market type
function getMarketImage(category: string, question: string, coinSymbol?: string): string {
  const questionLower = question.toLowerCase()
  
  // First check for specific coin mentions in question
  if (questionLower.includes('bitcoin') || questionLower.includes('btc')) {
    return 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
  }
  if (questionLower.includes('ethereum') || questionLower.includes('eth')) {
    return 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
  }
  if (questionLower.includes('solana') || questionLower.includes('sol')) {
    return 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
  }
  if (questionLower.includes('dogecoin') || questionLower.includes('doge')) {
    return 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'
  }
  if (questionLower.includes('shiba') || questionLower.includes('shib')) {
    return 'https://assets.coingecko.com/coins/images/11939/large/shiba.png'
  }
  if (questionLower.includes('pepe')) {
    return 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg'
  }
  
  // Check for specific coin symbols
  if (coinSymbol) {
    const coinImages: Record<string, string> = {
      'btc': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      'eth': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      'sol': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      'doge': 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
      'shib': 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
      'pepe': 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
      'bonk': 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
      'wif': 'https://assets.coingecko.com/coins/images/35087/large/dogwifcoin.jpg',
      'floki': 'https://assets.coingecko.com/coins/images/16746/large/floki.png'
    }
    if (coinImages[coinSymbol]) return coinImages[coinSymbol]
  }

  // Check for specific topics in questions
  if (questionLower.includes('elon') || questionLower.includes('musk')) {
    return 'https://images.unsplash.com/photo-1634912314704-c646c586b131?w=400&h=300&fit=crop'
  }
  if (questionLower.includes('twitter') || questionLower.includes(' x ') || questionLower.includes('tweet')) {
    return 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop'
  }
  if (questionLower.includes('gas fees') || questionLower.includes('gwei')) {
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
  }
  if (questionLower.includes('hack') || questionLower.includes('security')) {
    return 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop'
  }
  if (questionLower.includes('bank') || questionLower.includes('adoption')) {
    return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
  }
  if (questionLower.includes('meme') || questionLower.includes('lambo') || questionLower.includes('hodl') || questionLower.includes('diamond hands')) {
    return 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
  }
  if (questionLower.includes('trend') || questionLower.includes('emoji') || questionLower.includes('influencer')) {
    return 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop'
  }
  if (questionLower.includes('dominance') || questionLower.includes('trading') || questionLower.includes('fear') || questionLower.includes('greed')) {
    return 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop'
  }
  if (questionLower.includes('downtime') || questionLower.includes('network')) {
    return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
  }

  // Fallback by category
  const categoryImages: Record<string, string> = {
    'Memes': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    'Social Media': 'https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400&h=300&fit=crop',
    'Crypto': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
    'Trading': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=300&fit=crop',
    'Technical': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    'Security': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop',
    'Finance': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
  }
  
  return categoryImages[category] || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop'
}

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function getRandomInitialPools() {
  const total = Math.floor(Math.random() * 5000) + 1000 // 1000-6000 total
  const yesRatio = Math.random() * 0.6 + 0.2 // 20% to 80%
  return {
    yesPool: Math.floor(total * yesRatio),
    noPool: Math.floor(total * (1 - yesRatio))
  }
}

export async function populateCryptoMarkets() {
  try {
    console.log('🚀 Starting crypto market population...')
    const cryptoData = await getCryptoData()
    console.log(`📊 Fetched ${cryptoData.length} cryptocurrencies`)
    const now = new Date()
  const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000)
  const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000)
  const in60Minutes = new Date(now.getTime() + 60 * 60 * 1000)
  const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000)
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  // Current world events, news, and trending markets (24-48 hour duration)
  const specialMarkets = [
    // News & Current Events
    {
      question: "Will any major tech company announce layoffs tomorrow?",
      description: "Tech sector continues restructuring amid economic uncertainty.",
      category: "Business",
      closesAt: in24Hours
    },
    {
      question: "Will oil prices rise above $90/barrel in the next 24 hours?",
      description: "Geopolitical tensions and supply concerns affecting oil markets.",
      category: "Finance", 
      closesAt: in24Hours
    },
    {
      question: "Will S&P 500 close green tomorrow?",
      description: "Stock market volatility amid economic data releases and earnings.",
      category: "Finance",
      closesAt: in24Hours
    },
    {
      question: "Will any country announce new crypto regulations in 48 hours?",
      description: "Global regulatory landscape constantly evolving with new announcements.",
      category: "Politics",
      closesAt: in48Hours
    },

    // Memes & Internet Culture
    {
      question: "Will 'Ohio' be mentioned in 10,000+ TikTok videos this week?",
      description: "Gen Z's favorite way to describe anything weird or chaotic.",
      category: "Memes",
      closesAt: in48Hours
    },
    {
      question: "Will someone try to explain NFTs to their grandparents on TikTok today?",
      description: "Peak boomer vs zoomer financial education content.",
      category: "Memes",
      closesAt: in24Hours
    },
    {
      question: "Will 'rizz' make it into a mainstream news headline this week?",
      description: "Gen Z slang infiltration into traditional media continues.",
      category: "Memes",
      closesAt: in48Hours
    },
    {
      question: "Will any politician use 'no cap' in an official statement today?",
      description: "Politicians desperately trying to connect with young voters.",
      category: "Politics",
      closesAt: in24Hours
    },
    {
      question: "Will someone create a cryptocurrency called 'SkibidiCoin' this week?",
      description: "Peak brainrot meets crypto innovation.",
      category: "Memes",
      closesAt: in48Hours
    },

    // Wars & Global Conflicts
    {
      question: "Will any country's military tweet something cringe today?",
      description: "Military social media accounts and their questionable meme attempts.",
      category: "Politics",
      closesAt: in24Hours
    },
    {
      question: "Will a peace treaty be announced anywhere in the world this week?",
      description: "Optimistic but who knows in this timeline.",
      category: "Politics",
      closesAt: in48Hours
    },
    {
      question: "Will any world leader communicate via meme instead of official statement?",
      description: "2024 diplomacy has entered the chat.",
      category: "Politics",
      closesAt: in24Hours
    },

    // Weird News & Strange Events
    {
      question: "Will someone claim they saw aliens and get trending today?",
      description: "UFO sightings are so hot right now.",
      category: "Weird",
      closesAt: in24Hours
    },
    {
      question: "Will a Karen incident go viral and spawn 100+ reaction videos?",
      description: "The internet's favorite type of public freakout content.",
      category: "Weird",
      closesAt: in24Hours
    },
    {
      question: "Will someone try to marry an AI chatbot this week?",
      description: "Modern love stories getting weirder by the day.",
      category: "Weird",
      closesAt: in48Hours
    },
    {
      question: "Will a celebrity accidentally livestream something embarrassing today?",
      description: "Live streaming accidents are comedy gold.",
      category: "Weird",
      closesAt: in24Hours
    },
    {
      question: "Will someone claim they time traveled on social media today?",
      description: "Peak internet delusion meets viral content.",
      category: "Weird",
      closesAt: in24Hours
    },
    {
      question: "Will a Florida man story make international headlines this week?",
      description: "Florida man never disappoints with absurd news.",
      category: "Weird",
      closesAt: in48Hours
    },
    {
      question: "Will someone try to pay rent with Monopoly money and film it?",
      description: "Peak economic protest content creation.",
      category: "Weird",
      closesAt: in24Hours
    },

    // Technology & AI Madness
    {
      question: "Will an AI write a better news article than a human journalist today?",
      description: "The robot uprising starts with good grammar.",
      category: "Technology",
      closesAt: in24Hours
    },
    {
      question: "Will someone ask ChatGPT to run for president this week?",
      description: "AI political campaigns are the logical next step.",
      category: "Technology",
      closesAt: in48Hours
    },
    {
      question: "Will a robot malfunction and become a meme today?",
      description: "Technology fails are peak entertainment.",
      category: "Technology",
      closesAt: in24Hours
    },
    {
      question: "Will someone claim their smart fridge is plotting against them?",
      description: "IoT paranoia meets comedy gold.",
      category: "Technology",
      closesAt: in24Hours
    },

    // Celebrity & Pop Culture Chaos
    {
      question: "Will any celebrity change their name to something AI-related this week?",
      description: "Following Grimes' lead with weird name changes.",
      category: "Pop Culture",
      closesAt: in48Hours
    },
    {
      question: "Will a TikTok dance go viral and get performed by a politician today?",
      description: "Peak cringe political pandering content.",
      category: "Pop Culture",
      closesAt: in24Hours
    },
    {
      question: "Will someone famous get canceled for something they said in 2009?",
      description: "Digital archaeology meets cancel culture.",
      category: "Pop Culture",
      closesAt: in24Hours
    },
    {
      question: "Will a celebrity accidentally reveal they don't manage their own social media?",
      description: "Social media manager slip-ups are hilarious.",
      category: "Pop Culture",
      closesAt: in24Hours
    },

    // Economic Absurdity
    {
      question: "Will someone try to buy a house with cryptocurrency today?",
      description: "Peak crypto adoption meets real estate market.",
      category: "Finance",
      closesAt: in24Hours
    },
    {
      question: "Will inflation be blamed for something completely unrelated today?",
      description: "Everything is inflation's fault apparently.",
      category: "Finance",
      closesAt: in24Hours
    },
    {
      question: "Will someone crowdfund buying a country this week?",
      description: "GoFundMe campaigns are getting wild.",
      category: "Finance",
      closesAt: in48Hours
    },
    {
      question: "Will a meme stock move 20%+ based on a tweet today?",
      description: "Social media market manipulation is real.",
      category: "Finance",
      closesAt: in24Hours
    },
    
    // Trending Memes & Social
    {
      question: "Will 'HODL' trend on crypto Twitter in the next 12 hours?",
      description: "Classic crypto meme during market volatility periods.",
      category: "Memes",
      closesAt: in12Hours
    },
    {
      question: "Will ChatGPT have any major outages in the next 24 hours?",
      description: "AI services experiencing high demand and potential instability.",
      category: "Technology",
      closesAt: in24Hours
    },
    {
      question: "Will any celebrity announce crypto investment today?",
      description: "Celebrity crypto endorsements often drive market attention.",
      category: "Social Media",
      closesAt: in24Hours
    },
    {
      question: "Will Solana NFT trading volume exceed Ethereum today?",
      description: "SOL NFT ecosystem growing rapidly vs ETH dominance.",
      category: "NFTs",
      closesAt: in24Hours
    },
    {
      question: "Will Bitcoin dominance drop below 55% this week?",
      description: "Current BTC dominance is around 56-57%. Alt season brewing?",
      category: "Crypto",
      closesAt: in48Hours
    },
    {
      question: "Will any meme coin pump 50%+ in the next 24 hours?",
      description: "Daily meme coin moonshots and viral movements.",
      category: "Memes",
      closesAt: in24Hours
    },
    {
      question: "Will 'Diamond Hands' get more mentions than 'Paper Hands' today?",
      description: "Daily battle of crypto trading memes on social media.",
      category: "Memes",
      closesAt: in24Hours
    },
    {
      question: "Will 'Buy the dip' trend on crypto Twitter this weekend?",
      description: "Weekend dips often lead to viral 'buy the dip' memes.",
      category: "Social Media", 
      closesAt: in24Hours
    },
    {
      question: "Will Elon Musk tweet about crypto this week?",
      description: "Elon's crypto tweets always cause market movement.",
      category: "Social Media",
      closesAt: in48Hours
    },
    {
      question: "Will Ethereum gas fees spike above 50 gwei tomorrow?",
      description: "Current gas fees are moderate. Will network congestion increase?",
      category: "Technical",
      closesAt: in12Hours
    },
    {
      question: "Will any crypto exchange get hacked this month?",
      description: "September has historically seen security incidents.",
      category: "Security",
      closesAt: in48Hours
    },
    {
      question: "Will 'HODL' or 'NGMI' trend more on crypto Twitter this week?",
      description: "Classic crypto slang battle. Which will dominate social sentiment?",
      category: "Memes",
      closesAt: in48Hours
    },
    {
      question: "Will any major bank announce crypto adoption this week?",
      description: "Traditional finance continues embracing crypto.",
      category: "Finance",
      closesAt: in48Hours
    },
    {
      question: "Will 'Wen Lambo' memes make a comeback this week?",
      description: "Classic crypto meme due for a revival?",
      category: "Memes",
      closesAt: in48Hours
    },
    {
      question: "Will Bitcoin close above $65,000 this weekend?",
      description: "BTC testing key resistance levels.",
      category: "Crypto",
      closesAt: in24Hours
    },
    {
      question: "Will any crypto influencer get 'cancelled' this week?",
      description: "Crypto Twitter drama is always brewing.",
      category: "Social Media",
      closesAt: in48Hours
    },
    {
      question: "Will 'Diamond Hands' emoji usage spike 50%+ this week?",
      description: "Tracking crypto emoji sentiment on social media.",
      category: "Social Media",
      closesAt: in48Hours
    },
    {
      question: "Will any meme coin pump 100%+ this week?",
      description: "Tracking explosive meme coin movements in current market conditions.",
      category: "Memes",
      closesAt: in48Hours
    },
    {
      question: "Will crypto fear & greed index drop below 30 this week?",
      description: "Current market sentiment indicator predicting extreme fear.",
      category: "Trading",
      closesAt: in48Hours
    },
    {
      question: "Will any major crypto announcement happen this weekend?",
      description: "Weekend crypto news and major project updates prediction.",
      category: "Crypto",
      closesAt: in24Hours
    },
    
    // FOMO MARKETS - Ultra-short duration (15-60 minutes)
    {
      question: "Will Bitcoin price move up or down in the next 15 minutes?",
      description: "Ultra-fast BTC price prediction. Current volatility creating quick opportunities.",
      category: "FOMO",
      closesAt: in15Minutes
    },
    {
      question: "Will Ethereum outperform Bitcoin in the next 30 minutes?",
      description: "ETH vs BTC short-term performance battle. Quick alpha opportunity.",
      category: "FOMO", 
      closesAt: in30Minutes
    },
    {
      question: "Will any meme coin pump 10%+ in the next hour?",
      description: "Meme coin FOMO - catching the next moonshot before it happens.",
      category: "FOMO",
      closesAt: in60Minutes
    },
    {
      question: "Will crypto total market cap cross $2.5T in next 30 minutes?",
      description: "Total crypto market reaching key psychological resistance.",
      category: "FOMO",
      closesAt: in30Minutes
    },
    {
      question: "Will Bitcoin dominance change by 0.5%+ in next hour?",
      description: "BTC.D volatility - quick movements indicate alt season shifts.",
      category: "FOMO",
      closesAt: in60Minutes
    },
    {
      question: "Will 'FOMO' trend on crypto Twitter in next 15 minutes?",
      description: "Social sentiment spike - FOMO mentions indicating market mood.",
      category: "FOMO",
      closesAt: in15Minutes
    }
  ]

  // Add meme coin markets with real prices first
  let marketsCreated = 0
  const targetMarkets = 20

  console.log('Creating meme coin markets with live prices...')
  const memeCoins = cryptoData.filter(crypto => 
    ['doge', 'shib', 'pepe', 'bonk', 'floki', 'wif', 'brett', 'popcat'].includes(crypto.symbol)
  ).slice(0, 4)

  for (const memeCoin of memeCoins) {
    if (marketsCreated >= targetMarkets) break

    const currentPrice = memeCoin.current_price
    const priceTargets = generatePriceTargets(memeCoin)
    const change24h = memeCoin.price_change_percentage_24h || 0

    const questionText = `Will ${memeCoin.name} pump above $${formatPrice(priceTargets.aggressive)} in 24 hours?`
    
    const memeMarket = {
      question: questionText,
      description: `${memeCoin.symbol.toUpperCase()} currently at $${formatPrice(currentPrice)} (24h: ${change24h.toFixed(2)}%). Meme coin moonshot prediction - target is ${((priceTargets.aggressive/currentPrice - 1) * 100).toFixed(1)}% pump!`,
      category: 'Memes',
      closesAt: in48Hours,
      image: getMarketImage('Memes', questionText, memeCoin.symbol)
    }

    const { yesPool, noPool } = getRandomInitialPools()
    const market = {
      id: createMarketId(memeMarket.question, memeMarket.category, memeCoin.symbol),
      question: memeMarket.question,
      description: memeMarket.description,
      category: memeMarket.category,
      image: memeMarket.image,
      status: 'OPEN' as const,
      yesPool,
      noPool,
      createdAt: now,
      closesAt: memeMarket.closesAt,
      createdBy: 'system',
      slug: createSlug(memeMarket.question)
    }

    markets.set(market.id, market)
    marketsCreated++
    console.log(`Created meme coin market: ${market.question}`)
    console.log(`  Market ID: ${market.id}`)
    
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  // Then add general special markets (social, geopolitical, etc.)
  console.log('Creating special markets...')
  for (const marketData of specialMarkets) {
    if (marketsCreated >= targetMarkets) break

    const { yesPool, noPool } = getRandomInitialPools()
    const market = {
      id: createMarketId(marketData.question, marketData.category),
      question: marketData.question,
      description: marketData.description,
      category: marketData.category,
      image: getMarketImage(marketData.category, marketData.question),
      status: 'OPEN' as const,
      yesPool,
      noPool,
      createdAt: now,
      closesAt: marketData.closesAt,
      createdBy: 'system',
      slug: createSlug(marketData.question)
    }

    markets.set(market.id, market)
    marketsCreated++
    console.log(`Created special market: ${market.question}`)
    
    // Small delay to ensure unique IDs
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  // Then add crypto-specific markets with real prices if we have room
  if (marketsCreated < targetMarkets) {
    console.log('Adding crypto-specific markets with live prices...')
    
    for (const crypto of cryptoData.slice(0, 8)) {
      if (marketsCreated >= targetMarkets) break

      const currentPrice = crypto.current_price
      const priceTargets = generatePriceTargets(crypto)
      const change24h = crypto.price_change_percentage_24h || 0
      
      // Create different types of markets based on the crypto
      const marketTypes = [
        {
          question: `Will ${crypto.name} (${crypto.symbol.toUpperCase()}) reach $${formatPrice(priceTargets.bullish)} by tomorrow?`,
          description: `Current price: $${formatPrice(currentPrice)}. 24h change: ${change24h.toFixed(2)}%. Target is ${((priceTargets.bullish/currentPrice - 1) * 100).toFixed(1)}% above current price.`,
          closesAt: in12Hours
        },
        {
          question: `Will ${crypto.name} drop below $${formatPrice(priceTargets.bearish)} in the next 24 hours?`,
          description: `Current price: $${formatPrice(currentPrice)}. 24h change: ${change24h.toFixed(2)}%. Target is ${((1 - priceTargets.bearish/currentPrice) * 100).toFixed(1)}% below current price.`,
          closesAt: in12Hours
        },
        {
          question: `Will ${crypto.name} outperform Bitcoin percentage-wise this week?`,
          description: `${crypto.symbol.toUpperCase()} currently at $${formatPrice(currentPrice)}. BTC vs ALT performance comparison over 7 days.`,
          closesAt: in48Hours
        }
      ]

      // Pick a random market type for this crypto
      const selectedMarket = marketTypes[Math.floor(Math.random() * marketTypes.length)]

      const { yesPool, noPool } = getRandomInitialPools()
      const market = {
        id: createMarketId(selectedMarket.question, 'Crypto'),
        question: selectedMarket.question,
        description: selectedMarket.description,
        category: 'Crypto',
        image: getMarketImage('Crypto', selectedMarket.question, crypto.symbol),
        status: 'OPEN' as const,
        yesPool,
        noPool,
        createdAt: now,
        closesAt: selectedMarket.closesAt,
        createdBy: 'system',
        slug: createSlug(selectedMarket.question)
      }

      markets.set(market.id, market)
      marketsCreated++
      console.log(`Created crypto market: ${market.question}`)
      
      // Small delay to ensure unique IDs
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }

  // Add some special crypto markets with real data
  if (marketsCreated < targetMarkets) {
    const btc = cryptoData.find(c => c.symbol === 'btc')
    const eth = cryptoData.find(c => c.symbol === 'eth')
    const sol = cryptoData.find(c => c.symbol === 'sol')
    
    const specialCryptoMarkets = []
    
    if (btc) {
      specialCryptoMarkets.push({
        question: `Will Bitcoin break $${Math.round(btc.current_price * 1.05).toLocaleString()} this weekend?`,
        description: `BTC currently at $${formatPrice(btc.current_price)}. Weekend breakout prediction based on current resistance levels.`,
        category: 'Crypto',
        closesAt: in24Hours
      })
    }
    
    if (eth) {
      specialCryptoMarkets.push({
        question: `Will Ethereum gas fees average above 30 gwei tomorrow?`,
        description: `ETH at $${formatPrice(eth.current_price)}. Network congestion and gas fee prediction.`,
        category: 'Technical',
        closesAt: in12Hours
      })
    }
    
    if (sol) {
      specialCryptoMarkets.push({
        question: `Will Solana maintain above $${Math.round(sol.current_price * 0.95)} this week?`,
        description: `SOL currently at $${formatPrice(sol.current_price)}. Testing key support levels.`,
        category: 'Crypto',
        closesAt: in48Hours
      })
    }

    for (const marketData of specialCryptoMarkets) {
      if (marketsCreated >= targetMarkets) break

      const { yesPool, noPool } = getRandomInitialPools()
      const market = {
        id: createMarketId(marketData.question, marketData.category),
        question: marketData.question,
        description: marketData.description,
        category: marketData.category,
        image: getMarketImage(marketData.category, marketData.question, marketData.question.toLowerCase().includes('bitcoin') ? 'btc' : marketData.question.toLowerCase().includes('ethereum') ? 'eth' : marketData.question.toLowerCase().includes('solana') ? 'sol' : undefined),
        status: 'OPEN' as const,
        yesPool,
        noPool,
        createdAt: now,
        closesAt: marketData.closesAt,
        createdBy: 'system',
        slug: createSlug(marketData.question)
      }

      markets.set(market.id, market)
      marketsCreated++
      console.log(`Created special crypto market: ${market.question}`)
      
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }

    console.log(`\n✅ Successfully created ${marketsCreated} crypto prediction markets!`)
    return marketsCreated
  } catch (error) {
    console.error('❌ Error in populateCryptoMarkets:', error)
    throw error
  }
}
