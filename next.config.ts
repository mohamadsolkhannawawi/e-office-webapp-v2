import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "api.qrserver.com",
                port: "",
                pathname: "/v1/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "9000",
                pathname: "/**",
            },
        ],
    },
    rewrites: async () => {
        return {
            beforeFiles: [
                {
                    source: "/api/:path*",
                    destination: "http://localhost:3005/api/:path*",
                },
            ],
        };
    },
};

export default nextConfig;
