import React from 'react';

export const NexatechLogo: React.FC<{ className?: string, mode?: 'light' | 'dark' }> = ({ className, mode = 'dark' }) => {
    const textColor = mode === 'dark' ? 'white' : '#0f172a';
    const blueColor = '#2d68b5';

    return (
        <svg
            viewBox="0 0 450 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* 3D HEXAGON ICON */}
            <g transform="translate(185, 10) scale(1.2)">
                {/* Top Facet */}
                <path d="M40 0L80 20L40 40L0 20L40 0Z" fill="#9ec4ea" />
                {/* Right Facet */}
                <path d="M80 20L80 60L40 80L40 40L80 20Z" fill="#2d68b5" />
                {/* Left Facet */}
                <path d="M0 20L0 60L40 80L40 40L0 20Z" fill="#4a89cc" />
                {/* Inner Detail / Hole effect */}
                <path d="M40 30L55 37.5V52.5L40 60L25 52.5V37.5L40 30Z" fill="white" fillOpacity="0.2" />
            </g>

            {/* NEXATECH TEXT WITH STYLIZED E */}
            <g transform="translate(0, 140)">
                {/* N */}
                <text x="0" y="0" fill={textColor} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '58px' }}>N</text>

                {/* Stylized E (Blue) */}
                <path d="M85 -45H125V-35H95V-25H120V-15H95V-5H125V5H85V-45Z" fill={blueColor} />

                {/* X */}
                <text x="145" y="0" fill={textColor} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '58px' }}>X</text>

                {/* A */}
                <text x="210" y="0" fill={textColor} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '58px' }}>A</text>

                {/* T */}
                <text x="275" y="0" fill={textColor} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '58px' }}>T</text>

                {/* Stylized E (Blue) */}
                <path d="M335 -45H375V-35H345V-25H370V-15H345V-5H375V5H335V-45Z" fill={blueColor} />

                {/* C */}
                <text x="395" y="0" fill={textColor} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '58px' }}>C</text>

                {/* H */}
                <text x="455" y="0" fill={textColor} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '58px' }}>H</text>
            </g>
        </svg>
    );
};
