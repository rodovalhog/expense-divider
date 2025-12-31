import React from 'react';
import { ExternalLink, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SponsoredBannerProps {
    title: string;
    description: string;
    link: string;
    ctaText?: string;
    className?: string;
    icon?: React.ElementType;
}

export function SponsoredBanner({
    title,
    description,
    link,
    ctaText = "Saiba mais",
    className,
    icon: Icon = Megaphone
}: SponsoredBannerProps) {
    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group relative flex items-center gap-4 p-4 overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-800/50 hover:border-blue-500/30 transition-all duration-300",
                className
            )}
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />

            <div className="flex-shrink-0 p-3 bg-neutral-800 rounded-lg border border-neutral-700 group-hover:border-blue-500/30 transition-colors">
                <Icon className="w-6 h-6 text-neutral-400 group-hover:text-blue-400 transition-colors" />
            </div>

            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                        Parceiro
                    </span>
                    <h3 className="font-semibold text-neutral-200 group-hover:text-white truncate transition-colors">
                        {title}
                    </h3>
                </div>
                <p className="text-sm text-neutral-400 line-clamp-2 md:line-clamp-1 group-hover:text-neutral-300 transition-colors">
                    {description}
                </p>
            </div>

            <div className="flex-shrink-0 hidden sm:flex items-center gap-1 text-sm font-medium text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                {ctaText}
                <ExternalLink className="w-3 h-3" />
            </div>
        </a>
    );
}
