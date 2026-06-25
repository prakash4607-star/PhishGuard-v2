"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import Sidebar from "../../../src/components/Sidebar";
import { createAuditLog } from "../../../src/lib/audit";
import { getRole } from "../../../src/lib/getRole";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [approvedDomain, setApprovedDomain] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [scheduledAt, setScheduledAt] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");

  // load campaigns from supabase
  async function fetchCampaigns() {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .order("id");

    setCampaigns(data || []);
  }

  async function loadRole() {
  const r = await getRole();
  setRole(r || "");
}

  useEffect(() => {
  fetchCampaigns();
  loadRole();
}, []);

  async function createCampaign() {
    if (!name.trim() || !email.trim() || !approvedDomain.trim()) {
      alert("Fill all fields");
      return;
    }

    const status = scheduledAt !== "" ? "Scheduled" : "Active";

    const { error } = await supabase.from("campaigns").insert([
      {
        name,
        email,
        priority,
        status,
        approved_domain: approvedDomain,
        scheduled_at: scheduledAt || null,
      },
    ]);

    if (!error) {
      await createAuditLog("Campaign Created", `${name} (${priority})`);
      setName("");
      setEmail("");
      setPriority("Medium");
      setApprovedDomain("");
      setScheduledAt("");
      fetchCampaigns();
    }
  }

  async function deleteCampaign(id: number, campaignName: string) {
    console.log("ROLE:", role);
    console.log("Deleting ID:", id);

    const { data, error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id)
      .select();

    console.log("DELETE DATA:", data);
    console.log("DELETE ERROR:", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Deleted successfully");
    fetchCampaigns();
  }

  async function launchCampaign(campaign: any) {
    console.log("LAUNCH BUTTON CLICKED");
  try {
    const { data: recipients, error } =
      await supabase
        .from("employees")
        .select("*");

    if (error) {
      console.error(error);
      return;
    }
    console.log("Campaign:", campaign);
    console.log("Recipients:", recipients);
    for (const user of recipients || []) {
  console.log("USER:", user);
}

    for (const user of recipients || []) {
        if (!user.email?.trim()) continue;

        const domain = user.email.split("@")[1]?.toLowerCase();
        if (!domain) continue;

        const approved = campaign.approved_domain?.toLowerCase() || "";
        // Allow sending to gmail.com regardless of campaign approved domain
        if (domain !== approved && domain !== "gmail.com") {
          continue;
        }

        console.log("Sending email to:", user.email);

const response = await fetch("/api/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    to: user.email,
    subject: campaign.name,
    html: `
      <h2>${campaign.name}</h2>
      <p>New scholarship opportunity available.</p>
      <a href="http://localhost:3000/phish?employee_id=${user.id}&campaign_id=${campaign.id}">
        View Details
      </a>
    `,
  }),
});

console.log("EMAIL STATUS:", response.status);

const result = await response.json();
console.log("EMAIL RESULT:", result);
      }

      await supabase
  .from("campaigns")
  .update({
    status: "Completed",
  })
  .eq("id", campaign.id);

await createAuditLog(
  "Campaign Launched",
  campaign.name
);

fetchCampaigns();

alert("Campaign Launched Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to launch campaign");
    }
  }
  async function runScheduler() {

  const response =
    await fetch(
      "/api/run-scheduled"
    );

  const data =
    await response.json();

  for (
    const campaign of
    data.dueCampaigns
  ) {
    await launchCampaign(
      campaign
    );
  }

  fetchCampaigns();

  alert(
    "Scheduler Finished"
  );
}
  return (
    <main className="min-h-screen bg-[#030B1A] text-white flex">
      <Sidebar />
      <div className="flex-1 p-10">
        <p className="mb-4">
  Current Role: {role}
</p>
        <h1 className="text-4xl font-bold mb-8">
          Campaign Management
        </h1>
        <div className="grid grid-cols-3 gap-4 mb-8">

  <div className="bg-[#081528] p-4 rounded-xl">
    <h2>Total Campaigns</h2>
    <p className="text-3xl font-bold">
      {campaigns.length}
    </p>
  </div>

  <div className="bg-[#081528] p-4 rounded-xl">
    <h2>Active</h2>
    <p className="text-3xl font-bold">
      {
        campaigns.filter(
          (c) => c.status === "Active"
        ).length
      }
    </p>
  </div>

  <div className="bg-[#081528] p-4 rounded-xl">
    <h2>Scheduled</h2>
    <p className="text-3xl font-bold">
      {
        campaigns.filter(
          (c) => c.status === "Scheduled"
        ).length
      }
    </p>
  </div>

</div>

      <div className="border p-4 rounded mb-8">
        <input
          type="text"
          placeholder="Campaign Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mr-2 text-black"
        />

        <input
          type="email"
          placeholder="Owner Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mr-2 text-black"
        />

        <input
          type="text"
          placeholder="Approved Domain"
          value={approvedDomain}
          onChange={(e) => setApprovedDomain(e.target.value)}
          className="border p-2 mr-2 text-black"
        />

        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="border p-2 mr-2 text-black"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border p-2 text-black"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <button
          onClick={createCampaign}
          className="bg-green-600 px-4 py-2 ml-2 rounded"
        >
          Create Campaign
        </button>
      </div>
      <input
  type="text"
  placeholder="Search Campaign..."
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
  className="border p-2 mb-4 text-black w-full"
/>
<button
  onClick={runScheduler}
  className="bg-yellow-600 px-4 py-2 rounded mb-4"
>
  Run Scheduler
</button>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Approved Domain</th>
            <th className="border p-2">Scheduled Time</th>
            <th className="border p-2">Priority</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {campaigns
  .filter(
    (campaign) =>
      campaign.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  )
  .map((campaign) => (
            <tr key={campaign.id}>
              <td className="border p-2">{campaign.name}</td>
              <td className="border p-2">{campaign.email}</td>
              <td className="border p-2">{campaign.approved_domain}</td>
              <td className="border p-2">
                {campaign.scheduled_at
                  ? new Date(campaign.scheduled_at).toLocaleString()
                  : "-"}
              </td>
              <td className="border p-2">{campaign.priority}</td>
              <td className="border p-2">
                <span
                  className={`px-3 py-1 rounded text-white ${
                   campaign.status === "Scheduled"
  ? "bg-yellow-600"
  : campaign.status === "Active"
  ? "bg-green-600"
  : campaign.status === "Completed"
  ? "bg-blue-600"
  : "bg-red-600"
                  }`}
                >
                  {campaign.status}
                </span>
              </td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => launchCampaign(campaign)}
                  className="bg-purple-600 px-3 py-1 rounded"
                >
                  Launch
                </button>
                {role === "super_admin" && (
  <button
    onClick={() =>
      deleteCampaign(
        campaign.id,
        campaign.name
      )
    }
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
    </div>
  </main>
  );
}