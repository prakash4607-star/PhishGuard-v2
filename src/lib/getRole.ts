import { supabase } from "./supabase";

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

  return data?.role || "admin";
}