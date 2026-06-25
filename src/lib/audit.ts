import { supabase } from "./supabase";

export async function createAuditLog(
  action: string,
  details: string
) {
  await supabase
    .from("audit_logs")
    .insert([
      {
        action,
        details,
      },
    ]);
}

export const addAuditLog =
  createAuditLog;