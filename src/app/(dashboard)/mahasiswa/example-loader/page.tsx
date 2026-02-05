"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePDFGeneration, useAsyncOperation } from "@/hooks/useAsyncOperation";
import { delay } from "@/hooks/useAsyncOperation";
import { Card } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function ExampleImplementation() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        scholarship: "",
    });

    const { generatePDF } = usePDFGeneration();
    const { executeWithLoading } = useAsyncOperation();

    // Example 1: PDF Generation
    const handleGeneratePDF = async () => {
        await generatePDF(async () => {
            // Simulate PDF generation process
            await delay(3000);

            // Mock PDF generation
            const pdfBlob = new Blob(["Mock PDF Content"], {
                type: "application/pdf",
            });
            const pdfUrl = URL.createObjectURL(pdfBlob);

            // Create download link
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `surat-rekomendasi-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);

            toast.success("PDF berhasil dihasilkan!");
        }, "Menghasilkan PDF Surat Rekomendasi...");
    };

    // Example 2: Form Submission with Custom Loading
    const handleSubmitForm = async () => {
        await executeWithLoading(
            async () => {
                // Simulate form submission
                await delay(2000);

                // Mock API call
                const response = await fetch("/api/submit-form", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (!response.ok) throw new Error("Failed to submit");

                toast.success("Form berhasil disubmit!");
                setFormData({ name: "", email: "", scholarship: "" });
            },
            {
                loadingKey: "form-submission",
                loadingMessage: "Menyimpan data formulir...",
                onError: () => toast.error("Gagal menyimpan form"),
            },
        );
    };

    // Example 3: Page Operation
    const handleLoadData = async () => {
        await executeWithLoading(
            async () => {
                await delay(1500);
                toast.success("Data berhasil dimuat!");
            },
            {
                usePageLoader: true,
                loadingMessage: "Memuat data aplikasi...",
            },
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">
                    Contoh Implementasi Universal Loader
                </h1>
                <p className="text-slate-600">
                    Demonstrasi penggunaan loader untuk berbagai operasi
                </p>
            </div>

            {/* Example Form */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Form Example</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Nama
                        </label>
                        <Input
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            placeholder="Masukkan nama"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                            placeholder="Masukkan email"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Beasiswa
                        </label>
                        <Input
                            value={formData.scholarship}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    scholarship: e.target.value,
                                }))
                            }
                            placeholder="Jenis beasiswa"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={handleSubmitForm} className="flex-1">
                            <FileText className="mr-2 h-4 w-4" />
                            Submit Form
                        </Button>

                        <Button
                            onClick={handleGeneratePDF}
                            variant="secondary"
                            className="flex-1"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Generate PDF
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Additional Actions */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Page Operations</h2>
                <Button
                    onClick={handleLoadData}
                    variant="outline"
                    className="w-full"
                >
                    Load Data (Page Loader)
                </Button>
            </Card>

            {/* Usage Instructions */}
            <Card className="p-6 bg-blue-50">
                <h2 className="text-lg font-semibold mb-4">Cara Penggunaan</h2>
                <div className="space-y-2 text-sm">
                    <p>
                        <strong>1. PDF Generation:</strong> Menggunakan{" "}
                        <code>usePDFGeneration()</code> untuk operasi PDF
                    </p>
                    <p>
                        <strong>2. Form Submission:</strong> Menggunakan{" "}
                        <code>useAsyncOperation()</code> dengan custom loading
                        key
                    </p>
                    <p>
                        <strong>3. Page Loading:</strong> Menggunakan page
                        loader untuk operasi yang memuat data halaman
                    </p>
                </div>
            </Card>
        </div>
    );
}
