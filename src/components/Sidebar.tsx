"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { getRole } from "../lib/getRole";

export default function Sidebar() {
  const pathname = usePathname();

  const [role, setRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadRole();
  }, []);

  async function loadRole() {
    const userRole = await getRole();
    setRole(userRole || "");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const menu = [
    {
      name: "Dashboard",
      href: "/dashboard",
    },
    {
      name: "Campaigns",
      href: "/campaigns",
    },
    {
      name: "User Guide",
      href: "/user-guide",
    },
    {
      name: "Templates",
      href: "/templates",
    },
    {
      name: "Recipients",
      href: "/recipients",
    },
    ...(role === "super_admin"
      ? [
          {
            name: "Authorizations",
            href: "/authorizations",
          },
          {
            name: "Audit Logs",
            href: "/audit-logs",
          },
        ]
      : []),
    {
      name: "Analytics",
      href: "/analytics",
    },
  ];

  return (
    <aside className="w-72 min-h-screen bg-[#071224] border-r border-[#14243d] p-6 flex flex-col">

      <h1 className="text-3xl font-bold text-white mb-10">
        PhishGuard
      </h1>

      <div className="space-y-2 flex-1">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
          >
            <div
              className={`p-3 rounded-xl transition cursor-pointer ${
                pathname === item.href
                  ? "bg-[#10203A] text-blue-400"
                  : "text-white hover:bg-[#10203A]"
              }`}
            >
              {item.name}
            </div>
          </Link>
        ))}
      </div>

      <div className="border-t border-[#14243d] pt-4 mt-6">
        <p className="text-xs text-slate-400">
          Role
        </p>

        <p
          className={`font-semibold ${
            role === "super_admin"
              ? "text-green-400"
              : "text-blue-400"
          }`}
        >
          {role || "Loading..."}
        </p>

        <button
          onClick={logout}
          className="bg-red-600 p-2 rounded mt-4"
        >
          Logout
        </button>
      </div>

    </aside>
  );
}