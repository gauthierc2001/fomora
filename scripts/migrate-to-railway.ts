import { PrismaClient } from '@prisma/client'

// Supabase connection
const supabasePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.klucdodkixhvbwahprev:TEhGrVgslVJIUIL7@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"
    }
  }
})

// Railway connection
const railwayPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:OPFJYsSxfQMvHUlQlKpJpzWjjiJSVkUr@shinkansen.proxy.rlwy.net:57939/railway"
    }
  }
})

async function migrateData() {
  console.log('🚀 Starting migration from Supabase to Railway...')

  try {
    // Disconnect and reconnect both clients to clear any prepared statements
    await supabasePrisma.$disconnect()
    await railwayPrisma.$disconnect()
    await supabasePrisma.$connect()
    await railwayPrisma.$connect()
    // Export from Supabase
    console.log('📤 Exporting data from Supabase...')
    
    const users = await supabasePrisma.user.findMany()
    console.log(`Found ${users.length} users`)
    
    const markets = await supabasePrisma.market.findMany()
    console.log(`Found ${markets.length} markets`)
    
    const bets = await supabasePrisma.bet.findMany()
    console.log(`Found ${bets.length} bets`)
    
    const fomoMarkets = await supabasePrisma.fomoMarket.findMany()
    console.log(`Found ${fomoMarkets.length} FOMO markets`)
    
    const actionLogs = await supabasePrisma.actionLog.findMany()
    console.log(`Found ${actionLogs.length} action logs`)

    // Clear Railway data
    console.log('🗑️ Clearing existing Railway data...')
    await railwayPrisma.actionLog.deleteMany()
    await railwayPrisma.bet.deleteMany()
    await railwayPrisma.market.deleteMany()
    await railwayPrisma.fomoMarket.deleteMany()
    await railwayPrisma.user.deleteMany()

    // Import to Railway
    console.log('📥 Importing data to Railway...')

    // Import users first (they're referenced by other tables)
    console.log('👥 Importing users...')
    for (const user of users) {
      await railwayPrisma.user.create({
        data: user
      })
    }
    console.log(`✅ Imported ${users.length} users`)

    // Import markets
    console.log('📊 Importing markets...')
    for (const market of markets) {
      await railwayPrisma.market.create({
        data: market
      })
    }
    console.log(`✅ Imported ${markets.length} markets`)

    // Import FOMO markets
    console.log('🔥 Importing FOMO markets...')
    for (const market of fomoMarkets) {
      await railwayPrisma.fomoMarket.create({
        data: market
      })
    }
    console.log(`✅ Imported ${fomoMarkets.length} FOMO markets`)

    // Import bets
    console.log('💰 Importing bets...')
    for (const bet of bets) {
      await railwayPrisma.bet.create({
        data: bet
      })
    }
    console.log(`✅ Imported ${bets.length} bets`)

    // Import action logs
    console.log('📝 Importing action logs...')
    for (const log of actionLogs) {
      await railwayPrisma.actionLog.create({
        data: log
      })
    }
    console.log(`✅ Imported ${actionLogs.length} action logs`)

    console.log('✨ Migration complete!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await supabasePrisma.$disconnect()
    await railwayPrisma.$disconnect()
  }
}

migrateData()
