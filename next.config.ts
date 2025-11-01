import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true, // cho phép build mặc dù có lỗi TS
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "salempiano.vn",
        port: "",
        pathname: "/wp-content/uploads/**", // tất cả hình trong thư mục uploads
      },
    ],
  },
};

export default nextConfig;
