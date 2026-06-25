"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  ChevronRight,
  Filter,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";
import { generateAndDownloadDocument } from "@/lib/template-api";
import { Card } from "@/components/ui/card";
import { StandardPagination } from "@/components/ui/standard-pagination";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function SuratSelesaiPage() {
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchTerm, setPencarianTerm] = useState("");
  const [jenisFilter, setJenisFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pagination, setPaginasi] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // 1. Perbarui fungsi fetchApplications untuk menerima parameter tanggal
  const fetchApplications = useCallback(
    async (
      page: number,
      search: string,
      jenis: string,
      limit: number,
      startDt?: string,
      endDt?: string
    ) => {
      console.log("[DEBUG] fetchApplications called with:", {
        page,
        search,
        jenis,
        limit,
        startDt,
        endDt,
      });
      setIsLoading(true);
      try {
        const { data, meta } = await getApplications({
          status: "FINISHED",
          page,
          limit,
          search: search || undefined,
          jenisBeasiswa: jenis === "ALL" ? undefined : jenis,
          startDate: startDt || undefined, // Kirim ke API jika ada
          endDate: endDt || undefined,     // Kirim ke API jika ada
        });
        
        console.log("[DEBUG] API response received:", {
          dataLength: data.length,
          meta,
        });
        setApplications(data);
        setPaginasi({
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.totalPages,
        });
      } catch (error) {
        console.error("[DEBUG] Failed to fetch applications:", error);
        toast.error("Gagal memuat surat selesai. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleDownloadTemplate = async (applicationId: string) => {
    setDownloadingId(applicationId);
    try {
      const templateId = "cml1v2sev0010oau4yy2at0jh"; 
      await generateAndDownloadDocument(
        templateId,
        applicationId,
        `surat-rekomendasi-beasiswa-${applicationId}.docx`
      );
      toast.success("Dokumen Word berhasil diunduh!");
    } catch (error) {
      console.error("Failed to download template:", error);
      toast.error(
        `Gagal mengunduh dokumen: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`
      );
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    fetchApplications(1, searchTerm, jenisFilter, pagination.limit, startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Tambahkan startDate dan endDate ke dependency array agar memicu fetch ulang saat berubah
  useEffect(() => {
    const delayPencarian = setTimeout(() => {
      fetchApplications(1, searchTerm, jenisFilter, pagination.limit, startDate, endDate);
    }, 500);

    return () => clearTimeout(delayPencarian);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, jenisFilter, startDate, endDate]); 

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchApplications(newPage, searchTerm, jenisFilter, pagination.limit, startDate, endDate);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPaginasi((prev) => ({ ...prev, limit: newPageSize, page: 1 }));
    fetchApplications(1, searchTerm, jenisFilter, newPageSize, startDate, endDate);
  };

  const getStatusInfo = (status: string, app?: ApplicationSummary) => {
    if (status === "COMPLETED") {
      const roleText = app?.lastActorRole ? ` ${app.lastActorRole}` : "";
      return {
        label: `Diterbitkan${roleText ? " oleh" : ""}${roleText}`,
        color: "bg-emerald-500 text-white",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
      };
    }
    if (status === "REJECTED") {
      const roleText = app?.lastActorRole ? ` ${app.lastActorRole}` : "";
      return {
        label: `Ditolak${roleText ? " oleh" : ""}${roleText}`,
        color: "bg-red-500 text-white",
        icon: <XCircle className="h-3.5 w-3.5" />,
      };
    }
    return {
      label: status,
      color: "bg-slate-500 text-white",
      icon: <CheckCircle className="h-3.5 w-3.5" />,
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs md:text-sm font-medium text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link
          href="/mahasiswa/surat/selesai"
          className="whitespace-nowrap transition-colors hover:text-undip-blue"
        >
          Surat Saya
        </Link>
        <ChevronRight className="mx-1 md:mx-2 h-3 w-3 md:h-4 md:w-4 shrink-0" />
        <span className="whitespace-nowrap text-slate-800">
          Surat Selesai
        </span>
      </nav>

      {/* Judul Halaman */}
      <h1 className="text-2xl font-bold text-slate-800">Surat Selesai</h1>
      <p className="text-sm text-slate-500 -mt-4">
        Surat-surat rekomendasi beasiswa yang telah selesai diproses.
      </p>

      {/* Gabungan Filter dan Kartu Tabel */}
      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-3xl py-0 gap-0">
        {/* Bagian Filter */}
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari surat..."
                value={searchTerm}
                onChange={(e) => setPencarianTerm(e.target.value)}
                className="pl-10 h-10 border-slate-100 bg-slate-50/50 w-full rounded-3xl"
              />
            </div>

            {/* Filter Tanggal */}
            <div className="w-full xl:w-auto flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50/50 rounded-3xl p-2 border border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400 ml-1" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label
                    htmlFor="startDate"
                    className="text-xs font-medium text-slate-600 whitespace-nowrap"
                  >
                    Dari
                  </Label>
                  <div className="relative flex-1 sm:flex-none">
                    <Input
                      id="startDate"
                      type="date"
                      className="h-9 w-full sm:w-35 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-3xl"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate || undefined}
                    />
                  </div>
                </div>

                <div className="hidden sm:block h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Label
                    htmlFor="endDate"
                    className="text-xs font-medium text-slate-600 whitespace-nowrap"
                  >
                    Sampai
                  </Label>
                  <div className="relative flex-1 sm:flex-none">
                    <Input
                      id="endDate"
                      type="date"
                      className="h-9 w-full sm:w-35 text-sm border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-3xl"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Tombol Clear Filter Tanggal */}
              {(startDate || endDate) && (
                <>
                  <div className="hidden sm:block h-4 w-px bg-slate-200" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 gap-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    title="Hapus filter tanggal"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Hapus</span>
                  </Button>
                </>
              )}
            </div>

            {/* Filter Jenis */}
            <Select value={jenisFilter} onValueChange={setJenisFilter}>
              <SelectTrigger
                className="w-full sm:w-48 h-10 border-slate-100 text-slate-600 rounded-3xl"
                suppressHydrationWarning
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Jenis Surat" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Jenis</SelectItem>
                <SelectItem value="internal">Beasiswa Internal</SelectItem>
                <SelectItem value="eksternal">Beasiswa Eksternal</SelectItem>
                <SelectItem value="akademik">Beasiswa Akademik</SelectItem>
                <SelectItem value="keperluan_lain">Keperluan Lain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bagian Mobile View */}
        <div className="md:hidden border-t border-slate-100">
          {isLoading ? (
            <div className="px-4 py-12 text-center text-slate-500">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading data...
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-14 w-14 mx-auto mb-1"
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
                <p className="font-medium text-slate-600">
                  Tidak ada surat yang selesai.
                </p>
                <p className="text-sm text-slate-400">
                  Belum ada surat yang telah diselesaikan.
                </p>
              </div>
            </div>
          ) : (
            applications.map((app, index) => {
              const status = getStatusInfo(app.status, app);

              return (
                <div
                  key={app.id}
                  className="border-b border-slate-100 px-4 py-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </span>
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {app.scholarshipName ||
                            app.letterType?.name ||
                            "Surat Rekomendasi Beasiswa"}
                        </p>
                      </div>

                      <p className="text-xs text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold w-fit ${status.color}`}
                        title={status.label}
                      >
                        {status.icon}
                        <span className="truncate">{status.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Link
                      href={`/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${app.id}?from=selesai`}
                      className="flex-1 min-w-[120px]"
                    >
                      <Button className="h-9 w-full gap-2 rounded-3xl bg-undip-blue text-xs font-medium text-white hover:bg-sky-700">
                        <Eye className="h-4 w-4" />
                        Detail
                      </Button>
                    </Link>

                    {app.status === "COMPLETED" && (
                      <Button
                        size="sm"
                        className="h-9 gap-2 bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-xs rounded-3xl flex-1 min-w-[110px]"
                        onClick={() => {
                          try {
                            const link = document.createElement("a");
                            link.href = `${BASE_PATH}/api/templates/letter/${app.id}/pdf`;
                            link.download = `${app.scholarshipName || "Surat"}-${app.id}.pdf`;
                            link.click();
                            toast.success("PDF berhasil diunduh!");
                          } catch (error) {
                            console.error("Error downloading PDF:", error);
                            toast.error(
                              `Gagal mengunduh PDF: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`
                            );
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Unduh
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-undip-blue border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-white w-12">No</th>
                <th className="px-6 py-4 font-semibold text-white min-w-50">
                  Subjek Surat
                </th>
                <th className="px-6 py-4 font-semibold text-white min-w-50">
                  Tanggal Pengajuan
                </th>
                <th className="px-6 py-4 font-semibold text-white min-w-50">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold text-white w-24">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading data...
                    </div>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
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
                        Tidak ada surat yang selesai.
                      </p>
                      <p className="text-slate-400 text-sm">
                        Belum ada surat yang telah diselesaikan.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((app, index) => {
                  const status = getStatusInfo(app.status, app);

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 text-slate-500 text-sm font-medium">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 group-hover:text-undip-blue transition-colors">
                          {app.scholarshipName ||
                            app.letterType?.name ||
                            "Surat Rekomendasi Beasiswa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(app.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}
                        >
                          {status.icon}
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${app.id}?from=selesai`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 px-3 gap-2 text-white bg-undip-blue hover:bg-sky-700 font-medium text-xs rounded-3xl"
                            >
                              <Eye className="h-4 w-4" />
                              Detail
                            </Button>
                          </Link>

                          {app.status === "COMPLETED" && (
                            <Button
                              size="sm"
                              className="h-9 px-3 gap-2 bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-xs rounded-3xl"
                              onClick={() => {
                                try {
                                  const link = document.createElement("a");
                                  link.href = `${BASE_PATH}/api/templates/letter/${app.id}/pdf`;
                                  link.download = `${app.scholarshipName || "Surat"}-${app.id}.pdf`;
                                  link.click();
                                  toast.success("PDF berhasil diunduh!");
                                } catch (error) {
                                  console.error("Error downloading PDF:", error);
                                  toast.error(
                                    `Gagal mengunduh PDF: ${error instanceof Error ? error.message : "Terjadi kesalahan"}`
                                  );
                                }
                              }}
                            >
                              <Download className="h-4 w-4" />
                              Unduh PDF
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi */}
        <StandardPagination
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