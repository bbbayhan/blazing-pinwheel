import React, { useState } from 'react';
import type { Book } from '../types';
import { Calendar, User, Trash2, Edit2, Check, X } from 'lucide-react';

interface BookListProps {
    books: Book[];
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Book>) => void;
}

export const BookList: React.FC<BookListProps> = ({ books, onDelete, onUpdate }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Book>>({});

    const startEditing = (book: Book) => {
        setEditingId(book.id);
        setEditForm({ title: book.title, author: book.author, year: book.year || '' });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEditing = (id: string) => {
        onUpdate(id, editForm);
        setEditingId(null);
        setEditForm({});
    };

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
                const isEditing = editingId === book.id;

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
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #1e293b, #0f172a)' }}>
                                    <span style={{ fontSize: '2rem', opacity: 0.2 }}>📚</span>
                                </div>
                            )}

                            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                {!isEditing && (
                                    <>
                                        <button
                                            onClick={() => startEditing(book)}
                                            className="btn-icon"
                                            style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white' }}
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(book.id)}
                                            className="btn-icon"
                                            style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#ef4444' }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="card-body">
                            {isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Title"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        value={editForm.author}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, author: e.target.value }))}
                                        placeholder="Author"
                                    />
                                    <input
                                        type="text"
                                        value={editForm.year}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, year: e.target.value }))}
                                        placeholder="Year"
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <button
                                            onClick={() => saveEditing(book.id)}
                                            className="btn-primary"
                                            style={{ flex: 1, padding: '0.5rem', justifyContent: 'center' }}
                                        >
                                            <Check size={16} /> Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="btn-icon"
                                            style={{ flex: 1, justifyContent: 'center' }}
                                        >
                                            <X size={16} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
