import React from 'react';
import { BookOpen, Search, Cloud } from 'lucide-react';

interface HeaderProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchTerm, onSearchChange }) => {
    return (
        <header className="glass-panel" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderRadius: '0 0 1rem 1rem',
            marginBottom: '2rem'
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 2rem' }}>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '250px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            style={{ paddingLeft: '2.5rem', paddingRight: '1rem', fontSize: '0.875rem' }}
                        />
                    </div>

                    <a href="/list" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, opacity: 0.8, transition: 'opacity 0.2s' }}>
                        List View
                    </a>

                    <button
                        className="btn-primary"
                        onClick={() => alert('Google Drive / Excel export feature coming soon!')}
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'none', color: 'white' }}
                    >
                        <Cloud size={16} />
                        <span style={{ marginLeft: '0.5rem' }}>Export</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
