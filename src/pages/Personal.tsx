import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, Briefcase, MapPin, Eye, Edit3, Trash2, Loader2, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getPersonal, createPersonal, updatePersonal, deletePersonal } from '../services/hseService';
import { PersonalModal } from '../components/PersonalModal';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Personal: React.FC = () => {
    const [personnel, setPersonnel] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<any>(null);

    // UI states
    const [selectedPerson, setSelectedPerson] = useState<any>(null);
    const [personToDelete, setPersonToDelete] = useState<any>(null);

    const loadData = async () => {
        try {
            const data = await getPersonal();
            setPersonnel(data || []);
        } catch (err) {
            console.error('Error loading personnel:', err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredPersonnel = personnel.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async (data: any) => {
        try {
            const payload = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                area: data.area,
                role: data.role,
                status: data.status
            };

            if (editingPerson) {
                await updatePersonal(editingPerson.id, payload);
            } else {
                await createPersonal(payload);
            }
            loadData();
            setEditingPerson(null);
            setSelectedPerson(null);
        } catch (err) {
            console.error('Error saving person:', err);
            alert('Error al guardar personal');
        }
    };

    const confirmDelete = async () => {
        if (!personToDelete) return;
        try {
            await deletePersonal(personToDelete.id);
            setPersonToDelete(null);
            setSelectedPerson(null);
            loadData();
        } catch (err) {
            console.error('Error deleting person:', err);
            alert('Error al eliminar personal');
        }
    };

    const handleEdit = (person: any) => {
        setEditingPerson(person);
        setIsModalOpen(true);
    };

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-8">
            {/* Header section matches PersonalHSE */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Personal Operativo</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Gestión integral del talento humano y roles en campo.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar personal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-6 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingPerson(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Añadir Personal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPersonnel.map((person) => {
                    const initials = (person.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                    return (
                        <div
                            key={person.id}
                            onClick={() => setSelectedPerson(person)}
                            className="group relative bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-xl hover:border-brand-primary/20 transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-secondary to-brand-primary flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                                        {initials}
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                                        person.status === 'Activo' ? "bg-brand-success" : person.status === 'Inactivo' ? "bg-brand-error" : "bg-brand-warning"
                                    )} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-black text-brand-text truncate group-hover:text-brand-primary transition-colors">{person.name}</h3>
                                    <p className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider truncate">{person.role}</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-xl text-brand-text-muted opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                    <Eye className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    );
                })}
                {filteredPersonnel.length === 0 && personnel.length > 0 && (
                    <div className="col-span-full py-10 text-center">
                        <p className="text-brand-text-muted font-bold text-sm">No se encontraron resultados para "{searchTerm}"</p>
                    </div>
                )}
                {personnel.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                            <p className="text-brand-text-muted font-black text-sm tracking-widest uppercase">Cargando Personal...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* EXPANDED DETAIL VIEW MODAL */}
            {selectedPerson && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="bg-brand-primary p-10 text-white relative overflow-hidden text-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />

                            <button
                                onClick={() => setSelectedPerson(null)}
                                className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-[32px] bg-white text-brand-primary flex items-center justify-center text-3xl font-black shadow-2xl border-4 border-white/20 mb-6 group-hover:scale-105 transition-transform">
                                    {(selectedPerson.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <h2 className="text-2xl font-black tracking-tight mb-2">{selectedPerson.name}</h2>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[11px] font-black uppercase tracking-widest border border-white/10">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    {selectedPerson.role}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 space-y-6 bg-gray-50/50">
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { icon: Mail, label: 'Correo Corporativo', value: selectedPerson.email },
                                    { icon: Phone, label: 'Teléfono de Contacto', value: selectedPerson.phone },
                                    { icon: MapPin, label: 'Zona / Area Asignada', value: selectedPerson.area },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group/item">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand-primary group-hover/item:bg-brand-primary group-hover/item:text-white transition-all">
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-0.5">{item.label}</p>
                                            <p className="text-sm font-bold text-brand-text">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group/item">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center group-hover/item:brightness-110 transition-all",
                                        selectedPerson.status === 'Activo' ? "bg-brand-success/10 text-brand-success" : "bg-brand-error/10 text-brand-error"
                                    )}>
                                        <div className={cn("w-2 h-2 rounded-full",
                                            selectedPerson.status === 'Activo' ? "bg-brand-success animate-pulse" : "bg-brand-error"
                                        )} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mb-0.5">Estado del Perfil</p>
                                        <p className="text-sm font-black tracking-tight uppercase">{selectedPerson.status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => handleEdit(selectedPerson)}
                                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-brand-primary text-brand-primary text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all active:scale-95"
                                >
                                    <Edit3 className="w-4 h-4" /> Editar Perfil
                                </button>
                                <button
                                    onClick={() => setPersonToDelete(selectedPerson)}
                                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-brand-error/10 text-brand-error text-xs font-black uppercase tracking-widest hover:bg-brand-error hover:text-white transition-all active:scale-95"
                                >
                                    <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {personToDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-brand-text/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-[40px] w-full max-sm text-center shadow-2xl animate-in bounce-in duration-500">
                        <div className="w-20 h-20 bg-brand-error/10 rounded-[28px] flex items-center justify-center text-brand-error mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-brand-text mb-2">¿Confirmar Baja?</h3>
                        <p className="text-brand-text-muted text-sm font-medium mb-8 leading-relaxed">
                            Vas a eliminar a <span className="font-bold text-brand-text">{personToDelete.name}</span>. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDelete}
                                className="w-full py-4 bg-brand-error text-white text-xs font-black rounded-2xl hover:brightness-110 shadow-lg shadow-brand-error/20 transition-all uppercase tracking-widest"
                            >
                                Confirmar y Eliminar
                            </button>
                            <button
                                onClick={() => setPersonToDelete(null)}
                                className="w-full py-4 bg-gray-50 text-brand-text-muted text-xs font-black rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest"
                            >
                                Mantener Personal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PersonalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingPerson}
            />
        </div>
    );
};
