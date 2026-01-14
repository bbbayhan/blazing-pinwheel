import { useEffect, useState, useMemo } from 'react';
import type { Book, SortField, SortOrder } from '../types';
import { loadBooks } from '../services/storage';
import { Header } from '../components/Header';
import { BookList } from '../components/BookList';
import { Filter, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../utils/export';

function Home() {
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('dateAdded');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Load initial data
    useEffect(() => {
        loadBooks().then(setBooks);
    }, []);

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
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} onExport={() => exportToExcel(books)} />

            <main className="container">
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
                />
            </main>

            <footer style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <p>BookKeeper &copy; {new Date().getFullYear()}</p>
            </footer>
        </>
    );
}

export default Home;
