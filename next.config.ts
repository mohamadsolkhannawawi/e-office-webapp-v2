import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:3005";
const minioHost = process.env.NEXT_PUBLIC_MINIO_HOST || "localhost";
const minioPort = process.env.NEXT_PUBLIC_MINIO_PORT || "9000";

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
                hostname: minioHost,
                port: minioPort,
                pathname: "/**",
            },
        ],
    },
    rewrites: async () => {
        return {
            beforeFiles: [
                {
                    source: "/api/:path*",
                    destination: `${backendUrl}/api/:path*`,
                },
            ],
        };
    },
};

export default nextConfig;
