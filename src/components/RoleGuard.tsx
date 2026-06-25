"use client";

import { useEffect, useState } from "react";
import { getRole } from "../lib/getRole";

export default function RoleGuard({
  allowedRole,
  children,
}: any) {
  const [allowed, setAllowed] =
    useState(false);

  useEffect(() => {
    checkRole();
  }, []);

  async function checkRole() {
    const role =
      await getRole();

    setAllowed(
      role === allowedRole
    );
  }

  if (!allowed) {
    return (
      <div className="p-10">
        Access Denied
      </div>
    );
  }

  return children;
}