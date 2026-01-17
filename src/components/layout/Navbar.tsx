import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaRegBell } from "react-icons/fa";

export function Navbar() {
    return (
        <header className="bg-[#007bff] text-white py-3 px-6 shadow-sm flex justify-between items-center sticky top-0 z-50">
            {/* Bagian Kiri: Logo & Nama Instansi */}
            <div className="flex items-center gap-3">
                {/* Placeholder Logo (Ganti Image nanti kalau sudah ada file logo) */}
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-[10px]">
                    LOGO
                </div>
                <div className="leading-tight">
                    <h1 className="font-bold text-xs uppercase opacity-90">
                        Fakultas Sains & Matematika
                    </h1>
                    <p className="text-[10px] uppercase opacity-75">
                        Universitas Diponegoro
                    </p>
                </div>
            </div>

            {/* Bagian Kanan: Notifikasi & Profil */}
            <div className="flex items-center gap-4">
                <button
                    aria-label="Notifikasi"
                    className="hover:opacity-80 transition"
                >
                    <FaRegBell size={18} />
                </button>

                <div className="flex items-center gap-2 pl-4 border-l border-white/20">
                    <span className="text-sm font-medium hidden sm:block">
                        Ahmad Douglas
                    </span>
                    <Avatar className="w-8 h-8 border-2 border-white/30 cursor-pointer">
                        <AvatarImage
                            src="https://github.com/shadcn.png"
                            alt="@shadcn"
                        />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
