import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PlaceholderProps {
    title: string;
    icon: LucideIcon;
}

const PlaceholderPage: React.FC<PlaceholderProps> = ({ title, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-brand-card rounded-[32px] flex items-center justify-center border border-white/5 mb-6 shadow-2xl">
            <Icon className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-brand-text-muted max-w-sm">
            Esta sección está actualmente en desarrollo como parte del modulo de Operaciones HSE.
            Próximamente tendrás acceso a todas sus funcionalidades.
        </p>
    </div>
);

import { BarChart3, Users, Calendar, HelpCircle } from 'lucide-react';

export const Analytics = () => <PlaceholderPage title="Analytics" icon={BarChart3} />;
export const Equipo = () => <PlaceholderPage title="Gestión de Equipo" icon={Users} />;
export const Calendario = () => <PlaceholderPage title="Calendario" icon={Calendar} />;
export const Ayuda = () => <PlaceholderPage title="Centro de Ayuda" icon={HelpCircle} />;
