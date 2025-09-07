#!/usr/bin/env tsx
import { launchReset } from './launch-reset'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function main() {
  console.log('🚀 Fomora Launch Reset Tool')
  console.log('=============================\n')
  
  console.log('This tool will help you reset your platform for live launch.')
  console.log('You can reset user points, market pools, and betting history.\n')

  // First, run a dry run to show what would happen
  console.log('📊 Running preview (dry run)...\n')
  
  try {
    await launchReset({ dryRun: true })
  } catch (error) {
    console.error('❌ Preview failed:', error)
    process.exit(1)
  }

  console.log('\n' + '='.repeat(50))
  console.log('⚠️  WARNING: This will modify your live database!')
  console.log('='.repeat(50))
  
  const confirm1 = await ask('\nDo you want to proceed with the launch reset? (yes/no): ')
  if (confirm1.toLowerCase() !== 'yes') {
    console.log('❌ Reset cancelled.')
    rl.close()
    return
  }

  const confirm2 = await ask('\nAre you absolutely sure? This cannot be undone! (YES/no): ')
  if (confirm2 !== 'YES') {
    console.log('❌ Reset cancelled.')
    rl.close()
    return
  }

  // Get user preferences
  const resetBetsAnswer = await ask('\nReset all betting history? (Y/n): ')
  const resetBets = resetBetsAnswer.toLowerCase() !== 'n'

  const resetPointsAnswer = await ask('Reset all user points? (Y/n): ')
  const resetUserPoints = resetPointsAnswer.toLowerCase() !== 'n'

  let newUserPoints = 10000
  if (resetUserPoints) {
    const pointsAnswer = await ask('How many points should each user get? (default: 10000): ')
    if (pointsAnswer && !isNaN(parseInt(pointsAnswer))) {
      newUserPoints = parseInt(pointsAnswer)
    }
  }

  const resetPoolsAnswer = await ask('Reset all market pools? (Y/n): ')
  const resetMarketPools = resetPoolsAnswer.toLowerCase() !== 'n'

  const preserveAdminsAnswer = await ask('Preserve admin accounts? (Y/n): ')
  const preserveAdmins = preserveAdminsAnswer.toLowerCase() !== 'n'

  console.log('\n🔄 Starting launch reset...')
  console.log('Configuration:')
  console.log(`  Reset bets: ${resetBets}`)
  console.log(`  Reset user points: ${resetUserPoints}`)
  console.log(`  New user points: ${newUserPoints}`)
  console.log(`  Reset market pools: ${resetMarketPools}`)
  console.log(`  Preserve admins: ${preserveAdmins}`)

  try {
    const result = await launchReset({
      resetBets,
      resetUserPoints,
      resetMarketPools,
      newUserPoints,
      preserveAdmins,
      dryRun: false
    })

    console.log('\n🎉 Launch reset completed successfully!')
    console.log('Stats:', result.stats)
    console.log('\n🚀 Your platform is ready for launch!')

  } catch (error) {
    console.error('\n❌ Launch reset failed:', error)
    console.log('\n💡 Your database was not modified due to the error.')
  }

  rl.close()
}

main().catch(console.error)
