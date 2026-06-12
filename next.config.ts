import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray package-lock.json in the
  // home directory otherwise makes Next/Turbopack infer the wrong root, which
  // can misdirect file tracing and env resolution (locally and on Render).
  turbopack: {
    root: import.meta.dirname,
  },
  // Allow <Image> to load Supabase Storage public objects (cover art) from this
  // project's bucket host, scoped to the public object path.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vgsiwqrovctitxkruwpj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Google profile avatars (user_metadata.avatar_url) for the account menu.
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
