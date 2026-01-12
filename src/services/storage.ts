import type { Book } from '../types';
import { auth } from '../firebase-config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/books';

const getAuthHeaders = async () => {
    const token = await auth?.currentUser?.getIdToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const loadBooks = async (): Promise<Book[]> => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch books');
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
};

export const saveBooks = async () => {
    // No-op
};

export const addBook = async (book: Book) => {
    await fetch(API_URL, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(book),
    });
};

export const addBooks = async (books: Book[]) => {
    await fetch(API_URL, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(books),
    });
};

export const updateBook = async (id: string, updates: Partial<Book>) => {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(updates),
    });
};

export const deleteBook = async (id: string) => {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
    });
};

