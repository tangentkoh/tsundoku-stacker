"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import AddBook from "@/components/AddBookModal";
import BookStack from "@/components/BookStack";
import AnimatedStack from "@/components/AnimatedStack";
import Stats from "@/components/Stats";
import { subscribeBooks } from "@/lib/db";
import { Book } from "@/types/book";
import { LogOut, BookOpen, Layers } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortKey = "added_desc" | "added_asc" | "title_asc" | "title_desc";
interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

export default function Home() {
  const { user, loading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortKey>("added_desc");

  // 1. Hookのルールに従い、useMemoを早期リターンの前に移動
  const sortedUnreadBooks = useMemo(() => {
    const unread = books.filter((b) => b.status === "unread");

    return [...unread].sort((a, b) => {
      // 引数の型を具体的に指定して any を排除
      const getTime = (
        date: Date | FirebaseTimestamp | string | null | undefined,
      ): number => {
        if (!date) return 0;

        // Firebase Timestamp型 (secondsプロパティがあるかチェック)
        if (typeof date === "object" && "seconds" in date) {
          return date.seconds * 1000;
        }

        // Dateオブジェクト
        if (date instanceof Date) {
          return date.getTime();
        }

        // 文字列（ISO 8601など）
        return new Date(date).getTime();
      };

      const timeA = getTime(a.addedAt);
      const timeB = getTime(b.addedAt);

      switch (sortBy) {
        case "added_desc":
          return timeB - timeA;
        case "added_asc":
          return timeA - timeB;
        case "title_asc":
          return a.title.localeCompare(b.title, "ja");
        case "title_desc":
          return b.title.localeCompare(a.title, "ja");
        default:
          return 0;
      }
    });
  }, [books, sortBy]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (user) {
      const unsubscribe = subscribeBooks(user.uid, (fetchedBooks) => {
        setBooks(fetchedBooks);
      });
      return () => unsubscribe();
    }
  }, [user, loading, router]);

  // 2. Hookの宣言が終わった後に早期リターンを置く
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50 text-orange-600 font-bold">
        読み込み中...
      </div>
    );
  if (!user) return null;

  const unreadBooks = books.filter((b) => b.status === "unread");
  const readBooks = books.filter((b) => b.status === "read");

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-20">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <Layers className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Tsundoku-Stacker
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut(auth)}
            className="text-gray-500 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ログアウト
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                分析
              </h2>
              <Stats books={books} />
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                新規登録
              </h2>
              <AddBook />
            </section>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-black text-gray-800 flex items-center justify-center gap-2">
                  <Layers className="text-orange-600" />
                  現在の積読状況
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  残りはあと{" "}
                  <span className="text-orange-600 font-bold text-lg">
                    {unreadBooks.length}
                  </span>{" "}
                  冊
                </p>
              </div>
              <AnimatedStack books={unreadBooks} />
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  スタックの詳細
                </h2>

                <Select
                  value={sortBy}
                  onValueChange={(value: SortKey) => setSortBy(value)}
                >
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="並べ替え" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="added_desc">
                      追加順 (新しい順)
                    </SelectItem>
                    <SelectItem value="added_asc">追加順 (古い順)</SelectItem>
                    <SelectItem value="title_asc">
                      タイトル (A-Z/あ-ん)
                    </SelectItem>
                    <SelectItem value="title_desc">
                      タイトル (Z-A/ん-あ)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ソート済みの配列を渡す */}
              <BookStack books={sortedUnreadBooks} />
            </section>

            {readBooks.length > 0 && (
              <section className="pt-10 border-t border-gray-200">
                <h2 className="text-lg font-bold text-gray-400 mb-4 flex items-center gap-2">
                  ✅ 読了した本
                </h2>
                <div className="flex flex-wrap gap-2 opacity-70">
                  {readBooks.map((book) => (
                    <div
                      key={book.id}
                      className="text-[10px] bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm text-gray-600"
                    >
                      {book.title}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
