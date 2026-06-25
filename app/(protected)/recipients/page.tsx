"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import { createAuditLog } from "../../../src/lib/audit";
import Sidebar from "../../../src/components/Sidebar";

export default function RecipientsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("IT");

  const [search, setSearch] = useState("");

  const [recipients, setRecipients] = useState<any[]>([]);

  useEffect(() => {
    fetchRecipients();
  }, []);

  async function fetchRecipients() {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("id");

    if (!error) {
      setRecipients(data || []);
    }
  }

  async function validateDomain(
    email: string
  ) {
    const domain =
      email.split("@")[1]?.toLowerCase();

    if (!domain) return false;

    const { data, error } =
      await supabase
        .from("authorizations")
        .select("approved_domains");

    if (error || !data) {
      return false;
    }

    const approvedDomains =
      data.flatMap((row: any) =>
        row.approved_domains
          ?.split(",")
          .map((d: string) =>
            d.trim().toLowerCase()
          ) || []
      );

    return approvedDomains.includes(
      domain
    );
  }

  async function addRecipient() {
    if (!name.trim()) {
      alert("Name required");
      return;
    }

    if (!email.trim()) {
      alert("Email required");
      return;
    }

    if (!email.includes("@")) {
      alert("Invalid email");
      return;
    }

    const valid =
      await validateDomain(email);

    const { error } = await supabase
      .from("employees")
      .insert([
        {
          name,
          email,
          department,
          domain_valid: valid,
        },
      ]);

    if (error) {
      console.error(error);
      alert("Failed to add recipient");
      return;
    }

    await createAuditLog(
      "Recipient Added",
      `${name} (${email})`
    );

    setName("");
    setEmail("");
    setDepartment("IT");

    fetchRecipients();
  }

  async function deleteRecipient(
    id: number,
    recipientEmail: string
  ) {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (!error) {
      await createAuditLog(
        "Recipient Deleted",
        recipientEmail
      );

      fetchRecipients();
    }
  }

  async function handleCSVUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    const headers = lines[0]
      .split(",")
      .map((h: string) => h.trim().toLowerCase());

    const nameIdx = headers.indexOf("name");
    const emailIdx = headers.indexOf("email");
    const deptIdx = headers.indexOf("department");

    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      const nameVal = nameIdx > -1 ? (cols[nameIdx] || "").trim() : "";
      const emailVal = emailIdx > -1 ? (cols[emailIdx] || "").trim() : "";
      const deptVal = deptIdx > -1 ? (cols[deptIdx] || "").trim() : "IT";

      if (!emailVal) continue;

      const domainValid = await validateDomain(emailVal);

      rows.push({
        name: nameVal,
        email: emailVal,
        department: deptVal,
        domain_valid: domainValid,
      });
    }

    if (rows.length === 0) return;

    const { error } = await supabase.from("employees").insert(rows);
    if (error) {
      console.error(error);
      alert("Failed to import CSV");
      return;
    }

    await createAuditLog("Recipients Imported", file.name);
    fetchRecipients();
    alert(`Imported ${rows.length} recipients`);
  }

  const filteredRecipients =
    recipients.filter(
      (recipient) =>
        recipient.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        recipient.email
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  const approvedCount =
    recipients.filter(
      (r) => r.domain_valid
    ).length;

  const blockedCount =
    recipients.filter(
      (r) => !r.domain_valid
    ).length;

  return (
    <main className="min-h-screen bg-[#030B1A] text-white flex">
      <Sidebar />

      <div className="flex-1 p-10">

        <h1 className="text-4xl font-bold mb-8">
          Recipient Management
        </h1>

        <div className="grid grid-cols-3 gap-4 mb-8">

          <div className="bg-[#081528] border border-[#14243d] rounded-xl p-4">
            <h2 className="text-slate-400">
              Total Recipients
            </h2>

            <p className="text-3xl font-bold mt-2">
              {recipients.length}
            </p>
          </div>

          <div className="bg-[#081528] border border-[#14243d] rounded-xl p-4">
            <h2 className="text-green-400">
              Approved
            </h2>

            <p className="text-3xl font-bold mt-2">
              {approvedCount}
            </p>
          </div>

          <div className="bg-[#081528] border border-[#14243d] rounded-xl p-4">
            <h2 className="text-red-400">
              Blocked
            </h2>

            <p className="text-3xl font-bold mt-2">
              {blockedCount}
            </p>
          </div>

        </div>

        <div className="border border-[#14243d] p-4 rounded mb-8">

          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="mb-4"
          />

          <input
            placeholder="Recipient Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="border p-2 mr-2 text-black"
          />

          <input
            placeholder="Recipient Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="border p-2 mr-2 text-black"
          />

          <select
            value={department}
            onChange={(e) =>
              setDepartment(
                e.target.value
              )
            }
            className="border p-2 text-black"
          >
            <option>IT</option>
            <option>HR</option>
            <option>Finance</option>
            <option>Operations</option>
          </select>

          <button
            onClick={addRecipient}
            className="bg-green-600 px-4 py-2 ml-2 rounded"
          >
            Add Recipient
          </button>

        </div>

        <input
          type="text"
          placeholder="Search recipient..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border p-2 mb-6 text-black w-full"
        />

        <table className="border-collapse border border-gray-600 w-full">

          <thead>

            <tr>

              <th className="border p-2">
                Name
              </th>

              <th className="border p-2">
                Email
              </th>

              <th className="border p-2">
                Department
              </th>

              <th className="border p-2">
                Domain Status
              </th>

              <th className="border p-2">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredRecipients.map(
              (recipient) => (
                <tr
                  key={recipient.id}
                >
                  <td className="border p-2">
                    {recipient.name}
                  </td>

                  <td className="border p-2">
                    {recipient.email}
                  </td>

                  <td className="border p-2">
                    {recipient.department}
                  </td>

                  <td
                    className={`border p-2 font-bold ${
                      recipient.domain_valid
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {recipient.domain_valid
                      ? "Approved"
                      : "Blocked"}
                  </td>

                  <td className="border p-2">

                    <button
                      onClick={() =>
                        deleteRecipient(
                          recipient.id,
                          recipient.email
                        )
                      }
                      className="bg-red-600 px-3 py-1 rounded"
                    >
                      Delete
                    </button>

                  </td>
                </tr>
              )
            )}

          </tbody>

        </table>

      </div>
    </main>
  );
}