'use client';

import React, { useMemo } from 'react';
import { Transaction } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryPieChartProps {
    transactions: Transaction[];
}

const COLORS = [
    '#3B82F6', // Blue 500
    '#EF4444', // Red 500
    '#10B981', // Emerald 500
    '#F59E0B', // Amber 500
    '#8B5CF6', // Violet 500
    '#EC4899', // Pink 500
    '#06B6D4', // Cyan 500
    '#F97316', // Orange 500
    '#6366F1', // Indigo 500
    '#84CC16', // Lime 500
    '#14B8A6', // Teal 500
    '#EAB308', // Yellow 500
    '#D946EF', // Fuchsia 500
    '#64748B', // Slate 500
    '#A8A29E', // Stone 400
];

export function CategoryPieChart({ transactions }: CategoryPieChartProps) {
    const data = useMemo(() => {
        const categoryMap: Record<string, number> = {};

        transactions.forEach(t => {
            if (t.amount <= 0) return; // Ignore negative or zero amounts

            let cat = t.customCategory || t.category;
            if (!cat || cat.trim() === '-' || cat.trim() === '') {
                cat = 'Sem Categoria';
            }
            const amount = t.amount;
            if (!categoryMap[cat]) categoryMap[cat] = 0;
            categoryMap[cat] += amount;
        });

        // Convert to array, sort by value desc, and assign colors
        return Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .map((item, index) => ({
                ...item,
                fill: COLORS[index % COLORS.length]
            }));
    }, [transactions]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(val);
    };

    const renderLegendText = (value: string, entry: unknown) => {
        const payload = (entry as { payload: { value: number } }).payload;
        return <span className="text-neutral-300 text-xs ml-1">{value} ({formatCurrency(payload.value)})</span>;
    };

    if (data.length === 0) return null;

    return (
        <div className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 h-[500px]">
            <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-neutral-400" />
                <h3 className="text-lg font-semibold text-neutral-200">Gastos por Categoria</h3>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="40%" // Move pie slightly left to make room for legend
                        cy="50%"
                        labelLine={false}
                        outerRadius={140}
                        innerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.2)" />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number | undefined) => formatCurrency(value || 0)}
                        contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        width={240}
                        iconType="circle"
                        formatter={renderLegendText}
                        wrapperStyle={{ overflowY: 'auto', maxHeight: '400px', paddingLeft: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
