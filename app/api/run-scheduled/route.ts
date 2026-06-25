import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export async function GET() {
  const now = new Date().toISOString();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("status", "Scheduled")
    .lte("scheduled_at", now);

  return NextResponse.json({
    dueCampaigns: campaigns || [],
  });
}
