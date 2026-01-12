# BookKeeper

A premium, modern web application for managing your book collection.

## Features (Current)
- **Book Identification**: Upload images of your books to automatically extract metadata (Mocked).
- **Multiple Book Detection**: Can handle images containing multiple books.
- **Local Persistence**: All data is saved to your browser's Local Storage.
- **Filtering & Sorting**: Sort by title, author, or date added. Filter by text.
- **Premium UI**: Glassmorphism design with responsiveness.

## Features (Planned)
- **Real OCR Integration**: Replace the mock service with Tesseract.js or Cloud Vision API.
- **Google Drive Export**: Export your collection to an Excel sheet on Google Drive.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open the link provided (usually `http://localhost:5173`).

## Architecture & Deployment

This project uses a modern "decoupled" architecture, using the best free-tier platforms for each specific task.

```mermaid
graph TD
    User((User))
    
    subgraph "Frontend Layer (Vercel)"
        Client[React App]
        style Client fill:#61dafb,stroke:#333,stroke-width:2px
    end
    
    subgraph "Auth Layer (Google)"
        Auth[Firebase Auth]
        style Auth fill:#ffca28,stroke:#333,stroke-width:2px
    end
    
    subgraph "Backend Layer (Render)"
        Server[Node.js / Express API]
        style Server fill:#68a063,stroke:#333,stroke-width:2px
    end
    
    subgraph "Data Layer (Neon/Supabase)"
        DB[(PostgreSQL Database)]
        style DB fill:#336791,stroke:#333,stroke-width:2px,color:white
    end

    User -- "1. Visits URL" --> Client
    Client -- "2. Local Logic / UI" --> User
    
    User -- "3. Log In" --> Auth
    Auth -- "4. Returns Token" --> Client
    
    Client -- "5. API Request (with Token)" --> Server
    
    Server -- "6. Verifies Token" --> Auth
    Server -- "7. Read/Write Data" --> DB
    DB -- "8. Returns Data" --> Server
    Server -- "9. JSON Response" --> Client
```

### Technology Stack & Platforms

*   **Frontend (Vercel)**:
    *   **What it does**: Hosts the visual part of the app (HTML, CSS, React).
    *   **Why Vercel?**: Specialized for React performance and has a generous free tier.
*   **Authentication (Firebase)**:
    *   **What it does**: Handles User Login (Google Sign-In) and security tokens.
    *   **Why Firebase?**: Secure, free, and easier than building your own login system.
*   **Backend (Render)**:
    *   **What it does**: The "Brain". It runs 24/7 (or wakes on demand), receives requests, checks permissions, and talks to the database.
    *   **Why Render?**: Allows running a standard Node.js server for free.
*   **Database (Neon or Supabase)**:
    *   **What it does**: Persistently stores the book data (Titles, Authors, etc.).
    *   **Why Postgres?**: Professional-grade SQL database available for free on these platforms.

