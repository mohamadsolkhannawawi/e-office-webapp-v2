"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    KeyRound,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

import {
    listUsers,
    deleteUser,
    resetUserPassword,
    toggleUserStatus,
} from "@/lib/admin-api";

interface UserRole {
    role: {
        id: string;
        name: string;
    };
}

interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    userRole: UserRole[];
}

function KelolaPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [users, setUsers] = useState<User[]>([]);
    const [meta, setMeta] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        userId: string;
        userName: string;
    }>({
        open: false,
        userId: "",
        userName: "",
    });
    const [resetDialog, setResetDialog] = useState<{
        open: boolean;
        userId: string;
        userName: string;
        tempPassword: string;
    }>({
        open: false,
        userId: "",
        userName: "",
        tempPassword: "",
    });

    const loadUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const page = parseInt(searchParams.get("page") || "1");
            const limit = parseInt(searchParams.get("limit") || "20");

            console.log("[Kelola Pengguna] Loading users with filters:", {
                page,
                limit,
                search: searchParams.get("search") || "",
                role: searchParams.get("role") || "",
                status: searchParams.get("status") || "",
            });

            const data = await listUsers({
                page,
                limit,
                search: searchParams.get("search") || "",
                role: searchParams.get("role") || "",
                status: searchParams.get("status") || "",
            });

            console.log("[Kelola Pengguna] Users loaded successfully:", data);

            setUsers(data.users || []);
            setMeta(
                data.meta || {
                    total: 0,
                    page: 1,
                    limit: 20,
                    totalPages: 0,
                },
            );
        } catch (error) {
            console.error("[Kelola Pengguna] Error loading users:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "Gagal memuat data pengguna";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set("search", search);
        else params.delete("search");
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const handleFilterChange = (type: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") params.set(type, value);
        else params.delete(type);
        params.set("page", "1");
        router.push(`?${params.toString()}`);
    };

    const handleDelete = async () => {
        try {
            await deleteUser(deleteDialog.userId);
            toast.success(`Pengguna ${deleteDialog.userName} berhasil dihapus`);
            setDeleteDialog({ open: false, userId: "", userName: "" });
            loadUsers();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Gagal menghapus pengguna";
            toast.error(message);
        }
    };

    const handleResetPassword = async (userId: string, userName: string) => {
        try {
            const result = await resetUserPassword(userId);
            setResetDialog({
                open: true,
                userId,
                userName,
                tempPassword: result.temporaryPassword,
            });
            toast.success("Password berhasil direset");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Gagal mereset password";
            toast.error(message);
        }
    };

    const handleToggleStatus = async (
        userId: string,
        currentStatus: boolean,
    ) => {
        try {
            await toggleUserStatus(userId);
            toast.success(
                `Pengguna berhasil ${currentStatus ? "dinonaktifkan" : "diaktifkan"}`,
            );
            loadUsers();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Gagal mengubah status pengguna";
            toast.error(message);
        }
    };

    const formatRoleName = (roleName: string) => {
        const roleNames: Record<string, string> = {
            MAHASISWA: "Mahasiswa",
            SUPERVISOR: "Supervisor Akademik",
            MANAJER_TU: "Manajer TU",
            WAKIL_DEKAN_1: "Wakil Dekan 1",
            UPA: "UPA",
            SUPER_ADMIN: "Super Admin",
        };
        return roleNames[roleName] || roleName;
    };

    const getRoleBadgeColor = (roleName: string) => {
        const colors: Record<string, string> = {
            MAHASISWA: "bg-blue-100 text-blue-700",
            SUPERVISOR: "bg-purple-100 text-purple-700",
            MANAJER_TU: "bg-green-100 text-green-700",
            WAKIL_DEKAN_1: "bg-orange-100 text-orange-700",
            UPA: "bg-red-100 text-red-700",
            SUPER_ADMIN: "bg-slate-100 text-slate-700",
        };
        return colors[roleName] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Kelola Pengguna
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Manajemen pengguna sistem E-Office
                            </p>
                        </div>
                        <Link href="/super-admin/kelola-pengguna/buat">
                            <Button className="bg-undip-blue hover:bg-blue-600">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Pengguna
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Cari nama atau email..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleSearch()
                                    }
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSearch}
                                    variant="outline"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Select
                            value={searchParams.get("role") || "all"}
                            onValueChange={(value) =>
                                handleFilterChange("role", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                <SelectItem value="MAHASISWA">
                                    Mahasiswa
                                </SelectItem>
                                <SelectItem value="SUPERVISOR">
                                    Supervisor
                                </SelectItem>
                                <SelectItem value="MANAJER_TU">
                                    Manajer TU
                                </SelectItem>
                                <SelectItem value="WAKIL_DEKAN_1">
                                    Wakil Dekan 1
                                </SelectItem>
                                <SelectItem value="UPA">UPA</SelectItem>
                                <SelectItem value="SUPER_ADMIN">
                                    Super Admin
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={searchParams.get("status") || "all"}
                            onValueChange={(value) =>
                                handleFilterChange("status", value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">
                                    Tidak Aktif
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center"
                                    >
                                        Memuat data...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center"
                                    >
                                        Tidak ada data pengguna
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.userRole.map((ur) => (
                                                    <Badge
                                                        key={ur.role.id}
                                                        className={getRoleBadgeColor(
                                                            ur.role.name,
                                                        )}
                                                    >
                                                        {formatRoleName(
                                                            ur.role.name,
                                                        )}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.emailVerified ? (
                                                <Badge className="bg-emerald-100 text-emerald-700">
                                                    Aktif
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700">
                                                    Tidak Aktif
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.push(
                                                            `/super-admin/kelola-pengguna/${user.id}`,
                                                        )
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleResetPassword(
                                                            user.id,
                                                            user.name,
                                                        )
                                                    }
                                                >
                                                    <KeyRound className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            user.id,
                                                            user.emailVerified,
                                                        )
                                                    }
                                                >
                                                    {user.emailVerified ? (
                                                        <ToggleRight className="h-4 w-4" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50"
                                                    onClick={() =>
                                                        setDeleteDialog({
                                                            open: true,
                                                            userId: user.id,
                                                            userName: user.name,
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t p-4">
                            <div className="text-sm text-gray-600">
                                Menampilkan {users.length} dari {meta.total}{" "}
                                pengguna
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={meta.page === 1}
                                    onClick={() => {
                                        const params = new URLSearchParams(
                                            searchParams.toString(),
                                        );
                                        params.set(
                                            "page",
                                            String(meta.page - 1),
                                        );
                                        router.push(`?${params.toString()}`);
                                    }}
                                >
                                    Sebelumnya
                                </Button>
                                <div className="flex items-center px-4 text-sm">
                                    Halaman {meta.page} dari {meta.totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={meta.page === meta.totalPages}
                                    onClick={() => {
                                        const params = new URLSearchParams(
                                            searchParams.toString(),
                                        );
                                        params.set(
                                            "page",
                                            String(meta.page + 1),
                                        );
                                        router.push(`?${params.toString()}`);
                                    }}
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    !open &&
                    setDeleteDialog({ open: false, userId: "", userName: "" })
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus pengguna{" "}
                            <strong>{deleteDialog.userName}</strong>? Tindakan
                            ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Password Dialog */}
            <AlertDialog
                open={resetDialog.open}
                onOpenChange={(open) =>
                    !open &&
                    setResetDialog({
                        open: false,
                        userId: "",
                        userName: "",
                        tempPassword: "",
                    })
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Password Direset</AlertDialogTitle>
                        <AlertDialogDescription>
                            Password untuk{" "}
                            <strong>{resetDialog.userName}</strong> telah
                            direset. Password sementara:
                            <div className="mt-4 rounded bg gray-100 p-3 font-mono text-lg font-bold">
                                {resetDialog.tempPassword}
                            </div>
                            <p className="mt-2 text-sm text-amber-600">
                                Catat password ini dan berikan kepada pengguna.
                                Password ini tidak akan ditampilkan lagi.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction>Tutup</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default function KelolaPage() {
    return (
        <React.Suspense
            fallback={
                <div className="p-8 text-center text-slate-400">Memuat...</div>
            }
        >
            <KelolaPageContent />
        </React.Suspense>
    );
}
