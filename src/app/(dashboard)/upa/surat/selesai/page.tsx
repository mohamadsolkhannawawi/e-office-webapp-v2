"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
  Select,
  SelectKonten,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  ChevronLeft,
  Pencarian,
  Calendar,
  Filter,
  Eye,
  CheckCircle,
  Download,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";
import {
  generateAndDownloadDocument,
  getTemplateIdByLetterType,
} from "@/lib/template-api";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { StandardPaginasi } from "@/components/ui/standard-pagination";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function SelesaiPage() {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setPencarianTerm] = useState("");
  const [filterBeasiswa, setFilterBeasiswa] = useState("all");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pagination, setPaginasi] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchSelesaiData = useCallback(async () => {
    setLoading(true);
    try {
      let startDateIso: string | undefined = undefined;
      let endDateIso: string | undefined = undefined;

      if (startDateInput) {
        const start = new Date(startDateInput);
        start.setHours(0, 0, 0, 0);
        startDateIso = start.toISOString();
      }

      if (endDateInput) {
        const end = new Date(endDateInput);
        end.setHours(23, 59, 59, 999);
        endDateIso = end.toISOString();
      }

      const result = await getApplications({
        status: "COMPLETED",
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        jenisBeasiswa: filterBeasiswa !== "all" ? filterBeasiswa : undefined,
        startDate: startDateIso,
        endDate: endDateIso,
        sortOrder: sortOrder,
      });
      setApplications(result.data);
      setPaginasi({
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      console.error("Error fetching selesai:", error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    filterBeasiswa,
    startDateInput,
    endDateInput,
    sortOrder,
  ]);

  const handleDownloadPDF = async (applicationId: string) => {
    try {
      const link = document.createElement("a");
      link.href = `${BASE_PATH}/api/templates/letter/${applicationId}/pdf`;
      link.download = `Surat-Rekomendasi-${applicationId}.pdf`;
      link.click();
      toast.success("PDF berhasil diunduh!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error(
        `Gagal mengunduh PDF: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`,
      );
    }
  };

  const handlePageChange = (newPage: number) => {
    setPaginasi((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPaginasi((prev) => ({ ...prev, limit: newPageSize, page: 1 }));
  };

  useEffect(() => {
    fetchSelesaiData();
  }, [fetchSelesaiData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm font-medium text-slate-500">
        <Link
          href="/upa/surat/selesai"
          className="hover:text-undip-blue transition-colors"
        >
          Surat Masuk
        </Link>
        <ChevronRight className="mx-2 h-4 w-4" />
        <span className="text-slate-800">Selesai</span>
      </nav>

      {/* Header with Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Daftar Surat Selesai
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Total {pagination.total} surat selesai
          </p>
        </div>
      </div>

      {/* Filter dan Kartu Tabel */}
      <Card className="border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 overflow-hidden bg-white rounded-3xl py-0 gap-0">
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-800">
            Daftar Surat Selesai
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Pencarian */}
            <div className="relative flex-1 min-w-50">
              <Pencarian className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama/NIM..."
                value={searchTerm}
                onChange={(e) => setPencarianTerm(e.target.value)}
                className="pl-10 h-10 border-slate-100 bg-slate-50/50 w-full"
              />
            </div>

            {/* Filter Beasiswa */}
            <Select value={filterBeasiswa} onValueChange={setFilterBeasiswa}>
              <SelectTrigger className="w-full sm:w-50 h-10 border-slate-100 text-slate-600">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Jenis Surat" />
                </div>
              </SelectTrigger>
              <SelectKonten>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="internal">Beasiswa Internal</SelectItem>
                <SelectItem value="eksternal">Beasiswa Eksternal</SelectItem>
                <SelectItem value="akademik">Beasiswa Akademik</SelectItem>
                <SelectItem value="keperluan_lain">Keperluan Lain</SelectItem>
              </SelectKonten>
            </Select>

            {/* Date Range Filter */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50/50 rounded-lg p-2 border border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400 ml-1" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label
                    htmlFor="startDate"
                    className="text-xs text-slate-500 whitespace-nowrap"
                  >
                    Dari
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                    className="h-8 text-xs border-slate-200 w-full sm:w-36"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label
                    htmlFor="endDate"
                    className="text-xs text-slate-500 whitespace-nowrap"
                  >
                    Sampai
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDateInput}
                    onChange={(e) => setEndDateInput(e.target.value)}
                    className="h-8 text-xs border-slate-200 w-full sm:w-36"
                  />
                </div>
              </div>

              {(startDateInput || endDateInput) && (
                <button
                  onClick={() => {
                    setStartDateInput("");
                    setEndDateInput("");
                  }}
                  title="Hapus filter tanggal"
                  className="self-end sm:self-auto text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort Order */}
            <Select
              value={sortOrder}
              onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
            >
              <SelectTrigger className="w-full sm:w-50 h-10 border-slate-100 text-slate-600">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Urutkan" />
                </div>
              </SelectTrigger>
              <SelectKonten>
                <SelectItem value="desc">Terbaru</SelectItem>
                <SelectItem value="asc">Terlama</SelectItem>
              </SelectKonten>
            </Select>
          </div>
        </div>

        {/* Bagian Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-undip-blue border-b border-slate-100 text-[11px] uppercase text-white font-bold tracking-wider">
                <th className="px-6 py-4 w-12">No</th>
                <th className="px-6 py-4">Nama Pengaju</th>
                <th className="px-6 py-4">Subjek Surat</th>
                <th className="px-6 py-4">Nomor Surat</th>
                <th className="px-6 py-4">Tanggal Selesai</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="text-slate-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 mx-auto mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Memuat data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="text-slate-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 mx-auto mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Tidak ada data surat selesai.
                      </p>
                      <p className="text-slate-400 text-sm">
                        Belum ada surat yang tersedia saat ini.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((app, index) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 text-slate-500">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">
                        {app.formData?.namaLengkap ||
                          app.applicantName ||
                          "N/A"}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {app.formData?.nim || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {app.scholarshipName || app.letterType?.name || "-"}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-600">
                      {app.letterNumber || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(app.updatedAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Link
                          href={`/upa/surat/surat-rekomendasi-beasiswa/detail/${app.id}?from=selesai`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full h-8 text-xs bg-undip-blue font-bold border-slate-100 text-white hover:bg-white hover:border-undip-blue hover:text-undip-blue transition-all gap-1.5 px-4 w-28"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Detail
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleDownloadPDF(app.id)}
                          size="sm"
                          className="rounded-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 font-bold border-slate-100 text-white transition-all gap-1.5 px-4 w-28"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi Standar */}
        <StandardPaginasi
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.limit}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="surat selesai"
        />
      </Card>
    </div>
  );
}

