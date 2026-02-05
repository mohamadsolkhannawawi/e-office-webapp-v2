"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader, InlineLoader } from "@/components/ui/loader";

export default function LoaderShowcase() {
    const [activeDemo, setActiveDemo] = useState<string>("");

    const demos = [
        {
            id: "spinner-sm",
            title: "Small Spinner",
            component: (
                <Loader size="sm" variant="spinner" message="Loading..." />
            ),
        },
        {
            id: "spinner-md",
            title: "Medium Spinner",
            component: (
                <Loader
                    size="md"
                    variant="spinner"
                    message="Processing data..."
                />
            ),
        },
        {
            id: "spinner-lg",
            title: "Large Spinner",
            component: (
                <Loader
                    size="lg"
                    variant="spinner"
                    message="Generating report..."
                />
            ),
        },
        {
            id: "dots-md",
            title: "Dots Loader",
            component: (
                <Loader size="md" variant="dots" message="Uploading files..." />
            ),
        },
        {
            id: "pulse-lg",
            title: "Pulse Loader",
            component: (
                <Loader size="lg" variant="pulse" message="Syncing data..." />
            ),
        },
        {
            id: "inline-sm",
            title: "Inline Small",
            component: <InlineLoader size="sm" message="Loading content..." />,
        },
        {
            id: "inline-md",
            title: "Inline Medium",
            component: (
                <InlineLoader
                    size="md"
                    variant="dots"
                    message="Fetching results..."
                />
            ),
        },
    ];

    const handleDemoClick = (demoId: string) => {
        setActiveDemo(demoId);
        setTimeout(() => setActiveDemo(""), 3000);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">
                    Showcase Variasi Loader
                </h1>
                <p className="text-slate-600">
                    Berbagai jenis dan ukuran loader yang tersedia
                </p>
            </div>

            {/* Demo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {demos.map((demo) => (
                    <Card key={demo.id} className="p-4">
                        <h3 className="font-semibold mb-3">{demo.title}</h3>
                        <div className="min-h-20 items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                            {activeDemo === demo.id ? (
                                demo.component
                            ) : (
                                <Button
                                    onClick={() => handleDemoClick(demo.id)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    Click to Demo
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Code Examples */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Contoh Kode</h2>
                <div className="space-y-4 text-sm">
                    <div>
                        <h3 className="font-medium mb-2">Basic Loader:</h3>
                        <pre className="bg-slate-100 p-3 rounded overflow-x-auto">
                            <code>{`<Loader size="md" variant="spinner" message="Loading..." />`}</code>
                        </pre>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Fullscreen Loader:</h3>
                        <pre className="bg-slate-100 p-3 rounded overflow-x-auto">
                            <code>{`<Loader size="lg" fullScreen overlay message="Processing..." />`}</code>
                        </pre>
                    </div>
                    <div>
                        <h3 className="font-medium mb-2">Inline Loader:</h3>
                        <pre className="bg-slate-100 p-3 rounded overflow-x-auto">
                            <code>{`<InlineLoader size="sm" variant="dots" message="Loading content..." />`}</code>
                        </pre>
                    </div>
                </div>
            </Card>

            {/* Size Comparison */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Perbandingan Ukuran
                </h2>
                <div className="flex items-center justify-around">
                    <div className="text-center">
                        <Loader size="sm" />
                        <p className="mt-2 text-xs">Small</p>
                    </div>
                    <div className="text-center">
                        <Loader size="md" />
                        <p className="mt-2 text-xs">Medium</p>
                    </div>
                    <div className="text-center">
                        <Loader size="lg" />
                        <p className="mt-2 text-xs">Large</p>
                    </div>
                    <div className="text-center">
                        <Loader size="xl" />
                        <p className="mt-2 text-xs">Extra Large</p>
                    </div>
                </div>
            </Card>

            {/* Variant Comparison */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Perbandingan Varian
                </h2>
                <div className="flex items-center justify-around">
                    <div className="text-center">
                        <Loader size="lg" variant="spinner" />
                        <p className="mt-2 text-xs">Spinner</p>
                    </div>
                    <div className="text-center">
                        <Loader size="lg" variant="dots" />
                        <p className="mt-2 text-xs">Dots</p>
                    </div>
                    <div className="text-center">
                        <Loader size="lg" variant="pulse" />
                        <p className="mt-2 text-xs">Pulse</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
