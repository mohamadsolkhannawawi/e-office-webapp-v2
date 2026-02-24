"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Shield,
    Lock,
    Users,
    Loader2,
    ChevronDown,
    ChevronUp,
    Key,
} from "lucide-react";
import { listRoles, getRolePermissions } from "@/lib/admin-api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface Permission {
    resource: string;
    action: string;
}

interface Role {
    id: string;
    name: string;
    userCount: number;
    permissionCount: number;
    permissions: Permission[];
}

interface RoleDetail {
    id: string;
    name: string;
    permissions: Array<{
        id: string;
        resource: string;
        action: string;
    }>;
}

export default function RoleManagementPage() {
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<Role[]>([]);
    const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());
    const [roleDetails, setRoleDetails] = useState<Map<string, RoleDetail>>(
        new Map(),
    );
    const [loadingDetails, setLoadingDetails] = useState<Set<string>>(
        new Set(),
    );

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            setLoading(true);
            const response = await listRoles();
            setRoles(response.roles || []);
        } catch (error) {
            console.error("Error loading roles:", error);
            toast.error("Gagal memuat data role");
        } finally {
            setLoading(false);
        }
    };

    const loadRoleDetails = async (roleId: string) => {
        if (roleDetails.has(roleId)) return; // Already loaded

        try {
            setLoadingDetails((prev) => new Set(prev).add(roleId));
            const response = await getRolePermissions(roleId);
            setRoleDetails((prev) => new Map(prev).set(roleId, response.role));
        } catch (error) {
            console.error("Error loading role details:", error);
            toast.error("Gagal memuat detail role");
        } finally {
            setLoadingDetails((prev) => {
                const newSet = new Set(prev);
                newSet.delete(roleId);
                return newSet;
            });
        }
    };

    const toggleRoleExpansion = async (roleId: string) => {
        const isExpanded = expandedRoles.has(roleId);

        if (!isExpanded) {
            await loadRoleDetails(roleId);
            setExpandedRoles((prev) => new Set(prev).add(roleId));
        } else {
            setExpandedRoles((prev) => {
                const newSet = new Set(prev);
                newSet.delete(roleId);
                return newSet;
            });
        }
    };

    const getRoleName = (roleName: string) => {
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

    const getRoleColor = (roleName: string) => {
        const colors: Record<string, string> = {
            MAHASISWA: "bg-blue-100 text-blue-800",
            SUPERVISOR: "bg-green-100 text-green-800",
            MANAJER_TU: "bg-purple-100 text-purple-800",
            WAKIL_DEKAN_1: "bg-orange-100 text-orange-800",
            UPA: "bg-pink-100 text-pink-800",
            SUPER_ADMIN: "bg-red-100 text-red-800",
        };
        return colors[roleName] || "bg-gray-100 text-gray-800";
    };

    const totalUsers = roles.reduce((sum, role) => sum + role.userCount, 0);
    const totalPermissions = roles.reduce(
        (sum, role) => sum + role.permissionCount,
        0,
    );

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-undip-blue" />
                    <p className="mt-4 text-gray-600">Memuat data role...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    Kelola Peran
                </h1>
                <p className="text-slate-500 text-lg">
                    Kelola role dan permission sistem E-Office
                </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-undip-blue/10 p-3">
                                <Shield className="h-6 w-6 text-undip-blue" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Role
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {roles.length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Pengguna
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {totalUsers}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-purple-100 p-3">
                                <Lock className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Permission
                                </p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {totalPermissions}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Roles List */}
            <Card className="border-gray-200 shadow-sm rounded-3xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-undip-blue" />
                        Daftar Role di Sistem
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {roles.map((role) => {
                            const isExpanded = expandedRoles.has(role.id);
                            const detail = roleDetails.get(role.id);
                            const isLoadingDetail = loadingDetails.has(role.id);

                            return (
                                <div
                                    key={role.id}
                                    className="border border-gray-200 rounded-xl overflow-hidden"
                                >
                                    {/* Role Header */}
                                    <div className="bg-gray-50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Badge
                                                    className={`${getRoleColor(role.name)} font-semibold`}
                                                >
                                                    {getRoleName(role.name)}
                                                </Badge>
                                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        <span>
                                                            {role.userCount}{" "}
                                                            pengguna
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Lock className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                role.permissionCount
                                                            }{" "}
                                                            permission
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    toggleRoleExpansion(role.id)
                                                }
                                                className="hover:bg-gray-200"
                                            >
                                                {isLoadingDetail ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : isExpanded ? (
                                                    <>
                                                        <ChevronUp className="h-4 w-4 mr-1" />
                                                        Sembunyikan
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4 mr-1" />
                                                        Lihat Detail
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Expanded Role Details */}
                                    {isExpanded && detail && (
                                        <div className="p-4 bg-white border-t border-gray-200">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                    <Key className="h-4 w-4 text-undip-blue" />
                                                    Permissions (
                                                    {detail.permissions.length})
                                                </div>
                                                <div className="grid gap-2 md:grid-cols-2">
                                                    {detail.permissions.map(
                                                        (permission, idx) => (
                                                            <div
                                                                key={
                                                                    permission.id ||
                                                                    idx
                                                                }
                                                                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm"
                                                            >
                                                                <Lock className="h-3 w-3 text-gray-400" />
                                                                <span className="font-mono text-slate-700">
                                                                    {
                                                                        permission.resource
                                                                    }
                                                                    :
                                                                    {
                                                                        permission.action
                                                                    }
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                                {detail.permissions.length ===
                                                    0 && (
                                                    <p className="text-sm text-slate-500 text-center py-4">
                                                        Role ini belum memiliki
                                                        permission
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {roles.length === 0 && (
                        <div className="text-center py-12">
                            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-slate-500">
                                Tidak ada role di sistem
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
