import { prisma } from '@fomora/db'

async function exportData() {
  console.log('🚀 Starting data export from Supabase...')

  try {
    // Export users
    const users = await prisma.user.findMany()
    console.log(`📦 Exported ${users.length} users`)

    // Export markets
    const markets = await prisma.market.findMany()
    console.log(`📦 Exported ${markets.length} markets`)

    // Export bets
    const bets = await prisma.bet.findMany()
    console.log(`📦 Exported ${bets.length} bets`)

    // Export FOMO markets
    const fomoMarkets = await prisma.fomoMarket.findMany()
    console.log(`📦 Exported ${fomoMarkets.length} FOMO markets`)

    // Export action logs
    const actionLogs = await prisma.actionLog.findMany()
    console.log(`📦 Exported ${actionLogs.length} action logs`)

    // Save all data to a JSON file
    const data = {
      users,
      markets,
      bets,
      fomoMarkets,
      actionLogs
    }

    const fs = require('fs')
    fs.writeFileSync(
      'supabase-backup.json',
      JSON.stringify(data, null, 2)
    )

    console.log('✅ Data export complete! Saved to supabase-backup.json')
  } catch (error) {
    console.error('❌ Export failed:', error)
    process.exit(1)
  }
}

exportData()
