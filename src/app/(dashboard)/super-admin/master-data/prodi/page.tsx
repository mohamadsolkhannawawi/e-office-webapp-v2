"use client";

import React, { useState, useEffect } from "react";
import { Card, CardKonten, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  Edit,
  Trash,
  Loader2,
  Users,
  GraduationCap,
  Pencarian,
  X,
  BookOpen,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogKonten,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogKonten,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectKonten,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listProdi,
  createProdi,
  updateProdi,
  deleteProdi,
  listDepartments,
} from "@/lib/admin-api";
import toast from "react-hot-toast";

interface Departemen {
  id: string;
  name: string;
  code: string;
}

interface Prodi {
  id: string;
  name: string;
  code: string;
  departemenId: string;
  departemen: Departemen;
  mahasiswaCount: number;
  pegawaiCount: number;
}

export default function ProdiPage() {
  const [loading, setLoading] = useState(true);
  const [prodi, setProdi] = useState<Prodi[]>([]);
  const [filteredProdi, setFilteredProdi] = useState<Prodi[]>([]);
  const [departments, setDepartments] = useState<Departemen[]>([]);
  const [searchQuery, setPencarianQuery] = useState("");
  const [filterDepartemenId, setFilterDepartemenId] = useState<string>("");

  // State dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProdi, setSelectedProdi] = useState<Prodi | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Data formulir
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    departemenId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter prodi berdasarkan query pencarian dan filter departemen
    let filtered = prodi;

    if (filterDepartemenId) {
      filtered = filtered.filter((p) => p.departemenId === filterDepartemenId);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          p.departemen.name.toLowerCase().includes(query),
      );
    }

    setFilteredProdi(filtered);
  }, [searchQuery, filterDepartemenId, prodi]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodiResponse, departmentResponse] = await Promise.all([
        listProdi(),
        listDepartments(),
      ]);
      setProdi(prodiResponse.prodi || []);
      setFilteredProdi(prodiResponse.prodi || []);
      setDepartments(departmentResponse.departments || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code || !formData.departemenId) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      await createProdi({
        name: formData.name,
        code: formData.code.toUpperCase(),
        departemenId: formData.departemenId,
      });
      toast.success("Program Studi berhasil dibuat");
      setIsCreateOpen(false);
      setFormData({ name: "", code: "", departemenId: "" });
      loadData();
    } catch (error) {
      console.error("Error creating prodi:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat program studi",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProdi) return;

    if (!formData.name || !formData.code || !formData.departemenId) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      await updateProdi(selectedProdi.id, {
        name: formData.name,
        code: formData.code.toUpperCase(),
        departemenId: formData.departemenId,
      });
      toast.success("Program Studi berhasil diperbarui");
      setIsEditOpen(false);
      setSelectedProdi(null);
      setFormData({ name: "", code: "", departemenId: "" });
      loadData();
    } catch (error) {
      console.error("Error updating prodi:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui program studi",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProdi) return;

    setSubmitting(true);
    try {
      await deleteProdi(selectedProdi.id);
      toast.success("Program Studi berhasil dihapus");
      setIsDeleteOpen(false);
      setSelectedProdi(null);
      loadData();
    } catch (error) {
      console.error("Error deleting prodi:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal menghapus program studi",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (p: Prodi) => {
    setSelectedProdi(p);
    setFormData({
      name: p.name,
      code: p.code,
      departemenId: p.departemenId,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (p: Prodi) => {
    setSelectedProdi(p);
    setIsDeleteOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({ name: "", code: "", departemenId: "" });
    setIsCreateOpen(true);
  };

  const clearFilters = () => {
    setPencarianQuery("");
    setFilterDepartemenId("");
  };

  const totalMahasiswa = prodi.reduce((sum, p) => sum + p.mahasiswaCount, 0);
  const totalPegawai = prodi.reduce((sum, p) => sum + p.pegawaiCount, 0);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-undip-blue" />
          <p className="mt-4 text-gray-600">Memuat data program studi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="my-auto shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-undip-blue/10 text-undip-blue sm:h-20 sm:w-20">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-800">
              Master Data Program Studi
            </h1>
            <p className="text-lg text-slate-500">
              Kelola data program studi di FSM UNDIP
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="w-full rounded-xl bg-undip-blue hover:bg-undip-blue/90 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Program Studi
          </Button>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardKonten className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-undip-blue/10 p-3">
                <BookOpen className="h-6 w-6 text-undip-blue" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Program Studi</p>
                <p className="text-2xl font-bold text-slate-800">
                  {prodi.length}
                </p>
              </div>
            </div>
          </CardKonten>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardKonten className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 p-3">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Departemen</p>
                <p className="text-2xl font-bold text-slate-800">
                  {departments.length}
                </p>
              </div>
            </div>
          </CardKonten>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardKonten className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Mahasiswa</p>
                <p className="text-2xl font-bold text-slate-800">
                  {totalMahasiswa}
                </p>
              </div>
            </div>
          </CardKonten>
        </Card>

        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardKonten className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 p-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pegawai</p>
                <p className="text-2xl font-bold text-slate-800">
                  {totalPegawai}
                </p>
              </div>
            </div>
          </CardKonten>
        </Card>
      </div>

      {/* Pencarian, Filter and List */}
      <Card className="border-gray-200 shadow-sm rounded-3xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-undip-blue" />
              Daftar Program Studi
            </CardTitle>
            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
              {/* Filter Departemen */}
              <Select
                value={filterDepartemenId}
                onValueChange={setFilterDepartemenId}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Departemen" />
                </SelectTrigger>
                <SelectKonten>
                  <SelectItem value="all">Semua Departemen</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectKonten>
              </Select>

              {/* Pencarian */}
              <div className="relative w-full sm:w-72">
                <Pencarian className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari program studi..."
                  value={searchQuery}
                  onChange={(e) => setPencarianQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setPencarianQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Reset Filter */}
              {(searchQuery || filterDepartemenId) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full text-slate-600 sm:w-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardKonten>
          <div className="space-y-3">
            {filteredProdi.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="rounded-full bg-undip-blue/10 p-3">
                    <BookOpen className="h-5 w-5 text-undip-blue" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800">{p.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Badge variant="outline" className="font-mono">
                        {p.code}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <Building2 className="h-3 w-3 mr-1" />
                        {p.departemen.name}
                      </Badge>
                      <span className="text-xs text-slate-500 sm:text-sm">
                        {p.mahasiswaCount} Mahasiswa â€¢ {p.pegawaiCount}{" "}
                        Pegawai
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(p)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(p)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredProdi.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-slate-500">
                {searchQuery || filterDepartemenId
                  ? "Tidak ada program studi yang sesuai dengan filter"
                  : "Belum ada program studi"}
              </p>
            </div>
          )}
        </CardKonten>
      </Card>

      {/* Dialog Tambah */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogKonten>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Tambah Program Studi Baru</DialogTitle>
              <DialogDescription>
                Masukkan informasi program studi baru
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="departemenId">
                  Departemen <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.departemenId}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      departemenId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectKonten>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectKonten>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Program Studi <span className="text-red-500">*</span>
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
                  placeholder="Contoh: S1 Informatika"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">
                  Kode Program Studi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Contoh: S1-INF"
                  maxLength={20}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-undip-blue hover:bg-undip-blue/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogKonten>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogKonten>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Program Studi</DialogTitle>
              <DialogDescription>
                Perbarui informasi program studi
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-departemenId">
                  Departemen <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.departemenId}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      departemenId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectKonten>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectKonten>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Nama Program Studi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Contoh: S1 Informatika"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">
                  Kode Program Studi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Contoh: S1-INF"
                  maxLength={20}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-undip-blue hover:bg-undip-blue/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogKonten>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogKonten>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Program Studi?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus program studi{" "}
              <strong>{selectedProdi?.name}</strong> dari{" "}
              <strong>{selectedProdi?.departemen.name}</strong>?
              {selectedProdi &&
                (selectedProdi.mahasiswaCount > 0 ||
                  selectedProdi.pegawaiCount > 0) && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 font-semibold">
                      âš ï¸ Peringatan:
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Program studi ini memiliki {selectedProdi.mahasiswaCount}{" "}
                      mahasiswa dan {selectedProdi.pegawaiCount} pegawai.
                      Pindahkan mereka terlebih dahulu.
                    </p>
                  </div>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogKonten>
      </AlertDialog>
    </div>
  );
}
