import React, { useState, useEffect } from 'react';
import { X, Save, Map } from 'lucide-react';

interface CentroCostoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
}

export const CentroCostoModal: React.FC<CentroCostoModalProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData
}) => {
    const [formData, setFormData] = useState({
        id: '',
        name: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                id: Math.random().toString(36).substr(2, 9),
                name: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-text/20 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                <div className="bg-brand-primary p-8 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center shadow-xl border border-white/10">
                            <Map className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">{initialData ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'}</h2>
                            <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">{initialData ? 'Modificar unidad operativa' : 'Crear unidad operativa'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-3 hover:bg-white/20 rounded-2xl transition-all active:scale-90 bg-white/10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Nombre del Centro de Costo</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Zona Norte"
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-brand-text focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all placeholder:text-gray-300 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl border border-gray-100 text-sm font-black text-brand-text-muted hover:bg-gray-50 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand-primary text-white text-sm font-black hover:brightness-110 shadow-lg shadow-brand-primary/20 transition-all active:scale-95 uppercase tracking-widest"
                        >
                            <Save className="w-4 h-4" />
                            {initialData ? 'Guardar Cambios' : 'Crear Centro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
