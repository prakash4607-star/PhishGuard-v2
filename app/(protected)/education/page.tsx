"use client";

import Link from "next/link";

export default function EducationPage() {
  return (
    <main className="min-h-screen bg-[#030B1A] text-white flex items-center justify-center">

      <div className="max-w-3xl bg-[#081528] border border-[#14243d] rounded-2xl p-10">

        <h1 className="text-4xl font-bold text-red-500 mb-6">
          ⚠️ Phishing Awareness Training
        </h1>

        <p className="text-lg mb-6">
          You interacted with a simulated phishing campaign.
        </p>

        <div className="space-y-4">

          <div>
            <h2 className="font-bold text-xl">
              Warning Signs You Missed
            </h2>

            <ul className="list-disc ml-6 mt-2">
              <li>Urgent language</li>
              <li>Unexpected request</li>
              <li>Suspicious sender</li>
              <li>Unverified links</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-xl">
              Security Tips
            </h2>

            <ul className="list-disc ml-6 mt-2">
              <li>Verify sender identity</li>
              <li>Check domains carefully</li>
              <li>Hover over links before clicking</li>
              <li>Report suspicious emails</li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-xl">
              Learn More
            </h2>

            <p className="mt-2">
              Always verify scholarship, placement,
              fee payment and login requests through
              official college channels.
            </p>
          </div>

        </div>

        <Link href="/dashboard">
          <button className="bg-blue-600 px-5 py-3 rounded mt-8">
            Return to Dashboard
          </button>
        </Link>

      </div>

    </main>
  );
}