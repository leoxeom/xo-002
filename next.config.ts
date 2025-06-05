/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'res.cloudinary.com',
      'golf-pass-storage.s3.amazonaws.com',
      'supabase.co'
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Enable React 19 features
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize for glassmorphism effects
    optimizePackageImports: ['framer-motion'],
    // For better DX
    typedRoutes: true,
  },
  // For better performance with large datasets
  serverExternalPackages: ['@supabase/supabase-js'],
  // Optimize for production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // For glassmorphism effects and animations
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp4|webm)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/media/',
          outputPath: 'static/media/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    return config;
  },
};

export default nextConfig;
