import React from 'react';
import { Check } from 'lucide-react'; // Opsional: Untuk ikon centang jika selesai

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
  const steps = [
    { id: 1, label: "Info Pengajuan" },
    { id: 2, label: "Detail Pengajuan" },
    { id: 3, label: "Lampiran" },
    { id: 4, label: "Review & Ajukan" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-10 px-4">
      <nav aria-label="Progress Langkah">
        <ol className="flex items-center w-full">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const isLastStep = index === steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                {/* --- ITEM STEP (Lingkaran + Label) --- */}
                <li className="relative flex flex-col items-center">
                  
                  {/* Lingkaran Angka */}
                  <div
                    className={`z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300 border-2 
                      ${isActive 
                        ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100' // Step Aktif
                        : isCompleted 
                          ? 'bg-blue-600 border-blue-600 text-white' // Step Selesai
                          : 'bg-white border-gray-300 text-gray-400' // Step Belum
                      }`}
                  >
                    {isCompleted ? (
                       // Opsional: Ganti angka dengan Centang jika sudah lewat
                       <Check className="w-4 h-4" /> 
                    ) : (
                       step.id
                    )}
                  </div>

                  {/* Label di Bawah */}
                  <div 
                    className={`absolute top-10 w-32 text-center text-xs font-medium transition-colors duration-300
                      ${isActive || isCompleted ? 'text-blue-600' : 'text-gray-400'}`}
                  >
                    {step.label}
                  </div>
                </li>

                {/* --- GARIS PENGHUBUNG (SEPARATOR) --- */}
                {/* Hanya render garis jika ini bukan step terakhir */}
                {!isLastStep && (
                  <div className="flex-1 h-[2px] mx-2 bg-gray-200 relative">
                    {/* Garis Progress Berwarna (Overlay) */}
                    <div 
                      className={`absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500 ease-in-out
                        ${isCompleted ? 'w-full' : 'w-0'}`} 
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
      
      {/* Spacer agar label tidak tertutup konten di bawahnya */}
      <div className="h-8" />
    </div>
  );
}