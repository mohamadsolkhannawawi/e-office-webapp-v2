import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "E-Office SRB - FSM UNDIP",
    description: "Sistem E-Office Surat Rekomendasi Beasiswa FSM UNDIP",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>
                    <LoadingProvider>
                        {children}
                        <Toaster
                            position="top-center"
                            reverseOrder={false}
                            toastOptions={{
                                style: {
                                    minWidth: "400px",
                                    minHeight: "80px",
                                    padding: "16px",
                                    borderRadius: "12px",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                },
                                success: {
                                    style: {
                                        background: "#10b981",
                                        color: "white",
                                        minWidth: "400px",
                                        minHeight: "80px",
                                        borderRadius: "12px",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                    },
                                    iconTheme: {
                                        primary: "white",
                                        secondary: "#10b981",
                                    },
                                },
                                error: {
                                    style: {
                                        background: "#ef4444",
                                        color: "white",
                                        minWidth: "400px",
                                        minHeight: "80px",
                                        borderRadius: "12px",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                    },
                                    iconTheme: {
                                        primary: "white",
                                        secondary: "#ef4444",
                                    },
                                },
                                loading: {
                                    style: {
                                        background: "#3b82f6",
                                        color: "white",
                                        minWidth: "400px",
                                        minHeight: "80px",
                                        borderRadius: "12px",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                    },
                                },
                            }}
                        />
                    </LoadingProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
