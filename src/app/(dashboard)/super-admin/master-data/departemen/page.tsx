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
  BookOpen,
  Pencarian,
  X,
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
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/lib/admin-api";
import toast from "react-hot-toast";

interface Department {
  id: string;
  name: string;
  code: string;
  prodiCount: number;
  mahasiswaCount: number;
  pegawaiCount: number;
}

export default function DepartemenPage() {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(
    [],
  );
  const [searchQuery, setPencarianQuery] = useState("");

  // State dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Data formulir
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    // Filter departemen berdasarkan query pencarian
    if (searchQuery.trim() === "") {
      setFilteredDepartments(departments);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = departments.filter(
        (dept) =>
          dept.name.toLowerCase().includes(query) ||
          dept.code.toLowerCase().includes(query),
      );
      setFilteredDepartments(filtered);
    }
  }, [searchQuery, departments]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await listDepartments();
      setDepartments(response.departments || []);
      setFilteredDepartments(response.departments || []);
    } catch (error) {
      console.error("Error loading departments:", error);
      toast.error("Gagal memuat data departemen");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast.error("Nama dan kode departemen wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      await createDepartment({
        name: formData.name,
        code: formData.code.toUpperCase(),
      });
      toast.success("Departemen berhasil dibuat");
      setIsCreateOpen(false);
      setFormData({ name: "", code: "" });
      loadDepartments();
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat departemen",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDept) return;

    if (!formData.name || !formData.code) {
      toast.error("Nama dan kode departemen wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      await updateDepartment(selectedDept.id, {
        name: formData.name,
        code: formData.code.toUpperCase(),
      });
      toast.success("Departemen berhasil diperbarui");
      setIsEditOpen(false);
      setSelectedDept(null);
      setFormData({ name: "", code: "" });
      loadDepartments();
    } catch (error) {
      console.error("Error updating department:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal memperbarui departemen",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;

    setSubmitting(true);
    try {
      await deleteDepartment(selectedDept.id);
      toast.success("Departemen berhasil dihapus");
      setIsDeleteOpen(false);
      setSelectedDept(null);
      loadDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus departemen",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (dept: Department) => {
    setSelectedDept(dept);
    setIsDeleteOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({ name: "", code: "" });
    setIsCreateOpen(true);
  };

  const totalProdi = departments.reduce(
    (sum, dept) => sum + dept.prodiCount,
    0,
  );
  const totalMahasiswa = departments.reduce(
    (sum, dept) => sum + dept.mahasiswaCount,
    0,
  );
  const totalPegawai = departments.reduce(
    (sum, dept) => sum + dept.pegawaiCount,
    0,
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-undip-blue" />
          <p className="mt-4 text-gray-600">Memuat data departemen...</p>
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
            <Building2 className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Master Data Departemen
            </h1>
            <p className="text-slate-500 text-lg">
              Kelola data departemen di FSM UNDIP
            </p>
          </div>
          <Button
            onClick={openCreateDialog}
            className="w-full rounded-xl bg-undip-blue hover:bg-undip-blue/90 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Departemen
          </Button>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-200 shadow-sm rounded-3xl">
          <CardKonten className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-undip-blue/10 p-3">
                <Building2 className="h-6 w-6 text-undip-blue" />
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
              <div className="rounded-full bg-green-100 p-3">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Program Studi</p>
                <p className="text-2xl font-bold text-slate-800">
                  {totalProdi}
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

      {/* Pencarian dan Daftar */}
      <Card className="border-gray-200 shadow-sm rounded-3xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-undip-blue" />
              Daftar Departemen
            </CardTitle>
            {/* Pencarian */}
            <div className="relative w-full sm:w-72">
              <Pencarian className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari departemen..."
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
          </div>
        </CardHeader>
        <CardKonten>
          <div className="space-y-3">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-undip-blue/10 p-3">
                    <Building2 className="h-5 w-5 text-undip-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {dept.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className="font-mono">
                        {dept.code}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        {dept.prodiCount} Prodi â€¢ {dept.mahasiswaCount}{" "}
                        Mahasiswa â€¢ {dept.pegawaiCount} Pegawai
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(dept)}
                    className="hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(dept)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredDepartments.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-slate-500">
                {searchQuery
                  ? "Tidak ada departemen yang sesuai dengan pencarian"
                  : "Belum ada departemen"}
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
              <DialogTitle>Tambah Departemen Baru</DialogTitle>
              <DialogDescription>
                Masukkan informasi departemen baru
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Departemen <span className="text-red-500">*</span>
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
                  placeholder="Contoh: Departemen Informatika"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">
                  Kode Departemen <span className="text-red-500">*</span>
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
                  placeholder="Contoh: INF"
                  maxLength={10}
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
              <DialogTitle>Edit Departemen</DialogTitle>
              <DialogDescription>
                Perbarui informasi departemen
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Nama Departemen <span className="text-red-500">*</span>
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
                  placeholder="Contoh: Departemen Informatika"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">
                  Kode Departemen <span className="text-red-500">*</span>
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
                  placeholder="Contoh: INF"
                  maxLength={10}
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
            <AlertDialogTitle>Hapus Departemen?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus departemen{" "}
              <strong>{selectedDept?.name}</strong>?
              {selectedDept &&
                (selectedDept.prodiCount > 0 ||
                  selectedDept.mahasiswaCount > 0 ||
                  selectedDept.pegawaiCount > 0) && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 font-semibold">
                      âš ï¸ Peringatan:
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Departemen ini memiliki {selectedDept.prodiCount} program
                      studi, {selectedDept.mahasiswaCount} mahasiswa, dan{" "}
                      {selectedDept.pegawaiCount} pegawai. Hapus atau pindahkan
                      mereka terlebih dahulu.
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
