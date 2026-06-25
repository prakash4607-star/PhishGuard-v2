"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "../../../src/components/Sidebar";

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

export default function Dashboard() {
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

    setStats({
      campaigns: campaignCount || 0,
      employees: employeeCount || 0,
      results: resultCount || 0,
      opened: openedCount || 0,
      clicked: clickedCount || 0,
      submitted: submittedCount || 0,
    });
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
    <main className="min-h-screen bg-[#030B1A] text-white flex">
      <Sidebar />

      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            PhishGuard Dashboard
          </h1>
        </div>

        {/* Dashboard Cards */}

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card
            title="Campaigns"
            value={stats.campaigns}
          />

          <Card
            title="Employees"
            value={stats.employees}
          />

          <Card
            title="Results"
            value={stats.results}
          />

          <Card
            title="Opened"
            value={stats.opened}
          />

          <Card
            title="Clicked"
            value={stats.clicked}
          />

          <Card
            title="Submitted"
            value={stats.submitted}
          />
        </div>

        {/* Risk Distribution */}

        <h2 className="text-2xl font-bold mt-12 mb-4">
          Risk Distribution
        </h2>

        <div className="border border-[#14243d] rounded-2xl p-6">
          <ResponsiveContainer
            width="100%"
            height={350}
          >
            <PieChart>
              <Pie
                data={riskData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {riskData.map((_, index) => (
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

        {/* Risk Summary */}

        <h2 className="text-2xl font-bold mt-12 mb-4">
          Risk Summary
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="border border-[#14243d] rounded-2xl p-6">
            <h3 className="text-green-500 text-xl font-bold">
              Low Risk
            </h3>

            <p className="text-4xl mt-4">
              {
                employees.filter(
                  (e) =>
                    getRisk(
                      e.id,
                      resultsData
                    ) === "Low"
                ).length
              }
            </p>
          </div>

          <div className="border border-[#14243d] rounded-2xl p-6">
            <h3 className="text-yellow-500 text-xl font-bold">
              Medium Risk
            </h3>

            <p className="text-4xl mt-4">
              {
                employees.filter(
                  (e) =>
                    getRisk(
                      e.id,
                      resultsData
                    ) === "Medium"
                ).length
              }
            </p>
          </div>

          <div className="border border-[#14243d] rounded-2xl p-6">
            <h3 className="text-red-500 text-xl font-bold">
              High Risk
            </h3>

            <p className="text-4xl mt-4">
              {
                employees.filter(
                  (e) =>
                    getRisk(
                      e.id,
                      resultsData
                    ) === "High"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Engagement Analytics */}

        <h2 className="text-2xl font-bold mt-12 mb-4">
          Engagement Analytics
        </h2>

        <div className="border border-[#14243d] rounded-2xl p-6">
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

        <footer className="mt-12 text-center text-gray-400 border-t border-[#14243d] pt-4">
          PhishGuard Security Analytics Dashboard ©
          2026
        </footer>
      </div>
    </main>
  );
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
    <div className="bg-[#081528] border border-[#14243d] rounded-2xl p-6">
      <p className="text-slate-400 text-sm">
        {title}
      </p>

      <h2 className="text-4xl font-bold mt-3">
        {value}
      </h2>
    </div>
  );
}