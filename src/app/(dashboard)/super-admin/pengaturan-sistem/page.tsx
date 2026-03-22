"use client";

import React, { useState, useEffect } from "react";
import { Card, CardKonten, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  Building2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { getSystemConfig, updateSystemConfig } from "@/lib/admin-api";

interface LetterConfig {
  id: string;
  key: string;
  value: Record<string, string>;
  version: number;
  isActive: boolean;
  updatedAt: string;
}

const PEJABAT_LABELS: Record<string, string> = {
  WAKIL_DEKAN_1: "Wakil Dekan Akademik dan Kemahasiswaan",
  SUPERVISOR: "Supervisor Akademik",
  MANAJER: "Manajer TU",
  UPA: "Unit Pelayanan Akademik",
};

const KOP_FIELDS = [
  { field: "kementerian", label: "Kementerian" },
  { field: "universitas", label: "Universitas" },
  { field: "fakultas", label: "Fakultas" },
  { field: "alamat", label: "Alamat" },
  { field: "kampus", label: "Kampus" },
  { field: "kota", label: "Kota" },
  { field: "kodePos", label: "Kode Pos" },
  { field: "telp", label: "Telepon" },
  { field: "fax", label: "Fax" },
  { field: "website", label: "Website" },
  { field: "email", label: "Email" },
];

export default function SystemSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<LetterConfig[]>([]);
  const [editValues, setEditValues] = useState<
    Record<string, Record<string, string>>
  >({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getSystemConfig();
      const cfgList: LetterConfig[] = data.configs || [];
      setConfigs(cfgList);

      // Inisialisasi nilai editable dari data yang dimuat
      const initial: Record<string, Record<string, string>> = {};
      for (const cfg of cfgList) {
        initial[cfg.key] = Object.fromEntries(
          Object.entries(cfg.value).map(([k, v]) => [k, String(v ?? "")]),
        );
      }
      setEditValues(initial);
    } catch (error) {
      console.error("Error loading config:", error);
      toast.error("Gagal memuat konfigurasi sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (cfg: LetterConfig) => {
    try {
      setSavingKey(cfg.key);
      await updateSystemConfig(cfg.id, editValues[cfg.key]);
      toast.success(
        `Konfigurasi ${PEJABAT_LABELS[cfg.key] || cfg.key} berhasil disimpan`,
      );
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Gagal menyimpan konfigurasi");
    } finally {
      setSavingKey(null);
    }
  };

  const updateField = (configKey: string, field: string, value: string) => {
    setEditValues((prev) => ({
      ...prev,
      [configKey]: { ...prev[configKey], [field]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-undip-blue" />
          <p className="mt-4 text-gray-600">Memuat konfigurasi sistem...</p>
        </div>
      </div>
    );
  }

  const kopConfig = configs.find((c) => c.key === "KOP_SURAT_FSM");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Pengaturan Sistem
          </h1>
          <p className="text-slate-500 text-lg">
            Konfigurasi kop surat resmi dan parameter sistem
          </p>
        </div>
        <Button
          onClick={loadConfig}
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardKonten className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Status Sistem</p>
                <p className="text-2xl font-bold text-slate-800">Aktif</p>
              </div>
            </div>
          </CardKonten>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardKonten className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-undip-blue/10 p-3">
                <FileText className="h-6 w-6 text-undip-blue" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Konfigurasi Kop Surat</p>
                <p className="text-2xl font-bold text-slate-800">
                  {kopConfig ? 1 : 0}
                </p>
              </div>
            </div>
          </CardKonten>
        </Card>
        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardKonten className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Konfigurasi</p>
                <p className="text-2xl font-bold text-slate-800">
                  {configs.length}
                </p>
              </div>
            </div>
          </CardKonten>
        </Card>
      </div>

      {/* Kop Surat */}
      {kopConfig && (
        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-undip-blue" />
                Kop Surat Resmi
              </CardTitle>
              <Button
                size="sm"
                onClick={() => handleSaveConfig(kopConfig)}
                disabled={savingKey === kopConfig.key}
                className="bg-undip-blue hover:bg-undip-blue/90 rounded-xl"
              >
                {savingKey === kopConfig.key ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-3 w-3" />
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardKonten>
            <div className="grid gap-4 md:grid-cols-2">
              {KOP_FIELDS.map(({ field, label }) => (
                <div key={field} className="space-y-2">
                  <Label>{label}</Label>
                  <Input
                    value={editValues[kopConfig.key]?.[field] || ""}
                    onChange={(e) =>
                      updateField(kopConfig.key, field, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </CardKonten>
        </Card>
      )}
    </div>
  );
}

