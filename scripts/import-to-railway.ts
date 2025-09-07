import { prisma } from '@fomora/db'

async function importData() {
  console.log('🚀 Starting data import to Railway PostgreSQL...')

  try {
    const fs = require('fs')
    const data = JSON.parse(fs.readFileSync('supabase-backup.json', 'utf8'))

    // Clear existing data
    console.log('🗑️ Clearing existing data...')
    await prisma.actionLog.deleteMany()
    await prisma.bet.deleteMany()
    await prisma.market.deleteMany()
    await prisma.fomoMarket.deleteMany()
    await prisma.user.deleteMany()

    // Import users first (they're referenced by other tables)
    console.log('👥 Importing users...')
    for (const user of data.users) {
      await prisma.user.create({
        data: {
          ...user,
          // Convert dates back to Date objects
          createdAt: new Date(user.createdAt),
          lastSeenAt: new Date(user.lastSeenAt)
        }
      })
    }
    console.log(`✅ Imported ${data.users.length} users`)

    // Import markets
    console.log('📊 Importing markets...')
    for (const market of data.markets) {
      await prisma.market.create({
        data: {
          ...market,
          createdAt: new Date(market.createdAt),
          closesAt: new Date(market.closesAt),
          resolvedAt: market.resolvedAt ? new Date(market.resolvedAt) : null
        }
      })
    }
    console.log(`✅ Imported ${data.markets.length} markets`)

    // Import FOMO markets
    console.log('🔥 Importing FOMO markets...')
    for (const market of data.fomoMarkets) {
      await prisma.fomoMarket.create({
        data: {
          ...market,
          createdAt: new Date(market.createdAt),
          closesAt: new Date(market.closesAt)
        }
      })
    }
    console.log(`✅ Imported ${data.fomoMarkets.length} FOMO markets`)

    // Import bets
    console.log('💰 Importing bets...')
    for (const bet of data.bets) {
      await prisma.bet.create({
        data: {
          ...bet,
          createdAt: new Date(bet.createdAt)
        }
      })
    }
    console.log(`✅ Imported ${data.bets.length} bets`)

    // Import action logs
    console.log('📝 Importing action logs...')
    for (const log of data.actionLogs) {
      await prisma.actionLog.create({
        data: {
          ...log,
          createdAt: new Date(log.createdAt)
        }
      })
    }
    console.log(`✅ Imported ${data.actionLogs.length} action logs`)

    console.log('✨ Data import complete!')
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

importData()
