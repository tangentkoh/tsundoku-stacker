"use client";

import { Book } from "@/types/book";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function AnimatedStack({ books }: { books: Book[] }) {
  return (
    <div className="flex flex-col-reverse items-center w-full max-w-sm mx-auto">
      <AnimatePresence>
        {books.map((book, index) => (
          <motion.div
            key={book.id}
            layout // レイアウト変更を自動アニメーション化
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            // 本が重なっているように見せるためのスタイル
            className="relative w-64 h-12 border-b border-gray-400 bg-white shadow-md flex items-center px-4 cursor-pointer hover:bg-orange-50 transition-colors"
            style={{
              zIndex: books.length - index,
              marginBottom: "-4px", // 少し重ねる
              borderRadius: "2px 8px 8px 2px", // 背表紙っぽく
              borderLeft: "8px solid #e5e7eb", // 本の厚み感
            }}
          >
            {/* 修正後：明示的なサイズ指定 */}
            <div className="flex-shrink-0 mr-3">
              <Image
                src={book.thumbnail}
                alt=""
                width={32} // 8 * 4 = 32px
                height={40} // 10 * 4 = 40px
                className="object-cover rounded-sm shadow-sm"
                unoptimized
              />
            </div>
            <span className="text-[10px] font-bold truncate flex-1">
              {book.title}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
      {/* スタックの土台 */}
      <div className="w-72 h-4 bg-gray-300 rounded-full shadow-inner mt-2"></div>
    </div>
  );
}
