import { PrismaClient, Role } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// Test window: Current time + 48 hours
const TEST_START = new Date() // Now
const TEST_END = new Date(TEST_START.getTime() + 48 * 60 * 60 * 1000) // 48 hours later

const testMarkets = [
  {
    question: "Will 'NPC streamer' hashtag trend Top 10 on X (global) in the next 6 hours?",
    category: "Social Media",
    closesAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    description: "Based on X trending hashtags globally, must be exact phrase 'NPC streamer' in top 10."
  },
  {
    question: "Will ETH flip SOL in 24h trading volume in the next 12 hours?",
    category: "Crypto",
    closesAt: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    description: "Ethereum 24h trading volume must exceed Solana's 24h volume on CoinGecko at resolution time."
  },
  {
    question: "Will Bitcoin close above $100k in the next 24 hours?",
    category: "Crypto",
    closesAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    description: "BTC/USD price must close above $100,000 on major exchanges (Binance/Coinbase)."
  },
  {
    question: "Will 'Skibidi' keyword hit 50k new TikTok videos in the next 18 hours?",
    category: "Social Media",
    closesAt: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
    description: "TikTok videos containing 'Skibidi' in title/description uploaded during test period."
  },
  {
    question: "Will top Reddit meme of the day exceed 100k upvotes by Sun 23:59?",
    category: "Social Media",
    closesAt: new Date('2025-09-07T22:59:00.000Z'),
    description: "Highest upvoted meme post on r/memes or r/dankmemes on Sunday."
  },
  {
    question: "Will Doge tweet from verified account (>1M followers) get >50k likes by Mon 10:00?",
    category: "Crypto",
    closesAt: new Date('2025-09-08T09:00:00.000Z'),
    description: "Any tweet mentioning Dogecoin from verified account with 1M+ followers."
  },
  {
    question: "Will a Pepe derivative reach top 5 on OpenSea trending by Mon 12:00?",
    category: "NFT",
    closesAt: new Date('2025-09-08T11:00:00.000Z'),
    description: "Any Pepe-themed NFT collection in OpenSea trending top 5 by volume."
  },
  {
    question: "Will 'AI girlfriend' phrase trend on Google (worldwide rising) by Mon 08:00?",
    category: "Tech",
    closesAt: new Date('2025-09-08T07:00:00.000Z'),
    description: "Google Trends showing 'AI girlfriend' as rising search worldwide."
  },
  {
    question: "Will a crypto exchange outage be reported on X by Sun 22:00?",
    category: "Crypto",
    closesAt: new Date('2025-09-07T21:00:00.000Z'),
    description: "Major exchange (Binance/Coinbase/Kraken) reporting technical issues on official X account."
  },
  {
    question: "Will a meme coin pump >30% on DexScreener top list by Mon 11:00?",
    category: "Crypto",
    closesAt: new Date('2025-09-08T10:00:00.000Z'),
    description: "Any token on DexScreener trending with 30%+ gain in 24h at resolution time."
  },
  {
    question: "Will 'gm' become top 3 in X crypto trending by Sun 10:00?",
    category: "Crypto",
    closesAt: new Date('2025-09-07T09:00:00.000Z'),
    description: "The phrase 'gm' appears in top 3 trending topics under crypto category on X."
  },
  {
    question: "Will MrBeast post a video titled with a number by Mon 12:00?",
    category: "Social Media",
    closesAt: new Date('2025-09-08T11:00:00.000Z'),
    description: "MrBeast YouTube video title containing any number (e.g., '100', 'million')."
  },
  {
    question: "Will a major L2 announce downtime by Mon 09:00?",
    category: "Crypto",
    closesAt: new Date('2025-09-08T08:00:00.000Z'),
    description: "Arbitrum, Optimism, Polygon, or Base announcing scheduled/unscheduled downtime."
  },
  {
    question: "Will Solana TPS exceed 3k in public trackers snapshot at Mon 10:00?",
    category: "Crypto",
    closesAt: new Date('2025-09-08T09:00:00.000Z'),
    description: "Solana Beach or similar tracker showing >3000 TPS at resolution timestamp."
  },
  {
    question: "Will 'DeFi summer 2.0' phrase surpass 5k mentions on X by Mon 12:00?",
    category: "Crypto",
    closesAt: new Date('2025-09-08T11:00:00.000Z'),
    description: "Twitter mentions of exact phrase 'DeFi summer 2.0' during test period exceeding 5000."
  }
]

function createSlug(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
}

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminWallet = 'FoMoRaAdm1nW4ll3tPubl1cK3yF0rT3st1ng12345'
  const adminUser = await prisma.user.upsert({
    where: { walletAddress: adminWallet },
    update: {},
    create: {
      walletAddress: adminWallet,
      role: Role.ADMIN,
      pointsBalance: 100000,
      creditedInitial: true,
      ipHash: createHash('sha256').update('127.0.0.1').digest('hex')
    }
  })

  console.log('👑 Created admin user:', adminUser.id)

  // Set test configuration
  await prisma.config.upsert({
    where: { key: 'TEST_WINDOW' },
    update: {
      value: {
        startTime: TEST_START.toISOString(),
        endTime: TEST_END.toISOString(),
        durationHours: 48
      }
    },
    create: {
      key: 'TEST_WINDOW',
      value: {
        startTime: TEST_START.toISOString(),
        endTime: TEST_END.toISOString(),
        durationHours: 48
      }
    }
  })

  console.log('⏰ Set test window:', TEST_START, 'to', TEST_END)

  // Create test markets
  for (const marketData of testMarkets) {
    const slug = createSlug(marketData.question)
    
    await prisma.market.upsert({
      where: { slug },
      update: {},
      create: {
        ...marketData,
        slug,
        createdBy: adminUser.id
      }
    })
  }

  console.log(`🎯 Created ${testMarkets.length} test markets`)

  // Create initial action log
  await prisma.actionLog.create({
    data: {
      type: 'ADMIN_ACTION',
      metadata: {
        action: 'database_seeded',
        marketsCreated: testMarkets.length,
        timestamp: new Date().toISOString()
      },
      ipHash: createHash('sha256').update('127.0.0.1').digest('hex')
    }
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
