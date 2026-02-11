import { db } from "./firebase";
import {
  collection,
  setDoc,
  serverTimestamp,
  query,
  where,
  //getDocs,
} from "firebase/firestore";
import { Book } from "@/types/book";
import { onSnapshot, orderBy } from "firebase/firestore";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";

// 本をFirestoreに保存する関数
export const addBookToFirestore = async (userId: string, book: Book) => {
  try {
    // addDoc (ランダムID) ではなく setDoc (指定ID) を使う
    // book.id は Google Books の ID なので、それをドキュメント名にする
    const bookRef = doc(db, "books", book.id);

    const bookData = {
      ...book,
      userId,
      addedAt: serverTimestamp(),
    };

    await setDoc(bookRef, bookData);
    return book.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

// ユーザーに紐づく本をリアルタイムで取得する関数
export const subscribeBooks = (
  userId: string,
  callback: (books: Book[]) => void,
) => {
  const q = query(
    collection(db, "books"),
    where("userId", "==", userId),
    orderBy("addedAt", "desc"), // 新しい順に並べる
  );

  // onSnapshot を使うと、データが更新されるたびに callback が呼ばれる
  return onSnapshot(q, (snapshot) => {
    const books = snapshot.docs.map((doc) => ({
      ...doc.data(), // 先にばらす
      id: doc.id,
    })) as Book[];
    callback(books);
  });
};

// 本のステータスを更新する関数
export const updateBookStatus = async (
  bookId: string,
  newStatus: Book["status"],
) => {
  try {
    const bookRef = doc(db, "books", bookId);
    await updateDoc(bookRef, {
      status: newStatus,
      // 読み終わった時間を記録したい場合はここに追加してもOK
      // completedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating status: ", error);
    throw error;
  }
};

// もし「間違えて登録したから消したい」時のための削除関数
export const deleteBookFromFirestore = async (bookId: string) => {
  try {
    await deleteDoc(doc(db, "books", bookId));
  } catch (error) {
    console.error("Error deleting book: ", error);
    throw error;
  }
};
