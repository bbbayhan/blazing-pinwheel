require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

// Database libraries
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;
const DB_MODE = process.env.DATABASE_URL ? 'POSTGRES' : 'SQLITE';

console.log(`Starting server in ${DB_MODE} mode.`);

// --- Firebase Admin Setup ---
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized with service account.");
    } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e);
    }
} else {
    try {
        admin.initializeApp();
        console.log("Firebase Admin initialized (default credentials).");
    } catch (e) {
        console.warn("Firebase Admin not initialized. Auth checks will fail if enabled.");
    }
}

// --- Database Setup ---
let dbPostgres;
let dbSqlite;

if (DB_MODE === 'POSTGRES') {
    dbPostgres = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
} else {
    const dbPath = path.resolve(__dirname, 'books.db');
    dbSqlite = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('Could not connect to SQLite database', err);
        else console.log('Connected to SQLite database at', dbPath);
    });
}

// Helper: Run Query
const runQuery = async (queryType, sqlPg, sqlSqlite, params = []) => {
    if (DB_MODE === 'POSTGRES') {
        // Postgres
        const result = await dbPostgres.query(sqlPg, params);
        return result;
    } else {
        // SQLite (Promisified)
        return new Promise((resolve, reject) => {
            if (queryType === 'ALL') {
                dbSqlite.all(sqlSqlite, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve({ rows });
                });
            } else if (queryType === 'RUN') {
                dbSqlite.run(sqlSqlite, params, function (err) {
                    if (err) reject(err);
                    else resolve({ rows: [], rowCount: this.changes });
                });
            }
        });
    }
}

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Auth Middleware
const requireAuth = async (req, res, next) => {
    if (req.method === 'GET') return next(); // Allow read-only

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const adminEmail = process.env.ADMIN_EMAIL;

        // Strict Admin Check
        if (adminEmail && decodedToken.email !== adminEmail) {
            console.log(`Access denied for ${decodedToken.email}. Expected ${adminEmail}`);
            return res.status(403).json({ error: 'Forbidden: You are not the admin.' });
        }

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
};

app.use('/api/books', requireAuth);

// --- Init DB ---
const initDb = async () => {
    try {
        if (DB_MODE === 'POSTGRES') {
            await runQuery('RUN', `
                CREATE TABLE IF NOT EXISTS books (
                    "id" TEXT PRIMARY KEY,
                    "title" TEXT,
                    "author" TEXT,
                    "year" TEXT,
                    "coverUrl" TEXT,
                    "dateAdded" BIGINT
                )
            `);
        } else {
            // SQLite
            await runQuery('RUN', 'RUN', `
                CREATE TABLE IF NOT EXISTS books (
                  id TEXT PRIMARY KEY,
                  title TEXT,
                  author TEXT,
                  year TEXT,
                  coverUrl TEXT,
                  dateAdded INTEGER
                )
            `);
        }
        console.log("Database initialized.");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};
initDb();

// --- Routes ---

// GET all books
app.get('/api/books', async (req, res) => {
    try {
        const result = await runQuery(
            'ALL',
            'SELECT * FROM books ORDER BY "dateAdded" DESC', // PG
            'SELECT * FROM books ORDER BY dateAdded DESC'    // SQLite
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new books
app.post('/api/books', async (req, res) => {
    const books = Array.isArray(req.body) ? req.body : [req.body];

    // SQLite Transaction Helper
    const runSqliteTransaction = (stmts) => {
        return new Promise((resolve, reject) => {
            dbSqlite.serialize(() => {
                dbSqlite.run('BEGIN TRANSACTION');
                const stmt = dbSqlite.prepare('INSERT INTO books (id, title, author, year, coverUrl, dateAdded) VALUES (?, ?, ?, ?, ?, ?)');
                try {
                    stmts.forEach(book => {
                        stmt.run(book.id, book.title, book.author, book.year || '', book.coverUrl, book.dateAdded);
                    });
                    stmt.finalize();
                    dbSqlite.run('COMMIT', (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                } catch (e) {
                    dbSqlite.run('ROLLBACK');
                    reject(e);
                }
            });
        });
    };

    try {
        if (DB_MODE === 'POSTGRES') {
            const client = await dbPostgres.connect();
            try {
                await client.query('BEGIN');
                const queryText = `
                    INSERT INTO books ("id", "title", "author", "year", "coverUrl", "dateAdded")
                    VALUES ($1, $2, $3, $4, $5, $6)
                `;
                for (const book of books) {
                    await client.query(queryText, [
                        book.id,
                        book.title,
                        book.author,
                        book.year || '',
                        book.coverUrl,
                        book.dateAdded
                    ]);
                }
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        } else {
            // SQLite
            await runSqliteTransaction(books);
        }
        res.json({ message: 'Books added successfully', count: books.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// PUT update book
app.put('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    const { title, author, year, coverUrl } = req.body;

    try {
        await runQuery(
            'RUN',
            `UPDATE books SET "title" = COALESCE($1, "title"), "author" = COALESCE($2, "author"), "year" = COALESCE($3, "year"), "coverUrl" = COALESCE($4, "coverUrl") WHERE "id" = $5`, // PG
            `UPDATE books SET title = COALESCE(?, title), author = COALESCE(?, author), year = COALESCE(?, year), coverUrl = COALESCE(?, coverUrl) WHERE id = ?`, // SQLite
            [title, author, year, coverUrl, id]
        );
        res.json({ message: 'Book updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE book
app.delete('/api/books/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await runQuery(
            'RUN',
            'DELETE FROM books WHERE "id" = $1', // PG
            'DELETE FROM books WHERE id = ?',     // SQLite
            [id]
        );
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
