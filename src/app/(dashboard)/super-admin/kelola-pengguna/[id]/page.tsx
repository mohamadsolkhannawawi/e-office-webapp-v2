"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowLeft,
    User,
    Mail,
    Shield,
    Calendar,
    Loader2,
    Save,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    getUser,
    updateUser,
    listRoles,
    assignRoleToUser,
    removeRoleFromUser,
    listDepartments,
    listProdi,
} from "@/lib/admin-api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface UserData {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    userRole: Array<{
        role: {
            id: string;
            name: string;
        };
    }>;
    mahasiswa?: {
        nim: string;
        semester: number;
        ipk: number;
        ips: number;
        tahunMasuk: string;
        noHp: string;
        tempatLahir?: string;
        tanggalLahir?: string;
        departemen?: {
            id: string;
            nama: string;
        };
        programStudi?: {
            id: string;
            nama: string;
        };
    };
    pegawai?: {
        nip: string;
        jabatan: string;
        noHp: string;
        departemen?: {
            id: string;
            nama: string;
        };
        programStudi?: {
            id: string;
            nama: string;
        };
    };
}

interface Role {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
    code: string;
}

interface ProgramStudi {
    id: string;
    name: string;
    code: string;
    departemenId: string;
}

export default function EditUserPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [programStudiList, setProgramStudiList] = useState<ProgramStudi[]>(
        [],
    );
    const [filteredProdi, setFilteredProdi] = useState<ProgramStudi[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        mahasiswaData: {
            nim: "",
            semester: 0,
            ipk: 0,
            ips: 0,
            tahunMasuk: "",
            noHp: "",
            tempatLahir: "",
            tanggalLahir: "",
            departemenId: "",
            programStudiId: "",
        },
        pegawaiData: {
            nip: "",
            jabatan: "",
            noHp: "",
            departemenId: "",
            programStudiId: "",
        },
    });
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const loadUserData = useCallback(async () => {
        try {
            setLoading(true);
            const response = (await getUser(userId)) as UserData;
            setUserData(response);

            // Set form data
            setFormData({
                name: response.name || "",
                mahasiswaData: {
                    nim: response.mahasiswa?.nim || "",
                    semester: response.mahasiswa?.semester || 0,
                    ipk: response.mahasiswa?.ipk || 0,
                    ips: response.mahasiswa?.ips || 0,
                    tahunMasuk: response.mahasiswa?.tahunMasuk || "",
                    noHp: response.mahasiswa?.noHp || "",
                    tempatLahir: response.mahasiswa?.tempatLahir || "",
                    tanggalLahir: response.mahasiswa?.tanggalLahir || "",
                    departemenId: response.mahasiswa?.departemen?.id || "",
                    programStudiId: response.mahasiswa?.programStudi?.id || "",
                },
                pegawaiData: {
                    nip: response.pegawai?.nip || "",
                    jabatan: response.pegawai?.jabatan || "",
                    noHp: response.pegawai?.noHp || "",
                    departemenId: response.pegawai?.departemen?.id || "",
                    programStudiId: response.pegawai?.programStudi?.id || "",
                },
            });

            // Set selected roles
            const currentRoles = response.userRole.map((ur) => ur.role.id);
            setSelectedRoles(currentRoles);
        } catch (error) {
            console.error("Error loading user:", error);
            toast.error("Gagal memuat data pengguna");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadUserData();
        loadRoles();
        loadDepartments();
        loadProgramStudi();
    }, [userId, loadUserData]);

    const loadRoles = async () => {
        try {
            const response = await listRoles();
            setAvailableRoles(response.roles || []);
        } catch (error) {
            console.error("Error loading roles:", error);
        }
    };

    const loadDepartments = async () => {
        try {
            const response = await listDepartments();
            setDepartments(response.departments || []);
        } catch (error) {
            console.error("Error loading departments:", error);
        }
    };

    const loadProgramStudi = async () => {
        try {
            const response = await listProdi();
            setProgramStudiList(response.prodi || []);
        } catch (error) {
            console.error("Error loading program studi:", error);
        }
    };

    // Filter prodi based on selected departemen
    useEffect(() => {
        const departemenId = userData?.mahasiswa
            ? formData.mahasiswaData.departemenId
            : formData.pegawaiData.departemenId;

        if (departemenId) {
            const filtered = programStudiList.filter(
                (prodi) => prodi.departemenId === departemenId,
            );
            setFilteredProdi(filtered);
        } else {
            setFilteredProdi(programStudiList);
        }
    }, [
        formData.mahasiswaData.departemenId,
        formData.pegawaiData.departemenId,
        programStudiList,
        userData,
    ]);

    const handleRoleToggle = (roleId: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId],
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Update basic user info
            await updateUser(userId, {
                name: formData.name,
                ...(userData?.mahasiswa && {
                    mahasiswaData: formData.mahasiswaData,
                }),
                ...(userData?.pegawai && {
                    pegawaiData: formData.pegawaiData,
                }),
            });

            // Update roles
            const currentRoles =
                userData?.userRole.map((ur) => ur.role.id) || [];
            const rolesToAdd = selectedRoles.filter(
                (id) => !currentRoles.includes(id),
            );
            const rolesToRemove = currentRoles.filter(
                (id) => !selectedRoles.includes(id),
            );

            // Add new roles
            for (const roleId of rolesToAdd) {
                await assignRoleToUser(userId, roleId);
            }

            // Remove old roles
            for (const roleId of rolesToRemove) {
                await removeRoleFromUser(userId, roleId);
            }

            toast.success("Pengguna berhasil diperbarui");
            router.push("/super-admin/kelola-pengguna");
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui pengguna",
            );
        } finally {
            setSaving(false);
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

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-undip-blue" />
                    <p className="mt-4 text-gray-600">
                        Memuat data pengguna...
                    </p>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                    <p className="mt-4 text-gray-600">
                        Pengguna tidak ditemukan
                    </p>
                    <Button
                        onClick={() => router.back()}
                        className="mt-4"
                        variant="outline"
                    >
                        Kembali
                    </Button>
                </div>
            </div>
        );
    }

    const isMahasiswa = userData.userRole.some(
        (ur) => ur.role.name === "MAHASISWA",
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="rounded-xl"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Edit Pengguna
                        </h1>
                    </div>
                    <p className="text-slate-500 text-lg ml-12">
                        Ubah informasi pengguna dan kelola role
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-undip-blue" />
                            Informasi Dasar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={userData.email}
                                    disabled
                                    className="bg-gray-50"
                                />
                                <p className="text-xs text-gray-500">
                                    Email tidak dapat diubah
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Status Akun</Label>
                            <div className="flex items-center gap-2">
                                <Badge
                                    className={
                                        userData.isActive
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-red-100 text-red-700"
                                    }
                                >
                                    {userData.isActive
                                        ? "Aktif"
                                        : "Tidak Aktif"}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                    Terdaftar sejak{" "}
                                    {formatDate(userData.createdAt)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Role Management */}
                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-undip-blue" />
                            Kelola Role
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                            {availableRoles.map((role) => (
                                <div
                                    key={role.id}
                                    className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-gray-50"
                                >
                                    <Checkbox
                                        id={role.id}
                                        checked={selectedRoles.includes(
                                            role.id,
                                        )}
                                        onCheckedChange={() =>
                                            handleRoleToggle(role.id)
                                        }
                                    />
                                    <label
                                        htmlFor={role.id}
                                        className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {getRoleName(role.name)}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Mahasiswa Data */}
                {isMahasiswa && userData.mahasiswa && (
                    <Card className="border-gray-200 shadow-sm rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-undip-blue" />
                                Data Mahasiswa
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="nim">NIM</Label>
                                    <Input
                                        id="nim"
                                        value={formData.mahasiswaData.nim}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mahasiswaData: {
                                                    ...formData.mahasiswaData,
                                                    nim: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="semester">Semester</Label>
                                    <Input
                                        id="semester"
                                        type="number"
                                        value={formData.mahasiswaData.semester}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mahasiswaData: {
                                                    ...formData.mahasiswaData,
                                                    semester: parseInt(
                                                        e.target.value,
                                                    ),
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tahunMasuk">
                                        Tahun Masuk
                                    </Label>
                                    <Input
                                        id="tahunMasuk"
                                        value={
                                            formData.mahasiswaData.tahunMasuk
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mahasiswaData: {
                                                    ...formData.mahasiswaData,
                                                    tahunMasuk: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="ipk">IPK</Label>
                                    <Input
                                        id="ipk"
                                        type="number"
                                        step="0.01"
                                        value={formData.mahasiswaData.ipk}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mahasiswaData: {
                                                    ...formData.mahasiswaData,
                                                    ipk: parseFloat(
                                                        e.target.value,
                                                    ),
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ips">IPS</Label>
                                    <Input
                                        id="ips"
                                        type="number"
                                        step="0.01"
                                        value={formData.mahasiswaData.ips}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mahasiswaData: {
                                                    ...formData.mahasiswaData,
                                                    ips: parseFloat(
                                                        e.target.value,
                                                    ),
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="noHp">No HP</Label>
                                    <Input
                                        id="noHp"
                                        value={formData.mahasiswaData.noHp}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mahasiswaData: {
                                                    ...formData.mahasiswaData,
                                                    noHp: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="tempatLahir">
                                        Tempat Lahir
                                    </Label>
                                    <Input
                                        id="tempatLahir"
                                        value={
                                            formData.mahasiswaData.tempatLahir
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mahasiswaData: {
                                                    ...formData.mahasiswaData,
                                                    tempatLahir: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tanggalLahir">
                                        Tanggal Lahir
                                    </Label>
                                    <Input
                                        id="tanggalLahir"
                                        type="date"
                                        value={
                                            formData.mahasiswaData.tanggalLahir
                                        }
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                mahasiswaData: {
                                                    ...formData.mahasiswaData,
                                                    tanggalLahir:
                                                        e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="mahasiswaDepartemen">
                                        Departemen
                                    </Label>
                                    <Select
                                        value={
                                            formData.mahasiswaData.departemenId
                                        }
                                        onValueChange={(value) => {
                                            setFormData({
                                                ...formData,
                                                mahasiswaData: {
                                                    ...formData.mahasiswaData,
                                                    departemenId: value,
                                                    programStudiId: "", // Reset prodi when dept changes
                                                },
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Departemen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem
                                                    key={dept.id}
                                                    value={dept.id}
                                                >
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="mahasiswaProdi">
                                        Program Studi
                                    </Label>
                                    <Select
                                        value={
                                            formData.mahasiswaData
                                                .programStudiId
                                        }
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                mahasiswaData: {
                                                    ...formData.mahasiswaData,
                                                    programStudiId: value,
                                                },
                                            })
                                        }
                                        disabled={
                                            !formData.mahasiswaData.departemenId
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Program Studi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredProdi.map((prodi) => (
                                                <SelectItem
                                                    key={prodi.id}
                                                    value={prodi.id}
                                                >
                                                    {prodi.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!formData.mahasiswaData.departemenId && (
                                        <p className="text-xs text-gray-500">
                                            Pilih departemen terlebih dahulu
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Pegawai Data */}
                {!isMahasiswa && userData.pegawai && (
                    <Card className="border-gray-200 shadow-sm rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-undip-blue" />
                                Data Pegawai
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nip">NIP</Label>
                                    <Input
                                        id="nip"
                                        value={formData.pegawaiData.nip}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                pegawaiData: {
                                                    ...formData.pegawaiData,
                                                    nip: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jabatan">Jabatan</Label>
                                    <Input
                                        id="jabatan"
                                        value={formData.pegawaiData.jabatan}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                pegawaiData: {
                                                    ...formData.pegawaiData,
                                                    jabatan: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="pegawaiNoHp">No HP</Label>
                                    <Input
                                        id="pegawaiNoHp"
                                        value={formData.pegawaiData.noHp}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                pegawaiData: {
                                                    ...formData.pegawaiData,
                                                    noHp: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="pegawaiDepartemen">
                                        Departemen
                                    </Label>
                                    <Select
                                        value={
                                            formData.pegawaiData.departemenId
                                        }
                                        onValueChange={(value) => {
                                            setFormData({
                                                ...formData,
                                                pegawaiData: {
                                                    ...formData.pegawaiData,
                                                    departemenId: value,
                                                    programStudiId: "", // Reset prodi when dept changes
                                                },
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Departemen" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem
                                                    key={dept.id}
                                                    value={dept.id}
                                                >
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pegawaiProdi">
                                        Program Studi
                                    </Label>
                                    <Select
                                        value={
                                            formData.pegawaiData.programStudiId
                                        }
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                pegawaiData: {
                                                    ...formData.pegawaiData,
                                                    programStudiId: value,
                                                },
                                            })
                                        }
                                        disabled={
                                            !formData.pegawaiData.departemenId
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Program Studi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredProdi.map((prodi) => (
                                                <SelectItem
                                                    key={prodi.id}
                                                    value={prodi.id}
                                                >
                                                    {prodi.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!formData.pegawaiData.departemenId && (
                                        <p className="text-xs text-gray-500">
                                            Pilih departemen terlebih dahulu
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={saving}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        className="bg-undip-blue hover:bg-blue-600"
                        disabled={saving}
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
        </div>
    );
}
