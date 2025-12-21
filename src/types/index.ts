export type Owner = 'Me' | 'Wife' | 'Shared';
export type TransactionSource = 'CSV' | 'Manual';

export const DEFAULT_CATEGORIES = [
    'Supermercado',
    'Combustível',
    'Lazer',
    'Aluguel',
    'Saúde',
    'Restaurante',
    'Assinaturas',
    'Outros'
] as const;

export type Category = typeof DEFAULT_CATEGORIES[number] | string;

export interface Transaction {
    id: string; // generated UUID
    date: string;
    cardName: string;
    cardLastFour: string;
    category: Category; // The raw category from CSV
    customCategory?: Category; // The user-assigned category
    description: string;
    installment: string;
    amount: number; // In BRL (based on logic, user said "Valor (em R$)" column exists)
    originalAmountUS?: number;
    owner: Owner;
    sourceFile: string; // to track which invoice it came from
    source: TransactionSource;
    excluded?: boolean;
}

export interface CSVRow {
    "Data de Compra": string;
    "Nome no Cartão": string;
    "Final do Cartão": string;
    "Categoria": string;
    "Descrição": string;
    "Parcela": string;
    "Valor (em US$)": string;
    "Cotação (em R$)": string;
    "Valor (em R$)": string;
}
