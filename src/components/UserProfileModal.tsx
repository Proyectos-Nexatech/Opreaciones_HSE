import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { X, User, Mail, Phone, Save, LogOut, Camera, Loader2 } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { ConfirmationModal } from './ConfirmationModal';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, profile, refreshProfile, signOut } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'logout' | 'save';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'logout',
        title: '',
        message: ''
    });

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPhone(profile.phone || '');
        } else if (user) {
            setFullName(user.user_metadata?.full_name || '');
            setPhone(user.user_metadata?.phone || '');
        }
    }, [profile, user, isOpen]);

    if (!isOpen || !user) return null;

    const handleSaveClick = (e: React.FormEvent) => {
        e.preventDefault();
        setConfirmModal({
            isOpen: true,
            type: 'save',
            title: 'Actualizar Perfil',
            message: '¿Estás seguro de que deseas guardar los cambios realizados en tu perfil?'
        });
    };

    const handleLogoutClick = () => {
        setConfirmModal({
            isOpen: true,
            type: 'logout',
            title: 'Cerrar Sesión',
            message: '¿Estás seguro de que deseas cerrar sesión?'
        });
    };

    const handleConfirmAction = async () => {
        // Close confirmation modal immediately to prevent double usage
        setConfirmModal(prev => ({ ...prev, isOpen: false }));

        if (confirmModal.type === 'logout') {
            try {
                await signOut();
                onClose();
            } catch (error) {
                console.error('Error signing out:', error);
            }
        } else if (confirmModal.type === 'save') {
            setLoading(true);
            setMessage(null);

            try {
                // Actualizar tabla user_profiles (Fuente de la verdad)
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .update({
                        full_name: fullName,
                        phone: phone,
                    })
                    .eq('id', user.id);

                if (profileError) throw profileError;

                // Opcional: Actualizar metadata de auth para mantener sincronía
                await supabase.auth.updateUser({
                    data: {
                        full_name: fullName,
                        phone: phone,
                    }
                });

                await refreshProfile(); // Recargar datos del contexto
                setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });

                setTimeout(() => {
                    setMessage(null);
                }, 3000);

            } catch (err: any) {
                setMessage({ type: 'error', text: err.message || 'Error al actualizar perfil' });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="relative h-32 bg-gradient-to-r from-brand-primary to-blue-600">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                            <div className="relative group">
                                <div className="p-1 bg-white rounded-full shadow-lg">
                                    <UserAvatar user={user} name={fullName} size="xl" />
                                </div>
                                {/* Camera icon for visual cue */}
                                <div className="absolute bottom-1 right-1 p-1.5 bg-brand-primary rounded-full border-2 border-white text-white shadow-sm cursor-pointer hover:bg-brand-dark transition-colors">
                                    <Camera className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="pt-14 px-6 pb-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">{fullName || 'Usuario'}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>

                        {message && (
                            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center justify-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSaveClick} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                        placeholder="Tu nombre completo"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                                        placeholder="Tu número de teléfono"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleLogoutClick}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Guardar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type === 'logout' ? 'danger' : 'info'}
                confirmText={confirmModal.type === 'logout' ? 'Cerrar Sesión' : 'Confirmar'}
                cancelText="Cancelar"
            />
        </>
    );
};
