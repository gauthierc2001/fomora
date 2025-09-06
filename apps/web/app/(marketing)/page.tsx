'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { TestTimer } from '@/components/test-timer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { TrendingUp, Zap, Trophy, Target, Coins, Users, BarChart3, ArrowRight, TrendingDown, Clock, Globe, Rocket } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: Target,
      title: "Meme Prediction Markets",
      description: "Bet on viral trends, meme lifecycles and cultural moments before they explode"
    },
    {
      icon: Zap,
      title: "Lightning Fast on Solana",
      description: "Sub-second transactions with minimal fees for instant market participation"
    },
    {
      icon: Coins,
      title: "$FOMO Token Flywheel",
      description: "Every platform fee buys back $FOMO tokens, directly linking growth to value"
    },
    {
      icon: Trophy,
      title: "Gamified Competition",
      description: "Leaderboards, streak multipliers and reputation scoring for top predictors"
    }
  ]

  const stats = [
    {
      icon: TrendingUp,
      value: "10,000",
      label: "Free Test Points",
      description: "Start predicting immediately"
    },
    {
      icon: Clock,
      value: "48hrs",
      label: "Test Duration",
      description: "Live prediction markets"
    },
    {
      icon: BarChart3,
      value: "15+",
      label: "Active Markets",
      description: "Viral content predictions"
    },
    {
      icon: Rocket,
      value: "$FOMO",
      label: "Future Airdrop",
      description: "For top performers"
    }
  ]


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

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Global animated background elements */}
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
          <Logo />
          <div className="flex items-center space-x-4">
            <TestTimer />
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
            <Button asChild className="bg-fomora-red hover:bg-fomora-red-dark">
              <Link href="/app">Enter App</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
        {/* Falling Fomora Logos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Falling Logos */}
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={`logo-${i}`}
              className="absolute"
              style={{
                left: `${8 + i * 9}%`,
                top: '-80px',
              }}
              animate={{
                y: [0, 1000],
                rotate: [0, 360],
                x: [0, Math.sin(i * 0.5) * 30],
                opacity: [0, 0.6, 0.4, 0],
              }}
              transition={{
                duration: 15 + i * 1.2,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 2.5,
              }}
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-lg border-2 border-fomora-red/30 overflow-hidden">
                <img
                  src="/logo.jpg"
                  alt="Fomora"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div 
          className="container mx-auto max-w-6xl text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Badge className="mb-8 text-lg px-8 py-3 bg-fomora-red/10 text-fomora-red border-fomora-red/20 hover:bg-fomora-red/20 transition-colors">
              48-Hour Public Test Live Now
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-heading font-bold mb-8 leading-none"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-fomora-red via-fomora-red-light to-fomora-red-dark bg-clip-text text-transparent">
              Fomora
            </span>
            <br />
            <span className="text-fomora-black">The Internet</span>
            <br />
            <span className="bg-gradient-to-r from-fomora-black to-gray-800 bg-clip-text text-transparent">
              Meme Prediction Market
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Transform virality into a tradable market. Predict which memes will explode, 
            which trends will dominate and profit from your cultural foresight.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            variants={itemVariants}
          >
            <Button size="lg" className="text-lg px-10 py-6 bg-fomora-red hover:bg-fomora-red-dark group" asChild>
              <Link href="/app">
                Start Predicting
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-fomora-black/20 hover:bg-gray-50 text-fomora-black" asChild>
              <Link href="/app/rules">View Rules</Link>
            </Button>
          </motion.div>

          <motion.div 
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
          >
            {stats.map((stat, index) => (
              <motion.div key={index} variants={itemVariants} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-fomora-red/10 rounded-xl mb-3">
                  <stat.icon className="h-6 w-6 text-fomora-red" />
                </div>
                <div className="text-3xl font-bold text-fomora-black">{stat.value}</div>
                <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                <div className="text-xs text-gray-600">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-32 left-20 opacity-20"
          variants={floatingVariants}
          animate="animate"
        >
          <TrendingUp className="h-8 w-8 text-fomora-red" />
        </motion.div>
        <motion.div
          className="absolute top-48 right-32 opacity-20"
          variants={floatingVariants}
          animate="animate"
          transition={{ delay: 2 }}
        >
          <Globe className="h-6 w-6 text-fomora-red-dark" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-heading font-bold mb-6 text-fomora-black">
              How Fomora Works
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              A decentralized prediction market where internet culture becomes an asset class
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-fomora-red/40 group bg-white backdrop-blur-sm">
                  <CardContent className="pt-8 pb-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-fomora-red/10 to-fomora-red/5 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-fomora-red" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-fomora-black">{feature.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Token Economics Section */}
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
            <h2 className="text-5xl font-heading font-bold mb-6 text-white">
              The $FOMO Token Flywheel
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Every platform fee generates constant demand for $FOMO tokens through automatic buybacks 
              directly linking platform growth with token value appreciation.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                step: "01",
                title: "Users Bet on Markets",
                description: "Every wager includes a small participation fee (2-3%)",
                icon: Users
              },
              {
                step: "02", 
                title: "Fees Generate Buybacks",
                description: "All fees automatically purchase $FOMO from open markets",
                icon: TrendingUp
              },
              {
                step: "03",
                title: "Value Accrues to Holders",
                description: "Tokens are burned or treasured reducing supply and driving value",
                icon: Coins
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-fomora-red to-fomora-red-light rounded-full mb-4">
                    <item.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-fomora-black">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.description}</p>
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
          <h2 className="text-5xl font-heading font-bold mb-6 text-white">
            Ready to Predict the Future of Memes?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join the 48-hour public test. Connect your Solana wallet, receive 10,000 free points 
            and start betting on what goes viral.
          </p>
          <Button size="lg" className="text-lg px-12 py-6 bg-white text-fomora-red hover:bg-gray-50 group" asChild>
            <Link href="/app">
              Enter App Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/95 backdrop-blur-md py-12 px-4 border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <Logo />
            <div className="flex space-x-8 mt-6 md:mt-0">
              <Link href="/app/rules" className="text-sm text-gray-600 hover:text-fomora-red transition-colors">
                Rules
              </Link>
              <Link href="/whitepaper" className="text-sm text-gray-600 hover:text-fomora-red transition-colors">
                Whitepaper
              </Link>
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
