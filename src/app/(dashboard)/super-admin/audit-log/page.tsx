"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  Filter,
  Search,
  Loader2,
  User,
  Activity,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuditLogs, listUsers } from "@/lib/admin-api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface AuditLog {
  id: string;
  action: string;
  note: string | null;
  status: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
  letterInstance: {
    id: string;
    letterNumber: string | null;
    letterType: {
      name: string;
    };
  } | null;
  role: {
    name: string;
  } | null;
}

interface AuditLogResponse {
  logs: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

export default function AuditLogPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });
  const [users, setUsers] = useState<UserOption[]>([]);

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    userId: "",
    action: "",
    startDate: "",
    endDate: "",
  });

  // Temp filters for input
  const [tempFilters, setTempFilters] = useState({
    userId: "",
    action: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  const loadUsers = async () => {
    try {
      const response = await listUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response: AuditLogResponse = await getAuditLogs(filters);
      setLogs(response.logs || []);
      setMeta(response.meta);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      toast.error("Gagal memuat audit log");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setFilters({
      ...filters,
      ...tempFilters,
      page: 1, // Reset to first page when applying filters
    });
  };

  const clearFilters = () => {
    const clearedFilters = {
      userId: "",
      action: "",
      startDate: "",
      endDate: "",
    };
    setTempFilters(clearedFilters);
    setFilters({
      page: 1,
      limit: 50,
      ...clearedFilters,
    });
  };

  const goToPage = (page: number) => {
    setFilters({ ...filters, page });
  };

  const formatActionName = (action: string) => {
    const actionMap: Record<string, string> = {
      create: "Dibuat",
      update: "Diperbarui",
      delete: "Dihapus",
      submit: "Diajukan",
      approve: "Disetujui",
      reject: "Ditolak",
      login: "Masuk",
      logout: "Keluar",
      upload: "Diunggah",
      download: "Diunduh",
      view: "Dilihat",
      print: "Dicetak",
      archive: "Diarsipkan",
      restore: "Dipulihkan",
      generate: "Digenerate",
      sign: "Ditandatangani",
      cancel: "Dibatalkan",
      revision: "Revisi",
    };
    return actionMap[action.toLowerCase()] || action;
  };

  const formatStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Menunggu",
      approved: "Disetujui",
      rejected: "Ditolak",
      completed: "Selesai",
      in_progress: "Dalam Proses",
      cancelled: "Dibatalkan",
      draft: "Draft",
      active: "Aktif",
      inactive: "Tidak Aktif",
      archived: "Diarsipkan",
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const formatRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      MAHASISWA: "Mahasiswa",
      SUPERVISOR_AKADEMIK: "Supervisor Akademik",
      MANAJER_TU: "Manajer TU",
      WAKIL_DEKAN_1: "Wakil Dekan 1",
      UPA: "UPA",
      SUPER_ADMIN: "Super Admin",
    };
    // Also handle lowercase/mixed case just in case
    const normalizedRole = role.toUpperCase();
    return roleMap[normalizedRole] || role;
  };

  const getActionBadgeColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (
      actionLower.includes("create") ||
      actionLower.includes("submit") ||
      actionLower.includes("generate")
    )
      return "bg-green-100 text-green-700 border-green-200";
    if (actionLower.includes("approve") || actionLower.includes("sign"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (
      actionLower.includes("reject") ||
      actionLower.includes("cancel") ||
      actionLower.includes("delete")
    )
      return "bg-red-100 text-red-700 border-red-200";
    if (
      actionLower.includes("edit") ||
      actionLower.includes("update") ||
      actionLower.includes("revision")
    )
      return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusBadgeColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-700 border-gray-200";
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("approve") ||
      statusLower.includes("complet") ||
      statusLower.includes("active")
    )
      return "bg-green-100 text-green-700 border-green-200";
    if (
      statusLower.includes("reject") ||
      statusLower.includes("cancel") ||
      statusLower.includes("inactive")
    )
      return "bg-red-100 text-red-700 border-red-200";
    if (
      statusLower.includes("pending") ||
      statusLower.includes("process") ||
      statusLower.includes("draft")
    )
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", {
        locale: localeId,
      });
    } catch {
      return dateString;
    }
  };

  const hasActiveFilters =
    tempFilters.userId ||
    tempFilters.action ||
    tempFilters.startDate ||
    tempFilters.endDate;

  // Calculate stats
  const uniqueUsers = new Set(logs.map((log) => log.actor.id)).size;
  const todayLogs = logs.filter((log) => {
    const logDate = new Date(log.createdAt);
    const today = new Date();
    return (
      logDate.getDate() === today.getDate() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getFullYear() === today.getFullYear()
    );
  }).length;
  const uniqueActions = new Set(logs.map((log) => log.action)).size;

  if (loading && logs.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-undip-blue" />
          <p className="mt-4 text-gray-600">Memuat audit log...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Audit Log Sistem
        </h1>
        <p className="text-slate-500 text-lg">
          Lihat semua aktivitas dan perubahan di sistem
        </p>
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
                <p className="text-sm text-slate-500">Total Logs</p>
                <p className="text-2xl font-bold text-slate-800">
                  {meta.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Unique Users</p>
                <p className="text-2xl font-bold text-slate-800">
                  {uniqueUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Aktivitas Hari Ini</p>
                <p className="text-2xl font-bold text-slate-800">{todayLogs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Tipe Aktivitas</p>
                <p className="text-2xl font-bold text-slate-800">
                  {uniqueActions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-gray-200 shadow-sm rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-undip-blue" />
            Filter Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>User</Label>
              <Select
                value={tempFilters.userId}
                onValueChange={(value) =>
                  setTempFilters({
                    ...tempFilters,
                    userId: value === "all" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua User</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Action</Label>
              <Input
                placeholder="Cari action..."
                value={tempFilters.action}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    action: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={tempFilters.startDate}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    startDate: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Tanggal Akhir</Label>
              <Input
                type="date"
                value={tempFilters.endDate}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    endDate: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={applyFilters}
              className="bg-undip-blue hover:bg-undip-blue/90"
            >
              <Search className="h-4 w-4 mr-2" />
              Terapkan Filter
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-slate-600"
              >
                <X className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <Card className="border-gray-200 shadow-sm rounded-3xl">
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-undip-blue" />
              Riwayat Aktivitas
            </CardTitle>
            <div className="text-xs sm:text-sm text-slate-500">
              Menampilkan {logs.length} dari {meta.total} logs
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-undip-blue" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="rounded-full bg-undip-blue/10 p-2 mt-1">
                          <Activity className="h-4 w-4 text-undip-blue" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="outline"
                              className={getActionBadgeColor(log.action)}
                            >
                              {formatActionName(log.action)}
                            </Badge>
                            {log.status && (
                              <Badge
                                variant="outline"
                                className={getStatusBadgeColor(log.status)}
                              >
                                {formatStatusName(log.status)}
                              </Badge>
                            )}
                            {log.role && (
                              <Badge
                                variant="secondary"
                                className="bg-purple-50 text-purple-700 border-purple-200"
                              >
                                {formatRoleName(log.role.name)}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span className="font-medium text-slate-700">
                                {log.actor.name}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">
                                {log.actor.email}
                              </span>
                            </div>

                            {log.letterInstance && (
                              <div className="flex items-center gap-2 text-sm">
                                <FileCheck className="h-3.5 w-3.5 text-slate-400" />
                                <span className="text-slate-600">
                                  {log.letterInstance.letterType.name}
                                </span>
                                {log.letterInstance.letterNumber && (
                                  <>
                                    <span className="text-slate-400">•</span>
                                    <span className="font-mono text-slate-500">
                                      {log.letterInstance.letterNumber}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}

                            {log.note && (
                              <div className="flex items-start gap-2 text-sm">
                                <AlertCircle className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                                <span className="text-slate-600 italic">
                                  {log.note}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 self-end sm:self-auto shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {logs.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-slate-500">
                    Tidak ada audit log yang ditemukan
                  </p>
                </div>
              )}

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="text-sm text-slate-500">
                    Halaman {meta.page} dari {meta.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(meta.page - 1)}
                      disabled={meta.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(meta.page + 1)}
                      disabled={meta.page === meta.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
