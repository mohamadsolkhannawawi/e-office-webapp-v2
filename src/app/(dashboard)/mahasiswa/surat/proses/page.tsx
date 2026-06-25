"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Filter,
  Loader2,
  Search,
  Clock,
  AlertCircle,
  RotateCw,
  CheckCircle,
  XCircle,
  Eye,
  PencilLine,
  Calendar,
  X
} from "lucide-react";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StandardPagination } from "@/components/ui/standard-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MahasiswaEditModal } from "@/components/features/surat-rekomendasi-beasiswa/mahasiswa/MahasiswaEditModal";
import { Label } from "@/components/ui/label";

function SuratDalamProsesKonten() {
  const searchParams = useSearchParams();
  const urlJenis = searchParams.get("jenis") || "ALL";

  // FIX: State dipindahkan ke dalam body komponen
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setPencarianTerm] = useState("");
  const [jenisFilter, setJenisFilter] = useState<string>(urlJenis);
  const [pagination, setPaginasi] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [editModal, setEditModal] = useState<{
    open: boolean;
    applicationId: string;
    jenis: string;
    scholarshipName: string;
  }>({
    open: false,
    applicationId: "",
    jenis: "internal",
    scholarshipName: "",
  });

  useEffect(() => {
    setJenisFilter(urlJenis);
  }, [urlJenis]);

  const fetchApplications = useCallback(
    async (
      page = 1,
      search = searchTerm,
      jenis = jenisFilter,
      limit = pagination.limit,
    ) => {
      setIsLoading(true);
      try {
        const { data, meta } = await getApplications({
          status: "IN_PROGRESS",
          page,
          limit,
          search: search || undefined,
          jenisBeasiswa: jenis === "ALL" ? undefined : jenis,
          // Integrasi filter tanggal ke payload API
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        setApplications(data);
        setPaginasi({
          page: meta.page,
          limit: meta.limit,
          total: meta.total,
          totalPages: meta.totalPages,
        });
      } catch (error) {
        console.error("Failed to fetch applications:", error);
      } finally {
        setIsLoading(false);
      }
    },
    // Menambahkan startDate dan endDate ke dependency array useCallback
    [searchTerm, jenisFilter, pagination.limit, startDate, endDate],
  );

  useEffect(() => {
    const delayPencarian = setTimeout(() => {
      fetchApplications(1, searchTerm, jenisFilter);
    }, 500);

    return () => clearTimeout(delayPencarian);
  }, [searchTerm, jenisFilter, fetchApplications]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchApplications(newPage, searchTerm, jenisFilter, pagination.limit);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPaginasi((prev) => ({ ...prev, limit: newPageSize, page: 1 }));
    fetchApplications(1, searchTerm, jenisFilter, newPageSize);
  };

  const getStatusInfo = (app: ApplicationSummary) => {
    const roles = {
      0: "Mahasiswa",
      1: "Supervisor Akademik",
      2: "Manajer TU",
      3: "Wakil Dekan 1",
      4: "UPA",
    };
    const getRoleName = (step: number) =>
      roles[step as keyof typeof roles] || "Petugas";

    if (app.status === "REJECTED") {
      return {
        label: `Ditolak oleh ${getRoleName(app.currentStep)}`,
        color: "bg-red-500 text-white",
        icon: <XCircle className="h-3.5 w-3.5" />,
      };
    }
    if (app.status === "REVISION") {
      if (app.currentStep === 0) {
        const revisionFromRole =
          app.lastRevisionFromRole || getRoleName(app.currentStep + 1);
        return {
          label: `Revisi dari ${revisionFromRole}`,
          color: "bg-sky-500 text-white",
          icon: <RotateCw className="h-3.5 w-3.5" />,
        };
      } else {
        return {
          label: `Sedang Diproses di ${getRoleName(app.currentStep)}`,
          color: "bg-blue-500 text-white",
          icon: <Clock className="h-3.5 w-3.5" />,
        };
      }
    }
    if (app.status === "PENDING" || app.status === "IN_PROGRESS") {
      return {
        label: `Menunggu Verifikasi ${getRoleName(app.currentStep)}`,
        color: "bg-blue-500 text-white",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
      };
    }
    if (app.status === "COMPLETED") {
      return {
        label: "Selesai",
        color: "bg-emerald-500 text-white",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
      };
    }

    return {
      label: app.status,
      color: "bg-slate-500 text-white",
      icon: <Clock className="h-3.5 w-3.5" />,
    };
  };

  const getTargetInfo = (app: ApplicationSummary) => {
    const roles = {
      0: "Mahasiswa",
      1: "Supervisor Akademik",
      2: "Manajer TU",
      3: "Wakil Dekan 1",
      4: "UPA",
    };
    const getRoleName = (step: number) =>
      roles[step as keyof typeof roles] || "Petugas";

    if (app.status === "REVISION" && app.currentStep === 0) {
      return "Revisi Mahasiswa";
    }
    if (app.status === "REJECTED") {
      return "Ditolak";
    }
    if (app.status === "COMPLETED") {
      return "Selesai";
    }

    const nextStep = Math.min(app.currentStep + 1, 4);
    return `Ke ${getRoleName(nextStep)}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs md:text-sm font-medium text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
        <Link
          href="/mahasiswa/surat/proses"
          className="whitespace-nowrap transition-colors hover:text-undip-blue"
        >
          Surat Saya
        </Link>
        <ChevronRight className="mx-1 md:mx-2 h-3 w-3 md:h-4 md:w-4 shrink-0" />
        <span className="whitespace-nowrap text-slate-800">
          Surat Dalam Proses
        </span>
      </nav>

      {/* Judul Halaman */}
      <h1 className="text-2xl font-bold text-slate-800">Surat Dalam Proses</h1>
      <p className="text-sm text-slate-500 -mt-4">
        Daftar surat rekomendasi beasiswa yang sedang dalam proses
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

        {/* Bagian Daftar Mobile */}
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
                  Tidak ada surat yang sedang diproses.
                </p>
                <p className="text-sm text-slate-400">
                  Belum ada data surat yang tersedia saat ini.
                </p>
              </div>
            </div>
          ) : (
            applications.map((app, index) => {
              const statusInfo = getStatusInfo(app);
              const target = getTargetInfo(app);
              const hasEditButton = app.status === "PENDING" && app.currentStep === 1;

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

                      <div
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        <span className="truncate">{statusInfo.label}</span>
                      </div>

                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-500">
                          Target:
                        </span>{" "}
                        {target}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-4 grid gap-2 ${hasEditButton ? "grid-cols-2" : "grid-cols-1"}`}>
                    <Link
                      href={
                        app.status === "REVISION"
                          ? `/mahasiswa/surat/proses/detail/${app.id}`
                          : `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${app.id}?from=proses`
                      }
                    >
                      <Button className="h-9 w-full gap-2 rounded-3xl bg-undip-blue text-xs font-medium text-white hover:bg-sky-700 hover:text-white">
                        <Eye className="h-4 w-4" />
                        Detail
                      </Button>
                    </Link>

                    {app.status === "PENDING" && app.currentStep === 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-full gap-2 rounded-3xl bg-amber-500 text-xs font-medium text-white hover:bg-amber-600 hover:text-white"
                        title="Edit Surat"
                        onClick={() =>
                          setEditModal({
                            open: true,
                            applicationId: app.id,
                            jenis:
                              ((
                                app.formData as unknown as Record<
                                  string,
                                  unknown
                                >
                              )?.jenisBeasiswa as string) || "internal",
                            scholarshipName: app.scholarshipName || "",
                          })
                        }
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bagian Tabel Desktop */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-undip-blue border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-white w-12">No</th>
                  <th className="px-6 py-4 font-semibold text-white min-w-50">
                    Subjek Surat
                  </th>
                  <th className="px-6 py-4 font-semibold text-white min-w-50">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold text-white min-w-50">
                    Target Selanjutnya
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
                          Tidak ada surat yang sedang diproses.
                        </p>
                        <p className="text-slate-400 text-sm">
                          Belum ada data surat yang tersedia saat ini.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app, index) => {
                    const statusInfo = getStatusInfo(app);
                    const target = getTargetInfo(app);
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
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
                          >
                            {statusInfo.icon}
                            {statusInfo.label}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {target}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={
                                app.status === "REVISION"
                                  ? `/mahasiswa/surat/proses/detail/${app.id}`
                                  : `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${app.id}?from=proses`
                              }
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-3 gap-2 text-white bg-undip-blue hover:bg-sky-700 hover:text-white font-medium text-xs rounded-3xl"
                                title="Detail"
                              >
                                <Eye className="h-4 w-4" />
                                Detail
                              </Button>
                            </Link>
                            {app.status === "PENDING" &&
                              app.currentStep === 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 px-3 gap-2 text-white bg-amber-500 hover:bg-amber-600 hover:text-white font-medium text-xs rounded-3xl"
                                  title="Edit Surat"
                                  onClick={() =>
                                    setEditModal({
                                      open: true,
                                      applicationId: app.id,
                                      jenis:
                                        ((
                                          app.formData as unknown as Record<
                                            string,
                                            unknown
                                          >
                                        )?.jenisBeasiswa as string) || "internal",
                                      scholarshipName: app.scholarshipName || "",
                                    })
                                  }
                                >
                                  <PencilLine className="h-4 w-4" />
                                  Edit
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
        </div>

        {/* Paginasi Standar */}
        <StandardPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.limit}
          totalItems={pagination.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          itemLabel="surat dalam proses"
        />
      </Card>

      {/* Modal Konfirmasi Edit */}
      <MahasiswaEditModal
        isOpen={editModal.open}
        onClose={() => setEditModal((prev) => ({ ...prev, open: false }))}
        applicationId={editModal.applicationId}
        jenis={editModal.jenis}
        scholarshipName={editModal.scholarshipName}
      />
    </div>
  );
}

export default function SuratDalamProsesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-100">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      }
    >
      <SuratDalamProsesKonten />
    </Suspense>
  );
}