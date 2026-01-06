import React, { useCallback, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

interface UploadZoneProps {
    onUpload: (files: File[]) => Promise<void>;
    isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, isProcessing }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (isProcessing) return;

        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length > 0) {
            onUpload(files);
        }
    }, [onUpload, isProcessing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            onUpload(Array.from(e.target.files));
        }
    };

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`glass-panel fade-in`}
            style={{
                padding: '3rem',
                textAlign: 'center',
                borderStyle: 'dashed',
                borderWidth: '2px',
                borderColor: isDragOver ? 'var(--accent)' : 'var(--border)',
                cursor: isProcessing ? 'wait' : 'pointer',
                transition: 'all 0.3s',
                marginBottom: '3rem',
                background: isDragOver ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-card)'
            }}
        >
            <input
                type="file"
                id="file-upload"
                hidden
                multiple
                accept="image/*"
                onChange={handleChange}
                disabled={isProcessing}
            />
            <label htmlFor="file-upload" style={{ cursor: isProcessing ? 'wait' : 'pointer' }}>
                <div style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    {isProcessing ? (
                        <Loader2 size={40} className="animate-spin" color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <UploadCloud size={40} color="var(--accent)" />
                    )}
                </div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    {isProcessing ? 'Analyzing Books...' : 'Drop book photos here'}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {isProcessing ? 'Extracting titles and authors via AI...' : 'or click to browse from your device'}
                </p>
            </label>
            <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};
