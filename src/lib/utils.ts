import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function shouldIncludeInTotal(transaction: { amount: number; description?: string; category?: string; customCategory?: string; excluded?: boolean }) {
    // User Request: Values that are NOT negative MUST be included in the total,
    // even if they are flagged as excluded/ignored.
    if (transaction.amount >= 0) {
        return true;
    }

    // For negative values (payments/credits), respect the excluded flag
    if (transaction.excluded) return false;

    // Specific Exclusion Rule for Negatives: "Inclusão" in description AND No Category
    const isInclusao = (transaction.description || '').toLowerCase().includes('inclusão');
    const cat = transaction.customCategory || transaction.category;
    const hasNoCategory = !cat || cat.trim() === '' || cat.trim() === '-';

    if (isInclusao && hasNoCategory) {
        return false;
    }

    return true;
}

export function normalizeDescription(description?: string): string {
    if (!description) return '';

    // 1. Lowercase
    let normalized = description.toLowerCase();

    // 2. Remove text starting with special ID separators like '*' (common in credit card bills)
    // Example: "Facebk *Qrjqfjyyr2" -> "Facebk "
    if (normalized.includes('*')) {
        normalized = normalized.split('*')[0];
    }

    // 3. Clean up whitespace
    return normalized.trim().replace(/\s+/g, ' ');
}
