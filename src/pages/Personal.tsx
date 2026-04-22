import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Mail, Phone, Briefcase, MapPin, Eye, Edit3, Trash2, Loader2, X, AlertTriangle, Building2, Upload, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getPersonal, createPersonal, updatePersonal, deletePersonal } from '../services/hseService';
import { PersonalModal } from '../components/PersonalModal';
import { UploadPersonalCSVModal } from '../components/UploadPersonalCSVModal';
import { usePermissions } from '../hooks/usePermissions';

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
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { canCreate, canEdit, canDelete } = usePermissions();

    // Table states
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [showFilters, setShowFilters] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

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

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleColumnFilterChange = (key: string, value: string) => {
        setColumnFilters(prev => ({ ...prev, [key]: value }));
    };

    const sortedAndFilteredPersonnel = useMemo(() => {
        let result = personnel.filter(p =>
            (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.area || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Apply column filters
        Object.entries(columnFilters).forEach(([key, value]) => {
            if (value) {
                result = result.filter(p => {
                    const cellValue = key === 'centro' ? (p.centro?.name || '') : (p[key] || '');
                    return String(cellValue).toLowerCase().includes(value.toLowerCase());
                });
            }
        });

        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = sortConfig.key === 'centro' ? (a.centro?.name || '') : (a[sortConfig.key] || '');
                const bValue = sortConfig.key === 'centro' ? (b.centro?.name || '') : (b[sortConfig.key] || '');

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return result;
    }, [personnel, searchTerm, sortConfig, columnFilters]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortConfig, columnFilters, itemsPerPage]);

    const paginatedPersonnel = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedAndFilteredPersonnel.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedAndFilteredPersonnel, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedAndFilteredPersonnel.length / itemsPerPage);

    const handleSave = async (data: any) => {
        try {
            const payload = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                area: data.area,
                role: data.role,
                status: data.status,
                centro_costo_id: data.centro_costo_id || null
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
        
        // Si el personal está activo, la primera acción es desactivarlo (Soft Delete)
        if (personToDelete.status === 'Activo') {
            try {
                await updatePersonal(personToDelete.id, { ...personToDelete, status: 'Inactivo' });
                setPersonToDelete(null);
                setSelectedPerson(null);
                loadData();
            } catch (err) {
                console.error('Error deactivating person:', err);
                alert('Error al desactivar el personal');
            }
            return;
        }

        // Si ya está inactivo, intentamos eliminarlo permanentemente (Hard Delete)
        try {
            await deletePersonal(personToDelete.id);
            setPersonToDelete(null);
            setSelectedPerson(null);
            loadData();
        } catch (err) {
            console.error('Error deleting person:', err);
            alert('No se pudo eliminar el registro permanentemente. Es probable que esta persona tenga reportes o historia asociada.\n\nSe recomienda mantenerla como "Inactivo".');
        }
    };

    const handleEdit = (person: any) => {
        setSelectedPerson(null);
        setEditingPerson(person);
        setIsModalOpen(true);
    };

    const renderSortIcon = (key: string) => {
        if (sortConfig?.key === key) {
            return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
        }
        return <ChevronUp className="w-3 h-3 opacity-20" />;
    };

    const columns = [
        { key: 'name', label: 'Nombre' },
        { key: 'role', label: 'Cargo' },
        { key: 'centro', label: 'Centro de Costo' },
        { key: 'area', label: 'Área' },
        { key: 'email', label: 'Correo' },
        { key: 'status', label: 'Estado' }
    ];

    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-8 flex flex-col">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Personal Operativo</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Gestión integral del talento humano y roles en campo.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Búsqueda global..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-gray-200 rounded-xl py-2.5 pl-11 pr-6 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn("flex items-center justify-center p-2.5 rounded-xl border transition-all active:scale-95 shadow-sm",
                            showFilters ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                        )}
                        title="Filtros por columna"
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    {canCreate('personal') && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsUploadModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-brand-text font-semibold hover:bg-gray-50 shadow-sm transition-all active:scale-95"
                            >
                                <Upload className="w-5 h-5 text-brand-primary" /> Cargar CSV
                            </button>
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
                    )}
                </div>
            </div>

            {/* Table wrapper */}
            <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                {columns.map((col) => (
                                    <th key={col.key} className="p-4 text-xs font-black text-brand-text-muted tracking-widest uppercase">
                                        <div className="flex flex-col gap-2">
                                            <div
                                                className="flex items-center gap-2 cursor-pointer hover:text-brand-primary transition-colors select-none"
                                                onClick={() => handleSort(col.key)}
                                            >
                                                {col.label}
                                                {renderSortIcon(col.key)}
                                            </div>
                                            {showFilters && (
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar..."
                                                    value={columnFilters[col.key] || ''}
                                                    onChange={(e) => handleColumnFilterChange(col.key, e.target.value)}
                                                    className="w-full px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary/30"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            )}
                                        </div>
                                    </th>
                                ))}
                                <th className="p-4 text-xs font-black text-brand-text-muted tracking-widest uppercase text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedPersonnel.length > 0 ? (
                                paginatedPersonnel.map((person) => {
                                    const initials = (person.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                                    return (
                                        <tr key={person.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative shrink-0 hidden sm:block">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-secondary to-brand-primary flex items-center justify-center text-white font-black text-xs shadow-md">
                                                            {initials}
                                                        </div>
                                                        <div className={cn(
                                                            "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white",
                                                            person.status === 'Activo' ? "bg-brand-success" : person.status === 'Inactivo' ? "bg-brand-error" : "bg-brand-warning"
                                                        )} />
                                                    </div>
                                                    <div className="font-bold text-brand-text text-sm">
                                                        {person.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-brand-text-muted">{person.role}</td>
                                            <td className="p-4 text-sm font-medium text-brand-text-muted">
                                                {person.centro?.name ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100/80 border border-gray-200 text-xs">
                                                        <Building2 className="w-3 h-3" />
                                                        {person.centro.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300 italic text-xs">No asignado</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm font-medium text-brand-text-muted">{person.area || '-'}</td>
                                            <td className="p-4 text-sm font-medium text-brand-text-muted truncate max-w-[150px]" title={person.email}>{person.email || '-'}</td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                    person.status === 'Activo' ? "bg-brand-success/10 text-brand-success" : "bg-brand-error/10 text-brand-error"
                                                )}>
                                                    {person.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setSelectedPerson(person)}
                                                        className="p-2 text-brand-text-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {canEdit('personal') && (
                                                        <button
                                                            onClick={() => handleEdit(person)}
                                                            className="p-2 text-brand-text-muted hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {canDelete('personal') && (
                                                        <button
                                                            onClick={() => setPersonToDelete(person)}
                                                            className="p-2 text-brand-text-muted hover:text-brand-error hover:bg-brand-error/5 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center">
                                        {personnel.length === 0 ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                                                <p className="text-brand-text-muted font-black text-sm tracking-widest uppercase">Cargando Personal...</p>
                                            </div>
                                        ) : (
                                            <div className="py-10 text-center">
                                                <p className="text-brand-text-muted font-bold text-sm">No se encontraron resultados que coincidan con los filtros.</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 mt-auto gap-4 sm:gap-0">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-brand-text-muted">Mostrar</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="text-xs font-medium border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/30 cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-xs font-medium text-brand-text-muted">por página</span>
                    </div>

                    <div className="flex justify-end sm:justify-between items-center gap-4">
                        <span className="text-xs font-medium text-brand-text-muted hidden sm:inline-block">
                            Mostrando {sortedAndFilteredPersonnel.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, sortedAndFilteredPersonnel.length)} de {sortedAndFilteredPersonnel.length} registros
                        </span>

                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-xs font-bold text-brand-text bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                Anterior
                            </button>
                            <div className="px-3 py-1.5 text-xs font-black text-brand-primary bg-brand-primary/10 rounded-lg min-w-[3rem] text-center">
                                {currentPage} / {totalPages || 1}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-3 py-1.5 text-xs font-bold text-brand-text bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
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
                                    { icon: Building2, label: 'Centro de Costo', value: selectedPerson.centro?.name ? `${selectedPerson.centro.name} (${selectedPerson.centro.code})` : 'No asignado' },
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
                                {canEdit('personal') && (
                                    <button
                                        onClick={() => handleEdit(selectedPerson)}
                                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-brand-primary text-brand-primary text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all active:scale-95"
                                    >
                                        <Edit3 className="w-4 h-4" /> Editar Perfil
                                    </button>
                                )}
                                {canDelete('personal') && (
                                    <button
                                        onClick={() => setPersonToDelete(selectedPerson)}
                                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-brand-error/10 text-brand-error text-xs font-black uppercase tracking-widest hover:bg-brand-error hover:text-white transition-all active:scale-95"
                                    >
                                        <Trash2 className="w-4 h-4" /> Eliminar
                                    </button>
                                )}
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
                        <h3 className="text-2xl font-black text-brand-text mb-2">
                            {personToDelete.status === 'Activo' ? '¿Desactivar Personal?' : '¿Confirmar Eliminación?'}
                        </h3>
                        <p className="text-brand-text-muted text-sm font-medium mb-8 leading-relaxed">
                            {personToDelete.status === 'Activo' 
                                ? `Vas a cambiar el estado de ${personToDelete.name} a Inactivo. No podrá ser seleccionado en nuevos reportes.`
                                : `Vas a eliminar a ${personToDelete.name} permanentemente. Esta acción fallará si tiene registros asociados.`
                            }
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmDelete}
                                className="w-full py-4 bg-brand-error text-white text-xs font-black rounded-2xl hover:brightness-110 shadow-lg shadow-brand-error/20 transition-all uppercase tracking-widest"
                            >
                                {personToDelete.status === 'Activo' ? 'Desactivar y Mantener Historia' : 'Confirmar y Eliminar'}
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
            {/* Upload CSV Modal */}
            <UploadPersonalCSVModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUploadSuccess={loadData}
            />
        </div>
    );
};
