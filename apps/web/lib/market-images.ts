interface CoinGeckoImage {
  thumb: string
  small: string
  large: string
}

interface CoinGeckoResponse {
  image: CoinGeckoImage
}

async function getCryptoImage(coinId: string): Promise<string | null> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`)
    if (!response.ok) return null
    const data = await response.json() as CoinGeckoResponse
    return data.image.large || data.image.small || null
  } catch (error) {
    console.error('Failed to fetch crypto image:', error)
    return null
  }
}

const STATIC_IMAGES = {
  // Companies
  tesla: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo_black.svg',
  spacex: 'https://upload.wikimedia.org/wikipedia/commons/3/36/SpaceX_Logo_Black.png',
  apple: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  meta: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
  microsoft: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  disney: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Disney_wordmark.svg',
  netflix: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png',
  amazon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  coinbase: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Coinbase_Logo.png',
  kraken: 'https://assets.coingecko.com/markets/images/29/large/kraken.jpg',
  binance: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Binance_logo.svg',
  
  // Sports
  messi: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
  haaland: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Erling_Haaland_2023_%28cropped%29.jpg',
  nba: 'https://upload.wikimedia.org/wikipedia/en/0/03/National_Basketball_Association_logo.svg',
  f1: 'https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg',
  
  // Gaming
  gta: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Grand_Theft_Auto_logo.svg',
  rockstar: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Rockstar_Games_Logo.svg',
  
  // Organizations
  eu: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg',
  nato: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/NATO_flag.svg',
  fed: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Seal_of_the_United_States_Federal_Reserve_System.svg',
  sec: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Seal_of_the_United_States_Securities_and_Exchange_Commission.svg',
  
  // Countries
  china: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg',
  india: 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg',
  ukraine: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg',
  turkey: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg',
  saudi: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg',
  
  // Tech
  ai: 'https://upload.wikimedia.org/wikipedia/commons/0/07/The_AI_Revolution_Logo.png',
  quantum: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Bloch_Sphere.svg',
  vr: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Virtual_reality_icon.svg'
}

export async function getMarketImage(marketQuestion: string, marketDescription: string): Promise<string | null> {
  const text = (marketQuestion + ' ' + marketDescription).toLowerCase()
  
  // Check for crypto markets
  if (text.includes('bitcoin') || text.includes(' btc ')) {
    return getCryptoImage('bitcoin')
  }
  if (text.includes('ethereum') || text.includes(' eth ')) {
    return getCryptoImage('ethereum')
  }
  if (text.includes('solana') || text.includes(' sol ')) {
    return getCryptoImage('solana')
  }
  if (text.includes('xrp') || text.includes('ripple')) {
    return getCryptoImage('ripple')
  }
  if (text.includes('usdc')) {
    return getCryptoImage('usd-coin')
  }
  if (text.includes('usdt') || text.includes('tether')) {
    return getCryptoImage('tether')
  }

  // Check for companies
  if (text.includes('tesla') || text.includes('cybertruck')) {
    return STATIC_IMAGES.tesla
  }
  if (text.includes('spacex') || text.includes('starship')) {
    return STATIC_IMAGES.spacex
  }
  if (text.includes('apple') || text.includes('vision pro')) {
    return STATIC_IMAGES.apple
  }
  if (text.includes('meta ') || text.includes('facebook')) {
    return STATIC_IMAGES.meta
  }
  if (text.includes('microsoft')) {
    return STATIC_IMAGES.microsoft
  }
  if (text.includes('disney')) {
    return STATIC_IMAGES.disney
  }
  if (text.includes('netflix')) {
    return STATIC_IMAGES.netflix
  }
  if (text.includes('amazon') || text.includes('prime video')) {
    return STATIC_IMAGES.amazon
  }
  if (text.includes('coinbase')) {
    return STATIC_IMAGES.coinbase
  }
  if (text.includes('kraken')) {
    return STATIC_IMAGES.kraken
  }
  if (text.includes('binance')) {
    return STATIC_IMAGES.binance
  }

  // Check for sports
  if (text.includes('messi')) {
    return STATIC_IMAGES.messi
  }
  if (text.includes('haaland')) {
    return STATIC_IMAGES.haaland
  }
  if (text.includes('nba') || text.includes('basketball')) {
    return STATIC_IMAGES.nba
  }
  if (text.includes('f1') || text.includes('formula 1') || text.includes('grand prix')) {
    return STATIC_IMAGES.f1
  }

  // Check for gaming
  if (text.includes('gta') || text.includes('grand theft auto')) {
    return STATIC_IMAGES.gta
  }

  // Check for organizations
  if (text.includes('european union') || text.includes(' eu ')) {
    return STATIC_IMAGES.eu
  }
  if (text.includes('nato')) {
    return STATIC_IMAGES.nato
  }
  if (text.includes('federal reserve') || text.includes(' fed ')) {
    return STATIC_IMAGES.fed
  }
  if (text.includes(' sec ') || text.includes('securities and exchange')) {
    return STATIC_IMAGES.sec
  }

  // Check for countries
  if (text.includes('china') || text.includes('chinese')) {
    return STATIC_IMAGES.china
  }
  if (text.includes('india') || text.includes('indian')) {
    return STATIC_IMAGES.india
  }
  if (text.includes('ukraine') || text.includes('ukrainian')) {
    return STATIC_IMAGES.ukraine
  }
  if (text.includes('turkey') || text.includes('turkish')) {
    return STATIC_IMAGES.turkey
  }
  if (text.includes('saudi')) {
    return STATIC_IMAGES.saudi
  }

  // Check for tech concepts
  if (text.includes('agi') || text.includes('artificial intelligence')) {
    return STATIC_IMAGES.ai
  }
  if (text.includes('quantum')) {
    return STATIC_IMAGES.quantum
  }
  if (text.includes('vr') || text.includes('virtual reality')) {
    return STATIC_IMAGES.vr
  }

  return null
}
