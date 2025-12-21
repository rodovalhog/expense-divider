import Papa from 'papaparse';
// import { v4 as uuidv4 } from 'uuid'; // Removed unused
import { Transaction, CSVRow } from '@/types';

// Simple ID generator if crypto not available (frontend side often has crypto.randomUUID)
export const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
};

export const parseInvoiceCSV = (file: File): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse<CSVRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const transactions: Transaction[] = [];

                results.data.forEach((row) => {
                    // Detect Format 1: Detailed Invoice
                    if (row['Data de Compra'] && row['Valor (em R$)']) {
                        const amountStr = row['Valor (em R$)'];
                        let cleanAmount = amountStr.replace('R$', '').trim();

                        if (cleanAmount.includes(',') && cleanAmount.includes('.')) {
                            cleanAmount = cleanAmount.replace(/\./g, '').replace(',', '.');
                        } else if (cleanAmount.includes(',')) {
                            cleanAmount = cleanAmount.replace(',', '.');
                        }

                        const amount = parseFloat(cleanAmount);
                        const originalAmountUS = row['Valor (em US$)'] ? parseFloat(row['Valor (em US$)'].replace(',', '.')) : undefined;

                        transactions.push({
                            id: generateId(),
                            date: row['Data de Compra'],
                            cardName: row['Nome no Cartão'],
                            cardLastFour: row['Final do Cartão'],
                            category: row['Categoria'],
                            description: row['Descrição'],
                            installment: row['Parcela'],
                            amount: isNaN(amount) ? 0 : amount,
                            originalAmountUS,
                            owner: 'Shared',
                            sourceFile: file.name,
                            source: 'CSV'
                        });
                    }
                    // Detect Format 2: Nubank Simple (date, title, amount)
                    else if (row['date'] && row['amount']) {
                        const amountStr = String(row['amount']); // Ensure string
                        // Nubank usually is just "97.00" or "1000.50" (standard float format in csv often) 
                        // But let's be safe. If user says "97.00", parseFloat works directly.
                        const amount = parseFloat(amountStr);

                        transactions.push({
                            id: generateId(),
                            date: row['date'], // 2024-12-07
                            cardName: 'Nubank',
                            category: 'A Classificar', // Placeholder as requested
                            description: row['title'],
                            amount: isNaN(amount) ? 0 : amount,
                            owner: 'Shared',
                            sourceFile: file.name,
                            source: 'CSV'
                        });
                    }
                });

                resolve(transactions);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};
