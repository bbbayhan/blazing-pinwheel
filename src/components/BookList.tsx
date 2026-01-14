import React from 'react';
import type { Book } from '../types';
import { Calendar, User } from 'lucide-react';

interface BookListProps {
    books: Book[];
    onDelete?: (id: string) => void; // Optional now, since unused in component
    onUpdate?: (id: string, updates: Partial<Book>) => void; // Optional
}

export const BookList: React.FC<BookListProps> = ({ books }) => {
    // Read-only mode
    if (books.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <p>No books in your library yet. Upload a photo to get started!</p>
            </div>
        );
    }

    return (
        <div className="grid-books">
            {books.map((book, index) => {
                return (
                    <div
                        key={book.id}
                        className="glass-panel card fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="card-img" style={{ position: 'relative' }}>
                            {book.coverUrl ? (
                                <img src={book.coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #e2e8f0, #f1f5f9)' }}>
                                    <span style={{ fontSize: '2rem', opacity: 0.5 }}>📚</span>
                                </div>
                            )}

                            {/* Actions removed for read-only view */}
                        </div>

                        <div className="card-body">
                            <h3 style={{ fontSize: '1.25rem', lineHeight: 1.4 }}>{book.title}</h3>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                <User size={14} />
                                <span>{book.author}</span>
                            </div>

                            {book.year && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                    <Calendar size={14} />
                                    <span>{book.year}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                <span style={{ opacity: 0.5 }}>Added: {new Date(book.dateAdded).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
