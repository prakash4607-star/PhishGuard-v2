"use client";

import Sidebar from "../../src/components/Sidebar";

export default function UserGuidePage() {
  return (
    <main className="min-h-screen bg-[#030B1A] text-white flex">
      <Sidebar />

      <div className="flex-1 p-10">

        <h1 className="text-4xl font-bold mb-8">
          User Guide
        </h1>

        <div className="bg-[#081528] p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Introduction
          </h2>

          <p>
            PhishGuard is a phishing awareness and
            simulation platform designed for educational
            institutions. It helps administrators create
            controlled phishing campaigns and measure
            awareness levels among users.
          </p>
        </div>

        <div className="bg-[#081528] p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Step 1 - Login
          </h2>

          <ul className="list-disc pl-6">
            <li>Open PhishGuard</li>
            <li>Enter your credentials</li>
            <li>Login as Admin</li>
          </ul>
        </div>

        <div className="bg-[#081528] p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Step 2 - Add Authorization
          </h2>

          <ul className="list-disc pl-6">
            <li>Open Authorization Management</li>
            <li>Add institution details</li>
            <li>Add approved domains</li>
            <li>Save authorization</li>
          </ul>
        </div>

        <div className="bg-[#081528] p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Step 3 - Add Recipients
          </h2>

          <ul className="list-disc pl-6">
            <li>Add recipients manually</li>
            <li>Or upload CSV file</li>
            <li>Verify approved domains</li>
          </ul>
        </div>

        <div className="bg-[#081528] p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Step 4 - Create Campaign
          </h2>

          <ul className="list-disc pl-6">
            <li>Select template</li>
            <li>Select approved domain</li>
            <li>Schedule or launch campaign</li>
          </ul>
        </div>

        <div className="bg-[#081528] p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-4">
            Step 5 - Monitor Results
          </h2>

          <ul className="list-disc pl-6">
            <li>Open Analytics Dashboard</li>
            <li>Review click rate</li>
            <li>Review awareness score</li>
            <li>Export CSV report</li>
          </ul>
        </div>

        <div className="bg-[#081528] p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">
            Security Notice
          </h2>

          <ul className="list-disc pl-6">
            <li>Never collect passwords</li>
            <li>Only run approved campaigns</li>
            <li>Use approved domains only</li>
            <li>Review audit logs regularly</li>
          </ul>
        </div>

      </div>
    </main>
  );
}