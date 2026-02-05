"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // ログインしていなければログイン画面へ
    }
  }, [user, loading, router]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        読み込み中...
      </div>
    );
  if (!user) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-orange-600">Tsundoku-Stacker</h1>
      <p className="mt-4 text-xl">こんにちは、{user.email} さん！</p>

      <div className="mt-8">
        <Button variant="outline" onClick={() => signOut(auth)}>
          ログアウト
        </Button>
      </div>
    </main>
  );
}
