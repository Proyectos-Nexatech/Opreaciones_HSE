import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, KeyRound, Lock, CheckCircle2 } from 'lucide-react';

export const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    // Verify if we have a session (Supabase automatically handles the hash/token)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, it might be an expired link or manual access
                // setError('El enlace ha expirado o no es válido.');
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gray-50">
                <div className="absolute top-0 w-full h-1/2 bg-brand-primary" />
                <div className="absolute bottom-0 w-full h-1/2 bg-gray-50" />

                <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-12 z-10 text-center animate-in zoom-in-95 duration-300">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-[32px] bg-green-50 text-green-500 mb-8 shadow-sm border border-green-100">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">¡Contraseña Actualizada!</h2>
                    <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                        Tu contraseña ha sido cambiada exitosamente.<br />
                        Redirigiendo al inicio de sesión en unos segundos...
                    </p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 animate-[progress_3s_linear]" style={{ width: '100%' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gray-50">
            {/* Background elements to match the theme */}
            <div className="absolute top-0 w-full h-1/2 bg-brand-primary" />
            <div className="absolute bottom-0 w-full h-1/2 bg-gray-50" />

            <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-brand-primary p-10 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="relative z-10">
                        <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-4 shadow-xl border border-white/10">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Nueva Contraseña</h2>
                        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">Operaciones HSE</p>
                    </div>
                </div>

                <div className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs flex items-center gap-3 font-bold border border-red-100 animate-in slide-in-from-top-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                    <KeyRound className="w-3 h-3 text-brand-primary" /> Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-text placeholder-gray-400 focus:bg-white focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 focus:outline-none transition-all text-sm font-bold shadow-inner"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-[10px] font-black text-brand-text-muted uppercase tracking-widest ml-1">
                                    <CheckCircle2 className="w-3 h-3 text-brand-primary" /> Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-brand-text placeholder-gray-400 focus:bg-white focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 focus:outline-none transition-all text-sm font-bold shadow-inner"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-4.5 px-6 rounded-2xl shadow-xl shadow-brand-primary/20 text-sm font-black text-white bg-brand-primary hover:bg-brand-secondary active:scale-[0.98] transition-all duration-200 uppercase tracking-widest disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>Actualizar Contraseña</>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
