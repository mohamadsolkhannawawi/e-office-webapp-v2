"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Database,
    Mail,
    FileText,
    Server,
    Shield,
    Bell,
    Globe,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    HardDrive,
    Clock,
    Key,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";

interface SystemConfig {
    // Application Settings
    appName: string;
    appDescription: string;
    appUrl: string;
    maintenanceMode: boolean;

    // Email Settings
    emailEnabled: boolean;
    emailHost: string;
    emailPort: number;
    emailUser: string;
    emailFrom: string;
    emailFromName: string;

    // Notification Settings
    notificationEnabled: boolean;
    notificationRetentionDays: number;

    // Letter Numbering Settings
    letterNumberingFormat: string;
    letterNumberingPrefix: string;
    letterNumberingResetAnnually: boolean;

    // Storage Settings
    maxFileSize: number; // in MB
    allowedFileTypes: string;
    storageProvider: string;

    // Security Settings
    sessionTimeout: number; // in minutes
    passwordMinLength: number;
    requirePasswordChange: boolean;
    passwordChangeDays: number;

    // System Info (read-only)
    version: string;
    lastUpdated: string;
}

export default function SystemSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<SystemConfig>({
        appName: "E-Office FSM UNDIP",
        appDescription: "Sistem Manajemen Surat Elektronik",
        appUrl: "http://localhost:3000",
        maintenanceMode: false,
        emailEnabled: true,
        emailHost: "",
        emailPort: 587,
        emailUser: "",
        emailFrom: "",
        emailFromName: "E-Office FSM UNDIP",
        notificationEnabled: true,
        notificationRetentionDays: 30,
        letterNumberingFormat: "{PREFIX}/{NUMBER}/{MONTH}/{YEAR}",
        letterNumberingPrefix: "FSM",
        letterNumberingResetAnnually: true,
        maxFileSize: 10,
        allowedFileTypes: "pdf,doc,docx,jpg,jpeg,png",
        storageProvider: "supabase",
        sessionTimeout: 60,
        passwordMinLength: 8,
        requirePasswordChange: false,
        passwordChangeDays: 90,
        version: "2.0.0",
        lastUpdated: new Date().toISOString(),
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            // TODO: Fetch from API
            // const response = await fetch('/api/admin/system/config');
            // const data = await response.json();
            // setConfig(data);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
            console.error("Error loading config:", error);
            toast.error("Gagal memuat konfigurasi sistem");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // TODO: Save to API
            // await fetch('/api/admin/system/config', {
            //     method: 'PUT',
            //     body: JSON.stringify(config),
            // });

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast.success("Konfigurasi sistem berhasil disimpan");
        } catch (error) {
            console.error("Error saving config:", error);
            toast.error("Gagal menyimpan konfigurasi sistem");
        } finally {
            setSaving(false);
        }
    };

    const updateConfig = (
        key: keyof SystemConfig,
        value: SystemConfig[keyof SystemConfig],
    ) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-undip-blue" />
                    <p className="mt-4 text-gray-600">
                        Memuat konfigurasi sistem...
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
                        Pengaturan Sistem
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Konfigurasi dan pengaturan sistem E-Office FSM UNDIP
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-undip-blue hover:bg-undip-blue/90 rounded-xl"
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Simpan Perubahan
                        </>
                    )}
                </Button>
            </div>

            {/* System Status Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Status Sistem
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {config.maintenanceMode
                                        ? "Maintenance"
                                        : "Aktif"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-undip-blue/10 p-3">
                                <Server className="h-6 w-6 text-undip-blue" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Versi</p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {config.version}
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
                                    Storage
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {config.storageProvider.toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-100 p-3">
                                <Clock className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Session
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {config.sessionTimeout}m
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Application Settings */}
            <Card className="border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-undip-blue" />
                        Pengaturan Aplikasi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="appName">Nama Aplikasi</Label>
                            <Input
                                id="appName"
                                value={config.appName}
                                onChange={(e) =>
                                    updateConfig("appName", e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appUrl">URL Aplikasi</Label>
                            <Input
                                id="appUrl"
                                value={config.appUrl}
                                onChange={(e) =>
                                    updateConfig("appUrl", e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="appDescription">Deskripsi</Label>
                        <Textarea
                            id="appDescription"
                            value={config.appDescription}
                            onChange={(e) =>
                                updateConfig("appDescription", e.target.value)
                            }
                            rows={2}
                        />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            <div>
                                <p className="font-medium text-slate-800">
                                    Mode Maintenance
                                </p>
                                <p className="text-sm text-slate-500">
                                    Nonaktifkan akses pengguna sementara
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={config.maintenanceMode}
                            onCheckedChange={(checked) =>
                                updateConfig("maintenanceMode", checked)
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Email Settings */}
            <Card className="border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-undip-blue" />
                        Pengaturan Email
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-undip-blue" />
                            <div>
                                <p className="font-medium text-slate-800">
                                    Aktifkan Email
                                </p>
                                <p className="text-sm text-slate-500">
                                    Kirim notifikasi via email
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={config.emailEnabled}
                            onCheckedChange={(checked) =>
                                updateConfig("emailEnabled", checked)
                            }
                        />
                    </div>

                    {config.emailEnabled && (
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="emailHost">SMTP Host</Label>
                                    <Input
                                        id="emailHost"
                                        value={config.emailHost}
                                        onChange={(e) =>
                                            updateConfig(
                                                "emailHost",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="smtp.gmail.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emailPort">SMTP Port</Label>
                                    <Input
                                        id="emailPort"
                                        type="number"
                                        value={config.emailPort}
                                        onChange={(e) =>
                                            updateConfig(
                                                "emailPort",
                                                parseInt(e.target.value),
                                            )
                                        }
                                        placeholder="587"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="emailUser">
                                        Email Username
                                    </Label>
                                    <Input
                                        id="emailUser"
                                        value={config.emailUser}
                                        onChange={(e) =>
                                            updateConfig(
                                                "emailUser",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emailFrom">
                                        Email Pengirim
                                    </Label>
                                    <Input
                                        id="emailFrom"
                                        value={config.emailFrom}
                                        onChange={(e) =>
                                            updateConfig(
                                                "emailFrom",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emailFromName">
                                    Nama Pengirim
                                </Label>
                                <Input
                                    id="emailFromName"
                                    value={config.emailFromName}
                                    onChange={(e) =>
                                        updateConfig(
                                            "emailFromName",
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-undip-blue" />
                        Pengaturan Notifikasi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-undip-blue" />
                            <div>
                                <p className="font-medium text-slate-800">
                                    Aktifkan Notifikasi
                                </p>
                                <p className="text-sm text-slate-500">
                                    Tampilkan notifikasi in-app
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={config.notificationEnabled}
                            onCheckedChange={(checked) =>
                                updateConfig("notificationEnabled", checked)
                            }
                        />
                    </div>

                    {config.notificationEnabled && (
                        <div className="space-y-2">
                            <Label htmlFor="notificationRetention">
                                Retensi Notifikasi (hari)
                            </Label>
                            <Input
                                id="notificationRetention"
                                type="number"
                                value={config.notificationRetentionDays}
                                onChange={(e) =>
                                    updateConfig(
                                        "notificationRetentionDays",
                                        parseInt(e.target.value),
                                    )
                                }
                            />
                            <p className="text-sm text-slate-500">
                                Notifikasi akan dihapus otomatis setelah{" "}
                                {config.notificationRetentionDays} hari
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Letter Numbering Settings */}
            <Card className="border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-undip-blue" />
                        Pengaturan Penomoran Surat
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="letterPrefix">Prefix Nomor</Label>
                            <Input
                                id="letterPrefix"
                                value={config.letterNumberingPrefix}
                                onChange={(e) =>
                                    updateConfig(
                                        "letterNumberingPrefix",
                                        e.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="FSM"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="letterFormat">Format Nomor</Label>
                            <Input
                                id="letterFormat"
                                value={config.letterNumberingFormat}
                                onChange={(e) =>
                                    updateConfig(
                                        "letterNumberingFormat",
                                        e.target.value,
                                    )
                                }
                                placeholder="{PREFIX}/{NUMBER}/{MONTH}/{YEAR}"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-undip-blue" />
                            <div>
                                <p className="font-medium text-slate-800">
                                    Reset Nomor Setiap Tahun
                                </p>
                                <p className="text-sm text-slate-500">
                                    Mulai dari 1 setiap tahun baru
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={config.letterNumberingResetAnnually}
                            onCheckedChange={(checked) =>
                                updateConfig(
                                    "letterNumberingResetAnnually",
                                    checked,
                                )
                            }
                        />
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm font-medium text-slate-800 mb-1">
                            Contoh Nomor Surat:
                        </p>
                        <p className="font-mono text-undip-blue font-bold">
                            {config.letterNumberingPrefix}/001/
                            {new Date().getMonth() + 1}/
                            {new Date().getFullYear()}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Storage Settings */}
            <Card className="border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-undip-blue" />
                        Pengaturan Storage
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="storageProvider">
                                Storage Provider
                            </Label>
                            <Select
                                value={config.storageProvider}
                                onValueChange={(value) =>
                                    updateConfig("storageProvider", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="supabase">
                                        Supabase Storage
                                    </SelectItem>
                                    <SelectItem value="minio">MinIO</SelectItem>
                                    <SelectItem value="s3">
                                        Amazon S3
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxFileSize">
                                Ukuran File Maksimal (MB)
                            </Label>
                            <Input
                                id="maxFileSize"
                                type="number"
                                value={config.maxFileSize}
                                onChange={(e) =>
                                    updateConfig(
                                        "maxFileSize",
                                        parseInt(e.target.value),
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="allowedTypes">
                            Tipe File yang Diizinkan
                        </Label>
                        <Input
                            id="allowedTypes"
                            value={config.allowedFileTypes}
                            onChange={(e) =>
                                updateConfig("allowedFileTypes", e.target.value)
                            }
                            placeholder="pdf,doc,docx,jpg,jpeg,png"
                        />
                        <p className="text-sm text-slate-500">
                            Pisahkan dengan koma (,)
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-undip-blue" />
                        Pengaturan Keamanan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="sessionTimeout">
                                Session Timeout (menit)
                            </Label>
                            <Input
                                id="sessionTimeout"
                                type="number"
                                value={config.sessionTimeout}
                                onChange={(e) =>
                                    updateConfig(
                                        "sessionTimeout",
                                        parseInt(e.target.value),
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="passwordMinLength">
                                Panjang Password Minimal
                            </Label>
                            <Input
                                id="passwordMinLength"
                                type="number"
                                value={config.passwordMinLength}
                                onChange={(e) =>
                                    updateConfig(
                                        "passwordMinLength",
                                        parseInt(e.target.value),
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Key className="h-5 w-5 text-undip-blue" />
                            <div>
                                <p className="font-medium text-slate-800">
                                    Wajib Ganti Password Berkala
                                </p>
                                <p className="text-sm text-slate-500">
                                    Pengguna harus mengganti password secara
                                    berkala
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={config.requirePasswordChange}
                            onCheckedChange={(checked) =>
                                updateConfig("requirePasswordChange", checked)
                            }
                        />
                    </div>
                    {config.requirePasswordChange && (
                        <div className="space-y-2">
                            <Label htmlFor="passwordChangeDays">
                                Periode Ganti Password (hari)
                            </Label>
                            <Input
                                id="passwordChangeDays"
                                type="number"
                                value={config.passwordChangeDays}
                                onChange={(e) =>
                                    updateConfig(
                                        "passwordChangeDays",
                                        parseInt(e.target.value),
                                    )
                                }
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* System Information */}
            <Card className="border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-undip-blue" />
                        Informasi Sistem
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-slate-500 mb-1">
                                Versi Aplikasi
                            </p>
                            <p className="font-bold text-slate-800">
                                {config.version}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-sm text-slate-500 mb-1">
                                Terakhir Diperbarui
                            </p>
                            <p className="font-bold text-slate-800">
                                {new Date(config.lastUpdated).toLocaleString(
                                    "id-ID",
                                    {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    },
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
