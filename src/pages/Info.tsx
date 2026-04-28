import React from 'react';
import { Calculator, AlertTriangle, Percent, ShieldCheck, FileText, Calendar, AlertCircle, Activity, Stethoscope } from 'lucide-react';

const formulas = [
    {
        title: 'Permisos Activos',
        description: 'Mide la cantidad de permisos de trabajo (PT) que se encuentran actualmente abiertos o en ejecución.',
        formula: 'Suma total de permisos en estado "Activo"',
        icon: ShieldCheck,
        color: 'text-brand-primary',
        bgColor: 'bg-brand-primary/10'
    },
    {
        title: 'Indicador Ausentismo',
        description: 'Porcentaje de ausentismo del personal en comparación con el número total de trabajadores registrados.',
        formula: '(Total Reportes de Ausentismo / Total Personal Activo) × 100',
        icon: Percent,
        color: 'text-brand-warning',
        bgColor: 'bg-brand-warning/10'
    },
    {
        title: 'Novedades',
        description: 'Registro de variaciones, permisos y situaciones especiales reportadas durante las actividades.',
        formula: 'Suma de novedades médicas, familiares, de trámites u otros',
        icon: FileText,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
    },
    {
        title: 'Incidentes (Mes)',
        description: 'Total de accidentes e incidentes de todo tipo reportados dentro del mes calendario actual.',
        formula: 'Σ Eventos (Incidentes + Accidentes) del mes en curso',
        icon: Calendar,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50'
    },
    {
        title: 'ACI',
        description: 'Actos o Condiciones Inseguras: Comportamientos o situaciones en el entorno que podrían derivar en un accidente.',
        formula: 'Total de hallazgos clasificados como Acto Inseguro o Condición Insegura',
        icon: AlertTriangle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50'
    },
    {
        title: 'NEAR MISS',
        description: 'Incidentes de trabajo (Casi Accidentes): Eventos que no generaron lesiones ni daños materiales, pero tuvieron el potencial de hacerlo.',
        formula: 'Suma de eventos clasificados como "Casi Accidente" o "Near Miss"',
        icon: AlertCircle,
        color: 'text-brand-text-muted',
        bgColor: 'bg-gray-100'
    },
    {
        title: 'FAI',
        description: 'First Aid Injury (AT Casos de Primeros Auxilios): Lesiones o accidentes de trabajo menores que solo requieren atención de primeros auxilios y no tratamiento médico formal.',
        formula: 'Total de casos clasificados como Primeros Auxilios',
        icon: Activity,
        color: 'text-brand-success',
        bgColor: 'bg-brand-success/10'
    },
    {
        title: 'MTI',
        description: 'Medical Treatment Injury (AT Casos de Tratamiento Médico): Lesiones laborales que son más graves que un caso de primeros auxilios, requiriendo tratamiento médico por un profesional.',
        formula: 'Total de casos que requirieron atención médica sin llegar a ser incapacitantes',
        icon: Stethoscope,
        color: 'text-red-500',
        bgColor: 'bg-red-50'
    }
];

export const Info: React.FC = () => {
    return (
        <div className="w-full h-full animate-in fade-in duration-700 pb-10 px-4 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 py-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text font-outfit">Información de Fórmulas</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Diccionario de indicadores y métodos de cálculo del sistema.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formulas.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-2xl ${item.bgColor} ${item.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-brand-text leading-tight">{item.title}</h3>
                        </div>
                        <p className="text-sm text-brand-text-muted mb-6 flex-grow">{item.description}</p>
                        
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mt-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <Calculator className="w-4 h-4 text-brand-text-muted" />
                                <span className="text-xs font-bold text-brand-text-muted uppercase tracking-widest">Fórmula de Cálculo</span>
                            </div>
                            <code className="block text-sm font-mono font-bold text-brand-primary break-words">
                                {item.formula}
                            </code>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
