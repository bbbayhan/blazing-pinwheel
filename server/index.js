const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Higher limit for Base64 images

// Database Setup
const dbPath = path.resolve(__dirname, 'books.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create Table
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT,
      author TEXT,
      year TEXT,
      coverUrl TEXT,
      dateAdded INTEGER
    )
  `);
});

// Routes

// GET all books
app.get('/api/books', (req, res) => {
    db.all('SELECT * FROM books ORDER BY dateAdded DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST new books (Bulk or Single)
app.post('/api/books', (req, res) => {
    const books = Array.isArray(req.body) ? req.body : [req.body];

    const stmt = db.prepare('INSERT INTO books (id, title, author, year, coverUrl, dateAdded) VALUES (?, ?, ?, ?, ?, ?)');

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        try {
            books.forEach(book => {
                stmt.run(book.id, book.title, book.author, book.year || '', book.coverUrl, book.dateAdded);
            });
            db.run('COMMIT');
            res.json({ message: 'Books added successfully', count: books.length });
        } catch (e) {
            db.run('ROLLBACK');
            res.status(500).json({ error: e.message });
        }
        stmt.finalize();
    });
});

// PUT update book
app.put('/api/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, year, coverUrl } = req.body;

    // Build dynamic update query
    // Simple version for now: update all fields provided
    db.run(
        `UPDATE books SET title = COALESCE(?, title), author = COALESCE(?, author), year = COALESCE(?, year), coverUrl = COALESCE(?, coverUrl) WHERE id = ?`,
        [title, author, year, coverUrl, id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Book updated', changes: this.changes });
        }
    );
});

// DELETE book
app.delete('/api/books/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM books WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Book deleted', changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
