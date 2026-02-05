"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    getLetterConfig,
    updateLetterConfig,
    LeadershipConfig,
} from "@/lib/application-api";
import { Loader2, Save, UserCog } from "lucide-react";
import toast from "react-hot-toast";

export default function UpaSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // WD1 Config State
    const [wd1Config, setWd1Config] = useState<LeadershipConfig>({
        name: "",
        nip: "",
        jabatan: "",
    });

    const loadConfigs = useCallback(async () => {
        setLoading(true);
        try {
            const config = await getLetterConfig("WAKIL_DEKAN_1");
            if (config) {
                setWd1Config(config);
            }
        } catch (error) {
            console.error("Failed to load configs", error);
            toast.error(
                "Gagal memuat konfigurasi. Silakan refresh halaman atau hubungi administrator",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConfigs();
    }, [loadConfigs]);

    const handleSaveWd1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const success = await updateLetterConfig(
                "WAKIL_DEKAN_1",
                wd1Config as unknown as Record<string, unknown>,
            );
            if (success) {
                toast.success(
                    "Konfigurasi Wakil Dekan 1 berhasil diperbarui! Perubahan telah tersimpan",
                );
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error(error);
            toast.error(
                "Terjadi kesalahan sistem saat menyimpan. Silakan coba lagi atau hubungi administrator",
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Pengaturan Sistem
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Kelola konfigurasi surat dan data pejabat penandatangan.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-3xl">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-50 rounded-2xl">
                                <UserCog className="h-5 w-5 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">
                                Wakil Dekan 1
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveWd1} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="wd1Name">
                                    Nama Lengkap & Gelar
                                </Label>
                                <Input
                                    id="wd1Name"
                                    value={wd1Config.name}
                                    onChange={(e) =>
                                        setWd1Config({
                                            ...wd1Config,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Prof. Dr. Ngadiwiyana, S.Si., M.Si."
                                    className="rounded-3xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wd1Nip">NIP</Label>
                                <Input
                                    id="wd1Nip"
                                    value={wd1Config.nip}
                                    onChange={(e) =>
                                        setWd1Config({
                                            ...wd1Config,
                                            nip: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: 196906201999031002"
                                    className="rounded-3xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="wd1Jabatan">
                                    Jabatan Struktural
                                </Label>
                                <Input
                                    id="wd1Jabatan"
                                    value={wd1Config.jabatan}
                                    onChange={(e) =>
                                        setWd1Config({
                                            ...wd1Config,
                                            jabatan: e.target.value,
                                        })
                                    }
                                    placeholder="Contoh: Wakil Dekan Akademik dan Kemahasiswaan"
                                    className="rounded-3xl"
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full rounded-3xl"
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
                        </form>
                    </CardContent>
                </Card>

                {/* Placeholder for future configs like Kop Surat */}
                <Card className="opacity-60 rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Kop Surat (Coming Soon)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Konfigurasi alamat, nomor telepon, dan logo kop
                            surat akan tersedia di pembaruan berikutnya.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
