"use client";

import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { supabase } from "../../../src/lib/supabase";
import Sidebar from "../../../src/components/Sidebar";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function AnalyticsPage() {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [credentialSubmissions, setCredentialSubmissions] =
    useState(0);

  const [clickRate, setClickRate] =
    useState(0);

  const [credentialRate, setCredentialRate] =
    useState(0);

  const [awarenessScore, setAwarenessScore] =
    useState(100);

  const [riskData, setRiskData] = useState([
    { name: "High Risk", value: 0 },
    { name: "Medium Risk", value: 0 },
    { name: "Low Risk", value: 0 },
  ]);

  const [employeeRisks, setEmployeeRisks] =
    useState<any[]>([]);
  const [campaignStats, setCampaignStats] =
    useState<any[]>([]);
  const [reportRate, setReportRate] =
    useState(0);

  const [reportedCount, setReportedCount] =
    useState(0);
  const [topUsers, setTopUsers] =
    useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const { count: employeesCount } =
      await supabase
        .from("employees")
        .select("*", {
          count: "exact",
          head: true,
        });

    const { count: clicksCount } =
      await supabase
        .from("phishing_results")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("clicked_link", true);

    const { count: credentialsCount } =
      await supabase
        .from("phishing_results")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq(
          "submitted_credentials",
          true
        );

    setTotalEmployees(
      employeesCount || 0
    );

    setTotalClicks(
      clicksCount || 0
    );

    setCredentialSubmissions(
      credentialsCount || 0
    );

    const {
      count: reportedUsersCount,
    } = await supabase
      .from("phishing_results")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq(
        "reported_phishing",
        true
      );

    setReportedCount(reportedUsersCount || 0);

    const reportPercentage =
      employeesCount && employeesCount > 0
        ? (
            ((reportedUsersCount || 0) /
              employeesCount) *
            100
          ).toFixed(1)
        : 0;

    setReportRate(Number(reportPercentage));

    const clickPercentage =
      employeesCount && employeesCount > 0
        ? (
            ((clicksCount || 0) /
              employeesCount) *
            100
          ).toFixed(1)
        : 0;

    const credentialPercentage =
      employeesCount && employeesCount > 0
        ? (
            ((credentialsCount || 0) /
              employeesCount) *
            100
          ).toFixed(1)
        : 0;

    setClickRate(
      Number(clickPercentage)
    );

    setCredentialRate(
      Number(credentialPercentage)
    );

    const awareness =
      100 -
      Number(clickPercentage) -
      Number(credentialPercentage) +
      Number(reportPercentage);

    setAwarenessScore(
      awareness < 0 ? 0 : awareness
    );

    const { data: results } =
      await supabase
        .from("phishing_results")
        .select("*");

    const { data: campaigns } =
      await supabase
        .from("campaigns")
        .select("*");

    const campaignData =
      (campaigns || []).map(
        (campaign: any) => {
          const campaignResults =
            (results || []).filter(
              (r: any) =>
                r.campaign_id ===
                campaign.id
            );

          const clicks =
            campaignResults.filter(
              (r: any) =>
                r.clicked_link
            ).length;

          const credentials =
            campaignResults.filter(
              (r: any) =>
                r.submitted_credentials
            ).length;

          return {
            ...campaign,
            clicks,
            credentials,
          };
        }
      );

    setCampaignStats(campaignData);


    let high = 0;
    let medium = 0;
    let low = 0;

    (results || []).forEach(
      (row: any) => {
        if (
          row.submitted_credentials
        ) {
          high++;
        } else if (
          row.clicked_link
        ) {
          medium++;
        } else {
          low++;
        }
      }
    );

    setRiskData([
      {
        name: "High Risk",
        value: high,
      },
      {
        name: "Medium Risk",
        value: medium,
      },
      {
        name: "Low Risk",
        value: low,
      },
    ]);

    const { data: employees } =
      await supabase
        .from("employees")
        .select("*");

    const riskRows =
      (employees || []).map(
        (employee: any) => {
          const result =
            (results || []).find(
              (r: any) =>
                r.employee_id ===
                employee.id
            );

          let risk = "Low";

          if (
            result?.submitted_credentials
          ) {
            risk = "High";
          } else if (
            result?.clicked_link
          ) {
            risk = "Medium";
          }

          return {
            ...employee,
            risk,
            clicked:
              result?.clicked_link ||
              false,
            credentials:
              result?.submitted_credentials ||
              false,
            reported:
              result?.reported_phishing ||
              false,
          };
        }
      );

    const sortedUsers =
      [...riskRows]
        .sort((a, b) => {
          if (
            a.risk === "High" &&
            b.risk !== "High"
          )
            return -1;

          if (
            a.risk !== "High" &&
            b.risk === "High"
          )
            return 1;

          return 0;
        })
        .slice(0, 5);

    setTopUsers(sortedUsers);
    setEmployeeRisks(
      riskRows
    );
  }

  function exportCSV() {
    const rows = employeeRisks.map(
      (employee: any) => ({
        Name: employee.name,
        Email: employee.email,
        Risk: employee.risk,
        Clicked: employee.clicked,
        Credentials:
          employee.credentials,
        Reported: employee.reported || false,
      })
    );

    if (rows.length === 0) {
      return;
    }

    const csv = [
      Object.keys(rows[0]).join(","),
      ...rows.map((row) =>
        Object.values(row).join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    saveAs(
      blob,
      "phishguard-report.csv"
    );
  }

  return (
    <main className="min-h-screen bg-[#030B1A] text-white flex">
      <Sidebar />

      <div className="flex-1 p-10">
        <h1 className="text-4xl font-bold mb-8">
          Analytics Dashboard
        </h1>

        <button
          onClick={exportCSV}
          className="bg-green-600 px-4 py-2 rounded mb-6"
        >
          Export CSV Report
        </button>

        <div className="grid grid-cols-4 gap-6 mb-10">

          <div className="bg-[#081528] p-6 rounded-xl">
            <h2>Total Employees</h2>
            <p className="text-4xl font-bold mt-2">
              {totalEmployees}
            </p>
          </div>

          <div className="bg-[#081528] p-6 rounded-xl">
            <h2>Total Clicks</h2>
            <p className="text-4xl font-bold mt-2 text-yellow-400">
              {totalClicks}
            </p>
          </div>

          <div className="bg-[#081528] p-6 rounded-xl">
            <h2>Credential Submissions</h2>
            <p className="text-4xl font-bold mt-2 text-red-400">
              {credentialSubmissions}
            </p>
          </div>

          <div className="bg-[#081528] p-6 rounded-xl">
            <h2>
              Reported Phishing
            </h2>

            <p className="text-4xl font-bold text-blue-400 mt-2">
              {reportedCount}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-4 gap-6 mb-10">

          <div className="bg-[#081528] p-6 rounded-xl">
            <h2>Click Rate</h2>
            <p className="text-4xl font-bold text-yellow-400 mt-2">
              {clickRate}%
            </p>
          </div>

          <div className="bg-[#081528] p-6 rounded-xl">
            <h2>Credential Rate</h2>
            <p className="text-4xl font-bold text-red-400 mt-2">
              {credentialRate}%
            </p>
          </div>

          <div className="bg-[#081528] p-6 rounded-xl">
            <h2>Awareness Score</h2>
            <p className="text-4xl font-bold text-green-400 mt-2">
              {awarenessScore.toFixed(1)}%
            </p>
          </div>

          <div className="bg-[#081528] p-6 rounded-xl">
            <h2>
              Report Rate
            </h2>

            <p className="text-4xl font-bold text-cyan-400 mt-2">
              {reportRate}%
            </p>
          </div>

        </div>

        <div className="bg-[#081528] p-6 rounded-xl mb-10">
          <h2 className="text-2xl font-bold mb-4">
            Risk Distribution
          </h2>

          <PieChart
            width={500}
            height={350}
          >
            <Pie
              data={riskData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >
              <Cell fill="#ef4444" />
              <Cell fill="#eab308" />
              <Cell fill="#22c55e" />
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="bg-[#081528] p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">
            Employee Risk Analysis
          </h2>

          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">
                  Name
                </th>
                <th className="border p-2">
                  Email
                </th>
                <th className="border p-2">
                  Risk
                </th>
                <th className="border p-2">
                  Clicked Link
                </th>
                <th className="border p-2">
                  Submitted Credentials
                </th>
                <th className="border p-2">
                  Reported
                </th>
              </tr>
            </thead>

            <tbody>
              {employeeRisks.map(
                (employee: any) => (
                  <tr key={employee.id}>
                    <td className="border p-2">
                      {employee.name}
                    </td>

                    <td className="border p-2">
                      {employee.email}
                    </td>

                    <td className="border p-2">
                      <span
                        className={`px-3 py-1 rounded ${
                          employee.risk === "High"
                            ? "bg-red-600"
                            : employee.risk === "Medium"
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                      >
                        {employee.risk}
                      </span>
                    </td>

                    <td className="border p-2">
                      {employee.clicked
                        ? "Yes"
                        : "No"}
                    </td>

                    <td className="border p-2">
                      {employee.credentials
                        ? "Yes"
                        : "No"}
                    </td>

                    <td className="border p-2">
                      {employee.reported ? "Yes" : "No"}
                    </td>

                  </tr>
                )
              )}
            </tbody>

          </table>
        </div>

        <div className="bg-[#081528] p-6 rounded-xl mt-10">
          <h2 className="text-2xl font-bold mb-4">
            Campaign Performance
          </h2>

          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">
                  Campaign
                </th>

                <th className="border p-2">
                  Status
                </th>

                <th className="border p-2">
                  Clicks
                </th>

                <th className="border p-2">
                  Credentials
                </th>
              </tr>
            </thead>

            <tbody>
              {campaignStats.map(
                (campaign: any) => (
                  <tr key={campaign.id}>
                    <td className="border p-2">
                      {campaign.name}
                    </td>

                    <td className="border p-2">
                      {campaign.status}
                    </td>

                    <td className="border p-2">
                      {campaign.clicks}
                    </td>

                    <td className="border p-2">
                      {campaign.credentials}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-[#081528] p-6 rounded-xl mt-10">
          <h2 className="text-2xl font-bold mb-4">
            Top Vulnerable Employees
          </h2>

          {topUsers.map((user: any) => (
            <div
              key={user.id}
              className="border p-3 mb-2 rounded"
            >
              <p>{user.name}</p>
              <p>{user.email}</p>
              <p>{user.risk}</p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}