import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasourceUrl: "postgresql://postgres:OPFJYsSxfQMvHUlQlKpJpzWjjiJSVkUr@shinkansen.proxy.rlwy.net:57939/railway"
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export * from '@prisma/client'
