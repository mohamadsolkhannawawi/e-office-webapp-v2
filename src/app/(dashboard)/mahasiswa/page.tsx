"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  FileText,
  ChevronRight,
  Clock3,
  CircleCheckBig,
  FilePen,
  FileClock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { getApplications, ApplicationSummary } from "@/lib/application-api";

const DASHBOARD_ACTIONS = [
  {
    title: "Surat Rekomendasi Beasiswa",
    description: "Pengajuan surat untuk keperluan beasiswa",
    icon: <GraduationCap className="h-7 w-7" />,
    href: "/mahasiswa/surat/surat-rekomendasi-beasiswa",
    color: "bg-blue-50 text-undip-blue",
    disabled: false,
  },
  {
    title: "Surat Rekomendasi Keperluan Lain",
    description: "Pengajuan surat rekomendasi untuk keperluan non-beasiswa",
    icon: <FileText className="h-7 w-7" />,
    href: "/mahasiswa/surat/surat-rekomendasi-beasiswa/keperluan_lain",
    color: "bg-emerald-50 text-emerald-600",
    disabled: false,
  },
];

type DashboardStats = {
  inProgressBeasiswa: number;
  inProgressKeperluanLain: number;
  finished: number;
  draftBeasiswa: number;
  draftKeperluanLain: number;
};

const INITIAL_STATS: DashboardStats = {
  inProgressBeasiswa: 0,
  inProgressKeperluanLain: 0,
  finished: 0,
  draftBeasiswa: 0,
  draftKeperluanLain: 0,
};

