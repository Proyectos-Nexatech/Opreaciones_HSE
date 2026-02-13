import React, { useState } from 'react';

interface UserAvatarProps {
    user: {
        email?: string;
        user_metadata?: {
            full_name?: string;
            avatar_url?: string;
        };
    } | null;
    className?: string; // For wrapper sizing
    size?: 'sm' | 'md' | 'lg' | 'xl'; // Standard sizes
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, className = '', size = 'md' }) => {
    const [imageError, setImageError] = useState(false);

    const email = user?.email || '';
    const name = user?.user_metadata?.full_name || email.split('@')[0] || 'U';
    const avatarUrl = user?.user_metadata?.avatar_url;

    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const initials = getInitials(name);

    // Size mappings for container
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-24 h-24 text-2xl',
    };

    const containerClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white relative overflow-hidden ${className}`;

    // Deterministic color based on name length/char
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = name.length % colors.length;
    const bgColor = colors[colorIndex];

    if (avatarUrl && !imageError) {
        return (
            <div className={containerClasses}>
                <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <div className={`${containerClasses} ${bgColor}`}>
            {initials}
        </div>
    );
};
