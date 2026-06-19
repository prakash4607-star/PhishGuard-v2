"use client";

import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState({
    campaigns: 0,
    employees: 0,
    results: 0,
    opened: 0,
    clicked: 0,
    submitted: 0,
  });

  const [employees, setEmployees] = useState<any[]>([]);
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [campaignsData, setCampaignsData] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [department, setDepartment] = useState("IT");
  const [searchEmployee, setSearchEmployee] = useState("");
  const [searchCampaign, setSearchCampaign] =
  useState("");

  useEffect(() => {
  checkUser();
}, []);

async function checkUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    router.push("/login");
    return;
  }

  loadStats();
}
  async function fetchCampaigns() {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("id");

  if (!error) {
    setCampaignsData(data || []);
  }
}

  async function loadStats() {
    const { count: campaignCount } = await supabase
      .from("campaigns")
      .select("*", { count: "exact", head: true });

    const { count: employeeCount } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true });

    const { count: resultCount } = await supabase
      .from("phishing_results")
      .select("*", { count: "exact", head: true });

    const { count: openedCount } = await supabase
      .from("phishing_results")
      .select("*", { count: "exact", head: true })
      .eq("opened_email", true);

    const { count: clickedCount } = await supabase
      .from("phishing_results")
      .select("*", { count: "exact", head: true })
      .eq("clicked_link", true);

    const { count: submittedCount } = await supabase
      .from("phishing_results")
      .select("*", { count: "exact", head: true })
      .eq("submitted_credentials", true);

    const { data: employeeData } = await supabase
      .from("employees")
      .select("*");

    const { data: resultsTable } = await supabase
      .from("phishing_results")
      .select("*");

    setEmployees(employeeData || []);
    setResultsData(resultsTable || []);
    await fetchCampaigns();

    setStats({
      campaigns: campaignCount || 0,
      employees: employeeCount || 0,
      results: resultCount || 0,
      opened: openedCount || 0,
      clicked: clickedCount || 0,
      submitted: submittedCount || 0,
    });
  }

  async function createCampaign() {
    const { error } = await supabase
      .from("campaigns")
      .insert([
        {
          name,
          email,
          priority,
          status: "Active",
        },
      ]);

    if (!error) {
      setName("");
      setEmail("");
      setPriority("Medium");

      fetchCampaigns();
      loadStats();
    }
  }
  async function createEmployee() {
  const { error } = await supabase
    .from("employees")
    .insert([
      {
        name: employeeName,
        email: employeeEmail,
        department,
      },
    ]);

  if (!error) {
    setEmployeeName("");
    setEmployeeEmail("");
    setDepartment("IT");

    loadStats();
  }
}

  async function deleteEmployee(id: number) {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (!error) {
      loadStats();
    }
  }

  async function deleteCampaign(id: number) {
    await supabase
      .from("campaigns")
      .delete()
      .eq("id", id);

    fetchCampaigns();
    loadStats();
  }

  const riskData = [
    {
      name: "Low",
      value: employees.filter(
        (e) => getRisk(e.id, resultsData) === "Low"
      ).length,
    },
    {
      name: "Medium",
      value: employees.filter(
        (e) => getRisk(e.id, resultsData) === "Medium"
      ).length,
    },
    {
      name: "High",
      value: employees.filter(
        (e) => getRisk(e.id, resultsData) === "High"
      ).length,
    },
  ];

  const engagementData = [
    {
      name: "Opened",
      value: stats.opened,
    },
    {
      name: "Clicked",
      value: stats.clicked,
    },
    {
      name: "Submitted",
      value: stats.submitted,
    },
  ];

  const COLORS = [
    "#00C853",
    "#FFD600",
    "#FF1744",
  ];

  return (
    <main className="p-10">
      <div className="flex justify-between items-center mb-8">
  <h1 className="text-4xl font-bold">
    PhishGuard Analytics Dashboard
  </h1>

  <button
    onClick={async () => {
      await supabase.auth.signOut();
      router.push("/login");
    }}
    className="bg-red-600 px-4 py-2 rounded"
  >
    Logout
  </button>
</div>

      {/* Dashboard Cards */}

      <div className="grid grid-cols-3 gap-6">
        <Card title="Campaigns" value={stats.campaigns} />
        <Card title="Employees" value={stats.employees} />
        <Card title="Results" value={stats.results} />

        <Card title="Emails Opened" value={stats.opened} />
        <Card title="Links Clicked" value={stats.clicked} />
        <Card
          title="Credentials Submitted"
          value={stats.submitted}
        />
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-4">
  Campaign Management
</h2>

<div className="border p-4 rounded mb-6">
  <input
    type="text"
    placeholder="Campaign Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="border p-2 mr-2 text-black"
  />

  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
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

      {/* Employee Risk Analysis */}
<h2 className="text-2xl font-bold mt-10 mb-4">
  Employee Management
</h2>

<div className="border p-4 rounded mb-6">

  <input
    type="text"
    placeholder="Employee Name"
    value={employeeName}
    onChange={(e) =>
      setEmployeeName(e.target.value)
    }
    className="border p-2 mr-2 text-black"
  />

  <input
    type="email"
    placeholder="Employee Email"
    value={employeeEmail}
    onChange={(e) =>
      setEmployeeEmail(e.target.value)
    }
    className="border p-2 mr-2 text-black"
  />

  <select
    value={department}
    onChange={(e) =>
      setDepartment(e.target.value)
    }
    className="border p-2 text-black"
  >
    <option>IT</option>
    <option>HR</option>
    <option>Finance</option>
  </select>

  <button
    onClick={createEmployee}
    className="bg-blue-600 px-4 py-2 ml-2 rounded"
  >
    Add Employee
  </button>

</div>
      <h2 className="text-2xl font-bold mt-10 mb-4">
        Employee Risk Analysis
      </h2>
      <input
  type="text"
  placeholder="Search Employee..."
  value={searchEmployee}
  onChange={(e) =>
    setSearchEmployee(e.target.value)
  }
  className="border p-2 mb-4 text-black w-full"
/>

      <table className="border-collapse border border-gray-500 w-full">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Risk</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {employees
  .filter(
    (employee) =>
      employee.name
        .toLowerCase()
        .includes(
          searchEmployee.toLowerCase()
        ) ||
      employee.email
        .toLowerCase()
        .includes(
          searchEmployee.toLowerCase()
        )
  )
  .map((employee) => (
            <tr key={employee.id}>
              <td className="border p-2">
                {employee.name}
              </td>

              <td className="border p-2">
                {employee.email}
              </td>

              <td className="border p-2">
                {employee.department}
              </td>

              <td
                className={`border p-2 font-bold ${
                  getRisk(employee.id, resultsData) === "High"
                    ? "text-red-500"
                    : getRisk(employee.id, resultsData) === "Medium"
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {getRisk(employee.id, resultsData)}
              </td>
              <td className="border p-2">
  <button
    onClick={() => deleteEmployee(employee.id)}
    className="bg-red-600 px-3 py-1 rounded"
  >
    Delete
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pie Chart */}

      <h2 className="text-2xl font-bold mt-10 mb-4">
        Risk Distribution
      </h2>

      <div className="flex justify-center mb-10">
        <ResponsiveContainer
  width="100%"
  height={350}
>
  <PieChart>
          <Pie
            data={riskData}
            cx="50%"
            cy="50%"
            outerRadius={120}
            dataKey="value"
            label
          >
            {riskData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  COLORS[index % COLORS.length]
                }
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
        </ResponsiveContainer>
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-4">
  Risk Summary
</h2>

<div className="grid grid-cols-3 gap-6 mb-10">

  <div className="border rounded-lg p-6">
    <h3 className="text-green-500 text-xl font-bold">
      Low Risk
    </h3>

    <p className="text-4xl mt-4">
      {
        employees.filter(
          (e) => getRisk(e.id, resultsData) === "Low"
        ).length
      }
    </p>
  </div>

  <div className="border rounded-lg p-6">
    <h3 className="text-yellow-500 text-xl font-bold">
      Medium Risk
    </h3>

    <p className="text-4xl mt-4">
      {
        employees.filter(
          (e) => getRisk(e.id, resultsData) === "Medium"
        ).length
      }
    </p>
  </div>

  <div className="border rounded-lg p-6">
    <h3 className="text-red-500 text-xl font-bold">
      High Risk
    </h3>

    <p className="text-4xl mt-4">
      {
        employees.filter(
          (e) => getRisk(e.id, resultsData) === "High"
        ).length
      }
    </p>
  </div>

</div>

      {/* Bar Chart */}

      <h2 className="text-2xl font-bold mt-10 mb-4">
        Engagement Analytics
      </h2>

      <div className="border rounded-lg p-6 mb-10">

  <ResponsiveContainer
    width="100%"
    height={350}
  >
    <BarChart data={engagementData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Bar
            dataKey="value"
            fill="#3B82F6"
          />
        </BarChart>
    </ResponsiveContainer>
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-4">
  Campaign Performance Analytics
</h2>
<input
  type="text"
  placeholder="Search Campaign..."
  value={searchCampaign}
  onChange={(e) =>
    setSearchCampaign(e.target.value)
  }
  className="border p-2 mb-4 text-black w-full"
/>

<table className="border-collapse border border-gray-500 w-full mb-10">

  <thead>
    <tr>
      <th className="border p-2">
        Campaign
      </th>

      <th className="border p-2">
        Priority
      </th>

      <th className="border p-2">
        Status
      </th>

      <th className="border p-2">
        Opened
      </th>

      <th className="border p-2">
        Clicked
      </th>

      <th className="border p-2">
        Submitted
      </th>
      <th className="border p-2">
  Action
</th>
    </tr>
  </thead>

  <tbody>

    {campaignsData
  .filter((campaign) =>
    campaign.name
      .toLowerCase()
      .includes(
        searchCampaign.toLowerCase()
      )
  )
  .map((campaign) => {

      const campaignResults =
        resultsData.filter(
          (r) =>
            r.campaign_id === campaign.id
        );

      return (
        <tr key={campaign.id}>

          <td className="border p-2">
            {campaign.name}
          </td>

          <td className="border p-2">
            <span
  className={`font-bold ${
    campaign.priority === "High"
      ? "text-red-500"
      : campaign.priority === "Medium"
      ? "text-yellow-500"
      : "text-green-500"
  }`}
>
  {campaign.priority}
</span>
          </td>
          <td className="border p-2">
  <span
    className={`px-3 py-1 rounded text-white text-sm font-semibold ${
      campaign.status === "Active"
        ? "bg-green-600"
        : "bg-red-600"
    }`}
  >
    {campaign.status}
  </span>
</td>
          <td className="border p-2">
            {
              campaignResults.filter(
                (r) => r.opened_email
              ).length
            }
          </td>

          <td className="border p-2">
            {
              campaignResults.filter(
                (r) => r.clicked_link
              ).length
            }
          </td>

          <td className="border p-2">
            {
              campaignResults.filter(
                (r) =>
                  r.submitted_credentials
              ).length
            }
          </td>
          <td className="border p-2">
  <button
    onClick={() => deleteCampaign(campaign.id)}
    className="bg-red-600 px-3 py-1 rounded"
  >
    Delete
  </button>
</td>

        </tr>
      );
    })}

  </tbody>

</table>
<button
  onClick={() => exportCSV(resultsData)}
  className="bg-blue-600 px-4 py-2 rounded mb-4"
>
  Export Results CSV
</button>

      {/* Results Table */}

      <h2 className="text-2xl font-bold mt-10 mb-4">
        Phishing Simulation Results
      </h2>

      <table className="border-collapse border border-gray-500 w-full">
        <thead>
          <tr>
            <th className="border p-2">
              Employee ID
            </th>
            <th className="border p-2">
              Campaign ID
            </th>
            <th className="border p-2">
              Opened Email
            </th>
            <th className="border p-2">
              Clicked Link
            </th>
            <th className="border p-2">
              Submitted Credentials
            </th>
          </tr>
        </thead>

        <tbody>
          {resultsData.map((result) => (
            <tr
              key={`${result.employee_id}-${result.campaign_id}`}
            >
              <td className="border p-2">
                {result.employee_id}
              </td>

              <td className="border p-2">
                {result.campaign_id}
              </td>

              <td className="border p-2">
                {result.opened_email
                  ? "✅ Yes"
                  : "❌ No"}
              </td>

              <td className="border p-2">
                {result.clicked_link
                  ? "✅ Yes"
                  : "❌ No"}
              </td>

              <td className="border p-2">
                {result.submitted_credentials
                  ? "⚠️ Yes"
                  : "✅ No"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    <footer className="mt-12 text-center text-gray-400 border-t pt-4">
      PhishGuard Security Analytics Dashboard © 2026
    </footer>
    </main>
  );
}
function exportCSV(resultsData: any[]) {
  const rows = [
    [
      "Employee ID",
      "Campaign ID",
      "Opened",
      "Clicked",
      "Submitted",
    ],
    ...resultsData.map((r) => [
      r.employee_id,
      r.campaign_id,
      r.opened_email,
      r.clicked_link,
      r.submitted_credentials,
    ]),
  ];

  const csv =
    rows.map((e) => e.join(",")).join("\n");

  const blob = new Blob(
    [csv],
    { type: "text/csv" }
  );

  const url =
    window.URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "phishing_results.csv";

  a.click();
}

function getRisk(
  employeeId: number,
  resultsData: any[]
) {
  const result = resultsData.find(
    (r) => r.employee_id === employeeId
  );

  if (!result) return "Low";

  if (result.submitted_credentials)
    return "High";

  if (result.clicked_link)
    return "Medium";

  return "Low";
}

function Card({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold">
        {title}
      </h2>

      <p className="text-4xl mt-4">
        {value}
      </p>
    </div>
  );
}