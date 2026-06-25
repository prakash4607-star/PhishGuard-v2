"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../src/lib/supabase";

export default function LoginPage() {
  const [email,setEmail] =
    useState("");

  const [password,setPassword] =
    useState("");

  const router = useRouter();

  async function login() {

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if(error){
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="border p-8 rounded-lg w-96">
        <h1 className="text-3xl font-bold mb-6">
          PhishGuard Login
        </h1>

        <input
          className="border p-2 w-full mb-4 text-black"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          className="border p-2 w-full mb-4 text-black"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={login}
          className="bg-green-600 w-full py-2 rounded"
        >
          Login
        </button>
      </div>
    </main>
  );
}