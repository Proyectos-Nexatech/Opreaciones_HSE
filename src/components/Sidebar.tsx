import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    BarChart3,
    Users,
    Calendar,
    Settings,
    HelpCircle,
    ShieldCheck,
    Map,
    Building2,
    ChevronDown,
    ClipboardList
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NexatechIcon } from './NexatechIcon';
import { usePermissions } from '../hooks/usePermissions';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const dashboardItem = { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: 'dashboard' };

const managementItems = [
    { name: 'Personal', icon: Users, path: '/personal', permission: 'personal' },
    { name: 'Personal HSE', icon: ShieldCheck, path: '/personal-hse', permission: 'personal_hse' },
    { name: 'Centros de Costo', icon: Map, path: '/centros-costo', permission: 'centros_costo' },
    { name: 'Empresas Cliente', icon: Building2, path: '/empresas-cliente', permission: 'empresas' },
];

const formItems = [
    { name: 'Reporte diario de permisos', icon: FileText, path: '/reportes', badge: 12, permission: 'reportes' },
    { name: 'Reporte de asistencia', icon: Users, path: '/asistencia', permission: 'asistencia' },
    { name: 'Reporte de eventos', icon: ShieldCheck, path: '/eventos-accidentes', permission: 'reportes' },
    { name: 'Reporte de Novedades', icon: BarChart3, path: '/novedades', permission: 'novedades' },
    { name: 'Reporte de Ausentismo', icon: Calendar, path: '/ausentismo', permission: 'ausentismo' },
    { name: 'Ocurrio asi', icon: FileText, path: '/ocurrio-asi', permission: 'reportes' },
];

const generalItems = [
    { name: 'Configuración', icon: Settings, path: '/configuracion', permission: 'configuracion' },
    { name: 'Ayuda', icon: HelpCircle, path: '/ayuda', permission: 'dashboard' },
];

export const Sidebar: React.FC = () => {
    const [isFormsOpen, setIsFormsOpen] = useState(true);
    const { canView } = usePermissions();

    return (
        <aside className="w-20 md:w-64 flex flex-col h-screen bg-sidebar-bg border-r border-white/10 p-4 md:p-6 shadow-2xl relative z-30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-10 px-2 justify-center md:justify-start">
                <NexatechIcon className="w-10 h-10 transition-transform hover:rotate-3 flex-shrink-0" />
                <h1 className="text-xl font-extrabold tracking-tight text-white font-outfit leading-tight text-shadow-sm hidden md:block overflow-hidden whitespace-nowrap">
                    Operaciones<br /><span className="text-blue-100/80">HSE</span>
                </h1>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto scrollbar-hide pr-1">
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4 px-4 hidden md:block">
                        General
                    </p>
                    <nav className="space-y-1">
                        {/* 1. Dashboard */}
                        {canView('dashboard') && (
                            <NavLink
                                to={dashboardItem.path}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group justify-center md:justify-start",
                                    isActive
                                        ? "bg-white/15 text-white shadow-lg ring-1 ring-white/10"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <dashboardItem.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                                <span className="font-bold text-[15px] tracking-tight hidden md:block whitespace-nowrap">{dashboardItem.name}</span>
                            </NavLink>
                        )}

                        {/* 2. Formularios (Collapsible) */}
                        <div className="pt-2">
                            <button
                                onClick={() => setIsFormsOpen(!isFormsOpen)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group",
                                    isFormsOpen ? "text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <div className="flex items-center gap-4 w-full justify-center md:justify-start">
                                    <ClipboardList className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                                    <span className="font-bold text-[15px] tracking-tight text-left hidden md:block whitespace-nowrap">Formularios</span>
                                </div>
                                <ChevronDown className={cn(
                                    "w-4 h-4 transition-transform duration-300 hidden md:block flex-shrink-0",
                                    isFormsOpen && "rotate-180"
                                )} />
                            </button>

                            {isFormsOpen && (
                                <div className="mt-1 md:ml-4 md:pl-4 border-l border-white/10 space-y-1 animate-in slide-in-from-top-2 duration-300">
                                    {formItems.map((item) => {
                                        if (!canView(item.permission)) return null;
                                        return (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                title={item.name}
                                                className={({ isActive }) => cn(
                                                    "flex items-center rounded-xl transition-all duration-300 group relative px-4 py-2.5 justify-center md:justify-between",
                                                    isActive
                                                        ? "bg-white/10 text-white"
                                                        : "text-white/50 hover:bg-white/5 hover:text-white"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <item.icon className="w-4 h-4 md:hidden flex-shrink-0" />
                                                    <span className="font-semibold text-[14px] tracking-tight leading-tight hidden md:block overflow-hidden whitespace-nowrap">{item.name}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className="bg-white text-brand-primary text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm ml-2 hidden md:block">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 3, 4, 5. Management Items */}
                        {managementItems.map((item) => {
                            if (!canView(item.permission)) return null;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group justify-center md:justify-start",
                                        isActive
                                            ? "bg-white/15 text-white shadow-lg ring-1 ring-white/10"
                                            : "text-white/60 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                                    <span className="font-bold text-[15px] tracking-tight hidden md:block whitespace-nowrap">{item.name}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4 px-4 hidden md:block">
                        Sistema
                    </p>
                    <nav className="space-y-1">
                        {generalItems.map((item) => {
                            if (!canView(item.permission)) return null;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 justify-center md:justify-start",
                                        isActive
                                            ? "bg-white/15 text-white shadow-lg ring-1 ring-white/10"
                                            : "text-white/60 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                                    <span className="font-bold text-[15px] tracking-tight hidden md:block whitespace-nowrap">{item.name}</span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>
            </div>

        </aside>
    );
};
