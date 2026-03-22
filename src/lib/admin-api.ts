/**
 * Library Client API Admin
 * Fungsi untuk operasi Super Admin
 */

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

/**
 * API Manajemen Pengguna
 */

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  roles: string[];
  password?: string;
  mahasiswaData?: {
    nim: string;
    semester: number;
    ipk: number;
    ips: number;
    tahunMasuk: string;
    noHp: string;
    departemenId?: string;
    programStudiId?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
  };
  pegawaiData?: {
    nip: string;
    jabatan: string;
    noHp: string;
    departemenId?: string;
    programStudiId?: string;
  };
}

export interface UpdateUserData {
  name?: string;
  mahasiswaData?: {
    nim?: string;
    semester?: number;
    ipk?: number;
    ips?: number;
    tahunMasuk?: string;
    noHp?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    departemenId?: string;
    programStudiId?: string;
  };
  pegawaiData?: {
    nip?: string;
    jabatan?: string;
    noHp?: string;
    departemenId?: string;
    programStudiId?: string;
  };
}

export async function listUsers(filters: UserFilters = {}) {
  const queryParams = new URLSearchParams(
    Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );

  const res = await fetch(`${apiUrl}/api/master/user/all?${queryParams}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch users: ${error}`);
  }

  return res.json();
}

export async function getUser(userId: string) {
  const res = await fetch(`${apiUrl}/api/master/user/${userId}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch user: ${error}`);
  }

  return res.json();
}

export async function getUserActivity(userId: string) {
  const res = await fetch(`${apiUrl}/api/master/user/${userId}/activity`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch user activity: ${error}`);
  }

  return res.json();
}

export async function createUser(data: CreateUserData) {
  const res = await fetch(`${apiUrl}/api/master/user/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create user: ${error}`);
  }

  return res.json();
}

export async function updateUser(userId: string, data: UpdateUserData) {
  const res = await fetch(`${apiUrl}/api/master/user/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update user: ${error}`);
  }

  return res.json();
}

export async function deleteUser(userId: string) {
  const res = await fetch(`${apiUrl}/api/master/user/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete user: ${error}`);
  }

  return res.json();
}

export async function resetUserPassword(userId: string) {
  const res = await fetch(
    `${apiUrl}/api/master/user/${userId}/reset-password`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to reset password: ${error}`);
  }

  return res.json();
}

export async function toggleUserStatus(userId: string) {
  const res = await fetch(`${apiUrl}/api/master/user/${userId}/toggle-status`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to toggle user status: ${error}`);
  }

  return res.json();
}

/**
 * API Manajemen Role
 */

export async function listRoles() {
  const res = await fetch(`${apiUrl}/api/master/role/all`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch roles: ${error}`);
  }

  return res.json();
}

export async function getRolePermissions(roleId: string) {
  const res = await fetch(`${apiUrl}/api/master/role/${roleId}/permissions`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch role permissions: ${error}`);
  }

  return res.json();
}

export async function assignRoleToUser(userId: string, roleId: string) {
  const res = await fetch(
    `${apiUrl}/api/master/role/user/${userId}/assign-role`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ roleId }),
    },
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to assign role: ${error}`);
  }

  return res.json();
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  const res = await fetch(
    `${apiUrl}/api/master/role/user/${userId}/remove-role/${roleId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to remove role: ${error}`);
  }

  return res.json();
}

export async function getUserRoles(userId: string) {
  const res = await fetch(`${apiUrl}/api/master/role/user/${userId}/roles`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch user roles: ${error}`);
  }

  return res.json();
}

/**
 * API Master Data
 */

export async function listDepartments() {
  const res = await fetch(`${apiUrl}/api/master/departemen/all`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch departments: ${error}`);
  }

  return res.json();
}

export async function createDepartment(data: { name: string; code: string }) {
  const res = await fetch(`${apiUrl}/api/master/departemen/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create department: ${error}`);
  }

  return res.json();
}

export async function updateDepartment(
  id: string,
  data: { name?: string; code?: string },
) {
  const res = await fetch(`${apiUrl}/api/master/departemen/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update department: ${error}`);
  }

  return res.json();
}

export async function deleteDepartment(id: string) {
  const res = await fetch(`${apiUrl}/api/master/departemen/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete department: ${error}`);
  }

  return res.json();
}

export async function listProdi(departemenId?: string) {
  const queryParams = departemenId ? `?departemenId=${departemenId}` : "";
  const res = await fetch(`${apiUrl}/api/master/prodi/all${queryParams}`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch prodi: ${error}`);
  }

  return res.json();
}

export async function createProdi(data: {
  name: string;
  code: string;
  departemenId: string;
}) {
  const res = await fetch(`${apiUrl}/api/master/prodi/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create prodi: ${error}`);
  }

  return res.json();
}

export async function updateProdi(
  id: string,
  data: { name?: string; code?: string; departemenId?: string },
) {
  const res = await fetch(`${apiUrl}/api/master/prodi/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update prodi: ${error}`);
  }

  return res.json();
}

export async function deleteProdi(id: string) {
  const res = await fetch(`${apiUrl}/api/master/prodi/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to delete prodi: ${error}`);
  }

  return res.json();
}

/**
 * API Monitoring Sistem
 */

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export async function getSystemStats() {
  const res = await fetch(`${apiUrl}/api/admin/system/stats`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch system stats: ${error}`);
  }

  return res.json();
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  const queryParams = new URLSearchParams(
    Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => [k, String(v)]),
  );

  const res = await fetch(
    `${apiUrl}/api/admin/system/audit-logs?${queryParams}`,
    {
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch audit logs: ${error}`);
  }

  return res.json();
}

export async function getSystemConfig() {
  const res = await fetch(`${apiUrl}/api/admin/system/config`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch system config: ${error}`);
  }

  return res.json();
}

export async function updateSystemConfig(id: string, value: unknown) {
  const res = await fetch(`${apiUrl}/api/admin/system/config/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ value }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to update system config: ${error}`);
  }

  return res.json();
}

/**
 * API Manajemen Dokumen
 */

export async function getDocumentStatistics() {
  const res = await fetch(`${apiUrl}/api/admin/documents/statistics`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch document statistics: ${error}`);
  }

  return res.json();
}

export async function cleanupDocuments(letterInstanceId: string) {
  const res = await fetch(
    `${apiUrl}/api/admin/documents/cleanup/${letterInstanceId}`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to cleanup documents: ${error}`);
  }

  return res.json();
}

export async function cleanupAllDocuments() {
  const res = await fetch(`${apiUrl}/api/admin/documents/cleanup-all`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to cleanup all documents: ${error}`);
  }

  return res.json();
}

export async function cleanupOrphanedDocuments() {
  const res = await fetch(`${apiUrl}/api/admin/documents/cleanup-orphaned`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to cleanup orphaned documents: ${error}`);
  }

  return res.json();
}

export async function cleanupTempFiles() {
  const res = await fetch(`${apiUrl}/api/admin/documents/cleanup-temp`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to cleanup temp files: ${error}`);
  }

  return res.json();
}
