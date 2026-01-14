import {
    collection,
    doc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from 'firebase/firestore';
import { db } from '../firebase-config';
import type { Book } from '../types';

const COLLECTION_NAME = 'books';

export const loadBooks = async (): Promise<Book[]> => {
    if (!db) {
        console.warn("Firestore not initialized");
        return [];
    }
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('dateAdded', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => d.data() as Book);
    } catch (e) {
        console.error("Error loading books from Firestore:", e);
        return [];
    }
};

export const saveBooks = async () => {
    // No-op
};

export const addBook = async (book: Book) => {
    if (!db) return;
    try {
        // We use setDoc with book.id so we control the ID (consistent with previous behavior)
        await setDoc(doc(db, COLLECTION_NAME, book.id), book);
    } catch (e) {
        console.error("Error adding book to Firestore:", e);
        throw e;
    }
};

export const addBooks = async (books: Book[]) => {
    if (!db) return;
    // For large batches, writeBatch should be used, but for simplicity:
    await Promise.all(books.map(book => addBook(book)));
};

export const updateBook = async (id: string, updates: Partial<Book>) => {
    if (!db) return;
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
        await updateDoc(docRef, updates);
    } catch (e) {
        console.error("Error updating book in Firestore:", e);
        throw e;
    }
};

export const deleteBook = async (id: string) => {
    if (!db) return;
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (e) {
        console.error("Error deleting book from Firestore:", e);
        throw e;
    }
};

