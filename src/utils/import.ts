import * as XLSX from 'xlsx';
import type { Book } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const importFromExcel = async (file: File): Promise<Book[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // Assuming first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const books: Book[] = jsonData.map((row: any) => ({
                    id: uuidv4(),
                    title: row['Title'] || row['title'] || 'Unknown Title',
                    author: row['Author'] || row['author'] || 'Unknown Author',
                    year: (row['Year'] || row['year'] || '').toString(),
                    dateAdded: Date.now(),
                    coverUrl: '' // Cover needs to be re-uploaded or we rely on placeholders
                }));

                resolve(books);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};
