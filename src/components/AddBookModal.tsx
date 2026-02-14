"use client";

import { useState } from "react";
import { searchBooks } from "@/lib/bookApi";
import { Book } from "@/types/book";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { addBookToFirestore } from "@/lib/db";
import Scanner from "./Scanner";

export default function AddBook() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    const books = await searchBooks(query);
    setResults(books);
  };

  const handleBarcodeDetected = async (code: string) => {
    setShowScanner(false); // スキャン成功したら閉じる
    setQuery(code);
    const books = await searchBooks(code);
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
      setResults([]);
      setQuery("");
    } catch {
      alert("保存に失敗しました。");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      {/* 1. 検索バーセクション */}
      <div className="flex space-x-2">
        <Input
          placeholder="本を検索（タイトルやISBN）"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch}>検索</Button>
      </div>

      {/* 2. スキャナー切り替えボタン */}
      <Button
        variant="secondary"
        onClick={() => setShowScanner(!showScanner)}
        className="w-full border-dashed border-2"
      >
        {showScanner ? "スキャナーを閉じる" : "📷 バーコードをスキャンする"}
      </Button>

      {/* 3. スキャナー本体の表示 */}
      {showScanner && (
        <div className="mt-4 border-2 border-orange-500 rounded-lg p-1 overflow-hidden">
          <Scanner onDetected={handleBarcodeDetected} />
          <p className="text-[10px] text-center text-gray-500 mt-2">
            本の裏表紙にある上側のバーコードをかざしてください
          </p>
        </div>
      )}

      {/* 4. 検索結果リスト */}
      <div className="space-y-2 mt-4">
        {results.map((book) => (
          <Card key={book.id} className="p-2 flex items-center space-x-4">
            <div className="relative w-12 h-16 flex-shrink-0">
              <Image
                src={book.thumbnail}
                alt={book.title}
                fill
                className="object-cover rounded"
                sizes="48px"
                unoptimized
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
