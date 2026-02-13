import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, Trash2, Edit3, Filter, ChevronRight, Loader2 } from 'lucide-react';
import { getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa } from '../services/hseService';
import { EmpresaClienteModal } from '../components/EmpresaClienteModal';

export const EmpresasCliente: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [companies, setCompanies] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<any>(null);

    const loadData = async () => {
        try {
            const data = await getEmpresas();
            setCompanies(data || []);
        } catch (err) {
            console.error('Error loading companies:', err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = companies.filter(e => (e.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSave = async (data: any) => {
        try {
            const payload = {
                name: data.name,
                nit: data.nit,
                contact: data.contact,
                email: data.email,
                phone: data.phone
            };

            if (editingCompany) {
                await updateEmpresa(editingCompany.id, payload);
            } else {
                await createEmpresa(payload);
            }
            loadData();
            setEditingCompany(null);
        } catch (err) {
            console.error('Error saving company:', err);
            alert('Error al guardar la empresa');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Está seguro de eliminar esta empresa?')) {
            try {
                await deleteEmpresa(id);
                loadData();
            } catch (err) {
                console.error('Error deleting company:', err);
                alert('Error al eliminar la empresa');
            }
        }
    };

    const handleEdit = (company: any) => {
        setEditingCompany(company);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Empresas Cliente</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Directorio de aliados estratégicos y clientes corporativos.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar empresa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-6 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all w-80 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingCompany(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> Agregar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <span className="text-[11px] font-bold text-brand-text-muted uppercase tracking-wider ml-2">Nombre Empresa</span>
                    <Filter className="w-4 h-4 text-brand-text-muted cursor-pointer" />
                </div>
                <div className="divide-y divide-gray-50">
                    {filtered.map((empresa) => (
                        <div key={empresa.id} className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-all group">
                            <div className="flex items-center gap-4 ml-2">
                                <div className="p-2.5 bg-brand-accent rounded-xl text-brand-primary shadow-sm border border-brand-primary/10 transition-transform group-hover:scale-110">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <span className="text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors uppercase">{empresa.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(empresa)}
                                        className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100 shadow-sm"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(empresa.id)}
                                        className="p-2 text-brand-text-muted hover:text-brand-error hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-100 shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <ChevronRight className="w-5 h-5 text-brand-text-muted group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && companies.length > 0 && (
                        <div className="p-10 text-center">
                            <p className="text-brand-text-muted font-bold text-sm">No se encontraron resultados</p>
                        </div>
                    )}
                    {companies.length === 0 && (
                        <div className="p-20 text-center">
                            <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-4" />
                            <p className="text-brand-text-muted font-bold text-sm tracking-widest uppercase">Cargando empresas cliente...</p>
                        </div>
                    )}
                </div>
            </div>

            <EmpresaClienteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingCompany}
            />
        </div>
    );
};
