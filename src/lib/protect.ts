import { supabase } from "./supabase";

export async function checkAuth() {

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return !!session;
}