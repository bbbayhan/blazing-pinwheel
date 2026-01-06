import type { Book } from '../types';
import { v4 as uuidv4 } from 'uuid';

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove data:image/jpeg;base64, prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

export const processImage = async (file: File): Promise<Book[]> => {
    const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_VISION_KEY;

    if (!apiKey) {
        console.warn('No Google Cloud Vision API Key found. Using mock service.');
        return mockProcessImage(file);
    }

    try {
        const base64Image = await fileToBase64(file);

        const response = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requests: [
                    {
                        image: {
                            content: base64Image,
                        },
                        features: [
                            {
                                type: 'TEXT_DETECTION',
                            },
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            console.error('Vision API Error Details:', errorBody);
            throw new Error(`Vision API failed: ${response.status} ${response.statusText} - ${errorBody.error?.message || ''}`);
        }

        const data = await response.json();
        const fullText = data.responses[0]?.fullTextAnnotation?.text || '';

        if (!fullText) {
            return [];
        }

        // Heuristically try to separate detection into "lines" or "blocks"
        // Since we don't know the exact structure of the books in the image without Object Localization,
        // we will create ONE entry with all the text for the user to edit/split.
        // OR we can try to split by newlines if the user said "detect more than one book".
        // 
        // BETTER STRATEGY FOR USER:
        // Create one "Draft" book entry with all the text, so the user can edit it.
        // If we assume lines might be titles, we could try to split.
        // Let's create one entry per "Block" returned by Vision API if possible, or just one big entry.
        // 
        // Vision API structure:
        // fullTextAnnotation -> text (all text)
        // textAnnotations -> list of words/lines
        //
        // Let's just dump the full text into the Title for editing. 
        // Or better: First line = Title, Second line = Author (Guess)

        const chunks = fullText.split(/,|\n/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);

        // Remove duplicates and very short junk strings
        const uniqueChunks = (Array.from(new Set(chunks)) as string[]).filter((s: string) => s.length > 2);

        if (uniqueChunks.length === 0) {
            return [];
        }

        // Create full data URI for storage
        const fullDataUri = `data:${file.type};base64,${base64Image}`;

        return uniqueChunks.map((chunk: string) => ({
            id: uuidv4(),
            title: chunk, // Assume the chunk is the title
            author: 'Unknown', // User needs to fill this
            coverUrl: fullDataUri,
            dateAdded: Date.now(),
            year: '',
        }));

    } catch (error) {
        console.error('Vision API Error', error);
        alert('Vision API failed. Falling back to mock.');
        return mockProcessImage(file);
    }
};


// ---------------- MOCK FALLBACK ----------------

const MOCK_TITLES = [
    "The Great Gatsby", "1984", "Clean Code", "The Pragmatic Programmer",
    "Dune", "Project Hail Mary", "Sapiens"
];
const MOCK_AUTHORS = [
    "F. Scott Fitzgerald", "George Orwell", "Robert C. Martin",
    "Andy Hunt", "Frank Herbert", "Andy Weir", "Yuval Noah Harari"
];

const mockProcessImage = async (file: File): Promise<Book[]> => {
    // Convert to base64 even for mock so it persists
    const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
    });

    return new Promise((resolve) => {
        setTimeout(() => {
            const count = Math.floor(Math.random() * 3) + 1;
            const detectedBooks: Book[] = [];

            for (let i = 0; i < count; i++) {
                const idx = Math.floor(Math.random() * MOCK_TITLES.length);
                detectedBooks.push({
                    id: uuidv4(),
                    title: MOCK_TITLES[idx],
                    author: MOCK_AUTHORS[idx],
                    coverUrl: base64,
                    dateAdded: Date.now(),
                    year: '202' + Math.floor(Math.random() * 5)
                });
            }
            resolve(detectedBooks);
        }, 2000);
    });
};
