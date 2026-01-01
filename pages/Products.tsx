import React, { useState } from 'react';
import { useProducts } from '../hooks/useData';
import { supabase } from '../supabaseClient';
import { Product } from '../types';

const Products: React.FC = () => {
    const { products, loading, refresh } = useProducts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Papelaria',
        price: 0,
        stock: 0,
        unit: 'un'
    });

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price,
                stock: product.stock,
                unit: product.unit
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: 'Papelaria',
                price: 0,
                stock: 0,
                unit: 'un'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = {
            ...formData,
            user_id: user.id
        };

        let error;
        if (editingProduct) {
            const { error: err } = await supabase
                .from('products')
                .update(payload)
                .eq('id', editingProduct.id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('products')
                .insert([payload]);
            error = err;
        }

        if (error) {
            alert('Erro ao salvar produto: ' + error.message);
        } else {
            setIsModalOpen(false);
            refresh();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) alert('Erro ao excluir: ' + error.message);
        else refresh();
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0f172a]">
            <header className="flex-shrink-0 bg-white dark:bg-[#16212e] border-b border-slate-200 dark:border-slate-800 px-8 py-6 flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined font-bold">inventory_2</span>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Produtos</h2>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Gerencie seu catálogo de produtos e preços</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    CADASTRAR PRODUTO
                </button>
            </header>

            <main className="flex-1 p-8 flex flex-col gap-6">
                <div className="bg-white dark:bg-[#16212e] p-4 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="relative max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#16212e] rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preço</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estoque</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredProducts.map(product => (
                                        <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{product.name}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white">
                                                R$ {Number(product.price).toFixed(2)}
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`text-sm font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-slate-500'}`}>
                                                    {product.stock} {product.unit}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right space-x-2">
                                                <button onClick={() => handleOpenModal(product)} className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-all">
                                                    <span className="material-symbols-outlined text-xl">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#16212e] rounded-[40px] w-full max-w-lg p-10 shadow-2xl border border-white/20">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8">
                            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nome do Produto</label>
                                <input
                                    required
                                    placeholder="Ex: Convite Luxo 10x15"
                                    className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Categoria</label>
                                    <select
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                    >
                                        <option value="Papelaria">Papelaria</option>
                                        <option value="Impressão">Impressão</option>
                                        <option value="Serviço">Serviço</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Unidade</label>
                                    <select
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none"
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value as any })}
                                    >
                                        <option value="un">Unidade (un)</option>
                                        <option value="m²">Metro Quadrado (m²)</option>
                                        <option value="cento">Cento</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Preço (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Estoque Inicial</label>
                                    <input
                                        type="number"
                                        className="w-full h-12 px-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold outline-none"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl text-sm font-black text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
                                <button type="submit" disabled={saving} className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white text-sm font-black shadow-xl shadow-primary/20 transition-all disabled:opacity-50">
                                    {saving ? 'SALVANDO...' : 'SALVAR PRODUTO'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
