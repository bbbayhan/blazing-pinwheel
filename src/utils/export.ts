import * as XLSX from 'xlsx';
import type { Book } from '../types';

export const exportToExcel = (books: Book[]) => {
    if (books.length === 0) {
        alert('No books to export!');
        return;
    }

    // Map the books to a format suitable for Excel
    // We exclude the coverUrl as it's base64 and would make the file huge/broken
    const data = books.map(book => ({
        Title: book.title,
        Author: book.author,
        Year: book.year || 'N/A',
        'Date Added': new Date(book.dateAdded).toLocaleDateString(),
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'My Collection');

    // Trigger the download
    XLSX.writeFile(workbook, `MyBookCollection_${new Date().toISOString().split('T')[0]}.xlsx`);
};
