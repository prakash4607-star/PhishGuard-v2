import { supabase } from "./supabase";

function normalizeRole(role?: string | null) {
  const raw = role?.toLowerCase().trim() ?? "";
  const normalized = raw.replace(/[-\s]/g, "_");

  if (
    normalized === "super_admin" ||
    normalized === "superadmin" ||
    normalized === "super_adimun" ||
    normalized === "superadimun"
  ) {
    return "super_admin";
  }

  if (normalized === "admin") {
    return "admin";
  }

  return normalized || "admin";
}

export async function getRole() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("USER EMAIL:", user?.email);

  if (!user?.email) {
    return "admin";
  }

  const { data, error } = await supabase
    .from("roles")
    .select("role")
    .eq("email", user.email)
    .maybeSingle();

  console.log("ROLE DATA:", data);

  if (error) {
    console.error(error);
    return "admin";
  }

  const role = normalizeRole(data?.role);
  console.log("NORMALIZED ROLE:", role);
  return role;
}