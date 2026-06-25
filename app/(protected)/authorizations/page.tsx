"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../src/lib/supabase";
import Sidebar from "../../../src/components/Sidebar";
import RoleGuard from "../../../src/components/RoleGuard";
import { createAuditLog } from "../../../src/lib/audit";
import { getRole } from "../../../src/lib/getRole";

export default function AuthorizationsPage() {
  const [institution, setInstitution] = useState("");
  const [domains, setDomains] = useState("");
  const [scope, setScope] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuthorizations();
    loadRole();
  }, []);

  async function loadRole() {
    const r = await getRole();
    setRole(r || "");
  }

  async function fetchAuthorizations() {
    setLoading(true);
    const { data, error } = await supabase
      .from("authorizations")
      .select("*")
      .order("id");

    if (error) {
      alert(`Error fetching authorizations: ${error.message}`);
    } else {
      setAuthorizations(data || []);
    }
    setLoading(false);
  }

  async function createAuthorization() {
    if (role !== "super_admin") {
      alert("Only Super Admin can create authorizations.");
      return;
    }

    if (!institution.trim() || !domains.trim() || !scope.trim() || !approvedBy.trim()) {
      alert("Fill all fields");
      return;
    }

    const { error } = await supabase.from("authorizations").insert([
      {
        institution_name: institution,
        approved_domains: domains,
        campaign_scope: scope,
        approved_by: approvedBy,
      },
    ]);

    if (error) {
      alert(`Error creating authorization: ${error.message}`);
    } else {
      setInstitution("");
      setDomains("");
      setScope("");
      setApprovedBy("");
      fetchAuthorizations();
    }
  }

  async function deleteAuthorization(id: number, institutionName: string) {
    if (role !== "super_admin") {
      alert("Only Super Admin can delete authorizations.");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${institutionName}?`)) return;

    const { error } = await supabase.from("authorizations").delete().eq("id", id);

    if (error) {
      alert(`Error deleting authorization: ${error.message}`);
    } else {
      fetchAuthorizations();
    }
  }

  const filteredAuthorizations = useMemo(
    () =>
      authorizations.filter(
        (auth) =>
          auth.institution_name?.toLowerCase().includes(search.toLowerCase()) ||
          auth.approved_domains?.toLowerCase().includes(search.toLowerCase())
      ),
    [authorizations, search]
  );

  const domainCount = useMemo(
    () => new Set(authorizations.map((a) => a.approved_domains)).size,
    [authorizations]
  );

  return (
    <RoleGuard allowedRole="super_admin">
      <main className="flex">
        <Sidebar />
        <div className="flex-1 p-10">
        <h1 className="text-4xl font-bold mb-2">Authorization Management</h1>
        <p className="text-slate-400 mb-6">Current Role: {role || "Unknown"}</p>

        {role !== "super_admin" && (
          <div className="bg-red-600 p-3 rounded mb-6">
            Only Super Admin can create or delete authorizations.
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#081528] border border-[#14243d] rounded-xl p-4">
            <h2>Total Authorizations</h2>
            <p className="text-3xl font-bold mt-2">{authorizations.length}</p>
          </div>
          <div className="bg-[#081528] border border-[#14243d] rounded-xl p-4">
            <h2>Unique Approved Domains</h2>
            <p className="text-3xl font-bold mt-2">{domainCount}</p>
          </div>
          <div className="bg-[#081528] border border-[#14243d] rounded-xl p-4">
            <h2>Super Admin</h2>
            <p className="text-3xl font-bold mt-2">{role === "super_admin" ? "Yes" : "No"}</p>
          </div>
        </div>

        <div className="border p-4 rounded mb-8">
          <input
            placeholder="Institution Name"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="border p-2 mr-2 text-black"
          />
          <input
            placeholder="Approved Domains"
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            className="border p-2 mr-2 text-black"
          />
          <input
            placeholder="Campaign Scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="border p-2 mr-2 text-black"
          />
          <input
            placeholder="Approved By"
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            className="border p-2 mr-2 text-black"
          />
          {role === "super_admin" && (
            <button
              onClick={createAuthorization}
              className="bg-green-600 px-4 py-2 rounded"
            >
              Save Authorization
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Search Authorization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 mb-6 text-black w-full"
        />

        {loading ? (
          <p>Loading authorizations...</p>
        ) : (
          <table className="border-collapse border border-gray-500 w-full">
            <thead>
              <tr>
                <th className="border p-2">Institution</th>
                <th className="border p-2">Domains</th>
                <th className="border p-2">Scope</th>
                <th className="border p-2">Approved By</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuthorizations.map((auth) => (
                <tr key={auth.id}>
                  <td className="border p-2">{auth.institution_name}</td>
                  <td className="border p-2">{auth.approved_domains}</td>
                  <td className="border p-2">{auth.campaign_scope}</td>
                  <td className="border p-2">{auth.approved_by}</td>
                  <td className="border p-2">
                    {role === "super_admin" && (
                      <button
                        onClick={() => deleteAuthorization(auth.id, auth.institution_name)}
                        className="bg-red-600 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
    </RoleGuard>
  );
}
