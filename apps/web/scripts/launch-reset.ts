import { prisma } from '@fomora/db'

interface ResetOptions {
  resetUserPoints?: boolean
  resetMarketPools?: boolean
  resetBets?: boolean
  newUserPoints?: number
  preserveAdmins?: boolean
  dryRun?: boolean
}

async function launchReset(options: ResetOptions = {}) {
  const {
    resetUserPoints = true,
    resetMarketPools = true,
    resetBets = true,
    newUserPoints = 10000,
    preserveAdmins = true,
    dryRun = false
  } = options

  console.log('🚀 Starting Launch Reset...')
  console.log('Options:', options)
  
  if (dryRun) {
    console.log('🧪 DRY RUN MODE - No changes will be made')
  }

  try {
    // Get current state
    const userCount = await prisma.user.count()
    const marketCount = await prisma.market.count()
    const fomoMarketCount = await prisma.fomoMarket.count()
    const betCount = await prisma.bet.count()
    
    console.log('📊 Current State:')
    console.log(`  Users: ${userCount}`)
    console.log(`  Markets: ${marketCount}`)
    console.log(`  FOMO Markets: ${fomoMarketCount}`)
    console.log(`  Bets: ${betCount}`)

    if (dryRun) {
      console.log('\n🔄 Would perform the following actions:')
      
      if (resetBets) {
        console.log(`  - Delete all ${betCount} bets`)
      }
      
      if (resetUserPoints) {
        const usersToReset = preserveAdmins 
          ? await prisma.user.count({ where: { role: 'USER' } })
          : userCount
        console.log(`  - Reset ${usersToReset} users to ${newUserPoints} points`)
      }
      
      if (resetMarketPools) {
        console.log(`  - Reset ${marketCount} market pools to initial values`)
        console.log(`  - Reset ${fomoMarketCount} FOMO market pools to initial values`)
      }
      
      return { success: true, dryRun: true }
    }

    // Start actual reset
    console.log('\n🔄 Starting Reset Operations...')
    
    // 1. Delete all bets first (maintains referential integrity)
    if (resetBets) {
      console.log('🗑️  Deleting all bets...')
      const deletedBets = await prisma.bet.deleteMany()
      console.log(`✅ Deleted ${deletedBets.count} bets`)
    }

    // 2. Reset user points and stats
    if (resetUserPoints) {
      console.log(`💰 Resetting user points to ${newUserPoints}...`)
      
      const whereClause = preserveAdmins ? { role: 'USER' } : {}
      
      const updatedUsers = await prisma.user.updateMany({
        where: whereClause,
        data: {
          pointsBalance: newUserPoints,
          totalBets: 0,
          totalWagered: 0,
          creditedInitial: true // Mark as credited so they don't get initial credits again
        }
      })
      
      console.log(`✅ Reset ${updatedUsers.count} users`)
      
      if (preserveAdmins) {
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
        console.log(`🔒 Preserved ${adminCount} admin accounts`)
      }
    }

    // 3. Reset market pools
    if (resetMarketPools) {
      console.log('🎯 Resetting market pools...')
      
      // Reset regular markets to random initial pools
      const markets = await prisma.market.findMany()
      for (const market of markets) {
        const yesPool = 1000 + Math.floor(Math.random() * 2000) // 1000-3000
        const noPool = 1000 + Math.floor(Math.random() * 2000)  // 1000-3000
        
        await prisma.market.update({
          where: { id: market.id },
          data: {
            yesPool,
            noPool,
            status: 'OPEN' // Ensure markets are open
          }
        })
      }
      console.log(`✅ Reset ${markets.length} regular market pools`)
      
      // Reset FOMO markets
      const fomoMarkets = await prisma.fomoMarket.findMany()
      for (const fomoMarket of fomoMarkets) {
        const yesPool = 1000 + Math.floor(Math.random() * 2000)
        const noPool = 1000 + Math.floor(Math.random() * 2000)
        
        await prisma.fomoMarket.update({
          where: { id: fomoMarket.id },
          data: {
            yesPool,
            noPool,
            totalVolume: 0,
            participants: 0,
            status: 'OPEN'
          }
        })
      }
      console.log(`✅ Reset ${fomoMarkets.length} FOMO market pools`)
    }

    // Get final state
    const finalUserCount = await prisma.user.count()
    const finalBetCount = await prisma.bet.count()
    
    console.log('\n🎉 Launch Reset Complete!')
    console.log('📊 Final State:')
    console.log(`  Users: ${finalUserCount}`)
    console.log(`  Markets: ${marketCount} (preserved)`)
    console.log(`  FOMO Markets: ${fomoMarketCount} (preserved)`)
    console.log(`  Bets: ${finalBetCount}`)
    
    if (resetUserPoints) {
      console.log(`  User Points: Reset to ${newUserPoints}`)
    }
    
    console.log('\n🚀 Your platform is ready for live launch!')
    
    return {
      success: true,
      stats: {
        usersReset: resetUserPoints ? finalUserCount : 0,
        betsDeleted: resetBets ? betCount : 0,
        marketsReset: resetMarketPools ? marketCount + fomoMarketCount : 0
      }
    }

  } catch (error) {
    console.error('❌ Launch reset failed:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run') || args.includes('-d')
  const preserveAdmins = !args.includes('--reset-admins')
  const newUserPoints = parseInt(args.find(arg => arg.startsWith('--points='))?.split('=')[1] || '10000')

  launchReset({
    dryRun,
    preserveAdmins,
    newUserPoints
  })
    .then((result) => {
      console.log('\n✨ Reset operation completed:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 Reset operation failed:', error)
      process.exit(1)
    })
}

export { launchReset }
