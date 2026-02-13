"use client";

import { useState, useEffect } from "react"; // 追加
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import AddBook from "@/components/AddBookModal";
import BookStack from "@/components/BookStack"; // 追加
import { subscribeBooks } from "@/lib/db"; // 追加
import { Book } from "@/types/book"; // 追加

export default function Home() {
  const { user, loading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]); // 追加
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    // ログインしていれば、本の監視を開始
    if (user) {
      const unsubscribe = subscribeBooks(user.uid, (fetchedBooks) => {
        setBooks(fetchedBooks);
      });
      return () => unsubscribe(); // 画面を閉じたら監視を止める
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
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-gray-50">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-orange-600">Tsundoku-Stacker</h1>
        <Button variant="ghost" size="sm" onClick={() => signOut(auth)}>
          ログアウト
        </Button>
      </header>

      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-sm mb-10">
        <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
          新しい本を追加
        </h2>
        <AddBook />
      </div>

      <div className="w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          📚 未読スタック
          <span className="ml-3 text-sm font-normal text-gray-500">
            ({books.filter((b) => b.status === "unread").length} 冊)
          </span>
        </h2>

        {/* status が 'unread' の本だけを渡す */}
        <BookStack books={books.filter((b) => b.status === "unread")} />
      </div>

      {/* (オプション) 読み終わった本を表示するセクションも作れます */}
      <div className="w-full max-w-4xl mt-16 opacity-60">
        <h2 className="text-xl font-bold mb-4">✅ 読了した本</h2>
        <div className="flex flex-wrap gap-2">
          {books
            .filter((b) => b.status === "read")
            .map((book) => (
              <div
                key={book.id}
                className="text-[10px] bg-gray-200 p-1 rounded"
              >
                {book.title}
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