export default function MahasiswaDashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [latestApplications, setLatestApplications] = useState<
    ApplicationSummary[]
  >([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoadingStats(true);
      try {
        const [
          inProgressBeasiswa,
          inProgressKeperluanLain,
          finished,
          draftBeasiswa,
          draftKeperluanLain,
          latest,
        ] = await Promise.all([
          getApplications({
            status: "IN_PROGRESS",
            page: 1,
            limit: 1,
            excludeJenisBeasiswa: "keperluan_lain",
          }),
          getApplications({
            status: "IN_PROGRESS",
            page: 1,
            limit: 1,
            jenisBeasiswa: "keperluan_lain",
          }),
          getApplications({
            status: "FINISHED",
            page: 1,
            limit: 1,
          }),
          getApplications({
            status: "DRAFT",
            page: 1,
            limit: 1,
            excludeJenisBeasiswa: "keperluan_lain",
          }),
          getApplications({
            status: "DRAFT",
            page: 1,
            limit: 1,
            jenisBeasiswa: "keperluan_lain",
          }),
          getApplications({
            page: 1,
            limit: 5,
            sortOrder: "desc",
          }),
        ]);

        if (!isMounted) return;

        setStats({
          inProgressBeasiswa: inProgressBeasiswa.meta.total,
          inProgressKeperluanLain: inProgressKeperluanLain.meta.total,
          finished: finished.meta.total,
          draftBeasiswa: draftBeasiswa.meta.total,
          draftKeperluanLain: draftKeperluanLain.meta.total,
        });
        setLatestApplications(latest.data.slice(0, 5));
      } catch (error) {
        console.error("Failed to load mahasiswa dashboard data:", error);
      } finally {
        if (isMounted) setIsLoadingStats(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = useMemo(
    () => [
      {
        title: "Surat Beasiswa Dalam Proses",
        value: stats.inProgressBeasiswa,
        href: "/mahasiswa/surat/proses",
        icon: <Clock3 className="h-5 w-5" />,
        color: "bg-blue-50 text-blue-700",
      },
      {
        title: "Surat Keperluan Lain",
        value: stats.inProgressKeperluanLain,
        href: "/mahasiswa/surat/proses?jenis=keperluan_lain",
        icon: <FileText className="h-5 w-5" />,
        color: "bg-cyan-50 text-cyan-700",
      },
      {
        title: "Surat Selesai",
        value: stats.finished,
        href: "/mahasiswa/surat/selesai",
        icon: <CircleCheckBig className="h-5 w-5" />,
        color: "bg-emerald-50 text-emerald-700",
      },
      {
        title: "Draft Rekomendasi Beasiswa",
        value: stats.draftBeasiswa,
        href: "/mahasiswa/surat/draft/surat-rekomendasi-beasiswa",
        icon: <FilePen className="h-5 w-5" />,
        color: "bg-amber-50 text-amber-700",
      },
      {
        title: "Draft Keperluan Lain",
        value: stats.draftKeperluanLain,
        href: "/mahasiswa/surat/draft/surat-rekomendasi-beasiswa?jenis=keperluan_lain",
        icon: <FileClock className="h-5 w-5" />,
        color: "bg-violet-50 text-violet-700",
      },
    ],
    [stats],
  );

  const getLatestHref = (app: ApplicationSummary) => {
    if (app.status === "DRAFT") {
      const jenis = app.formData?.jenisBeasiswa || "internal";
      return `/mahasiswa/surat/surat-rekomendasi-beasiswa/${jenis}?id=${app.id}`;
    }
    return `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${app.id}`;
  };

  const getJenisLabel = (app: ApplicationSummary) => {
    if (app.formData?.jenisBeasiswa === "keperluan_lain") {
      return "Keperluan Lain";
    }
    return "Beasiswa";
  };

  const getStatusLabel = (status: ApplicationSummary["status"]) => {
    if (status === "IN_PROGRESS" || status === "PENDING") {
      return "Dalam Proses";
    }
    if (status === "COMPLETED") return "Selesai";
    if (status === "REJECTED") return "Ditolak";
    if (status === "REVISION") return "Revisi";
    return "Draft";
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumb - Hidden on dashboard */}

      {/* Page Title */}
      <h1 className="text-2xl font-bold text-slate-800 animate-in slide-in-from-bottom-3 duration-700">
        Dashboard
      </h1>
      {user?.name && (
        <p className="text-base text-slate-600 animate-in slide-in-from-bottom-3 duration-700 leading-relaxed">
          Selamat datang{" "}
          <span className="font-bold text-undip-blue">{user.name}</span>, disini
          Anda bisa mengelola pengajuan surat dan dokumen administratif dengan
          lebih mudah.
        </p>
      )}
      {!user?.name && (
        <p className="text-sm text-slate-500 animate-in slide-in-from-bottom-3 duration-700">
          Kelola pengajuan surat dan dokumen administratif Anda dengan mudah.
        </p>
      )}

      {/* Actions Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {DASHBOARD_ACTIONS.map((action, index) => (
          <div
            key={action.title}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {action.disabled ? (
              <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm opacity-60 cursor-not-allowed transition-all duration-300 animate-in slide-in-from-bottom-4">
                <div className="flex items-stretch gap-4">
                  <div
                    className={`my-auto flex h-16 w-16 items-center justify-center rounded-2xl ${action.color} shrink-0`}
                  >
                    {action.icon}
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <h3 className="text-base font-bold text-gray-400">
                      {action.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {action.description}
                    </p>
                    <Button
                      disabled
                      className="mt-5 h-10 w-full rounded-xl bg-gray-100 text-gray-400"
                    >
                      Belum Tersedia
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-100 hover:shadow-md animate-in slide-in-from-bottom-4">
                <div className="flex items-stretch gap-4">
                  <div
                    className={`my-auto flex h-16 w-16 items-center justify-center rounded-2xl ${action.color} shrink-0 transition-transform group-hover:scale-110`}
                  >
                    {action.icon}
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <h3 className="text-base font-bold text-slate-800">
                      {action.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {action.description}
                    </p>
                    <Link
                      href={action.href}
                      className="mt-5 inline-block w-full"
                    >
                      <Button className="h-10 w-full rounded-xl bg-undip-blue text-white hover:bg-sky-700">
                        Ajukan
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">Statistik Surat</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map((item) => (
            <Link key={item.title} href={item.href} className="block">
              <Card className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
                <div className="flex items-center justify-between">
                  <div
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}
                  >
                    {item.icon}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500 line-clamp-2">
                  {item.title}
                </p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">
                  {isLoadingStats ? "..." : item.value}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Applications */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            5 Pengajuan Surat Terbaru
          </h2>
          <Link
            href="/mahasiswa/surat/proses"
            className="text-sm font-semibold text-undip-blue hover:underline"
          >
            Lihat semua
          </Link>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm py-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-left text-sm border-collapse">
              <thead className="bg-undip-blue">
                <tr>
                  <th className="px-4 py-3 font-semibold text-white w-14">
                    No
                  </th>
                  <th className="px-4 py-3 font-semibold text-white">
                    Subjek Surat
                  </th>
                  <th className="px-4 py-3 font-semibold text-white w-44">
                    Jenis
                  </th>
                  <th className="px-4 py-3 font-semibold text-white w-40">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-white w-40">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 font-semibold text-white w-32">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {latestApplications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      {isLoadingStats
                        ? "Memuat pengajuan terbaru..."
                        : "Belum ada pengajuan surat."}
                    </td>
                  </tr>
                ) : (
                  latestApplications.map((app, index) => (
                    <tr key={app.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-semibold">
                        <div className="wrap-break-word md:line-clamp-1">
                          {app.scholarshipName || "Surat Rekomendasi"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {getJenisLabel(app)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(
                          app.updatedAt || app.createdAt,
                        ).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={getLatestHref(app)}>
                          <Button className="h-9 rounded-lg bg-undip-blue px-3 text-white hover:bg-sky-700">
                            Lihat
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
