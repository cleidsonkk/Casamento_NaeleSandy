const ADMIN_ACCESS_STORAGE_KEY = "wedding-admin-access-key";

export function getAdminAccessKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ADMIN_ACCESS_STORAGE_KEY) ?? "";
}

export function setAdminAccessKey(value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_ACCESS_STORAGE_KEY, value);
}

export function clearAdminAccessKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_ACCESS_STORAGE_KEY);
}
