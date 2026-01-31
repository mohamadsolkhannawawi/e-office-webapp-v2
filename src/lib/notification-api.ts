/**
 * Notification API Service
 * Mengelola semua operasi notifikasi dari frontend
 */

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    entityId?: string;
    letterInstanceId?: string; // 🔴 TAMBAHAN
    createdAt: string;
}

/**
 * Get all notifications for current user
 */
export async function getNotifications(options?: {
    limit?: number;
    unreadOnly?: boolean;
}): Promise<{ data: Notification[] }> {
    try {
        const params = new URLSearchParams();
        if (options?.limit) params.append("limit", String(options.limit));
        if (options?.unreadOnly)
            params.append("unreadOnly", String(options.unreadOnly));

        const response = await fetch(
            `/api/notifications${params.toString() ? "?" + params.toString() : ""}`,
            {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch notifications: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<{ data: { unread: number } }> {
    try {
        const response = await fetch("/api/notifications/count", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Failed to get unread count: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching unread count:", error);
        throw error;
    }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
    notificationId: string,
): Promise<{ success: boolean }> {
    try {
        const response = await fetch(
            `/api/notifications/${notificationId}/read`,
            {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to mark notification as read: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{
    success: boolean;
}> {
    try {
        const response = await fetch("/api/notifications/read-all", {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Failed to mark all as read: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error marking all as read:", error);
        throw error;
    }
}

/**
 * Delete notification by id
 */
export async function deleteNotification(
    notificationId: string,
): Promise<{ success: boolean }> {
    try {
        const response = await fetch(`/api/notifications/${notificationId}`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to delete notification: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<{
    success: boolean;
}> {
    try {
        const response = await fetch("/api/notifications/delete-all", {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to delete all notifications: ${response.status}`,
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting all notifications:", error);
        throw error;
    }
}
