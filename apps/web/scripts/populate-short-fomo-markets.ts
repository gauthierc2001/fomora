import { populateShortFomoMarkets } from '../lib/populate-short-fomo-markets'

// Run if called directly
if (require.main === module) {
  populateShortFomoMarkets()
    .then((result) => {
      console.log('\n✨ Population completed:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('\n💥 Population failed:', error)
      process.exit(1)
    })
}

export { populateShortFomoMarkets }
