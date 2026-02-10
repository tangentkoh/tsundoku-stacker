"use client";

import { useState } from "react";
import { searchBooks } from "@/lib/bookApi";
import { Book } from "@/types/book";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext"; // 追加
import { addBookToFirestore } from "@/lib/db"; // 追加

export default function AddBook() {
  const { user } = useAuth(); // 現在ログインしているユーザーを取得
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    const books = await searchBooks(query);
    setResults(books);
  };

  const handleAdd = async (book: Book) => {
    if (!user) {
      alert("ログインが必要です");
      return;
    }

    setIsAdding(true);
    try {
      await addBookToFirestore(user.uid, book);
      alert(`「${book.title}」をスタックに追加しました！`);
      setResults([]); // 登録後は検索結果をクリア
      setQuery("");
    } catch {
      // No variable defined at all
      alert("保存に失敗しました。");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <div className="flex space-x-2">
        <Input
          placeholder="本を検索（タイトルやISBN）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Enterキー対応
        />
        <Button onClick={handleSearch}>検索</Button>
      </div>

      <div className="space-y-2">
        {results.map((book) => (
          <Card key={book.id} className="p-2 flex items-center space-x-4">
            <div className="relative w-12 h-16 flex-shrink-0">
              <Image
                src={book.thumbnail}
                alt={book.title}
                fill
                className="object-cover rounded"
                sizes="48px"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold line-clamp-1">{book.title}</h3>
              <p className="text-xs text-gray-500">{book.authors.join(", ")}</p>
            </div>
            <Button
              size="sm"
              onClick={() => handleAdd(book)}
              disabled={isAdding}
            >
              追加
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
