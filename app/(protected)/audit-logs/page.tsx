"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import Sidebar from "../../../src/components/Sidebar";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    setLogs(data || []);
  }

  return (
    <main className="min-h-screen bg-[#030B1A] text-white flex">
      <Sidebar />

      <div className="flex-1 p-10">
        <h1 className="text-4xl font-bold mb-8">
          Audit Logs
        </h1>

        <table className="border-collapse border border-gray-500 w-full">
          <thead>
            <tr>
              <th className="border p-2">Action</th>
              <th className="border p-2">Details</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="border p-2">
                  {log.action}
                </td>

                <td className="border p-2">
                  {log.details}
                </td>

                <td className="border p-2">
                  {new Date(
                    log.created_at
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}