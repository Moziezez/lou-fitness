/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Keep Turbopack rooted in this app when a parent lockfile exists.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
