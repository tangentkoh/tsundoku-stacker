"use client";

import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chrome } from "lucide-react"; // アイコン用

export default function AuthForm() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      console.error("Googleログインエラー:", error);
    }
  };

  return (
    <Card className="w-[350px] shadow-xl border-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-black text-orange-600">
          Tsundoku-Stacker
        </CardTitle>
        <CardDescription>Googleアカウントですぐに始められます</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-700 border hover:bg-gray-50 font-bold"
        >
          <Chrome className="w-4 h-4 mr-2 text-blue-500" />
          Googleでサインイン
        </Button>
      </CardContent>
    </Card>
  );
}
