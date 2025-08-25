// next.config.mjs (ESM)
const isProd = process.env.GITHUB_ACTIONS === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           
  images: { unoptimized: true },
  basePath: isProd ? '/solverProgramacion' : '',
  assetPrefix: isProd ? '/solverProgramacion/' : '',
  trailingSlash: true         
};

export default nextConfig;
