// next.config.mjs (ESM)
const isProd = process.env.GITHUB_ACTIONS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           
  images: { unoptimized: true },
  basePath: isProd ? '/programacionLineal' : '',
  assetPrefix: isProd ? '/programacionLineal/' : '',
  trailingSlash: true         
};

export default nextConfig;