"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "spinner" | "dots" | "pulse";
    fullScreen?: boolean;
    overlay?: boolean;
    message?: string;
    className?: string;
}

const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
};

// Spinner Component
const Spinner = ({
    size = "md",
    className,
}: {
    size: string;
    className?: string;
}) => (
    <Loader2
        className={cn(
            sizeMap[size as keyof typeof sizeMap],
            "animate-spin",
            className,
        )}
    />
);

// Dots Component
const Dots = ({
    size = "md",
    className,
}: {
    size: string;
    className?: string;
}) => {
    const dotSize = {
        sm: "w-1 h-1",
        md: "w-2 h-2",
        lg: "w-3 h-3",
        xl: "w-4 h-4",
    };

    return (
        <div className={cn("flex space-x-1", className)}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        dotSize[size as keyof typeof dotSize],
                        "bg-primary rounded-full animate-pulse",
                    )}
                    style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: "1s",
                    }}
                />
            ))}
        </div>
    );
};

// Pulse Component
const Pulse = ({
    size = "md",
    className,
}: {
    size: string;
    className?: string;
}) => (
    <div
        className={cn(
            sizeMap[size as keyof typeof sizeMap],
            "bg-primary rounded-full animate-pulse",
            className,
        )}
    />
);

export const Loader = ({
    size = "md",
    variant = "spinner",
    fullScreen = false,
    overlay = false,
    message,
    className,
}: LoaderProps) => {
    const renderLoader = () => {
        switch (variant) {
            case "dots":
                return <Dots size={size} />;
            case "pulse":
                return <Pulse size={size} />;
            default:
                return <Spinner size={size} />;
        }
    };

    const loaderContent = (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3",
                className,
            )}
        >
            {renderLoader()}
            {message && (
                <p className="text-sm text-muted-foreground animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div
                className={cn(
                    "fixed inset-0 z-50 flex items-center justify-center",
                    overlay
                        ? "bg-background/80 backdrop-blur-sm"
                        : "bg-background",
                )}
            >
                {loaderContent}
            </div>
        );
    }

    return loaderContent;
};

// Page Loader Component
export const PageLoader = ({
    message = "Memuat halaman...",
}: {
    message?: string;
}) => (
    <Loader size="lg" variant="spinner" fullScreen overlay message={message} />
);

// Inline Loader Component
export const InlineLoader = ({
    message,
    size = "sm",
    variant = "spinner",
}: {
    message?: string;
    size?: "sm" | "md" | "lg";
    variant?: "spinner" | "dots" | "pulse";
}) => (
    <Loader size={size} variant={variant} message={message} className="py-4" />
);

// PDF Generation Loader
export const PDFLoader = ({
    message = "Menghasilkan dokumen PDF...",
}: {
    message?: string;
}) => (
    <Loader size="lg" variant="spinner" fullScreen overlay message={message} />
);

// Button Loader Component
export const ButtonLoader = ({ size = "sm" }: { size?: "sm" | "md" }) => (
    <Spinner size={size} className="mr-2" />
);

export default Loader;
