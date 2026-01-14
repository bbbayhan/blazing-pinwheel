import React, { useRef } from 'react';
import { BookOpen, Search, Cloud, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { importFromExcel } from '../utils/import';
import { addBooks } from '../services/storage';

interface HeaderProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange, onExport }) => {
    const { user, login, logout } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (confirm(`Import books from "${file.name}"? This will add them to your collection.`)) {
            try {
                const books = await importFromExcel(file);
                await addBooks(books);
                alert(`Successfully imported ${books.length} books! Refreshing page...`);
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert('Failed to import books. Please check the file format.');
            }
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <header className="glass-panel" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderRadius: '0 0 1rem 1rem',
            marginBottom: '2rem'
        }}>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
            />

            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            display: 'flex'
                        }}>
                            <BookOpen color="#0f172a" size={24} />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(to right, white, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                            BookKeeper
                        </h1>
                    </div>

                    <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <a href="/list" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>List View</a>

                        <button
                            className="btn-primary"
                            onClick={handleImportClick}
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'none', color: 'white' }}
                        >
                            <Upload size={16} />
                            <span className="btn-text" style={{ marginLeft: '0.5rem' }}>Import</span>
                        </button>

                        <button
                            className="btn-primary"
                            onClick={onExport}
                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'none', color: 'white' }}
                        >
                            <Cloud size={16} />
                            <span className="btn-text" style={{ marginLeft: '0.5rem' }}>Export</span>
                        </button>

                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src={user.photoURL || ''} alt="User" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                <button onClick={() => logout()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}>Logout</button>
                            </div>
                        ) : (
                            <button onClick={login} className="btn-primary">Login</button>
                        )}
                    </div>
                </div>

                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        style={{ paddingLeft: '2.5rem', paddingRight: '1rem', fontSize: '0.875rem', width: '100%' }}
                    />
                </div>

                {/* Mobile Actions Only */}
                <div className="mobile-actions" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                    <a href="/list" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Go to List View</a>
                    <button
                        onClick={handleImportClick}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <Upload size={20} />
                    </button>
                    <button
                        onClick={onExport}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <Cloud size={20} />
                    </button>
                </div>

            </div>
            <style>{`
        @media (min-width: 769px) {
           .container { flex-direction: row !important; align-items: center !important; justify-content: space-between !important; }
           .desktop-actions { display: flex !important; }
           .mobile-actions { display: none !important; }
           input { width: 250px !important; }
        }
        @media (max-width: 768px) {
           .desktop-actions { display: none !important; }
           .mobile-actions { display: flex !important; }
           .btn-text { display: none; }
        }
      `}</style>
        </header>
    );
};
