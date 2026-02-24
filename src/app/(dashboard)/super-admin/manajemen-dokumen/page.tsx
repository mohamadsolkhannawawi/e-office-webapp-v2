"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FolderKanban,
    Trash2,
    HardDrive,
    BarChart3,
    FileText,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    Database,
    Files,
    Clock,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from "react-hot-toast";

interface FileStatistics {
    totalFiles: number;
    totalSizeMB: string;
    filesByLetterInstance: Record<string, number>;
    duplicateInstances: Record<string, number>;
}

interface CleanupResult {
    message: string;
    before?: {
        totalFiles: number;
        totalSizeMB: string;
    };
    after?: {
        totalFiles: number;
        totalSizeMB: string;
    };
    saved?: {
        files: number;
        sizeMB: string;
    };
    removed?: {
        files: number;
        sizeMB: string;
    };
}

export default function DocumentManagementPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<FileStatistics | null>(null);
    const [processing, setProcessing] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        type: "all" | "orphaned" | "temp" | null;
        title: string;
        description: string;
    }>({
        open: false,
        type: null,
        title: "",
        description: "",
    });

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/admin/documents/statistics", {
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch statistics");
            }

            const data = await response.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Error loading statistics:", error);
            toast.error("Gagal memuat statistik dokumen");
        } finally {
            setLoading(false);
        }
    };

    const handleCleanup = async (type: "all" | "orphaned" | "temp") => {
        try {
            setProcessing(true);
            let endpoint = "";
            let successMessage = "";

            switch (type) {
                case "all":
                    endpoint = "/api/admin/documents/cleanup-all";
                    successMessage = "Cleanup dokumen duplikat berhasil";
                    break;
                case "orphaned":
                    endpoint = "/api/admin/documents/cleanup-orphaned";
                    successMessage = "Cleanup file orphaned berhasil";
                    break;
                case "temp":
                    endpoint = "/api/admin/documents/cleanup-temp";
                    successMessage = "Cleanup file temporary berhasil";
                    break;
            }

            const response = await fetch(endpoint, {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Cleanup failed");
            }

            const data = await response.json();
            if (data.success) {
                const result = data.data as CleanupResult;

                // Show detailed results
                if (result.saved) {
                    toast.success(
                        `${successMessage}\n${result.saved.files} file dihapus (${result.saved.sizeMB} MB dihemat)`,
                    );
                } else if (result.removed) {
                    toast.success(
                        `${successMessage}\n${result.removed.files} file dihapus (${result.removed.sizeMB} MB dihemat)`,
                    );
                } else {
                    toast.success(successMessage);
                }

                // Reload statistics
                await loadStatistics();
            }
        } catch (error) {
            console.error("Error during cleanup:", error);
            toast.error("Gagal melakukan cleanup");
        } finally {
            setProcessing(false);
            setConfirmDialog({
                open: false,
                type: null,
                title: "",
                description: "",
            });
        }
    };

    const openConfirmDialog = (
        type: "all" | "orphaned" | "temp",
        title: string,
        description: string,
    ) => {
        setConfirmDialog({
            open: true,
            type,
            title,
            description,
        });
    };

    const duplicateCount = stats
        ? Object.keys(stats.duplicateInstances).length
        : 0;

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-undip-blue" />
                    <p className="mt-4 text-gray-600">
                        Memuat statistik dokumen...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                        Manajemen Dokumen
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Monitor dan kelola file dokumen sistem
                    </p>
                </div>
                <Button
                    onClick={loadStatistics}
                    variant="outline"
                    disabled={loading}
                    className="rounded-xl"
                >
                    <RefreshCw
                        className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                    />
                    Refresh
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-undip-blue/10 p-3">
                                <FileText className="h-6 w-6 text-undip-blue" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total File
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {stats?.totalFiles || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-purple-100 p-3">
                                <HardDrive className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Size
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {stats?.totalSizeMB || "0"} MB
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-100 p-3">
                                <Files className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Letter Instances
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {stats
                                        ? Object.keys(
                                              stats.filesByLetterInstance,
                                          ).length
                                        : 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div
                                className={`rounded-full p-3 ${
                                    duplicateCount > 0
                                        ? "bg-amber-100"
                                        : "bg-green-100"
                                }`}
                            >
                                <AlertTriangle
                                    className={`h-6 w-6 ${
                                        duplicateCount > 0
                                            ? "text-amber-600"
                                            : "text-green-600"
                                    }`}
                                />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Duplikat
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {duplicateCount}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Cleanup Actions */}
            <Card className="border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-undip-blue" />
                        Operasi Cleanup
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Cleanup All Duplicates */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-100 p-3">
                                <Database className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    Cleanup Dokumen Duplikat
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Hapus file lama, simpan hanya versi terbaru
                                    untuk setiap surat
                                </p>
                                {duplicateCount > 0 && (
                                    <Badge className="mt-2 bg-amber-100 text-amber-700">
                                        {duplicateCount} surat dengan duplikat
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={() =>
                                openConfirmDialog(
                                    "all",
                                    "Cleanup Dokumen Duplikat",
                                    `Operasi ini akan menghapus semua file lama dan hanya menyimpan versi terbaru untuk setiap surat. ${duplicateCount} surat akan dibersihkan.`,
                                )
                            }
                            disabled={processing || duplicateCount === 0}
                            className="bg-undip-blue hover:bg-undip-blue/90 rounded-xl"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Cleanup
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Cleanup Orphaned Files */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-red-100 p-3">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    Cleanup File Orphaned
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Hapus file yang tidak memiliki record di
                                    database
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() =>
                                openConfirmDialog(
                                    "orphaned",
                                    "Cleanup File Orphaned",
                                    "Operasi ini akan menghapus semua file yang ada di storage tetapi tidak memiliki record di database. File-file ini biasanya terjadi karena error saat generate dokumen.",
                                )
                            }
                            disabled={processing}
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cleanup
                        </Button>
                    </div>

                    {/* Cleanup Temp Files */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-amber-100 p-3">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    Cleanup File Temporary
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Hapus file temporary yang sudah lebih dari 1
                                    jam
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() =>
                                openConfirmDialog(
                                    "temp",
                                    "Cleanup File Temporary",
                                    "Operasi ini akan menghapus file temporary yang sudah lebih dari 1 jam. File temporary biasanya digunakan saat proses upload dan generate dokumen.",
                                )
                            }
                            disabled={processing}
                            variant="outline"
                            className="rounded-xl"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cleanup
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* File Distribution */}
            {stats && Object.keys(stats.filesByLetterInstance).length > 0 && (
                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-undip-blue" />
                            Distribusi File per Surat
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {Object.entries(stats.filesByLetterInstance)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 20)
                                .map(([instanceId, count]) => (
                                    <div
                                        key={instanceId}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FolderKanban className="h-4 w-4 text-slate-400" />
                                            <span className="font-mono text-sm text-slate-700">
                                                {instanceId}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    count > 2
                                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                                        : "bg-green-50 text-green-700 border-green-200"
                                                }
                                            >
                                                {count} file
                                                {count > 2 && " (duplikat)"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                        </div>
                        {Object.keys(stats.filesByLetterInstance).length >
                            20 && (
                            <p className="text-sm text-slate-500 text-center mt-4">
                                Menampilkan 20 dari{" "}
                                {
                                    Object.keys(stats.filesByLetterInstance)
                                        .length
                                }{" "}
                                surat
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50 shadow-sm rounded-3xl">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <div className="rounded-full bg-undip-blue/10 p-2">
                            <CheckCircle2 className="h-5 w-5 text-undip-blue" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 mb-2">
                                Informasi Manajemen Dokumen
                            </h3>
                            <ul className="space-y-1 text-sm text-slate-600">
                                <li>
                                    • Cleanup dokumen duplikat akan menyimpan
                                    hanya versi terbaru dari setiap surat
                                </li>
                                <li>
                                    • File orphaned adalah file yang ada di
                                    storage tetapi tidak ada di database
                                </li>
                                <li>
                                    • File temporary otomatis dihapus setelah 1
                                    jam untuk menghemat storage
                                </li>
                                <li>
                                    • Setiap surat seharusnya hanya memiliki 2
                                    file: 1 DOCX dan 1 PDF
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog
                open={confirmDialog.open}
                onOpenChange={(open) =>
                    !open &&
                    setConfirmDialog({
                        open: false,
                        type: null,
                        title: "",
                        description: "",
                    })
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmDialog.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.description}
                            <br />
                            <br />
                            <strong className="text-amber-600">
                                Operasi ini tidak dapat dibatalkan!
                            </strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                confirmDialog.type &&
                                handleCleanup(confirmDialog.type)
                            }
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Ya, Lanjutkan"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
