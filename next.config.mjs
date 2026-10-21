const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Keep Turbopack rooted in this app when a parent lockfile exists.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Only the public course-images bucket of our own Supabase project.
    remotePatterns: supabaseUrl
      ? [new URL(`${supabaseUrl}/storage/v1/object/public/course-images/**`)]
      : [],
  },
  // The page was renamed; keep old links working.
  async redirects() {
    return [{ source: "/live-coaching", destination: "/online-access", permanent: true }];
  },
  experimental: {
    serverActions: {
      // Course images are capped at 5 MB; leave room for the other fields.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
