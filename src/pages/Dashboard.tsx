import React from 'react';
import { Link } from 'react-router-dom';
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    LayoutGrid,
    Users,
    ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StatCardProps {
    title: string;
    value: string;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'meta';
    icon: React.ElementType;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendType, icon: Icon }) => (
    <div className="bg-brand-card p-6 rounded-2xl border border-gray-100 relative overflow-hidden group hover:border-brand-primary/30 transition-all hover:shadow-lg shadow-sm">
        <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-brand-primary/5 rounded-xl text-brand-primary">
                <Icon className="w-5 h-5" />
            </div>
            <div className="p-2 border border-gray-100 rounded-full text-brand-text-muted group-hover:text-brand-primary group-hover:bg-brand-accent transition-all cursor-pointer">
                <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
            </div>
        </div>
        <p className="text-brand-text-muted text-sm font-semibold mb-1 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-brand-text">{value}</h3>
            {trend && (
                <span className={cn(
                    "text-[11px] font-bold px-2.5 py-1 rounded-lg border",
                    trendType === 'positive' && "bg-brand-success/10 text-brand-success border-brand-success/20",
                    trendType === 'negative' && "bg-brand-error/10 text-brand-error border-brand-error/20",
                    trendType === 'meta' && "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                )}>
                    {trend}
                </span>
            )}
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
    return (
        <div className="w-full space-y-8 animate-in fade-in duration-700 pb-10 px-8">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-brand-text">Performance Overview</h1>
                    <p className="text-brand-text-muted text-sm mt-1">Check your sales and analytics across the organization.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-brand-text font-semibold hover:bg-gray-50 transition-all shadow-sm">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Filter Date</span>
                    </button>
                    <Link
                        to="/reportes-permisos"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:brightness-110 shadow-lg shadow-brand-primary/10 transition-all active:scale-95"
                    >
                        <span className="text-lg">+</span> Create Report
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Active Permits" value="2,420" trend="+12%" trendType="positive" icon={ShieldCheck} />
                <StatCard title="Active Projects" value="4,100" trend="+5%" trendType="positive" icon={LayoutGrid} />
                <StatCard title="Safety Score" value="98.5%" trend="+2%" trendType="meta" icon={Users} />
                <StatCard title="Incidents" value="12" trend="-15%" trendType="positive" icon={AlertCircle} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main chart panel */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-2xl font-bold text-brand-text">Total Operations</h3>
                            <p className="text-brand-text-muted text-sm mt-1">Validations by month for current period</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex items-center gap-4 mr-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-brand-primary" />
                                    <span className="text-[11px] font-bold text-brand-text-muted uppercase">View</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-100" />
                                    <span className="text-[11px] font-bold text-brand-text-muted uppercase">Checkout</span>
                                </div>
                            </div>
                            <select className="bg-gray-50 border-none rounded-lg py-2 px-4 text-xs font-bold text-brand-text focus:ring-2 focus:ring-brand-primary/20 outline-none cursor-pointer">
                                <option>Last 30 days</option>
                                <option>Last 7 days</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-1.5 sm:gap-4 px-2">
                        {[45, 78, 52, 91, 64, 85, 55, 68, 88, 72, 95, 60].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                                <div className="w-full bg-gray-50 rounded-lg relative overflow-hidden flex items-end h-48">
                                    <div
                                        className="w-full bg-brand-primary rounded-lg transition-all duration-1000 group-hover/bar:bg-brand-secondary cursor-pointer"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full bg-blue-100/40 rounded-lg pointer-events-none" style={{ height: `${h * 0.4}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-brand-text-muted uppercase">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side information */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-brand-text">Active Personnel</h3>
                            <button className="text-brand-primary text-xs font-bold hover:underline">View All</button>
                        </div>
                        <div className="space-y-5">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-brand-text">30,717</span>
                                <span className="text-brand-success text-[10px] font-bold bg-brand-success/10 px-2 py-0.5 rounded-full">+20%</span>
                            </div>
                            <p className="text-[10px] text-brand-text-muted uppercase font-bold tracking-wider -mt-2">Compare the last month is 27,456</p>

                            <div className="space-y-4 pt-6 border-t border-gray-50">
                                {[
                                    { name: 'ZONA NORTE', val: '20,134', pct: 65, color: 'bg-brand-primary' },
                                    { name: 'ZONA SUR', val: '5,985', pct: 20, color: 'bg-brand-secondary' },
                                    { name: 'PLANTA CENTRAL', val: '4,598', pct: 15, color: 'bg-brand-text-muted' }
                                ].map((loc, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-2 h-2 rounded-full", loc.color)} />
                                            <span className="text-xs font-bold text-brand-text">{loc.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-brand-text block">{loc.val}</span>
                                            <span className="text-[10px] font-bold text-brand-text-muted">({loc.pct}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
