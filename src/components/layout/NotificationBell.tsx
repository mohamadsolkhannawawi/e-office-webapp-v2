"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCheck, Check, Trash2 } from "lucide-react";
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
    deleteNotification,
    deleteAllNotifications,
    Notification,
} from "@/lib/application-api";
import { useRouter } from "next/navigation";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const updateCount = async () => {
            const count = await getUnreadNotificationCount();
            if (isMounted) {
                setUnreadCount(count);
            }
        };

        const fetchUserRoles = async () => {
            try {
                // Fetch user roles from session/auth
                const response = await fetch("/api/auth/get-session", {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    if (isMounted && data.user) {
                        setUserRoles(data.user.roles || []);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user roles:", error);
            }
        };

        // Initial fetch
        void updateCount();
        void fetchUserRoles();

        // Poll every 30 seconds
        const interval = setInterval(() => {
            void updateCount();
        }, 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

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
        try {
            console.log("📌 Marking notification as read:", id);
            const result = await markNotificationAsRead(id);
            if (result) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
                console.log("✅ Successfully marked as read:", id);
            } else {
                console.error("❌ Failed to mark notification as read:", id);
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            console.log("📌 Marking all notifications as read");
            const result = await markAllNotificationsAsRead();
            if (result) {
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, isRead: true })),
                );
                setUnreadCount(0);
                console.log("✅ Successfully marked all as read");
            } else {
                console.error("❌ Failed to mark all notifications as read");
            }
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            console.log("🗑️ Deleting notification:", notificationId);
            const result = await deleteNotification(notificationId);
            if (result) {
                setNotifications((prev) =>
                    prev.filter((n) => n.id !== notificationId),
                );
                // Recalculate unread count
                const newCount = await getUnreadNotificationCount();
                setUnreadCount(newCount);
                console.log(
                    "✅ Successfully deleted notification:",
                    notificationId,
                );
            } else {
                console.error(
                    "❌ Failed to delete notification:",
                    notificationId,
                );
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const handleDeleteAll = async () => {
        try {
            console.log("🗑️ Deleting all notifications");
            const result = await deleteAllNotifications();
            if (result) {
                setNotifications([]);
                setUnreadCount(0);
                console.log("✅ Successfully deleted all notifications");
            } else {
                console.error("❌ Failed to delete all notifications");
            }
        } catch (error) {
            console.error("Error deleting all notifications:", error);
        }
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

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already
        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }

        // Determine route based on user role and notification type
        let path = "";

        const isSupervisor = userRoles.includes("SUPERVISOR");
        const isManager = userRoles.includes("MANAJER_TU");
        const isWakilDekan =
            userRoles.includes("WAKIL_DEKAN_1") ||
            userRoles.includes("WAKIL_DEKAN_2");
        const isUpa = userRoles.includes("UPA");

        const notificationType = notification.type;
        const entityId = notification.letterInstanceId || notification.entityId;

        if (!entityId) {
            console.error(
                "No entityId or letterInstanceId in notification:",
                notification,
            );
            return;
        }

        // Route based on notification type and user role
        switch (notificationType) {
            case "NEW_TASK":
                // NEW_TASK = need action (approval pending)
                if (isSupervisor) {
                    path = `/supervisor-akademik/surat/surat-rekomendasi-beasiswa/detail/${entityId}`;
                } else if (isManager) {
                    path = `/manajer-tu/surat/surat-rekomendasi-beasiswa/detail/${entityId}`;
                } else if (isWakilDekan) {
                    path = `/wakil-dekan-1/surat/surat-rekomendasi-beasiswa/detail/${entityId}`;
                } else if (isUpa) {
                    path = `/upa/surat/surat-rekomendasi-beasiswa/detail/${entityId}`;
                } else {
                    path = `/mahasiswa/surat/proses/detail/${entityId}`;
                }
                break;

            case "APPLICATION_REVISION":
                // Revision request - go to revision detail page
                path = `/mahasiswa/surat/proses/detail/${entityId}`;
                break;

            case "APPLICATION_PUBLISHED":
                // Letter published - go to published letter detail
                path = `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${entityId}`;
                break;

            case "APPLICATION_REJECTED":
                // Rejection - go to revision/process detail
                path = `/mahasiswa/surat/proses/detail/${entityId}`;
                break;

            case "APPLICATION_APPROVED":
            case "APPLICATION_SUBMITTED":
            default:
                // Default routing based on role
                if (isSupervisor) {
                    path = `/supervisor-akademik/surat/surat-rekomendasi-beasiswa/detail/${entityId}`;
                } else if (isManager) {
                    path = `/manajer-tu/surat/surat-rekomendasi-beasiswa/detail/${entityId}`;
                } else if (isWakilDekan) {
                    path = `/wakil-dekan-1/surat/surat-rekomendasi-beasiswa/detail/${entityId}`;
                } else if (isUpa) {
                    path = `/upa/surat/surat-rekomendasi-beasiswa/detail/${entityId}`;
                } else {
                    path = `/mahasiswa/surat/surat-rekomendasi-beasiswa/detail/${entityId}`;
                }
        }

        console.log("🔗 Navigating to:", path, {
            notificationType,
            userRoles,
            entityId,
        });

        if (path) {
            router.push(path);
            setIsOpen(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-10 h-10 rounded-full hover:bg-white/10"
                >
                    <Bell className="h-5 w-5 text-white" />
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
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-undip-blue hover:underline font-medium flex items-center gap-1"
                            >
                                <CheckCheck className="h-3 w-3" />
                                Tandai semua
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                className="text-xs text-red-600 hover:underline font-medium flex items-center gap-1"
                                title="Hapus semua notifikasi"
                            >
                                <Trash2 className="h-3 w-3" />
                                Hapus Semua
                            </button>
                        )}
                    </div>
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
                                className={`px-4 py-3 border-b border-slate-50 ${
                                    !notification.isRead ? "bg-blue-50/50" : ""
                                }`}
                            >
                                {/* Notifikasi Content */}
                                <div
                                    className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    role="button"
                                    tabIndex={0}
                                >
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
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-2 pt-2 border-t border-slate-200">
                                    {!notification.isRead && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(
                                                    notification.id,
                                                );
                                            }}
                                            className="flex-1 h-7 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                            title="Tandai sudah dibaca"
                                        >
                                            <Check className="h-3 w-3 mr-1" />
                                            Baca
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(notification.id);
                                        }}
                                        className="flex-1 h-7 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                        title="Hapus notifikasi"
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
