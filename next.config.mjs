/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/brands/unifi", destination: "/brands/ubiquiti", permanent: true },
      { source: "/brands/ruijie", destination: "/brands/ruijie-networks", permanent: true },
      { source: "/products/routers", destination: "/products/networking", permanent: true },
      { source: "/products/switches-gateways", destination: "/products/networking", permanent: true },
    ];
  },
};
export default nextConfig;
