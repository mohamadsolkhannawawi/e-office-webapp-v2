"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PencilLine, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { submitStaffEdit } from "@/lib/application-api";

interface StaffEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: "supervisor-akademik" | "manajer-tu";
    applicationId: string;
    /** Pre-filled values matching the original submission form */
    initialValues?: {
        namaBeasiswa?: string;
        namaLengkap?: string;
        nim?: string;
        email?: string;
        departemen?: string;
        programStudi?: string;
        tempatLahir?: string;
        tanggalLahir?: string;
        noHp?: string;
        semester?: string | number;
        ipk?: string | number;
        ips?: string | number;
    };
    /** Called after a successful edit so the parent can refresh data */
    onSuccess?: () => void;
}

type Step = "form" | "confirm" | "loading";

/** Normalize any date string to YYYY-MM-DD so <input type="date"> can display it */
function toDateInputValue(dateStr?: string): string {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            const y = d.getUTCFullYear();
            const m = String(d.getUTCMonth() + 1).padStart(2, "0");
            const day = String(d.getUTCDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
        }
    } catch {}
    return "";
}

export function StaffEditModal({
    isOpen,
    onClose,
    role,
    applicationId,
    initialValues,
    onSuccess,
}: StaffEditModalProps) {
    const roleName =
        role === "supervisor-akademik" ? "Supervisor Akademik" : "Manajer TU";

    // Form state
    const [namaBeasiswa, setNamaBeasiswa] = useState(
        initialValues?.namaBeasiswa || "",
    );
    const [namaLengkap, setNamaLengkap] = useState(
        initialValues?.namaLengkap || "",
    );
    const [nim, setNim] = useState(initialValues?.nim || "");
    const [email, setEmail] = useState(initialValues?.email || "");
    const [departemen, setDepartemen] = useState(
        initialValues?.departemen || "",
    );
    const [programStudi, setProgramStudi] = useState(
        initialValues?.programStudi || "",
    );
    const [tempatLahir, setTempatLahir] = useState(
        initialValues?.tempatLahir || "",
    );
    const [tanggalLahir, setTanggalLahir] = useState(
        toDateInputValue(initialValues?.tanggalLahir),
    );
    const [noHp, setNoHp] = useState(initialValues?.noHp || "");
    const [semester, setSemester] = useState(
        String(initialValues?.semester || ""),
    );
    const [ipk, setIpk] = useState(String(initialValues?.ipk || ""));
    const [ips, setIps] = useState(String(initialValues?.ips || ""));
    const [catatan, setCatatan] = useState("");
    const [step, setStep] = useState<Step>("form");

    /** Reset all local fields to the original initialValues (no data leaks on cancel) */
    const resetToInitial = () => {
        setNamaBeasiswa(initialValues?.namaBeasiswa || "");
        setNamaLengkap(initialValues?.namaLengkap || "");
        setNim(initialValues?.nim || "");
        setEmail(initialValues?.email || "");
        setDepartemen(initialValues?.departemen || "");
        setProgramStudi(initialValues?.programStudi || "");
        setTempatLahir(initialValues?.tempatLahir || "");
        setTanggalLahir(toDateInputValue(initialValues?.tanggalLahir));
        setNoHp(initialValues?.noHp || "");
        setSemester(String(initialValues?.semester || ""));
        setIpk(String(initialValues?.ipk || ""));
        setIps(String(initialValues?.ips || ""));
        setCatatan("");
        setStep("form");
    };

    const handleClose = () => {
        if (step === "loading") return;
        resetToInitial();
        onClose();
    };

    /** Reset all fields to initialValues when dialog opens; close when it closes */
    const handleOpenChange = (open: boolean) => {
        if (open) {
            resetToInitial();
        } else {
            handleClose();
        }
    };

    const handleSubmit = async () => {
        setStep("loading");
        try {
            const valuesPatch: Record<string, unknown> = {};
            if (namaLengkap.trim())
                valuesPatch.namaLengkap = namaLengkap.trim();
            if (nim.trim()) valuesPatch.nim = nim.trim();
            if (email.trim()) valuesPatch.email = email.trim();
            if (departemen.trim()) valuesPatch.departemen = departemen.trim();
            if (programStudi.trim())
                valuesPatch.programStudi = programStudi.trim();
            if (tempatLahir.trim())
                valuesPatch.tempatLahir = tempatLahir.trim();
            if (tanggalLahir.trim())
                valuesPatch.tanggalLahir = tanggalLahir.trim();
            if (noHp.trim()) valuesPatch.noHp = noHp.trim();
            if (semester.trim()) valuesPatch.semester = Number(semester);
            if (ipk.trim()) valuesPatch.ipk = Number(ipk);
            if (ips.trim()) valuesPatch.ips = Number(ips);
            // Keep nama_beasiswa in sync with scholarshipName
            if (namaBeasiswa.trim())
                valuesPatch.nama_beasiswa = namaBeasiswa.trim();

            await submitStaffEdit(applicationId, {
                namaBeasiswa: namaBeasiswa.trim() || undefined,
                values:
                    Object.keys(valuesPatch).length > 0
                        ? valuesPatch
                        : undefined,
                catatan: catatan.trim() || undefined,
            });

            toast.success("Data surat berhasil diperbarui!");
            handleClose();
            onSuccess?.();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Gagal memperbarui data surat.",
            );
            setStep("form");
        }
    };

    // Shared class helpers
    const lbl = "text-xs font-semibold text-slate-700 uppercase tracking-wide";
    const inp =
        "rounded-xl border-slate-200 focus:border-indigo-400 focus-visible:ring-indigo-300 text-sm h-10";

    // Rows shown in the confirm summary (only fields with values)
    const summaryRows = [
        { label: "Nama Beasiswa", val: namaBeasiswa },
        { label: "Nama Lengkap", val: namaLengkap },
        { label: "NIM", val: nim },
        { label: "Email", val: email },
        { label: "No. HP", val: noHp },
        { label: "Departemen", val: departemen },
        { label: "Program Studi", val: programStudi },
        { label: "Tempat Lahir", val: tempatLahir },
        { label: "Tanggal Lahir", val: tanggalLahir },
        { label: "Semester", val: semester },
        { label: "IPK", val: ipk },
        { label: "IPS", val: ips },
    ].filter((r) => r.val.trim());

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-4xl w-full rounded-3xl p-0 overflow-hidden border-0 shadow-xl">
                {/* Header */}
                <div className="bg-indigo-600 px-6 py-5">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-2xl">
                                <PencilLine className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-white font-bold text-lg">
                                    Edit Data Surat
                                </DialogTitle>
                                <DialogDescription className="text-indigo-200 text-xs mt-0.5">
                                    Perbarui informasi surat pengajuan sebagai{" "}
                                    {roleName}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {step === "form" && (
                    <>
                        <div className="px-6 py-5 space-y-4">
                            {/* Nama Beasiswa â€” full width */}
                            <div className="space-y-1.5">
                                <Label className={lbl}>Nama Beasiswa</Label>
                                <Input
                                    value={namaBeasiswa}
                                    onChange={(e) =>
                                        setNamaBeasiswa(e.target.value)
                                    }
                                    placeholder="Nama beasiswa yang dimohonkan"
                                    className={inp}
                                />
                            </div>

                            {/* Row 2 – 3 col: identitas */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className={lbl}>Nama Lengkap</Label>
                                    <Input
                                        value={namaLengkap}
                                        onChange={(e) =>
                                            setNamaLengkap(e.target.value)
                                        }
                                        placeholder="Nama mahasiswa"
                                        className={inp}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className={lbl}>NIM</Label>
                                    <Input
                                        value={nim}
                                        onChange={(e) => setNim(e.target.value)}
                                        placeholder="Nomor Induk Mahasiswa"
                                        className={inp}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className={lbl}>No. HP</Label>
                                    <Input
                                        value={noHp}
                                        onChange={(e) =>
                                            setNoHp(e.target.value)
                                        }
                                        placeholder="Nomor handphone"
                                        className={inp}
                                    />
                                </div>
                            </div>

                            {/* Row 3 – 3 col: kontak & akademik */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className={lbl}>Email</Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="email@mahasiswa.id"
                                        className={inp}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className={lbl}>Departemen</Label>
                                    <Input
                                        value={departemen}
                                        onChange={(e) =>
                                            setDepartemen(e.target.value)
                                        }
                                        placeholder="Nama departemen"
                                        className={inp}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className={lbl}>Program Studi</Label>
                                    <Input
                                        value={programStudi}
                                        onChange={(e) =>
                                            setProgramStudi(e.target.value)
                                        }
                                        placeholder="Nama program studi"
                                        className={inp}
                                    />
                                </div>
                            </div>

                            {/* Row 4 – TTL + nilai akademik */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                <div className="space-y-1.5 col-span-2 sm:col-span-2">
                                    <Label className={lbl}>Tempat Lahir</Label>
                                    <Input
                                        value={tempatLahir}
                                        onChange={(e) =>
                                            setTempatLahir(e.target.value)
                                        }
                                        placeholder="Kota / Kabupaten"
                                        className={inp}
                                    />
                                </div>
                                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                    <Label className={lbl}>Tanggal Lahir</Label>
                                    <Input
                                        type="date"
                                        value={tanggalLahir}
                                        onChange={(e) =>
                                            setTanggalLahir(e.target.value)
                                        }
                                        className={inp}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className={lbl}>Semester</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={14}
                                        value={semester}
                                        onChange={(e) =>
                                            setSemester(e.target.value)
                                        }
                                        placeholder="mis. 6"
                                        className={inp}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className={lbl}>IPK</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        max={4}
                                        value={ipk}
                                        onChange={(e) => setIpk(e.target.value)}
                                        placeholder="3.50"
                                        className={inp}
                                    />
                                </div>
                            </div>

                            {/* Row 5 – IPS + Catatan */}
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                                <div className="space-y-1.5 sm:col-span-1">
                                    <Label className={lbl}>IPS</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        max={4}
                                        value={ips}
                                        onChange={(e) => setIps(e.target.value)}
                                        placeholder="3.75"
                                        className={inp}
                                    />
                                </div>
                                <div className="space-y-1.5 sm:col-span-4">
                                    <Label className={lbl}>
                                        Catatan Perubahan{" "}
                                        <span className="text-slate-400 normal-case font-normal">
                                            (opsional)
                                        </span>
                                    </Label>
                                    <Textarea
                                        value={catatan}
                                        onChange={(e) =>
                                            setCatatan(e.target.value)
                                        }
                                        placeholder="Tuliskan alasan atau catatan perubahan..."
                                        rows={2}
                                        className="rounded-xl border-slate-200 focus:border-indigo-400 focus-visible:ring-indigo-300 text-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="px-6 pb-5 pt-3 gap-2 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="rounded-3xl px-6 border-slate-200 text-slate-600"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={() => setStep("confirm")}
                                disabled={!namaBeasiswa.trim()}
                                className="rounded-3xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                                Lanjutkan
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === "confirm" && (
                    <>
                        <div className="px-6 py-5 space-y-4">
                            {/* Header compact – horizontal */}
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl shrink-0">
                                    <CheckCircle2 className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">
                                        Konfirmasi Perubahan
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        Perubahan berikut akan disimpan dan
                                        tercatat dalam riwayat surat.
                                    </p>
                                </div>
                            </div>

                            {/* Summary – 2-column, colon-aligned */}
                            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 text-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
                                    {[
                                        summaryRows.slice(
                                            0,
                                            Math.ceil(summaryRows.length / 2),
                                        ),
                                        summaryRows.slice(
                                            Math.ceil(summaryRows.length / 2),
                                        ),
                                    ].map((col, ci) => (
                                        <div
                                            key={ci}
                                            className="grid grid-cols-[max-content_auto_1fr] gap-x-2 gap-y-2"
                                        >
                                            {col.map((r) => (
                                                <React.Fragment key={r.label}>
                                                    <span className="text-slate-500">
                                                        {r.label}
                                                    </span>
                                                    <span className="text-slate-400">
                                                        :
                                                    </span>
                                                    <span className="font-medium text-slate-700">
                                                        {r.val}
                                                    </span>
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {catatan.trim() && (
                                    <div className="pt-3 mt-3 border-t border-slate-200">
                                        <p className="text-slate-500 mb-1">
                                            Catatan
                                        </p>
                                        <p className="italic text-slate-600">
                                            &ldquo;{catatan}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="px-6 pb-5 pt-3 gap-2 border-t border-slate-100">
                            <Button
                                variant="outline"
                                onClick={() => setStep("form")}
                                className="rounded-3xl px-6 border-slate-200 text-slate-600"
                            >
                                Kembali
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                className="rounded-3xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {step === "loading" && (
                    <div className="px-6 py-12 flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                        <p className="text-slate-600 font-medium">
                            Menyimpan perubahan...
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
