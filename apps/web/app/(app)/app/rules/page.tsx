import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Coins, Clock, Users, Award, Shield, AlertTriangle } from 'lucide-react'

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Test Rules & Guidelines</h1>
        <p className="text-muted-foreground">
          Everything you need to know about the 48-hour prediction market test
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> This is a test environment using fake points. 
          No real money is involved. Top performers may be eligible for future $FOMO token airdrops.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Points Economy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Points Economy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Initial Credit</span>
              <Badge>10,000 points</Badge>
            </div>
            <div className="flex justify-between">
              <span>Market Creation Fee</span>
              <Badge variant="outline">100 points</Badge>
            </div>
            <div className="flex justify-between">
              <span>Minimum Bet</span>
              <Badge variant="outline">50 points</Badge>
            </div>
            <div className="flex justify-between">
              <span>Trading Fee</span>
              <Badge variant="outline">2% per bet</Badge>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              Points are credited once per wallet. Trading fees go to protocol pool for metrics.
            </p>
          </CardContent>
        </Card>

        {/* Test Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Test Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Test Window</span>
              <Badge>48 hours</Badge>
            </div>
            <div className="flex justify-between">
              <span>Market Creation</span>
              <Badge variant="outline">During test only</Badge>
            </div>
            <div className="flex justify-between">
              <span>Betting</span>
              <Badge variant="outline">Until market close</Badge>
            </div>
            <div className="flex justify-between">
              <span>Resolution</span>
              <Badge variant="outline">Admin manual</Badge>
            </div>
            <p className="text-sm text-muted-foreground pt-2">
              All markets must close before the 48-hour window ends.
            </p>
          </CardContent>
        </Card>

        {/* How to Play */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              How to Play
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">1. Connect Wallet</h4>
              <p className="text-sm text-muted-foreground">
                Connect a Solana wallet (Phantom, Solflare, Backpack) and receive 10,000 free points.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">2. Explore Markets</h4>
              <p className="text-sm text-muted-foreground">
                Browse prediction markets about viral content, memes, and internet trends.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">3. Make Predictions</h4>
              <p className="text-sm text-muted-foreground">
                Bet YES or NO on outcomes. Odds adjust based on the betting pool.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">4. Create Markets</h4>
              <p className="text-sm text-muted-foreground">
                Create your own prediction markets for 100 points.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Airdrop Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Airdrop Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold">$FOMO Token Airdrop</h4>
              <p className="text-sm text-muted-foreground">
                Top performers in the test may be eligible for future $FOMO token airdrops.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-medium">Criteria:</span>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Final point balance above starting amount</li>
                <li>• Active participation (multiple bets/markets)</li>
                <li>• Account in good standing</li>
                <li>• Completion of test window</li>
              </ul>
            </div>
            <Badge className="w-full justify-center">
              Eligibility list exported after test ends
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Market Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Market Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Social Media</h4>
              <p className="text-sm text-muted-foreground">
                Twitter/X trends, TikTok viral content, Reddit posts
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Crypto</h4>
              <p className="text-sm text-muted-foreground">
                Token movements, exchange events, DeFi trends
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">NFTs</h4>
              <p className="text-sm text-muted-foreground">
                Collection launches, OpenSea trends, digital art
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Tech</h4>
              <p className="text-sm text-muted-foreground">
                AI developments, tech announcements, app launches
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Gaming</h4>
              <p className="text-sm text-muted-foreground">
                Game releases, streaming events, esports
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Entertainment</h4>
              <p className="text-sm text-muted-foreground">
                Celebrity news, memes, viral videos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anti-Abuse & Fair Play */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Anti-Abuse & Fair Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Detection Systems</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• One faucet per wallet address</li>
                <li>• IP address monitoring (hashed)</li>
                <li>• Betting pattern analysis</li>
                <li>• Admin oversight and review</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Enforcement</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Suspicious accounts flagged</li>
                <li>• Manual review for eligibility</li>
                <li>• Market cancellation if needed</li>
                <li>• Transparent resolution process</li>
              </ul>
            </div>
          </div>
          <Alert>
            <AlertDescription>
              All actions are logged for transparency. Suspected abuse will be investigated before airdrop eligibility determination.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Contact & Support */}
      <Card>
        <CardHeader>
          <CardTitle>Contact & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Technical Issues</h4>
              <p className="text-sm text-muted-foreground">
                Report bugs or technical problems through GitHub issues or Discord.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Market Disputes</h4>
              <p className="text-sm text-muted-foreground">
                Admin team reviews all market resolutions with evidence. Decisions are final.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
