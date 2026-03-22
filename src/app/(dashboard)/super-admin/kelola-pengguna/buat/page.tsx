"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardKonten, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowLeft,
    User,
    Mail,
    Shield,
    Loader2,
    Save,
    Eye,
    EyeOff,
    BookOpen,
    Briefcase,
    Key,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    createUser,
    listRoles,
    listDepartments,
    listProdi,
} from "@/lib/admin-api";
import {
    Select,
    SelectKonten,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

export default function CreateUserPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [programStudiList, setProgramStudiList] = useState<ProgramStudi[]>(
        [],
    );
    const [filteredProdiMahasiswa, setFilteredProdiMahasiswa] = useState<
        ProgramStudi[]
    >([]);
    const [filteredProdiPegawai, setFilteredProdiPegawai] = useState<
        ProgramStudi[]
    >([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
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

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                loadRoles(),
                loadDepartments(),
                loadProgramStudi(),
            ]);
        } catch (error) {
            console.error("Error loading initial data:", error);
            toast.error("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    };

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

    // Filter prodi mahasiswa based on selected departemen
    useEffect(() => {
        if (formData.mahasiswaData.departemenId) {
            const filtered = programStudiList.filter(
                (prodi) =>
                    prodi.departemenId === formData.mahasiswaData.departemenId,
            );
            setFilteredProdiMahasiswa(filtered);
        } else {
            setFilteredProdiMahasiswa([]);
        }
    }, [formData.mahasiswaData.departemenId, programStudiList]);

    // Filter prodi pegawai based on selected departemen
    useEffect(() => {
        if (formData.pegawaiData.departemenId) {
            const filtered = programStudiList.filter(
                (prodi) =>
                    prodi.departemenId === formData.pegawaiData.departemenId,
            );
            setFilteredProdiPegawai(filtered);
        } else {
            setFilteredProdiPegawai([]);
        }
    }, [formData.pegawaiData.departemenId, programStudiList]);

    const handleRoleToggle = (roleId: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId],
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email) {
            toast.error("Nama dan email wajib diisi");
            return;
        }

        if (selectedRoles.length === 0) {
            toast.error("Pilih minimal satu role untuk pengguna");
            return;
        }

        // Check if MAHASISWA role is selected and required fields are filled
        const isMahasiswa = selectedRoles.some((roleId) => {
            const role = availableRoles.find((r) => r.id === roleId);
            return role?.name === "MAHASISWA";
        });

        if (
            isMahasiswa &&
            (!formData.mahasiswaData.nim || !formData.mahasiswaData.semester)
        ) {
            toast.error(
                "NIM dan Semester wajib diisi untuk pengguna dengan role Mahasiswa",
            );
            return;
        }

        setSaving(true);

        try {
            // Convert role IDs to role names for API
            const roleNames = selectedRoles
                .map((roleId) => {
                    const role = availableRoles.find((r) => r.id === roleId);
                    return role?.name;
                })
                .filter(Boolean) as string[];

            const createData: any = {
                name: formData.name,
                email: formData.email,
                roles: roleNames, // Send role names, not IDs
            };

            // Add password if provided
            if (formData.password) {
                createData.password = formData.password;
            }

            // Add mahasiswa data if MAHASISWA role selected and data exists
            if (isMahasiswa && formData.mahasiswaData.nim) {
                createData.mahasiswaData = {
                    nim: formData.mahasiswaData.nim,
                    semester: Number(formData.mahasiswaData.semester) || 0,
                    ipk: Number(formData.mahasiswaData.ipk) || 0,
                    ips: Number(formData.mahasiswaData.ips) || 0,
                    tahunMasuk: formData.mahasiswaData.tahunMasuk || "",
                    noHp: formData.mahasiswaData.noHp || "",
                    tempatLahir: formData.mahasiswaData.tempatLahir || "",
                    tanggalLahir: formData.mahasiswaData.tanggalLahir || "",
                    departemenId:
                        formData.mahasiswaData.departemenId || undefined,
                    programStudiId:
                        formData.mahasiswaData.programStudiId || undefined,
                };
            }

            // Add pegawai data if non-mahasiswa roles selected and data exists
            const hasNonMahasiswaRole = selectedRoles.some((roleId) => {
                const role = availableRoles.find((r) => r.id === roleId);
                return role?.name !== "MAHASISWA";
            });

            if (hasNonMahasiswaRole && formData.pegawaiData.nip) {
                createData.pegawaiData = {
                    nip: formData.pegawaiData.nip,
                    jabatan: formData.pegawaiData.jabatan || "",
                    noHp: formData.pegawaiData.noHp || "",
                    departemenId:
                        formData.pegawaiData.departemenId || undefined,
                    programStudiId:
                        formData.pegawaiData.programStudiId || undefined,
                };
            }

            await createUser(createData);

            toast.success("Pengguna berhasil dibuat");
            router.push("/super-admin/kelola-pengguna");
        } catch (error) {
            console.error("Error creating user:", error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Gagal membuat pengguna",
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

    const isMahasiswaSelected = selectedRoles.some((roleId) => {
        const role = availableRoles.find((r) => r.id === roleId);
        return role?.name === "MAHASISWA";
    });

    const hasNonMahasiswaRole = selectedRoles.some((roleId) => {
        const role = availableRoles.find((r) => r.id === roleId);
        return role?.name !== "MAHASISWA";
    });

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-undip-blue" />
                    <p className="mt-4 text-gray-600">Memuat data...</p>
                </div>
            </div>
        );
    }

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
                            Buat Pengguna Baru
                        </h1>
                    </div>
                    <p className="text-slate-500 text-lg ml-12">
                        Tambahkan pengguna baru ke sistem E-Office
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
                    <CardKonten className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Lengkap{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value,
                                            })
                                        }
                                        className="pl-10"
                                        placeholder="email@undip.ac.id"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password{" "}
                                    <span className="text-gray-500 text-sm font-normal">
                                        (Opsional, akan digenerate otomatis jika
                                        kosong)
                                    </span>
                                </Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value,
                                            })
                                        }
                                        className="pl-10 pr-10"
                                        placeholder="Minimal 8 karakter"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </CardKonten>
                </Card>

                {/* Roles */}
                <Card className="border-gray-200 shadow-sm rounded-3xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-undip-blue" />
                            Role Pengguna{" "}
                            <span className="text-red-500">*</span>
                        </CardTitle>
                    </CardHeader>
                    <CardKonten>
                        <div className="grid gap-3 md:grid-cols-2">
                            {availableRoles.map((role) => (
                                <div
                                    key={role.id}
                                    className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                                >
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={selectedRoles.includes(
                                            role.id,
                                        )}
                                        onCheckedChange={() =>
                                            handleRoleToggle(role.id)
                                        }
                                    />
                                    <Label
                                        htmlFor={`role-${role.id}`}
                                        className="flex-1 cursor-pointer font-medium"
                                    >
                                        {getRoleName(role.name)}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {selectedRoles.length === 0 && (
                            <p className="mt-2 text-sm text-amber-600">
                                Pilih minimal satu role untuk pengguna
                            </p>
                        )}
                    </CardKonten>
                </Card>

                {/* Mahasiswa Data */}
                {isMahasiswaSelected && (
                    <Card className="border-gray-200 shadow-sm rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-undip-blue" />
                                Data Mahasiswa
                            </CardTitle>
                        </CardHeader>
                        <CardKonten className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nim">
                                        NIM{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
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
                                        placeholder="24060122140XXX"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="semester">
                                        Semester{" "}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="semester"
                                        type="number"
                                        min="1"
                                        max="14"
                                        value={
                                            formData.mahasiswaData.semester ||
                                            ""
                                        }
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
                                        placeholder="1-14"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ipk">IPK</Label>
                                    <Input
                                        id="ipk"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="4"
                                        value={formData.mahasiswaData.ipk || ""}
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
                                        placeholder="0.00 - 4.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ips">IPS</Label>
                                    <Input
                                        id="ips"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="4"
                                        value={formData.mahasiswaData.ips || ""}
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
                                        placeholder="0.00 - 4.00"
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
                                        placeholder="2020"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="noHpMahasiswa">
                                        No. HP
                                    </Label>
                                    <Input
                                        id="noHpMahasiswa"
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
                                        placeholder="08123456789"
                                    />
                                </div>

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
                                        placeholder="Semarang"
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

                                <div className="space-y-2">
                                    <Label htmlFor="departemenMahasiswa">
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
                                        <SelectKonten>
                                            {departments.map((dept) => (
                                                <SelectItem
                                                    key={dept.id}
                                                    value={dept.id}
                                                >
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectKonten>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="prodiMahasiswa">
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
                                        <SelectKonten>
                                            {filteredProdiMahasiswa.map(
                                                (prodi) => (
                                                    <SelectItem
                                                        key={prodi.id}
                                                        value={prodi.id}
                                                    >
                                                        {prodi.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectKonten>
                                    </Select>
                                </div>
                            </div>
                        </CardKonten>
                    </Card>
                )}

                {/* Pegawai Data */}
                {hasNonMahasiswaRole && (
                    <Card className="border-gray-200 shadow-sm rounded-3xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-undip-blue" />
                                Data Pegawai
                            </CardTitle>
                        </CardHeader>
                        <CardKonten className="space-y-4">
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
                                        placeholder="199001012020121001"
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
                                        placeholder="Dosen / Staff"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="noHpPegawai">No. HP</Label>
                                    <Input
                                        id="noHpPegawai"
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
                                        placeholder="08123456789"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="departemenPegawai">
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
                                        <SelectKonten>
                                            {departments.map((dept) => (
                                                <SelectItem
                                                    key={dept.id}
                                                    value={dept.id}
                                                >
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectKonten>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="prodiPegawai">
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
                                        <SelectKonten>
                                            {filteredProdiPegawai.map(
                                                (prodi) => (
                                                    <SelectItem
                                                        key={prodi.id}
                                                        value={prodi.id}
                                                    >
                                                        {prodi.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectKonten>
                                    </Select>
                                </div>
                            </div>
                        </CardKonten>
                    </Card>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={saving}
                        className="rounded-xl"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-undip-blue hover:bg-undip-blue/90 rounded-xl"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Simpan Pengguna
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

