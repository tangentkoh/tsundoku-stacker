"use client";

import { Book } from "@/types/book";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // 追加
//import { Check } from "lucide-react"; // アイコン（任意：npm install lucide-react が必要）
import { updateBookStatus } from "@/lib/db";

export default function BookStack({ books }: { books: Book[] }) {
  if (books.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        まだ本がありません。
      </div>
    );
  }

  const handleComplete = async (bookId: string) => {
    if (confirm("この本を読み終わりましたか？")) {
      await updateBookStatus(bookId, "read");
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-4xl mt-8">
      {books.map((book) => (
        <Card
          key={book.id}
          className="p-3 flex flex-col items-center space-y-2 relative group overflow-hidden"
        >
          {/* 画像部分 */}
          <div className="relative w-full aspect-[3/4] shadow-md">
            <Image
              src={book.thumbnail}
              alt={book.title}
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>

          <h3 className="text-xs font-bold line-clamp-2 h-8 text-center">
            {book.title}
          </h3>

          {/* 読了ボタン（ホバー時に表示、または常に表示） */}
          <Button
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-[10px] h-8"
            onClick={() => handleComplete(book.id)}
          >
            読了！
          </Button>
        </Card>
      ))}
    </div>
  );
}
