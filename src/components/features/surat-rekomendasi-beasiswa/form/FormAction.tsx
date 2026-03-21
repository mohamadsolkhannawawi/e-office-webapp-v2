"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

import {
  updateApplication,
  createDraftApplication,
} from "@/lib/attachment-api";
import { submitStudentEdit } from "@/lib/application-api";
import { FormDataType } from "@/types/form";
import { showError, showSuccess } from "@/lib/toast-helpers";

interface ActionProps {
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  isNextDisabled?: boolean;
  letterInstanceId?: string;
  formData?: FormDataType;
  jenis?: string;
  /** When "student_edit", calls the student-edit endpoint instead of normal update */
  mode?: "default" | "student_edit";
}

export function FormAction({
  currentStep,
  onNext,
  onBack,
  isNextDisabled,
  letterInstanceId,
  formData,
  jenis,
  mode = "default",
}: ActionProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDraftSuccess, setShowDraftSuccess] = React.useState(false);
  const [draftRedirectPath, setDraftRedirectPath] = React.useState("");
  const [showSubmitSuccess, setShowSubmitSuccess] = React.useState(false);
  const [submitRedirectPath, setSubmitRedirectPath] = React.useState("");
  const [submitSuccessTitle, setSubmitSuccessTitle] = React.useState("");
  const [submitSuccessMessage, setSubmitSuccessMessage] = React.useState("");
  const draftIconRef = React.useRef<HTMLDivElement | null>(null);
  const submitIconRef = React.useRef<HTMLDivElement | null>(null);

  const isStudentEdit = mode === "student_edit";
  const draftListPath =
    jenis === "keperluan_lain"
      ? "/mahasiswa/surat/draft/surat-rekomendasi-beasiswa?jenis=keperluan_lain"
      : "/mahasiswa/surat/draft/surat-rekomendasi-beasiswa";

  React.useEffect(() => {
    if (!showDraftSuccess || !draftIconRef.current) return;
    const anim = draftIconRef.current.animate(
      [
        { transform: "translateY(10px) scale(0.8)", opacity: 0.2 },
        { transform: "translateY(-2px) scale(1.08)", opacity: 1, offset: 0.6 },
        { transform: "translateY(0) scale(1)", opacity: 1 },
      ],
      {
        duration: 620,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        fill: "both",
      },
    );
    return () => anim.cancel();
  }, [showDraftSuccess]);

  React.useEffect(() => {
    if (!showSubmitSuccess || !submitIconRef.current) return;
    const anim = submitIconRef.current.animate(
      [
        { transform: "translateY(12px) scale(0.78)", opacity: 0.2 },
        { transform: "translateY(-2px) scale(1.1)", opacity: 1, offset: 0.6 },
        { transform: "translateY(0) scale(1)", opacity: 1 },
      ],
      {
        duration: 640,
        easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        fill: "both",
      },
    );
    return () => anim.cancel();
  }, [showSubmitSuccess]);

  const handleSaveDraft = async () => {
    if (!formData) return;

    setIsSubmitting(true);
    try {
      if (letterInstanceId) {
        // Update existing
        await updateApplication(letterInstanceId, {
          namaBeasiswa: formData.namaBeasiswa,
          values: {
            ...(formData as unknown as Record<string, unknown>),
            jenisBeasiswa: jenis,
          },
          status: "DRAFT",
        });
        setDraftRedirectPath(draftListPath);
        setShowDraftSuccess(true);
      } else {
        // Create new
        await createDraftApplication(formData.namaBeasiswa, {
          ...(formData as unknown as Record<string, unknown>),
          jenisBeasiswa: jenis,
        });
        setDraftRedirectPath(draftListPath);
        setShowDraftSuccess(true);
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
      showError("Gagal menyimpan draft. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAjukan = async () => {
    if (!letterInstanceId || !formData) {
      console.error("Missing letterInstanceId or formData");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isStudentEdit) {
        // Student self-edit: call the dedicated student-edit endpoint
        await submitStudentEdit(letterInstanceId, {
          namaBeasiswa: formData.namaBeasiswa,
          values: {
            ...(formData as unknown as Record<string, unknown>),
            jenisBeasiswa: jenis,
          },
        });

        localStorage.removeItem(`srb_form_${jenis}`);
        setSubmitSuccessTitle("Revisi Berhasil Disimpan!");
        setSubmitSuccessMessage(
          "Perubahan surat Anda sudah tersimpan dan akan diteruskan ke proses verifikasi berikutnya.",
        );
        setSubmitRedirectPath(
          `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${letterInstanceId}?from=proses`,
        );
        setShowSubmitSuccess(true);
      } else {
        // Normal submission flow
        await updateApplication(letterInstanceId, {
          namaBeasiswa: formData.namaBeasiswa,
          values: {
            ...(formData as unknown as Record<string, unknown>),
            jenisBeasiswa: jenis,
          },
          status: "PENDING",
        });

        localStorage.removeItem(`srb_form_${jenis}`);
        setSubmitSuccessTitle("Pengajuan Berhasil!");
        setSubmitSuccessMessage(
          "Surat Anda berhasil diajukan dan masuk ke tahap verifikasi. Anda dapat memantau progresnya pada daftar surat dalam proses.",
        );
        setSubmitRedirectPath(
          `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${letterInstanceId}`,
        );
        setShowSubmitSuccess(true);
      }
    } catch (error) {
      console.error("Failed to submit application:", error);
      const errMsg = error instanceof Error ? error.message : "";
      const isForbidden =
        errMsg.includes("403") || errMsg.toLowerCase().includes("forbidden");
      showError(
        isForbidden
          ? "Anda tidak memiliki izin untuk melakukan aksi ini. Silakan hubungi administrator."
          : isStudentEdit
            ? "Gagal menyimpan revisi surat. Silakan coba lagi."
            : "Gagal mengajukan surat. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAjukanSurat = () => {
    if (currentStep === 4) {
      return;
    } else {
      onNext();
    }
  };

  return (
    <>
      {/* Draft Success Modal */}
      <Dialog open={showDraftSuccess} onOpenChange={setShowDraftSuccess}>
        <DialogContent className="max-w-sm rounded-2xl sm:rounded-2xl text-center">
          <DialogHeader className="items-center gap-3">
            <div ref={draftIconRef}>
              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Draft Tersimpan!
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Surat Anda telah berhasil disimpan dalam daftar{" "}
              <strong>Draft Surat</strong>. Anda dapat melanjutkan pengisian
              kapan saja.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col mt-2">
            <Button
              onClick={() => {
                setShowDraftSuccess(false);
                router.push(draftRedirectPath);
              }}
              className="w-full bg-undip-blue hover:bg-sky-700 text-white rounded-3xl h-11"
            >
              Lihat Daftar Draft
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDraftSuccess(false)}
              className="w-full rounded-3xl h-11"
            >
              Lanjut Isi Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Success Modal */}
      <Dialog open={showSubmitSuccess} onOpenChange={setShowSubmitSuccess}>
        <DialogContent className="max-w-sm rounded-2xl sm:rounded-2xl text-center">
          <DialogHeader className="items-center gap-3">
            <div ref={submitIconRef}>
              <CheckCircle2 className="h-14 w-14 text-undip-blue" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              {submitSuccessTitle}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {submitSuccessMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col mt-2">
            <Button
              onClick={() => {
                setShowSubmitSuccess(false);
                router.push(submitRedirectPath);
              }}
              className="w-full bg-undip-blue hover:bg-sky-700 text-white rounded-3xl h-11"
            >
              Lihat Detail Surat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 1}
          className={`bg-white border-gray-300 text-gray-700 hover:bg-gray-50 px-6 h-11 rounded-3xl ${
            currentStep === 1 ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          Step Sebelumnya
        </Button>

        <div className="flex flex-col sm:flex-row gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-white bg-orange-500 border-orange-500 hover:bg-orange-600 hover:text-white h-11 px-6 rounded-3xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Draft"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Simpan sebagai Draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  Data yang Anda isi akan disimpan dan dapat dilanjutkan nanti
                  melalui menu Draft Surat.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-3xl">
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSaveDraft}
                  className="bg-undip-blue hover:bg-sky-700 rounded-3xl"
                >
                  Ya, Simpan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {currentStep === 4 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className={`${isStudentEdit ? "bg-amber-500 hover:bg-amber-600" : "bg-undip-blue hover:bg-sky-700"} text-white h-11 px-8 font-medium shadow-sm rounded-3xl`}
                  disabled={
                    isSubmitting ||
                    !!(typeof isNextDisabled !== "undefined" && isNextDisabled)
                  }
                >
                  {isStudentEdit ? "Simpan Revisi" : "Ajukan Surat"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isStudentEdit
                      ? "Konfirmasi Simpan Revisi Surat"
                      : "Konfirmasi Pengajuan Surat"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isStudentEdit
                      ? 'Apakah Anda yakin ingin menyimpan perubahan? Revisi akan dicatat dalam riwayat surat sebagai "Revisi oleh Mahasiswa" dan surat tetap menunggu verifikasi Supervisor Akademik.'
                      : "Apakah Anda yakin ingin mengajukan surat ini? Setelah diajukan, surat akan masuk ke proses verifikasi dan tidak dapat diubah."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-red-600 hover:bg-red-700 text-white h-11 px-8 font-medium shadow-sm shadow-red-200 rounded-3xl">
                    Batal
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmAjukan}
                    className={`${isStudentEdit ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : "bg-undip-blue hover:bg-sky-700 shadow-blue-200"} text-white h-11 px-8 font-medium shadow-sm rounded-3xl`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? isStudentEdit
                        ? "Menyimpan..."
                        : "Mengajukan..."
                      : isStudentEdit
                        ? "Ya, Simpan Revisi"
                        : "Ya, Ajukan"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button
              onClick={handleAjukanSurat}
              className="bg-undip-blue hover:bg-sky-700 text-white h-11 px-8 font-medium shadow-sm shadow-blue-200 rounded-3xl"
              disabled={
                !!(typeof isNextDisabled !== "undefined" && isNextDisabled)
              }
            >
              Lanjut
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
