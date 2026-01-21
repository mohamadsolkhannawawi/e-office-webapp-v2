"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    Notification,
} from "@/lib/application-api";
import Link from "next/link";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch unread count on mount and periodically
    const fetchUnreadCount = useCallback(async () => {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        // Poll every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    // Fetch full notifications when popover opens
    const handleOpenChange = async (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setIsLoading(true);
            const data = await getNotifications({ limit: 10 });
            setNotifications(data);
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        await markNotificationAsRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Baru saja";
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        return `${diffDays} hari lalu`;
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-10 h-10 rounded-full hover:bg-slate-100"
                >
                    <Bell className="h-5 w-5 text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 shadow-xl border-slate-200 rounded-xl overflow-hidden"
                align="end"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-sm">
                        Notifikasi
                    </h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-undip-blue hover:underline font-medium flex items-center gap-1"
                        >
                            <CheckCheck className="h-3 w-3" />
                            Tandai semua
                        </button>
                    )}
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            Memuat...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-400 text-sm">
                                Tidak ada notifikasi
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${
                                    !notification.isRead ? "bg-blue-50/50" : ""
                                }`}
                                onClick={() => {
                                    if (!notification.isRead) {
                                        handleMarkAsRead(notification.id);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                            !notification.isRead
                                                ? "bg-undip-blue"
                                                : "bg-transparent"
                                        }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {getTimeAgo(notification.createdAt)}
                                        </p>
                                    </div>
                                    {notification.entityId && (
                                        <Link
                                            href={`#`}
                                            className="p-1 text-slate-400 hover:text-undip-blue"
                                            title="Lihat detail"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
