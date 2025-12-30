import jwtDecode from "jwt-decode";

export function getUserFromToken() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}
