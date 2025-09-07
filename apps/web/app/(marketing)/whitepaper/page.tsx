'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { 
  TrendingUp, Zap, Trophy, Target, Coins, Users, BarChart3, ArrowLeft, 
  Globe, Rocket, Lock, Shield, Database, Brain, Gamepad2, 
  DollarSign, ChartLine, Clock, Layers, Network
} from 'lucide-react'

export default function WhitepaperPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: Globe,
      content: "Fomora transforms internet culture into a tradable asset class through decentralized prediction markets on Solana. Users bet on viral trends, meme lifecycles and cultural moments before they explode, creating a new financial primitive where internet foresight generates real value."
    },
    {
      id: "problem",
      title: "The Problem",
      icon: Brain,
      content: "Traditional finance fails to capture the $100B+ attention economy driving modern culture. Viral content, memes and trends generate enormous value but remain untradeable. Cultural tastemakers have no way to monetize their foresight, while the internet's collective intelligence around virality goes unharnessed."
    },
    {
      id: "solution",
      title: "The Fomora Solution",
      icon: Target,
      content: "Fomora creates liquid prediction markets for internet culture. Users stake tokens on outcomes like 'Will this TikTok hit 10M views?' or 'Will this meme trend on Twitter?' Winners earn from accurate predictions while the platform captures the wisdom of crowds to predict viral phenomena."
    },
    {
      id: "architecture",
      title: "Platform Architecture",
      icon: Layers,
      content: "Built on Solana for sub-second finality and minimal fees. Smart contracts handle market creation, betting logic and automated resolution. Persistent file-based storage ensures data integrity during the test phase, with plans for full decentralization via Solana programs and IPFS integration."
    },
    {
      id: "markets",
      title: "Market Categories",
      icon: BarChart3,
      content: "Regular Markets: Longer-term predictions (24-48 hours) covering crypto trends, tech news, politics and cultural events. FOMO Markets: Ultra-short duration bets (30 minutes to 6 hours) capturing viral moments as they happen. Categories include viral content, memes, trending topics and real-time events."
    },
    {
      id: "tokenomics",
      title: "$FOMO Token Economics",
      icon: Coins,
      content: "Every platform fee (2-3% of bet volume) automatically triggers $FOMO token buybacks from open markets. Purchased tokens are either burned to reduce supply or treasured for ecosystem development. This creates a direct link between platform usage and token value appreciation, aligning user activity with holder interests."
    },
    {
      id: "gamification",
      title: "Gamification & Incentives",
      icon: Gamepad2,
      content: "Leaderboards track top predictors across different timeframes and categories. Streak multipliers reward consistent accuracy. Reputation scoring builds long-term credibility. Achievement systems and badges create engagement loops while identifying the best cultural forecasters on the platform."
    },
    {
      id: "technology",
      title: "Technical Infrastructure",
      icon: Network,
      content: "Solana blockchain for fast, cheap transactions. Next.js frontend with React Query for real-time data. Persistent storage with automatic data validation. Wallet integration via Solana adapters. Real-time market updates and live betting. Automated market resolution and payout distribution."
    },
    {
      id: "security",
      title: "Security & Trust",
      icon: Shield,
      content: "Solana wallet authentication ensures user identity. Atomic transaction handling prevents double-spending. Balance validation and rollback mechanisms protect against race conditions. All market data is cryptographically verifiable. Admin controls limited to market resolution and emergency functions only."
    },
    {
      id: "economics",
      title: "Platform Economics",
      icon: DollarSign,
      content: "Users start with 10,000 test points during the public beta. Platform takes 2-3% fee on winning bets. Winners receive proportional payouts based on pool distribution. Early withdrawal includes penalty fees to discourage gaming. All fees fuel $FOMO token buybacks creating sustainable value accrual."
    }
  ]

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-fomora-red/5 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-fomora-red/3 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50 border-gray-200"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <a 
                href="https://x.com/tryfomora" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>Follow Us</span>
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
            </Button>
            <Button asChild className="bg-fomora-red hover:bg-fomora-red-dark">
              <Link href="/app">Enter App</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
        <motion.div 
          className="container mx-auto max-w-4xl text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Badge className="mb-8 text-lg px-8 py-3 bg-fomora-red/10 text-fomora-red border-fomora-red/20 hover:bg-fomora-red/20 transition-colors">
              Technical Whitepaper v1.0
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-heading font-bold mb-8 leading-none"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-fomora-red via-fomora-red-light to-fomora-red-dark bg-clip-text text-transparent">
              Fomora Protocol
            </span>
            <br />
            <span className="text-fomora-black">Whitepaper</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Decentralized Prediction Markets for Internet Culture
            <br />
            <span className="text-lg text-gray-600">Transforming Virality into a Tradable Asset Class</span>
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Published: January 2025</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Fomora Team</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Table of Contents */}
      <section className="py-16 px-4 bg-gray-50">
        <motion.div 
          className="container mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-heading font-bold mb-8 text-center text-fomora-black">
            Table of Contents
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sections.map((section, index) => (
              <motion.a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-fomora-red/40 hover:shadow-md transition-all duration-300 group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-fomora-red/10 rounded-lg flex items-center justify-center group-hover:bg-fomora-red/20 transition-colors">
                  <section.icon className="w-4 h-4 text-fomora-red" />
                </div>
                <span className="font-medium text-fomora-black group-hover:text-fomora-red transition-colors">
                  {section.title}
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Content Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              className="mb-20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden border-gray-200 hover:border-fomora-red/40 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-fomora-red/10 to-fomora-red/5 rounded-xl flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-fomora-red" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-fomora-black">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {section.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-fomora-black via-gray-900 to-fomora-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-heading font-bold mb-6 text-white">
              Key Platform Metrics
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Current platform statistics during the 48-hour public test phase
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Users,
                value: "10,000",
                label: "Test Points",
                description: "Free starting balance"
              },
              {
                icon: Clock,
                value: "48 Hours",
                label: "Test Duration",
                description: "Live prediction markets"
              },
              {
                icon: BarChart3,
                value: "35+",
                label: "Active Markets",
                description: "Regular + FOMO markets"
              },
              {
                icon: Zap,
                value: "2-3%",
                label: "Platform Fee",
                description: "Powers $FOMO buybacks"
              }
            ].map((metric, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-fomora-red to-fomora-red-light rounded-full mb-4">
                  <metric.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                <div className="text-fomora-red font-medium mb-1">{metric.label}</div>
                <div className="text-gray-400 text-sm">{metric.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-fomora-red via-fomora-red-light to-fomora-red-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <motion.div 
          className="container mx-auto max-w-4xl text-center relative z-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-heading font-bold mb-6 text-white">
            Experience Fomora Today
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join the 48-hour public test. Connect your Solana wallet and start predicting 
            the future of internet culture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-12 py-6 bg-white text-fomora-red hover:bg-gray-50" asChild>
              <Link href="/app">Enter App</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-12 py-6 border-white text-white hover:bg-white/10" asChild>
              <Link href="/app/rules">View Rules</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/95 backdrop-blur-md py-12 px-4 border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <Link href="/">
              <Logo />
            </Link>
            <div className="flex space-x-8 mt-6 md:mt-0">
              <Link href="/app/rules" className="text-sm text-gray-600 hover:text-fomora-red transition-colors">
                Rules
              </Link>
              <a 
                href="https://x.com/tryfomora" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-fomora-red transition-colors"
              >
                Twitter
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-fomora-red transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-gray-500 border-gray-200">
            <p>© 2025 Fomora. Public test — No real money involved.</p>
            <p className="mt-2">Transforming internet culture into tradable markets on Solana.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
