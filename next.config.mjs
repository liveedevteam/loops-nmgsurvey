/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize for production
  poweredByHeader: false,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_COUPON_DISCOUNT: process.env.COUPON_DISCOUNT_TEXT || '10% OFF',
  },
  
  // Webpack config for handling ES modules
  webpack: (config) => {
    // Fix for certain LINE SDK modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;

