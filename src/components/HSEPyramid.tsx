import React from 'react';

interface HSEPyramidProps {
    mti: number;
    fai: number;
    nearMiss: number;
    aci: number;
}

export const HSEPyramid: React.FC<HSEPyramidProps> = ({ mti, fai, nearMiss, aci }) => {
    return (
        <div className="bg-white p-5 md:p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center h-full group hover:border-brand-primary/20 transition-all hover:shadow-xl">
            <h3 className="text-xl font-bold text-[#126bf0] mb-1 font-outfit self-start ml-2">Indicadores HSE</h3>
            <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold mb-4 self-start ml-2 border-l-2 border-brand-primary/20 pl-2">
                Pirámide de Seguridad
            </p>
            
            <div className="relative w-full max-w-[240px] aspect-[1/1] flex flex-col mt-2">
                {/* MTI Level */}
                <div 
                    className="relative flex flex-col items-center justify-center transition-all hover:brightness-110 hover:scale-[1.02] cursor-default shadow-md"
                    style={{ 
                        backgroundColor: '#ef4444', 
                        clipPath: 'polygon(50% 0%, 37.5% 100%, 62.5% 100%)',
                        height: '25%',
                        zIndex: 4,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                >
                    <span className="text-2xl font-black text-white leading-none">{mti}</span>
                    <span className="text-[9px] font-black text-white/90 uppercase tracking-tighter">MTI</span>
                </div>

                {/* FAI Level */}
                <div 
                    className="relative flex flex-col items-center justify-center transition-all hover:brightness-110 hover:scale-[1.02] cursor-default"
                    style={{ 
                        backgroundColor: '#f97316', 
                        clipPath: 'polygon(37.5% 0%, 62.5% 0%, 75% 100%, 25% 100%)',
                        height: '25%',
                        marginTop: '4px',
                        zIndex: 3
                    }}
                >
                    <span className="text-2xl font-black text-white leading-none">{fai}</span>
                    <span className="text-[10px] font-black text-white/90 uppercase tracking-tighter">FAI</span>
                </div>

                {/* NEAR MISS Level */}
                <div 
                    className="relative flex flex-col items-center justify-center transition-all hover:brightness-110 hover:scale-[1.02] cursor-default"
                    style={{ 
                        backgroundColor: '#fbbf24', 
                        clipPath: 'polygon(25% 0%, 75% 0%, 87.5% 100%, 12.5% 100%)',
                        height: '25%',
                        marginTop: '4px',
                        zIndex: 2
                    }}
                >
                    <span className="text-2xl font-black text-brand-text leading-none">{nearMiss}</span>
                    <span className="text-[10px] font-black text-brand-text-muted/80 uppercase tracking-tighter">NEAR MISS</span>
                </div>

                {/* ACI Level */}
                <div 
                    className="relative flex flex-col items-center justify-center transition-all hover:brightness-110 hover:scale-[1.02] cursor-default"
                    style={{ 
                        backgroundColor: '#fde68a', 
                        clipPath: 'polygon(12.5% 0%, 87.5% 0%, 100% 100%, 0% 100%)',
                        height: '25%',
                        marginTop: '4px',
                        zIndex: 1
                    }}
                >
                    <span className="text-2xl font-black text-brand-text leading-none">{aci}</span>
                    <span className="text-[10px] font-black text-brand-text-muted/80 uppercase tracking-tighter">ACI</span>
                </div>
            </div>

            <div className="mt-auto pt-8 text-left w-full space-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] leading-tight text-brand-text-muted font-bold">
                    <span className="text-brand-text font-black">ACI:</span> Actos o Condiciones Inseguras
                </p>
                <p className="text-[9px] leading-tight text-brand-text-muted font-bold">
                    <span className="text-brand-text font-black">NEAR MISS:</span> Incidentes de trabajo
                </p>
                <p className="text-[9px] leading-tight text-brand-text-muted font-bold">
                    <span className="text-brand-text font-black">FAI:</span> AT Casos de Primeros Auxilios
                </p>
                <p className="text-[9px] leading-tight text-brand-text-muted font-bold">
                    <span className="text-brand-text font-black">MTI:</span> AT Casos de Tratamiento Médico
                </p>
            </div>
        </div>
    );
};
