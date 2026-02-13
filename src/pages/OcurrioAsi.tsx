import React from 'react';
import { Play, FileVideo, Image as ImageIcon, MessageSquare, History } from 'lucide-react';

export const OcurrioAsi: React.FC = () => {
    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Ocurrió Así</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Reconstrucción visual y narrativa de eventos para aprendizaje organizacional.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-brand-text font-semibold hover:bg-gray-50 transition-all shadow-sm">
                        <History className="w-4 h-4" /> Historial de Lecciones
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group">
                        <div className="aspect-video bg-gray-900 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
                            <button className="w-20 h-20 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform relative z-10">
                                <Play className="w-8 h-8 fill-current ml-1" />
                            </button>
                            <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                                <h3 className="text-2xl font-bold mb-1">Incidente en Grúa Torre L2</h3>
                                <p className="text-white/70 text-sm">Causa Raíz: Fatiga de material no detectada en inspección previa.</p>
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-6 mb-8 py-4 border-b border-gray-50">
                                <div className="flex items-center gap-2 text-brand-text-muted">
                                    <FileVideo className="w-4 h-4" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Video 3D</span>
                                </div>
                                <div className="flex items-center gap-2 text-brand-text-muted">
                                    <ImageIcon className="w-4 h-4" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">12 Fotos</span>
                                </div>
                                <div className="flex items-center gap-2 text-brand-text-muted">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest">Feedback</span>
                                </div>
                            </div>
                            <h4 className="font-bold text-brand-text mb-4">Secuencia del Evento</h4>
                            <div className="space-y-4">
                                <p className="text-sm text-brand-text-muted leading-relaxed">
                                    A las 14:35, el sensor de carga detectó una anomalía en el brazo principal. Se procedió a la evacuación inmediata del área perimetral siguiendo el protocolo HSE-04...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-brand-text mb-6">Lecciones de la Semana</h3>
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center text-brand-primary font-bold shrink-0">
                                        {i}
                                    </div>
                                    <p className="text-xs font-semibold text-brand-text-muted leading-relaxed">
                                        Importancia de la validación cruzada en permisos de trabajo en alturas.
                                    </p>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-3 bg-brand-primary/10 text-brand-primary text-xs font-black rounded-xl hover:bg-brand-primary/20 transition-all uppercase tracking-widest">
                            Ver Material Completo
                        </button>
                    </div>

                    <div className="bg-brand-secondary p-8 rounded-[32px] text-white relative overflow-hidden shadow-xl shadow-brand-secondary/20 group cursor-pointer">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-2">Simulador HSE</h3>
                            <p className="text-white/80 text-xs leading-relaxed">Interactúe con escenarios de riesgo real en un entorno seguro.</p>
                        </div>
                        <History className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </div>
                </div>
            </div>
        </div>
    );
};
