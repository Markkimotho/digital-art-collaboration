import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@prisma/client',
    'better-sqlite3',
    '@prisma/adapter-better-sqlite3',
  ],
  webpack: (config, { isServer }) => {
    // Prisma 7 TypeScript-native client uses .js extensions that resolve to .ts files
    // Configure webpack to try .ts before .js for these imports
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js', '.jsx'],
        '.mjs': ['.mts', '.mjs'],
        '.cjs': ['.cts', '.cjs'],
      },
    }

    if (isServer) {
      // Prevent socket.io optional peer deps from breaking server builds
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'utf-8-validate': 'commonjs utf-8-validate',
          bufferutil: 'commonjs bufferutil',
        })
      }
    }

    return config
  },
}

export default nextConfig
