"use client";

import { Book } from "@/types/book";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function Stats({ books }: { books: Book[] }) {
  const unreadCount = books.filter((b) => b.status === "unread").length;
  const readCount = books.filter((b) => b.status === "read").length;

  const data = [
    { name: "未読", value: unreadCount },
    { name: "読了", value: readCount },
  ];

  const COLORS = ["#ea580c", "#16a34a"];

  // データが空の時のためのフォールバック（グラフが壊れないように）
  if (books.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        データがありません
      </div>
    );
  }

  return (
    // 親の div にしっかりとした高さを指定し、相対位置（relative）にします
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1000} // アニメーションを安定させる
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
