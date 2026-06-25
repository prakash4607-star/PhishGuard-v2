"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabase";

export default function PhishPage() {
  const [recorded, setRecorded] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    recordClick();
  }, []);

  async function recordClick() {
    try {
      const params = new URLSearchParams(
        window.location.search
      );

      const employeeId =
        params.get("employee_id");

      const campaignId =
        params.get("campaign_id");

      if (!employeeId || !campaignId)
        return;

      const { data: existing } =
        await supabase
          .from("phishing_results")
          .select("id")
          .eq(
            "employee_id",
            employeeId
          )
          .eq(
            "campaign_id",
            campaignId
          )
          .maybeSingle();

      if (!existing) {
        const { error } =
          await supabase
            .from("phishing_results")
            .insert([
              {
                employee_id:
                  employeeId,
                campaign_id:
                  campaignId,
                clicked_link: true,
                opened_email: true,
                submitted_credentials:
                  false,
              },
            ]);

        if (!error) {
          setRecorded(true);
        }
      } else {
        setRecorded(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function submitCredentials() {
    try {
      const params =
        new URLSearchParams(
          window.location.search
        );

      const employeeId =
        params.get("employee_id");

      const campaignId =
        params.get("campaign_id");

      if (!employeeId || !campaignId)
        return;

      await supabase
        .from("phishing_results")
        .update({
          submitted_credentials:
            true,
        })
        .eq(
          "employee_id",
          employeeId
        )
        .eq(
          "campaign_id",
          campaignId
        );

      alert(
        "This was a phishing simulation. Never enter credentials into suspicious websites."
      );

      setUsername("");
      setPassword("");
    } catch (err) {
      console.error(err);
    }
  }

  async function reportPhishing() {
    try {
      const params =
        new URLSearchParams(
          window.location.search
        );

      const employeeId =
        params.get("employee_id");

      const campaignId =
        params.get("campaign_id");

      if (!employeeId || !campaignId)
        return;

      await supabase
        .from("phishing_results")
        .update({
          reported_phishing: true,
        })
        .eq(
          "employee_id",
          employeeId
        )
        .eq(
          "campaign_id",
          campaignId
        );

      alert(
        "Excellent! You identified the phishing attempt."
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="min-h-screen bg-[#030B1A] text-white p-10">
      <h1 className="text-5xl font-bold text-red-500 mb-6">
        Phishing Awareness Training
      </h1>

      <p className="text-xl mb-6">
        You clicked a simulated
        phishing link.
      </p>

      {recorded && (
        <div className="bg-green-700 p-3 rounded mb-6">
          Interaction Recorded
          Successfully
        </div>
      )}

      <div className="bg-[#081528] p-6 rounded-xl mb-6">
        <h2 className="text-2xl font-bold mb-4">
          Login Required
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          className="border p-2 text-black w-full mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="border p-2 text-black w-full mb-4"
        />

        <button
          onClick={
            submitCredentials
          }
          className="bg-red-600 px-4 py-2 rounded"
        >
          Login
        </button>
        <button
          onClick={reportPhishing}
          className="bg-blue-600 px-4 py-2 rounded ml-3"
        >
          Report As Phishing
        </button>
      </div>

      <div className="bg-[#081528] p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-4">
          Warning Signs You Missed
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            Unexpected scholarship
            offer
          </li>
          <li>
            Urgent language designed
            to pressure you
          </li>
          <li>
            Unknown or suspicious
            sender
          </li>
          <li>
            Unverified links
          </li>
          <li>
            Possible request for
            sensitive information
          </li>
        </ul>
      </div>

      <div className="bg-[#081528] p-6 rounded-xl mt-6">
        <h2 className="text-2xl font-bold mb-4">
          Security Tips
        </h2>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            Always verify sender
            identity
          </li>
          <li>
            Check links before
            clicking
          </li>
          <li>
            Never share passwords
          </li>
          <li>
            Report suspicious emails
          </li>
          <li>
            Use Multi-Factor
            Authentication
          </li>
        </ul>
      </div>

      <button
        className="bg-green-600 px-6 py-3 rounded mt-8"
        onClick={() =>
          alert(
            "Great! Stay alert and report suspicious emails."
          )
        }
      >
        I Understand The Risks
      </button>
    </main>
  );
}