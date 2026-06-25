import { supabase } from "@/src/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {

  const now =
    new Date().toISOString();

  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("status", "Scheduled")
    .lte("scheduled_at", now);

  return NextResponse.json(data);
}