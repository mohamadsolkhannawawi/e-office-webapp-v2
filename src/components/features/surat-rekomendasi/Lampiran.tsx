import React, { Dispatch, SetStateAction } from "react";

import type { FormDataType, LampiranFile } from "@/types/form";

interface LampiranProps {
    data: FormDataType;
    setData: Dispatch<SetStateAction<FormDataType>>;
}
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function Lampiran({ data, setData }: LampiranProps) {
    // Handler for main attachment

    const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setData((prev) => ({
                ...prev,
                lampiranUtama: Array.from(files).map((file) => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file,
                })),
            }));
        }
    };

    // Handler for additional attachments
    const handleAdditionalFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setData((prev) => ({
                ...prev,
                lampiranTambahan: Array.from(files).map((file) => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file,
                })),
            }));
        }
    };

    return (
        <section aria-label="Upload Lampiran">
            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                        <Label className="text-sm font-bold text-gray-800">
                            Lampiran Utama{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-xs text-gray-500 -mt-2">
                            Wajib. Unggah minimal 1 dokumen pendukung utama.
                            Format: PDF, JPG, PNG. Maks: 5MB/file.
                        </p>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer group">
                            <div className="bg-blue-100 p-4 rounded-full mb-4 text-[#007bff] group-hover:scale-110 transition-transform">
                                <BsFileEarmarkArrowUp size={24} />
                            </div>
                            <label className="text-sm font-medium text-gray-700 cursor-pointer">
                                Seret & lepas atau{" "}
                                <span className="text-[#007bff] font-bold">
                                    pilih file
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    multiple
                                    className="hidden"
                                    onChange={handleMainFileChange}
                                />
                            </label>
                            <p className="text-xs text-gray-400 mt-1">
                                untuk diunggah
                            </p>
                            {/* Preview selected files */}
                            {Array.isArray(data.lampiranUtama) &&
                                data.lampiranUtama.length > 0 && (
                                    <ul className="mt-2 text-xs text-gray-600">
                                        {data.lampiranUtama.map(
                                            (
                                                file: LampiranFile,
                                                idx: number
                                            ) => (
                                                <li key={idx}>{file.name}</li>
                                            )
                                        )}
                                    </ul>
                                )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-sm font-bold text-gray-800">
                            Lampiran Tambahan
                        </Label>
                        <p className="text-xs text-gray-500 -mt-2">
                            Opsional. Tambahkan dokumen pendukung lainnya jika
                            diperlukan.
                        </p>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-400 transition cursor-pointer group">
                            <div className="bg-blue-100 p-4 rounded-full mb-4 text-[#007bff] group-hover:scale-110 transition-transform">
                                <BsFileEarmarkArrowUp size={24} />
                            </div>
                            <label className="text-sm font-medium text-gray-700 cursor-pointer">
                                Seret & lepas atau{" "}
                                <span className="text-[#007bff] font-bold">
                                    pilih file
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    multiple
                                    className="hidden"
                                    onChange={handleAdditionalFileChange}
                                />
                            </label>
                            <p className="text-xs text-gray-400 mt-1">
                                untuk diunggah
                            </p>
                            {/* Preview selected files */}
                            {Array.isArray(data.lampiranTambahan) &&
                                data.lampiranTambahan.length > 0 && (
                                    <ul className="mt-2 text-xs text-gray-600">
                                        {data.lampiranTambahan.map(
                                            (
                                                file: LampiranFile,
                                                idx: number
                                            ) => (
                                                <li key={idx}>{file.name}</li>
                                            )
                                        )}
                                    </ul>
                                )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
