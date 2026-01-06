import type { Book } from '../types';

const API_URL = 'http://localhost:3001/api/books';

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
    // No-op for now as we are moving to individual API calls
    // or we can implement a bulk sync if needed.
    // But standard pattern is to use API calls on action (add/delete/update)
    // rather than syncing the whole state "onChange".
};

export const addBook = async (book: Book) => {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
    });
};

export const addBooks = async (books: Book[]) => {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(books),
    });
};

export const updateBook = async (id: string, updates: Partial<Book>) => {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
};

export const deleteBook = async (id: string) => {
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
};
