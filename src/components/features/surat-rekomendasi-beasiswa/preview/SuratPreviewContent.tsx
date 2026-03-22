"use client";

import Image from "next/image";
import {
  ChevronLeft,
  Maximize2,
  Minimize2,
  Info,
  Hash,
  Send,
  ShieldCheck,
  Check,
  PenTool,
  RotateCcw,
  XOctagon,
  Download,
  Sparkles,
  CheckCircle,
  Clock,
  PencilLine,
} from "lucide-react";
import { verifyApplication } from "@/lib/application-api";
import {
  generateAndDownloadDocument,
  getTemplateIdByLetterType,
  triggerDocxGeneration,
} from "@/lib/template-api";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { usePDFGeneration } from "@/hooks/useAsyncOperation";
import toast from "react-hot-toast";
// import { DocxPreview } from "@/components/features/surat-rekomendasi-beasiswa/preview/DocxPreview"; // Removed
import { UPANumberingModal } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/UPANumberingModal";
import { UPAStampModal } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/UPAStampModal";
import { WD1SignatureModal } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/WD1SignatureModal";
import { AdminActionModals } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/AdminActionModals";
import { SuccessStampModal } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/SuccessStampModal";
import { SignatureImage } from "@/components/ui/signature-image";
import { ActionStatusModal } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/ActionStatusModal";
import { MahasiswaEditModal } from "@/components/features/surat-rekomendasi-beasiswa/mahasiswa/MahasiswaEditModal";
import { StaffEditModal } from "@/components/features/surat-rekomendasi-beasiswa/detail/reviewer/StaffEditModal";
import React, { useEffect, useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export interface PreviewData {
  nama?: string;
  nim?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  noHp?: string;
  jurusan?: string;
  programStudi?: string;
  semester?: string;
  ipk?: string;
  ips?: string;
  keperluan?: string;
  email?: string;
  status?: string;
  currentStep?: number;
  applicationId?: string;
  signatureUrl?: string;
  nomorSurat?: string;
  publishedAt?: string;
  qrCodeUrl?: string;
  stampId?: string;
  stampUrl?: string; // Kept in interface just in case data has it, but unused in component state
  jenisBeasiswa?: string;
  scholarshipName?: string;
}

interface SuratPreviewContentProps {
  defaultStage?: string;
  backUrl?: string;
  data?: PreviewData;
  applicationId?: string;
}

export function SuratPreviewContent({
  defaultStage = "mahasiswa",
  backUrl,
  data,
  applicationId,
}: SuratPreviewContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stage = searchParams.get("stage") || defaultStage;
  const { generatePDF } = usePDFGeneration();

  // Resolve Application ID from prop or data object
  const pdfId = applicationId || data?.applicationId;

  const [upaLetterNumber, setUpaLetterNumber] = useState(
    searchParams.get("no") || data?.nomorSurat || "",
  );
  const [upaStampId, setUpaStampId] = useState<string | null>(
    data?.stampId || null,
  );
  const [upaStampUrl, setUpaStampUrl] = useState<string | null>(
    data?.stampUrl || null,
  );
  const [upaIsStampApplied, setUpaIsStampApplied] = useState(!!data?.stampId);
  const [wd1Signature, setWd1Signature] = useState<string | null>(
    data?.signatureUrl || null,
  );
  const [isNumberingModalOpen, setIsNumberingModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "approve" | "revise" | "reject" | "publish"
  >("approve");
  const [isSuccessStampModalOpen, setIsSuccessStampModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    status: "success" | "error";
    type: "approve" | "revise" | "reject" | "publish";
    message?: string;
  }>({ isOpen: false, status: "success", type: "approve" });
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPdfPreviewLoading, setIsPdfPreviewLoading] = useState(true);

  // Removed unused states: upaStampUrl, qrCodeUrl, leadershipConfig, docxLoadError

  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStaffEditModalOpen, setIsStaffEditModalOpen] = useState(false);
  const [mobileInfoPanel, setMobileInfoPanel] = useState<
    "attributes" | "status" | null
  >(null);

  useEffect(() => {
    if (searchParams.get("autoPrint") === "true") {
      const timer = setTimeout(() => {
        window.print();
      }, 1000); // Small delay to ensure rendering is complete
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Removed fetching leadershipConfig as it was unused

  // Map stage to step number for canTakeAction logic
  const stageStepMap: Record<string, number> = {
    supervisor: 1,
    manajer: 2,
    wd1: 3,
    upa: 4,
  };
  const roleStep = stageStepMap[stage] || 0;
  const currentStep = data?.currentStep || 0;
  const isTerminalStatus =
    data?.status === "COMPLETED" ||
    data?.status === "PUBLISHED" ||
    data?.status === "REJECTED";

  // Can only take action if:
  // 1. The application is at this role's step
  // 2. The application is not in a terminal status (COMPLETED/REJECTED)
  const canTakeAction = currentStep === roleStep && !isTerminalStatus;

  const showStatusInfo =
    !canTakeAction &&
    !(
      stage === "mahasiswa" &&
      (data?.status === "COMPLETED" || data?.status === "PUBLISHED")
    ) &&
    !(
      stage === "upa" &&
      (data?.status === "COMPLETED" || data?.status === "PUBLISHED")
    );

  const statusTitle =
    data?.status === "REJECTED"
      ? "Surat Ditolak"
      : data?.status === "COMPLETED" || data?.status === "PUBLISHED"
        ? "Surat Selesai"
        : (() => {
            if (currentStep === 3) {
              return "Menunggu Verifikasi dan Tanda Tangan";
            } else if (currentStep === 4) {
              return "Menunggu Penomoran Surat dan Publish";
            }
            const stepLabels: Record<number, string> = {
              1: "Supervisor Akademik",
              2: "Manajer TU",
              3: "Wakil Dekan 1",
              4: "UPA",
            };
            const pendingRole = stepLabels[currentStep] || "Sistem";
            return `Menunggu Verifikasi ${pendingRole}`;
          })();

  const statusDescription =
    data?.status === "REJECTED"
      ? stage === "mahasiswa"
        ? "Pengajuan surat rekomendasi Anda ditolak."
        : "Pengajuan ini telah ditolak."
      : data?.status === "COMPLETED" || data?.status === "PUBLISHED"
        ? "Surat telah diterbitkan dan selesai."
        : stage === "mahasiswa"
          ? (() => {
              if (currentStep === 3) {
                return "Surat Anda sedang menunggu verifikasi dan penandatanganan dari Wakil Dekan 1.";
              } else if (currentStep === 4) {
                return "Surat Anda sedang menunggu penomoran dan penerbitan dari UPA.";
              }
              const stepLabels: Record<number, string> = {
                1: "Supervisor Akademik",
                2: "Manajer TU",
                3: "Wakil Dekan 1",
                4: "UPA",
              };
              const pendingRole = stepLabels[currentStep] || "sistem";
              return `Surat Anda sedang menunggu verifikasi dari ${pendingRole}.`;
            })()
          : (() => {
              if (currentStep === 3) {
                return "Surat ini sedang menunggu verifikasi dan penandatanganan Anda.";
              } else if (currentStep === 4) {
                return "Surat ini sedang menunggu penomoran dan penerbitan dari Anda.";
              }
              const stepLabels: Record<number, string> = {
                1: "Supervisor Akademik",
                2: "Manajer TU",
                3: "Wakil Dekan 1",
                4: "UPA",
              };
              const pendingRole = stepLabels[currentStep] || "sistem";
              return `Surat ini sedang menunggu tindakan dari ${pendingRole}.`;
            })();

  // Student can self-edit if PENDING at step 1 (before Supervisor Akademik acts)
  const canStudentSelfEdit =
    stage === "mahasiswa" &&
    data?.status === "PENDING" &&
    data?.currentStep === 1;

  // Staff (SA/MTU) can edit when the letter is at their step
  const canStaffEdit =
    (stage === "supervisor" || stage === "manajer") && canTakeAction;

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  // Removed unused config object derived from useMemo as HTML preview is no longer used

  const attributes = [
    {
      label: "Status Saat Ini",
      value: (() => {
        if (data?.status === "COMPLETED" || data?.status === "PUBLISHED")
          return "Selesai / Terbit";
        if (data?.status === "REJECTED") return "Ditolak";
        if (data?.status === "REVISED") return "Perlu Revisi";

        const stepLabels: Record<number, string> = {
          1: "SUPERVISOR AKADEMIK",
          2: "MANAJER TU",
          3: "WAKIL DEKAN 1",
          4: "UPA",
        };

        const pendingRole = stepLabels[currentStep] || "PROSES";
        return `Menunggu Verifikasi (${pendingRole})`;
      })(),
    },
    {
      label: "Jenis Surat",
      value:
        data?.jenisBeasiswa === "keperluan_lain"
          ? "Surat Rekomendasi Keperluan Lain"
          : "Surat Rekomendasi Beasiswa",
    },
    {
      label: "Keperluan",
      value: data?.keperluan || "-",
    },
    { label: "Nama Lengkap", value: data?.nama || "-" },
    { label: "Role", value: "Mahasiswa" },
    { label: "NIM", value: data?.nim || "-" },
    {
      label: "Email",
      value: data?.email || "-",
    },
    { label: "Departemen", value: data?.jurusan || "-" },
    { label: "Program Studi", value: data?.programStudi || "-" },
    { label: "Tempat Lahir", value: data?.tempatLahir || "-" },
    {
      label: "Tanggal Lahir",
      value: data?.tanggalLahir || "-",
    },
    { label: "No. HP", value: data?.noHp || "-" },
    { label: "Semester", value: data?.semester || "-" },
    { label: "IPK", value: data?.ipk || "-" },
    { label: "IPS", value: data?.ips || "-" },
  ];

  // PDF Refresh Trigger
  const [pdfRefreshTimestamp, setPdfRefreshTimestamp] = useState(0);

  // Hydration fix: Set timestamp only after mount to ensure server/client match initially
  // and provide a fresh timestamp for the initial load.
  useEffect(() => {
    setPdfRefreshTimestamp(Date.now());
  }, []);

  // Handle PDF preview loading state
  useEffect(() => {
    if (pdfId && pdfRefreshTimestamp > 0) {
      setIsPdfPreviewLoading(true);
    }
  }, [pdfId, pdfRefreshTimestamp]);

  const triggerPdfRefresh = () => {
    console.log("🔄 Triggering PDF Refresh...");
    setPdfRefreshTimestamp(Date.now());
  };

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-h-140 flex-col overflow-hidden md:h-full md:min-h-0 md:flex-row">
      <style
        dangerouslySetInnerHTML={{
          __html: `
                @media print {
                    @page { 
                        margin: 0; 
                        size: A4 portrait;
                    }
                    /* Hide everything except the document preview container */
                    .print\\:hidden, 
                    .w-80, 
                    .h-12, 
                    .fixed, 
                    header, 
                    aside, 
                    nav, 
                    footer {
                        display: none !important;
                    }
                    
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: 100% !important;
                        overflow: visible !important;
                        background: white !important;
                    }

                    /* Main containers */
                    .h-full, .flex-1, .bg-slate-200, .bg-slate-100 {
                        background: white !important;
                        height: auto !important;
                        overflow: visible !important;
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    /* Document rendering */
                    .docx-preview-container {
                        display: block !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        width: 100% !important;
                        background: white !important;
                    }
                }
            `,
        }}
      />
      <UPANumberingModal
        isOpen={isNumberingModalOpen}
        onClose={() => setIsNumberingModalOpen(false)}
        onNumberChange={(num) => {
          setUpaLetterNumber(num);
          if (num) triggerPdfRefresh();
        }}
        onStampApply={() => {
          setUpaIsStampApplied(true);
          triggerPdfRefresh();
        }}
        applicationId={applicationId}
        onVerificationGenerated={() => {
          // QrCode handled via backend now
        }}
        appliedLetterNumber={upaLetterNumber}
        onDocumentRegenerate={triggerPdfRefresh}
      />
      <UPAStampModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        onStampChange={(stampData) => {
          if (stampData) {
            setUpaStampId(stampData.stampId);
            setUpaStampUrl(stampData.stampUrl);
            setUpaIsStampApplied(true);
            triggerPdfRefresh();
          }
        }}
        applicationId={applicationId || ""}
        appliedStampId={upaStampId}
      />
      <SuccessStampModal
        isOpen={isSuccessStampModalOpen}
        onClose={() => setIsSuccessStampModalOpen(false)}
      />
      <ActionStatusModal
        isOpen={statusModal.isOpen}
        onClose={() => {
          setStatusModal((prev) => ({ ...prev, isOpen: false }));
          if (statusModal.status === "success" && pendingRedirect) {
            router.push(pendingRedirect);
          }
        }}
        status={statusModal.status}
        type={statusModal.type}
        customMessage={statusModal.message}
      />
      <WD1SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSignatureChange={(sig) => {
          setWd1Signature(sig);
          if (sig) triggerPdfRefresh();
        }}
        initialSignature={wd1Signature}
        applicationId={applicationId}
      />
      <AdminActionModals
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        type={modalType}
        role={
          (stage === "supervisor"
            ? "supervisor-akademik"
            : stage === "manajer"
              ? "manajer-tu"
              : stage === "wd1"
                ? "wakil-dekan-1"
                : "upa") as
            | "supervisor-akademik"
            | "manajer-tu"
            | "wakil-dekan-1"
            | "upa"
        }
        data={{
          nomorSurat: upaLetterNumber,
        }}
        onConfirm={async (data) => {
          try {
            const messages: Record<string, string> = {
              approve: "Surat Berhasil Disetujui!",
              revise: `Revisi diminta ke ${data.targetRole}. Alasan: ${data.reason}`,
              reject: `Surat Berhasil Ditolak. Alasan: ${data.reason}`,
              publish: "Surat Berhasil Diterbitkan!",
            };

            let redirectPath = "";
            if (stage === "supervisor") {
              redirectPath = "/supervisor-akademik/surat/perlu-tindakan";
            } else if (stage === "manajer") {
              redirectPath = "/manajer-tu/surat/perlu-tindakan";
            } else if (stage === "wd1") {
              redirectPath = "/wakil-dekan-1/surat/perlu-tindakan";
            } else if (stage === "upa") {
              redirectPath = "/upa/surat/perlu-tindakan";
            }

            // Map targetRole to Step (Step 0 = Mahasiswa, 1 = Supervisor, 2 = TU, 3 = WD1)
            const roleToStep: Record<string, number> = {
              Mahasiswa: 0,
              "Supervisor Akademik": 1,
              "Manajer TU": 2,
              "Wakil Dekan 1": 3,
            };

            const action = modalType === "publish" ? "approve" : modalType;

            await verifyApplication(applicationId || "", {
              action:
                action === "revise"
                  ? "revision"
                  : (action as "approve" | "reject" | "revision"),
              notes: data.reason,
              targetStep: data.targetRole
                ? roleToStep[data.targetRole]
                : undefined,
              signatureUrl: wd1Signature || undefined,
              letterNumber: upaLetterNumber || undefined,
              stampId: upaStampId || undefined,
            });

            // If publish action, trigger document generation to create QR code
            if (modalType === "publish" && applicationId) {
              try {
                await triggerDocxGeneration(applicationId);
                triggerPdfRefresh();
              } catch (error) {
                console.error("Error generating document with QR code:", error);
              }
            }

            setPendingRedirect(redirectPath);
            setStatusModal({
              isOpen: true,
              status: "success",
              type: modalType,
              message: messages[modalType],
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Gagal memproses pengajuan.";
            setStatusModal({
              isOpen: true,
              status: "error",
              type: modalType,
              message: errorMessage,
            });
          }
        }}
      />
      {/* Left Sidebar: Attributes */}
      <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto hidden xl:block shrink-0 print:hidden">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Preview</h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Pratinjau surat untuk tahap {stage}. Periksa detail sebelum
              melanjutkan proses.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-center">
            <div className="bg-slate-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Info className="h-4 w-4 text-slate-400" />
              <h2 className="font-bold text-sm text-slate-700 uppercase tracking-wider">
                Atribut Surat
              </h2>
            </div>
            <div className="p-4 space-y-4 text-left">
              {attributes.map((attr, index) => (
                <div key={index} className="space-y-1">
                  <p className="text-[11px] font-medium text-slate-400 uppercase">
                    {attr.label}
                  </p>
                  <p
                    className={`text-sm font-semibold ${attr.label === "Status Saat Ini" ? "text-undip-blue" : "text-slate-700"}`}
                  >
                    {attr.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Document Preview */}
      <div className="flex-1 flex min-h-0 flex-col bg-slate-200 overflow-hidden relative print:bg-white print:overflow-visible">
        {/* Toolbar */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-3 md:px-4 shrink-0 shadow-sm print:hidden">
          <div className="flex items-center gap-2 md:hidden">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setMobileInfoPanel("attributes")}
              className="h-8 rounded-full px-3 text-[11px] font-semibold"
            >
              Atribut Surat
            </Button>
            {showStatusInfo && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setMobileInfoPanel("status")}
                className="h-8 rounded-full px-3 text-[11px] font-semibold"
              >
                Status Surat
              </Button>
            )}
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-slate-100 rounded-3xl transition-colors group"
            title={isFullscreen ? "Minimize" : "Maximize"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-slate-400 group-hover:text-undip-blue transition-colors" />
            ) : (
              <Maximize2 className="h-4 w-4 text-slate-400 group-hover:text-undip-blue transition-colors" />
            )}
          </button>
        </div>

        {/* Document Area */}
        <div className="relative flex h-full min-h-0 flex-1 justify-center overflow-hidden bg-[#525659] p-0 print:block print:overflow-visible print:bg-white print:p-0">
          {/* PDF Preview Iframe - Use pdfId derived from prop or data */}
          {pdfId && pdfRefreshTimestamp > 0 ? (
            <>
              {isPdfPreviewLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#525659] z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                    </div>
                    <p className="text-white text-sm font-medium">
                      Render PDF surat...
                    </p>
                  </div>
                </div>
              )}
              <iframe
                src={`${BASE_PATH}/api/templates/letter/${pdfId}/pdf?t=${pdfRefreshTimestamp}#toolbar=0&navpanes=0&scrollbar=1`}
                className="h-full w-full border-0"
                title="Preview Surat"
                onLoad={() => {
                  setIsPdfPreviewLoading(false);
                }}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <p>Memuat Dokumen...</p>
            </div>
          )}
        </div>
      </div>

      {mobileInfoPanel && (
        <div className="fixed inset-0 z-50 bg-black/45 md:hidden">
          <button
            type="button"
            aria-label="Tutup panel"
            className="absolute inset-0"
            onClick={() => setMobileInfoPanel(null)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[78dvh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {mobileInfoPanel === "attributes"
                    ? "Atribut Surat"
                    : "Status Surat"}
                </h2>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-bold">
                  {mobileInfoPanel === "attributes"
                    ? "Detail Dokumen"
                    : "Informasi Surat"}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setMobileInfoPanel(null)}
                className="rounded-full"
              >
                Tutup
              </Button>
            </div>

            {mobileInfoPanel === "attributes" ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">Preview</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Pratinjau surat untuk tahap {stage}. Periksa detail sebelum
                    melanjutkan proses.
                  </p>
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
                  {attributes.map((attr, index) => (
                    <div key={`mobile-attr-${index}`} className="space-y-1">
                      <p className="text-[11px] font-medium uppercase text-slate-400">
                        {attr.label}
                      </p>
                      <p
                        className={`text-sm font-semibold ${attr.label === "Status Saat Ini" ? "text-undip-blue" : "text-slate-700"}`}
                      >
                        {attr.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
                    data?.status === "REJECTED"
                      ? "bg-red-100"
                      : data?.status === "COMPLETED" ||
                          data?.status === "PUBLISHED"
                        ? "bg-green-100"
                        : "bg-blue-100"
                  }`}
                >
                  {data?.status === "REJECTED" ? (
                    <XOctagon className="h-6 w-6 text-red-600" />
                  ) : data?.status === "COMPLETED" ||
                    data?.status === "PUBLISHED" ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Clock className="h-6 w-6 animate-spin text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-700">{statusTitle}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {statusDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Sidebar: Actions */}
      <div
        className={`${isFullscreen ? "w-0 opacity-0 overflow-hidden" : "w-80"} border-l border-gray-200 bg-white overflow-y-auto hidden md:block transition-all duration-500 ease-in-out print:hidden`}
      >
        <div className="p-6 space-y-6">
          {/* Show status message if action is not allowed */}
          {showStatusInfo ? (
            <div className="space-y-4">
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                  Status
                </h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                  Informasi Surat
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-3">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                    data?.status === "REJECTED"
                      ? "bg-red-100"
                      : data?.status === "COMPLETED" ||
                          data?.status === "PUBLISHED"
                        ? "bg-green-100"
                        : "bg-blue-100"
                  }`}
                >
                  {data?.status === "REJECTED" ? (
                    <XOctagon className="h-6 w-6 text-red-600" />
                  ) : data?.status === "COMPLETED" ||
                    data?.status === "PUBLISHED" ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-blue-600 animate-spin" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-700">{statusTitle}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {statusDescription}
                  </p>
                </div>
              </div>
            </div>
          ) : stage === "upa" &&
            !data?.publishedAt &&
            data?.status !== "COMPLETED" &&
            data?.status !== "PUBLISHED" ? (
            <>
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                  Penerbitan
                </h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                  Finalisasi Dokumen
                </p>
              </div>

              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 space-y-6 shadow-sm">
                  <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="p-3 bg-blue-50 rounded-3xl text-undip-blue">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                      Otoritas UPA
                    </h3>
                  </div>

                  <div className="space-y-3 pt-5 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 text-center">
                      Tahap 1: Penomoran
                    </p>

                    <Button
                      onClick={() => setIsNumberingModalOpen(true)}
                      className="w-full bg-yellow-400 border-2 border-yellow-400 text-black hover:bg-yellow-500 font-bold py-5 rounded-3xl flex items-center justify-center gap-2"
                    >
                      <Hash className="h-5 w-5" />
                      {upaLetterNumber ? "Ubah No. Surat" : "Beri Nomor Surat"}
                    </Button>

                    {upaLetterNumber && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in zoom-in duration-300">
                        <div className="flex flex-col items-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest text-center">
                            Nomor Surat Terpilih
                          </p>
                          <div className="flex items-center gap-2 text-undip-blue font-bold text-sm bg-white px-4 py-2 rounded-3xl shadow-sm border border-blue-50 w-full justify-center">
                            <Sparkles className="h-3.5 w-3.5" />
                            {upaLetterNumber}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-5 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 text-center">
                      Tahap 2: Pengesahan
                    </p>

                    <Button
                      onClick={() => setIsStampModalOpen(true)}
                      className={`w-full ${upaIsStampApplied ? "bg-red-600 border-red-200 text-white hover:bg-red-700" : "bg-white border-2 border-undip-blue text-undip-blue hover:bg-blue-50"} font-bold py-5 rounded-3xl flex items-center justify-center gap-2 transition-all shadow-sm`}
                    >
                      <ShieldCheck className="h-5 w-5" />
                      {upaIsStampApplied ? "Ubah Stempel" : "Bubuhkan Stempel"}
                    </Button>

                    {upaIsStampApplied && upaStampUrl && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in zoom-in duration-300">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">
                            Stempel Teraplikasi
                          </p>
                          <div className="w-20 h-20">
                            <SignatureImage
                              src={upaStampUrl}
                              alt="Stempel"
                              className="object-contain w-full h-full mix-blend-multiply"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-5 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 text-center">
                      Langkah Terakhir
                    </p>

                    <Button
                      disabled={!upaLetterNumber || !upaIsStampApplied}
                      className={`w-full ${!upaLetterNumber || !upaIsStampApplied ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-undip-blue hover:bg-sky-700 text-white shadow-lg"} font-bold py-6 rounded-3xl flex items-center justify-center gap-2`}
                      onClick={() => {
                        setModalType("publish");
                        setIsActionModalOpen(true);
                      }}
                    >
                      <Send className="h-5 w-5" />
                      Publish
                    </Button>
                    {(!upaLetterNumber || !upaIsStampApplied) && (
                      <p className="text-[9px] text-slate-400 text-center leading-tight">
                        Nomor dan stempel wajib diisi sebelum publikasi.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : stage === "wd1" ? (
            <>
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                  Persetujuan
                </h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                  Otorisasi Dokumen
                </p>
              </div>

              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 space-y-6 shadow-sm">
                  <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="p-3 bg-blue-50 rounded-2xl text-undip-blue">
                      <PenTool className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                      Wakil Dekan 1
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      Langkah 1: Tanda Tangan
                    </p>
                    <Button
                      onClick={() => setIsSignatureModalOpen(true)}
                      className={`w-full ${wd1Signature ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"} border-2 font-bold py-5 rounded-3xl flex items-center justify-center gap-2 text-[11px] shadow-sm transition-all`}
                    >
                      <PenTool className="h-4 w-4" />
                      {wd1Signature
                        ? "Ubah Tanda Tangan"
                        : "Bubuhkan Tanda Tangan"}
                      {wd1Signature && <Check className="h-3 w-3" />}
                    </Button>

                    {wd1Signature && (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 animate-in zoom-in duration-300">
                        <div className="bg-white border border-emerald-100 rounded-3xl py-2 px-3 flex justify-center shadow-inner pt-2">
                          <SignatureImage
                            src={wd1Signature}
                            alt="WD1 Signature"
                            className="object-contain mix-blend-multiply w-32 h-16"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 text-center">
                      Langkah Terakhir
                    </p>
                    <Button
                      disabled={!wd1Signature}
                      className={`w-full ${!wd1Signature ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-undip-blue hover:bg-sky-700 text-white"} font-bold py-6 rounded-3xl flex items-center justify-center gap-2`}
                      onClick={() => {
                        setModalType("approve");
                        setIsActionModalOpen(true);
                      }}
                    >
                      <Check className="h-5 w-5" />
                      Setujui
                    </Button>

                    <Button
                      onClick={() => {
                        setModalType("revise");
                        setIsActionModalOpen(true);
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-5 w-5" />
                      Revisi
                    </Button>

                    <Button
                      onClick={() => {
                        setModalType("reject");
                        setIsActionModalOpen(true);
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-2"
                    >
                      <XOctagon className="h-5 w-5" />
                      Tolak
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : stage === "supervisor" || stage === "manajer" ? (
            <>
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                  {stage === "supervisor" ? "Verifikasi" : "Persetujuan"}
                </h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                  {stage === "supervisor"
                    ? "Supervisor Akademik"
                    : "Manajer TU"}
                </p>
              </div>

              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 space-y-6 shadow-sm">
                  <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="p-3 bg-blue-50 rounded-3xl text-undip-blue">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                      Otoritas {stage.toUpperCase()}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-5 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 text-center">
                      Pilih Tindakan
                    </p>

                    <Button
                      onClick={() => {
                        setModalType("approve");
                        setIsActionModalOpen(true);
                      }}
                      className="w-full bg-undip-blue hover:bg-sky-700 text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-2"
                    >
                      <Check className="h-5 w-5" />
                      Setujui
                    </Button>

                    <Button
                      onClick={() => {
                        setModalType("revise");
                        setIsActionModalOpen(true);
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-5 w-5" />
                      Revisi
                    </Button>

                    <Button
                      onClick={() => {
                        setModalType("reject");
                        setIsActionModalOpen(true);
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-2"
                    >
                      <XOctagon className="h-5 w-5" />
                      Tolak
                    </Button>
                    <p className="text-[9px] text-slate-400 text-center leading-tight pt-2">
                      Tindakan ini akan mempengaruhi status surat pengaju secara
                      langsung.
                    </p>

                    {canStaffEdit && (
                      <>
                        <div className="border-t border-slate-100 pt-4" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 text-center">
                          Data Surat
                        </p>
                        <Button
                          onClick={() => setIsStaffEditModalOpen(true)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-2"
                        >
                          <PencilLine className="h-5 w-5" />
                          Edit Data Surat
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : stage === "mahasiswa" ? (
            <>
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                  Unduh Surat
                </h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                  Pratinjau & Cetak
                </p>
              </div>

              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                {data?.status === "PUBLISHED" ||
                data?.status === "COMPLETED" ? (
                  <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 space-y-6 shadow-sm">
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="p-3 bg-emerald-50 rounded-3xl text-emerald-600">
                        <Download className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                        Dokumen Siap
                      </h3>
                    </div>

                    <div className="space-y-3 pt-5 border-t border-slate-100 text-center">
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Klik tombol di bawah untuk mengunduh surat dalam format
                        PDF.
                      </p>
                      <Button
                        onClick={async () => {
                          if (!applicationId) return;

                          // Open PDF in new tab with loader
                          await generatePDF(async () => {
                            const pdfUrl = `${BASE_PATH}/api/templates/letter/${applicationId}/pdf`;
                            window.open(pdfUrl, "_blank");
                          }, "Render PDF surat...");
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                      >
                        <Download className="h-5 w-5" />
                        Unduh PDF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-6 space-y-6 shadow-sm">
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="p-3 bg-slate-50 rounded-3xl text-slate-400">
                        <Clock className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                        Surat Sedang Diproses
                      </h3>
                    </div>
                    <div className="pt-5 border-t border-slate-100 text-center">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Surat Anda masih dalam proses verifikasi. Unduhan PDF
                        akan tersedia setelah surat diterbitkan oleh Staff UPA.
                      </p>
                    </div>
                  </div>
                )}

                {/* Student Self-Edit: Only for PENDING at step 1 */}
                {canStudentSelfEdit && (
                  <div className="bg-white rounded-3xl border-2 border-dashed border-amber-200 p-6 space-y-4 shadow-sm">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-amber-50 rounded-3xl text-amber-600">
                        <PencilLine className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                        Edit Surat
                      </h3>
                      <p className="text-xs text-slate-500 text-center leading-relaxed">
                        Surat belum diproses supervisor. Anda masih dapat
                        mengubah isi surat.
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsEditModalOpen(true)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-amber-200 transition-all active:scale-95"
                    >
                      <PencilLine className="h-5 w-5" />
                      Edit Surat
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : stage === "upa" ? (
            <>
              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                  Unduh Surat
                </h2>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                  Praktinjau & Cetak
                </p>
              </div>

              <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 space-y-6 shadow-sm">
                  <div className="flex flex-col items-center gap-2 mb-2">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase">
                      Surat Selesai
                    </h3>
                  </div>

                  <div className="space-y-3 pt-5 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Surat telah diterbitkan dan selesai. Klik tombol di bawah
                      untuk mencetak atau mengunduh surat sebagai PDF.
                    </p>
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={async () => {
                          if (!applicationId) return;

                          // Open PDF in new tab with loader
                          await generatePDF(async () => {
                            const pdfUrl = `${BASE_PATH}/api/templates/letter/${applicationId}/pdf`;
                            window.open(pdfUrl, "_blank");
                          }, "Render PDF surat...");
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                      >
                        <Download className="h-5 w-5" />
                        Unduh PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">
                Informasi
              </h2>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">
                Status Dokumen
              </p>
            </div>
          )}

          {/* Back Button */}
          <div className="pt-2">
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full bg-red-600 hover:bg-red-700 text-white hover:text-white font-bold py-6 rounded-3xl flex items-center justify-center gap-2 border-none shadow-sm transition-all active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
              Kembali
            </Button>
          </div>
        </div>
      </div>

      {/* Student Self-Edit Modal */}
      <MahasiswaEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        applicationId={pdfId || ""}
        jenis={data?.jenisBeasiswa || "internal"}
        scholarshipName={data?.scholarshipName || ""}
      />

      {/* Staff Edit Modal — Supervisor Akademik / Manajer TU */}
      <StaffEditModal
        isOpen={isStaffEditModalOpen}
        onClose={() => setIsStaffEditModalOpen(false)}
        role={stage === "supervisor" ? "supervisor-akademik" : "manajer-tu"}
        applicationId={pdfId || ""}
        initialValues={{
          namaBeasiswa: data?.scholarshipName || data?.keperluan || "",
          namaLengkap: data?.nama || "",
          nim: data?.nim || "",
          email: data?.email || "",
          departemen: data?.jurusan || "",
          programStudi: data?.programStudi || "",
          tempatLahir: data?.tempatLahir || "",
          tanggalLahir: data?.tanggalLahir || "",
          noHp: data?.noHp || "",
          semester: data?.semester || "",
          ipk: data?.ipk || "",
          ips: data?.ips || "",
        }}
        onSuccess={() => setPdfRefreshTimestamp(Date.now())}
      />
    </div>
  );
}
