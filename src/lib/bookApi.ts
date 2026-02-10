import { Book } from "@/types/book";

// APIレスポンスの型を定義
interface GoogleBooksResponse {
  items?: {
    id: string;
    volumeInfo: {
      title: string;
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
  }[];
}

export const searchBooks = async (query: string): Promise<Book[]> => {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`,
  );
  const data: GoogleBooksResponse = await response.json(); // anyを回避

  if (!data.items) return [];

  return data.items.map((item) => ({
    id: item.id,
    title: item.volumeInfo.title,
    authors: item.volumeInfo.authors || ["不明"],
    thumbnail:
      item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://") ||
      "/no-image.png",
    publishedDate: item.volumeInfo.publishedDate,
    pageCount: item.volumeInfo.pageCount,
    isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
    status: "unread",
    addedAt: new Date(),
  }));
};
