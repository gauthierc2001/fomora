#!/usr/bin/env tsx

/**
 * Script to create an admin user
 * Usage: tsx scripts/setup-admin.ts <wallet_address>
 */

import { PrismaClient, Role } from '@fomora/db'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

async function createAdmin(walletAddress: string) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress }
    })

    if (existingUser) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { walletAddress },
        data: { 
          role: Role.ADMIN,
          pointsBalance: Math.max(existingUser.pointsBalance, 100000) // Ensure admin has points
        }
      })
      
      console.log('✅ Updated existing user to admin:', updatedUser.walletAddress)
    } else {
      // Create new admin user
      const adminUser = await prisma.user.create({
        data: {
          walletAddress,
          role: Role.ADMIN,
          pointsBalance: 100000,
          creditedInitial: true,
          ipHash: createHash('sha256').update('admin-setup').digest('hex')
        }
      })
      
      console.log('✅ Created new admin user:', adminUser.walletAddress)
    }

    // Log the action
    await prisma.actionLog.create({
      data: {
        type: 'ADMIN_ACTION',
        metadata: {
          action: 'admin_user_created',
          walletAddress,
          timestamp: new Date().toISOString()
        },
        ipHash: createHash('sha256').update('admin-setup').digest('hex')
      }
    })

    console.log('🎉 Admin setup complete!')
  } catch (error) {
    console.error('❌ Error creating admin:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get wallet address from command line arguments
const walletAddress = process.argv[2]

if (!walletAddress) {
  console.error('Usage: tsx scripts/setup-admin.ts <wallet_address>')
  process.exit(1)
}

if (walletAddress.length < 32 || walletAddress.length > 50) {
  console.error('Invalid wallet address format')
  process.exit(1)
}

console.log('🔧 Setting up admin user for:', walletAddress)
createAdmin(walletAddress)
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
