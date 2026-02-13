import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 bg-gray-50 overflow-y-auto">
                <div className="absolute top-0 w-full h-1/2 bg-blue-500" />
                <div className="absolute bottom-0 w-full h-1/2 bg-gray-50" />

                <div className="relative w-full max-w-lg bg-white rounded-2xl lg:rounded-[32px] shadow-2xl p-8 lg:p-10 z-10 text-center animate-in zoom-in-95 duration-300 my-4">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-green-50 text-green-500 mb-6 shadow-sm border border-green-100">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-4">¡Registro Exitoso!</h2>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed text-sm lg:text-base">
                        Tu cuenta ha sido creada exitosamente.<br />
                        <span className="font-bold text-gray-700">Tu acceso está pendiente de aprobación.</span><br />
                        Un administrador revisará tu solicitud y activará tu cuenta.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/20 text-sm font-black text-white bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all duration-200 uppercase tracking-widest"
                    >
                        Ir al Inicio de Sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-gray-50 overflow-y-auto">
            {/* Background Elements */}
            <div className="absolute top-0 w-full h-1/2 bg-blue-500" />
            <div className="absolute bottom-0 w-full h-1/2 bg-gray-50" />

            {/* Main Floating Card */}
            <div className="relative w-full max-w-4xl bg-white rounded-2xl lg:rounded-[32px] shadow-2xl flex flex-col lg:flex-row-reverse overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-500 my-4 lg:my-auto">

                {/* Right Side: Visual / Illustration (Logo and Info) */}
                <div className="hidden lg:flex w-1/2 bg-[#5D9CFF] relative items-center justify-center p-8 overflow-hidden">
                    <div className="absolute top-10 right-10 w-20 h-20 bg-white/20 rounded-full blur-2xl" />
                    <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />

                    <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
                        <img
                            src="/logo NEXATECH.png"
                            alt="Nexatech Logo"
                            className="w-48 lg:w-64 h-auto mb-6 lg:mb-8 drop-shadow-lg transition-transform duration-300 hover:scale-105"
                        />

                        <div className="text-white">
                            <h3 className="text-2xl lg:text-3xl font-black mb-2 tracking-tight">Operaciones HSE</h3>
                            <p className="text-blue-100 text-sm lg:text-base font-medium leading-relaxed">
                                Únete a nuestra plataforma y gestiona la seguridad de tu equipo de forma profesional.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Left Side: Form */}
                <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white border-r border-gray-50">
                    <div className="max-w-xs mx-auto w-full">
                        <div className="mb-4 lg:mb-6">
                            <p className="text-xs text-gray-400 font-medium">Español (CO) ▼</p>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">Crear Cuenta</h2>
                        <p className="text-gray-400 text-sm font-medium mb-6 lg:mb-8">Comienza tu viaje con nosotros hoy.</p>

                        <form onSubmit={handleRegister} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs flex items-center gap-3 font-semibold border border-red-100">
                                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3 lg:space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-800 ml-1">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-5 py-2.5 lg:py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all text-sm font-medium"
                                        placeholder="usuario@empresa.com"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-800 ml-1">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full px-5 py-2.5 lg:py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 focus:outline-none transition-all text-sm font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 ml-1 font-medium italic">Mínimo 6 caracteres</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl shadow-xl shadow-blue-500/25 text-sm font-black text-white bg-blue-500 hover:bg-blue-600 active:scale-[0.98] transition-all duration-200 uppercase tracking-widest"
                                >
                                    {loading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        'Registrarse'
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center pt-6 border-t border-gray-50">
                            <p className="text-xs text-gray-400 font-medium">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="text-blue-500 font-black hover:underline underline-offset-4 transition-all">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
