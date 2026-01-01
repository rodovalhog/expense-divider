'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Users } from 'lucide-react';
import { inviteUser, getSharedUsers, cancelInvite } from '@/app/actions';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sharedUsers, setSharedUsers] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoadingList, setIsLoadingList] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSharedUsers();
        }
    }, [isOpen]);

    const loadSharedUsers = async () => {
        setIsLoadingList(true);
        try {
            const list = await getSharedUsers();
            setSharedUsers(list);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingList(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await inviteUser(email);
            setSuccess('Convite enviado com sucesso!');
            setEmail('');
            loadSharedUsers(); // Reload list
        } catch (e: any) {
            setError(e.message || 'Erro ao enviar convite');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este usuário?')) return;
        try {
            await cancelInvite(id);
            loadSharedUsers();
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white"
                >
                    <X className="w-5 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Compartilhar Conta</h2>
                        <p className="text-sm text-neutral-400">Convide pessoas para acessar seus dados</p>
                    </div>
                </div>

                <form onSubmit={handleInvite} className="mb-8">
                    <div className="flex gap-2">
                        <input
                            type="email"
                            required
                            placeholder="Email do convidado"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-neutral-800 border-neutral-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>{loading ? '...' : 'Convidar'}</span>
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
                </form>

                <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Acesso Compartilhado</h3>

                    {isLoadingList ? (
                        <p className="text-neutral-500 text-sm">Carregando...</p>
                    ) : sharedUsers.length === 0 ? (
                        <p className="text-neutral-500 text-sm italic">Ninguém convidado ainda.</p>
                    ) : (
                        <div className="space-y-3">
                            {sharedUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between bg-neutral-800/50 p-3 rounded-lg border border-neutral-800">
                                    <div>
                                        <p className="text-sm text-white">{user.guestEmail}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'accepted'
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            {user.status === 'accepted' ? 'Aceito' : 'Pendente'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(user.id)}
                                        className="text-neutral-500 hover:text-red-400 p-2 transition-colors"
                                        title="Remover acesso"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
