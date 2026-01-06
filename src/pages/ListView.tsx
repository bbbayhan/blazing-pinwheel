import { useEffect, useState } from 'react';
import type { Book } from '../types';
import { loadBooks, deleteBook, updateBook } from '../services/storage';
import { Header } from '../components/Header';
import { Trash2, Edit2, Check, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ListView() {
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Book>>({});
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    useEffect(() => {
        loadBooks().then(setBooks);
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this book?')) {
            await deleteBook(id);
            setBooks(prev => prev.filter(b => b.id !== id));
        }
    };

    const startEditing = (book: Book) => {
        setEditingId(book.id);
        setEditForm({ title: book.title, author: book.author, year: book.year || '' });
    };

    const saveEditing = async (id: string) => {
        await updateBook(id, editForm);
        setBooks(prev => prev.map(b => b.id === id ? { ...b, ...editForm } : b));
        setEditingId(null);
        setEditForm({});
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({});
    };

    const filteredBooks = books.filter(b =>
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            <main className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        className="btn-icon"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Gallery
                    </button>
                    <h2 style={{ margin: 0 }}>All Books (List View)</h2>
                </div>

                <div className="glass-panel" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cover</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Title</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Author</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Year</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBooks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No books found.</td>
                                </tr>
                            ) : filteredBooks.map((book) => {
                                const isEditing = editingId === book.id;
                                return (
                                    <tr key={book.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', width: '80px' }}>
                                            {book.coverUrl && (
                                                <img
                                                    src={book.coverUrl}
                                                    alt="cover"
                                                    style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', cursor: 'zoom-in' }}
                                                    onClick={() => setZoomedImage(book.coverUrl!)}
                                                />
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {isEditing ? (
                                                <input
                                                    value={editForm.title || ''}
                                                    onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                                                    autoFocus
                                                />
                                            ) : (
                                                <span style={{ fontWeight: 600 }}>{book.title}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {isEditing ? (
                                                <input
                                                    value={editForm.author || ''}
                                                    onChange={e => setEditForm(p => ({ ...p, author: e.target.value }))}
                                                />
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)' }}>{book.author}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {isEditing ? (
                                                <input
                                                    value={editForm.year || ''}
                                                    onChange={e => setEditForm(p => ({ ...p, year: e.target.value }))}
                                                    style={{ width: '80px' }}
                                                />
                                            ) : (
                                                <span>{book.year}</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {isEditing ? (
                                                    <>
                                                        <button className="btn-primary" style={{ padding: '0.5rem' }} onClick={() => saveEditing(book.id)}>
                                                            <Check size={16} />
                                                        </button>
                                                        <button className="btn-icon" onClick={cancelEditing}>
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button className="btn-icon" onClick={() => startEditing(book)}>
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => handleDelete(book.id)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>

            {zoomedImage && (
                <div
                    onClick={() => setZoomedImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-out',
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <img
                        src={zoomedImage}
                        alt="Zoomed Cover"
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90vh',
                            borderRadius: '8px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            transform: 'scale(1)',
                            transition: 'transform 0.3s ease'
                        }}
                    />
                </div>
            )}
        </>
    );
}

export default ListView;
