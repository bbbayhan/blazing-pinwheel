import { useEffect, useState, useMemo } from 'react';
import type { Book, SortField, SortOrder } from '../types';
import { processImage } from '../services/ocr';
import { loadBooks, addBooks, deleteBook, updateBook } from '../services/storage';
import { Header } from '../components/Header';
import { UploadZone } from '../components/UploadZone';
import { BookList } from '../components/BookList';
import { Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [draftBooks, setDraftBooks] = useState<Book[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('dateAdded');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Load initial data
    useEffect(() => {
        loadBooks().then(setBooks);
    }, []);

    const handleUpload = async (files: File[]) => {
        setIsProcessing(true);
        try {
            // Process all files
            const results = await Promise.all(files.map(file => processImage(file)));
            const newDrafts = results.flat();
            setDraftBooks(prev => [...newDrafts, ...prev]);
        } catch (e) {
            console.error(e);
            alert('Failed to process images');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddToCollection = async () => {
        // 1. Add to DB
        await addBooks(draftBooks);
        // 2. Refresh local state (or optimistically update)
        const updated = await loadBooks();
        setBooks(updated);
        setDraftBooks([]);
        navigate('/list');
    };

    const handleDiscardDrafts = () => {
        if (confirm('Discard all drafts?')) {
            setDraftBooks([]);
        }
    };

    const handleDeleteDraft = (id: string) => {
        setDraftBooks(prev => prev.filter(b => b.id !== id));
    };

    const handleUpdateDraft = (id: string, updates: Partial<Book>) => {
        setDraftBooks(prev => prev.map(book => {
            if (book.id === id) {
                return { ...book, ...updates };
            }
            return book;
        }));
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this book?')) {
            await deleteBook(id);
            setBooks(prev => prev.filter(b => b.id !== id));
        }
    };

    const handleUpdateBook = async (id: string, updates: Partial<Book>) => {
        await updateBook(id, updates);
        setBooks(prev => prev.map(book => {
            if (book.id === id) {
                return { ...book, ...updates };
            }
            return book;
        }));
    };

    const filteredAndSortedBooks = useMemo(() => {
        let result = [...books];

        // Filter
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(b =>
                b.title.toLowerCase().includes(lower) ||
                b.author.toLowerCase().includes(lower)
            );
        }

        // Sort
        result.sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];

            // Handle strings
            if (typeof valA === 'string' && typeof valB === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [books, searchTerm, sortField, sortOrder]);

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return (
        <>
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />

            <main className="container">
                <UploadZone onUpload={handleUpload} isProcessing={isProcessing} />

                {draftBooks.length > 0 && (
                    <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid var(--accent)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>
                                Detected Books (Drafts)
                                <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                                    - Review before adding
                                </span>
                            </h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn-primary"
                                    onClick={handleAddToCollection}
                                >
                                    Add {draftBooks.length} Books to Collection & View List
                                </button>
                                <button
                                    className="btn-icon"
                                    onClick={handleDiscardDrafts}
                                    style={{ borderColor: '#ef4444', color: '#ef4444' }}
                                >
                                    Discard All
                                </button>
                            </div>
                        </div>
                        <BookList
                            books={draftBooks}
                            onDelete={handleDeleteDraft}
                            onUpdate={handleUpdateDraft}
                        />
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        My Collection
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                            ({filteredAndSortedBooks.length} books)
                        </span>
                    </h2>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn-icon"
                            onClick={() => navigate('/list')}
                        >
                            Switch to Table View
                        </button>
                        <button
                            className="btn-icon"
                            onClick={() => toggleSort('title')}
                            style={{ borderColor: sortField === 'title' ? 'var(--accent)' : 'var(--border)' }}
                        >
                            <Filter size={16} style={{ marginRight: '0.5rem' }} />
                            Sort by Title
                            {sortField === 'title' && (
                                <ArrowUpDown size={14} style={{ marginLeft: '0.5rem', opacity: 0.7 }} />
                            )}
                        </button>
                        <button
                            className="btn-icon"
                            onClick={() => toggleSort('dateAdded')}
                            style={{ borderColor: sortField === 'dateAdded' ? 'var(--accent)' : 'var(--border)' }}
                        >
                            <ArrowUpDown size={16} style={{ marginRight: '0.5rem' }} />
                            Recent
                        </button>
                    </div>
                </div>

                <BookList
                    books={filteredAndSortedBooks}
                    onDelete={handleDelete}
                    onUpdate={handleUpdateBook}
                />
            </main>

            <footer style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <p>BookKeeper &copy; {new Date().getFullYear()}</p>
            </footer>
        </>
    );
}

export default Home;
