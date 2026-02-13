import React, { useState } from 'react';
import { Search, Bell, Mail, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfileModal } from './UserProfileModal';
import { UserAvatar } from './UserAvatar';

export const Header: React.FC = () => {
    const { user, profile } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <>
            <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-gray-100 sticky top-0 z-20">
                <div className="flex-1 max-w-sm md:max-w-2xl">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-11 md:pr-12 pr-4 text-sm text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all placeholder:text-brand-text-muted/60"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 opacity-40">
                            <Command className="w-3.5 h-3.5 text-brand-text" />
                            <span className="text-[10px] font-bold text-brand-text">K</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 pr-4 border-r border-gray-100">
                        <button className="p-2.5 rounded-xl hover:bg-gray-50 text-brand-text-muted hover:text-brand-text transition-all relative group">
                            <Mail className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-full border-2 border-white shadow-sm" />
                        </button>
                        <button className="p-2.5 rounded-xl hover:bg-gray-50 text-brand-text-muted hover:text-brand-text transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-error rounded-full border-2 border-white" />
                        </button>
                    </div>

                    <div
                        className="flex items-center gap-4 pl-2 group cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setIsProfileOpen(true)}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                                {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'}
                            </p>
                            <p className="text-[11px] text-brand-text-muted font-medium">
                                {user?.email || 'No conectado'}
                            </p>
                        </div>
                        <div className="relative">
                            <UserAvatar user={user} name={profile?.full_name} size="md" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-[2.5px] border-white shadow-sm" />
                        </div>
                    </div>
                </div>
            </header>

            <UserProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </>
    );
};
