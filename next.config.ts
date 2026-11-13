import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Album art and profile pictures come from wherever the API says (Audius content nodes,
  // IPFS gateways, the backend's own storage), so plain <img> is used and no host list is kept.
  images: { unoptimized: true },
};

export default nextConfig;
