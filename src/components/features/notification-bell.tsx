"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    Notification,
} from "@/lib/notification-api";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            console.log("📥 Fetching notifications...");
            const response = await getNotifications({ limit: 10 });
            console.log("📥 Notifications response:", response);
            setNotifications(response.data || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            console.log("📥 Fetching unread count...");
            const response = await getUnreadCount();
            console.log("📥 Unread count response:", response);
            setUnreadCount(response.data.unread);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    };

    // Initialize on mount
    useEffect(() => {
        setIsMounted(true);
        fetchUnreadCount();
        fetchNotifications();

        // Poll for new notifications every 10 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
            fetchNotifications(); // Also refresh full list
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Refresh notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, isRead: true } : n,
                ),
            );
            await fetchUnreadCount();
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await deleteNotification(notificationId);
            setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId),
            );
            await fetchUnreadCount();
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to delete all:", error);
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read if not already
        if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
        }

        // Navigate to letter detail if letterInstanceId exists
        if (notification.letterInstanceId) {
            router.push(
                `/dashboard/surat-rekomendasi/${notification.letterInstanceId}`,
            );
            setIsOpen(false);
        }
    };

    // Prevent hydration mismatch - only render after mount
    if (!isMounted) {
        return (
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
            </button>
        );
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 text-slate-600 hover:bg-slate-100"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 p-0 shadow-lg">
                {/* Header */}
                <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between bg-slate-50">
                    <h3 className="font-semibold text-slate-800">Notifikasi</h3>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-600 hover:bg-blue-100 h-6"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Baca Semua
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDeleteAll}
                                className="text-xs text-red-600 hover:bg-red-100 h-6"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Hapus Semua
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-6 text-center text-slate-500">
                            Memuat notifikasi...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                            <p className="text-slate-500 text-sm">
                                Tidak ada notifikasi
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                                        !notification.isRead
                                            ? "bg-blue-50 border-l-4 border-blue-500"
                                            : "border-l-4 border-transparent"
                                    }`}
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="flex gap-2 justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-800 text-sm">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-2">
                                                {new Date(
                                                    notification.createdAt,
                                                ).toLocaleString("id-ID")}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(
                                                            notification.id,
                                                        );
                                                    }}
                                                    className="h-7 w-7 p-0 hover:bg-blue-200"
                                                    title="Tandai sudah dibaca"
                                                >
                                                    <Check className="h-4 w-4 text-blue-600" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(
                                                        notification.id,
                                                    );
                                                }}
                                                className="h-7 w-7 p-0 hover:bg-red-200"
                                                title="Hapus notifikasi"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
