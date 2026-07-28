export const GUEST_KEY_COOKIE = "flownic_guest_key";
export const GUEST_NAME_COOKIE = "flownic_guest_name";

export function readCookie(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    const [k, ...rest] = part.split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function guestCookieHeaders(guestKey: string, displayName: string): string[] {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return [
    `${GUEST_KEY_COOKIE}=${encodeURIComponent(guestKey)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`,
    `${GUEST_NAME_COOKIE}=${encodeURIComponent(displayName)}; Path=/; SameSite=Lax; Max-Age=604800${secure}`,
  ];
}
