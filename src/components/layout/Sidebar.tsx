"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mail, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  submenu?: { label: string; href: string }[];
}

export function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>("surat-masuk");

  const menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <Home size={18} />,
    },
    {
      label: "Surat Masuk",
      href: "/surat-masuk",
      icon: <Mail size={18} />,
      submenu: [
        { label: "Penerima", href: "/surat-masuk/penerima" },
        { label: "Disposisi", href: "/surat-masuk/disposisi" },
        { label: "Tembusan", href: "/surat-masuk/tembusan" },
        { label: "Arsip", href: "/surat-masuk/arsip" },
      ],
    },
  ];

  const toggleMenu = (label: string) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <aside
      className={`w-64 bg-white border-r border-gray-200 h-[calc(100vh-60px)] sticky top-15 overflow-y-auto ${className}`}
    >
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <div key={item.label}>
            {/* Menu Item */}
            {item.submenu ? (
              <button
                onClick={() => toggleMenu(item.label)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  expandedMenu === item.label
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  size={16}
                  className={`transition-transform ${
                    expandedMenu === item.label ? "rotate-90" : ""
                  }`}
                />
              </button>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )}

            {/* Submenu */}
            {item.submenu && expandedMenu === item.label && (
              <div className="ml-4 mt-1 space-y-1">
                {item.submenu.map((subitem) => (
                  <Link
                    key={subitem.label}
                    href={subitem.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      pathname === subitem.href
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{subitem.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
