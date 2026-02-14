export type Book = {
  id: string; // Google Books APIなどのID
  title: string; // タイトル
  authors: string[]; // 著者（複数人の場合があるため配列）
  thumbnail: string; // 表紙画像のURL
  publishedDate?: string; // 出版日
  pageCount?: number; // ページ数
  isbn?: string; // ISBNコード（バーコード用）
  status: "unread" | "reading" | "read"; // 状態（積読、読書中、読了）
  addedAt: Date; // 登録日
};
