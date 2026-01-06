export interface Book {
    id: string;
    title: string;
    author: string;
    year?: string;
    coverUrl?: string;
    dateAdded: number; // timestamp
}

export type SortField = 'dateAdded' | 'title' | 'author';
export type SortOrder = 'asc' | 'desc';
