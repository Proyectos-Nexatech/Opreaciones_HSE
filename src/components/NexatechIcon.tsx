import React from 'react';

export const NexatechIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <svg
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Top Facet */}
            <path d="M40 0L80 20L40 40L0 20L40 0Z" fill="#9ec4ea" />
            {/* Right Facet */}
            <path d="M80 20L80 60L40 80L40 40L80 20Z" fill="#2d68b5" />
            {/* Left Facet */}
            <path d="M0 20L0 60L40 80L40 40L0 20Z" fill="#4a89cc" />
            {/* Inner Detail / Hole effect */}
            <path d="M40 30L55 37.5V52.5L40 60L25 52.5V37.5L40 30Z" fill="white" fillOpacity="0.2" />
        </svg>
    );
};
