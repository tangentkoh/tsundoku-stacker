import { Book } from "@/types/book";

// Google API のレスポンス構造を定義して 'any' を排除
interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
}

export const searchBooks = async (query: string): Promise<Book[]> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;
  // APIキーがあればURLに付与、なければそのまま（制限にかかりやすい）
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5${apiKey ? `&key=${apiKey}` : ""}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        console.error("リクエスト制限中です。しばらく時間を置いてください。");
      } else {
        console.error("APIレスポンスエラー:", response.status);
      }
      return [];
    }

    const data = await response.json();

    if (!data.items) {
      return [];
    }

    // item: any ではなく item: GoogleBookItem を指定
    return data.items.map((item: GoogleBookItem): Book => {
      const info = item.volumeInfo;
      return {
        id: item.id,
        title: info.title || "タイトル不明",
        authors: info.authors || ["著者不明"],
        thumbnail: info.imageLinks?.thumbnail
          ? info.imageLinks.thumbnail.replace("http://", "https://")
          : "https://placehold.jp/24/cccccc/ffffff/150x200.png?text=No%20Image",
        publishedDate: info.publishedDate || "",
        pageCount: info.pageCount || 0,
        isbn: info.industryIdentifiers?.[0]?.identifier || "ISBN不明",
        status: "unread",
        addedAt: new Date(),
      };
    });
  } catch (error) {
    console.error("検索中にエラーが発生しました:", error);
    return [];
  }
};
