import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Briefcase, MapPin } from 'lucide-react';

interface PersonalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (person: any) => void;
    initialData?: any;
}

export const PersonalModal: React.FC<PersonalModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        area: '',
        status: 'Activo',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                role: '',
                area: '',
                status: 'Activo',
                email: '',
                phone: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            id: initialData?.id || Date.now().toString()
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-md animate-in fade-in duration-300">

            <div className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
                <div className="bg-brand-primary p-8 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center shadow-xl border border-white/10">
                            <User className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">
                                {initialData ? 'Editar Colaborador' : 'Nuevo Colaborador'}
                            </h2>
                            <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Gestión de Personal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-3 hover:bg-white/20 rounded-2xl transition-all active:scale-90 bg-white/10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                                placeholder="Ej: Juan Perez"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Cargo / Puesto</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                required
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                                placeholder="Ej: Soldador"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1">Área / Proyecto</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-gray-500 ml-1">Estado</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 focus:outline-none"
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                                <option value="En Vacaciones">En Vacaciones</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-gray-500 ml-1">Teléfono</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-800 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all">
                            Cancelar
                        </button>
                        <button type="submit" className="flex-1 py-3.5 rounded-xl font-bold bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:brightness-110 transition-all">
                            {initialData ? 'Guardar Cambios' : 'Añadir a la Base'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
