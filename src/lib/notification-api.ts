/**
 * Notification API Service
 * Mengelola semua operasi notifikasi dari frontend
 */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
 * Ambil semua notifikasi untuk user saat ini
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
      `${BASE_PATH}/api/notifications${params.toString() ? "?" + params.toString() : ""}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Ambil jumlah notifikasi yang belum dibaca
 */
export async function getUnreadCount(): Promise<{ data: { unread: number } }> {
  try {
    const response = await fetch(`${BASE_PATH}/api/notifications/count`, {
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
 * Tandai notifikasi sebagai sudah dibaca
 */
export async function markNotificationAsRead(
  notificationId: string,
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${BASE_PATH}/api/notifications/${notificationId}/read`,
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
 * Tandai semua notifikasi sebagai sudah dibaca
 */
export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
}> {
  try {
    const response = await fetch(`${BASE_PATH}/api/notifications/read-all`, {
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
 * Hapus notifikasi berdasarkan id
 */
export async function deleteNotification(
  notificationId: string,
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(
      `${BASE_PATH}/api/notifications/${notificationId}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

/**
 * Hapus semua notifikasi
 */
export async function deleteAllNotifications(): Promise<{
  success: boolean;
}> {
  try {
    const response = await fetch(`${BASE_PATH}/api/notifications/delete-all`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete all notifications: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    throw error;
  }
}
