import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

interface Breadcrumb {
    label: string;
    href?: string;
    active?: boolean;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: (string | Breadcrumb)[];
    actions?: React.ReactNode;
    showBack?: boolean;
}

export default function PageHeader({ title, subtitle, breadcrumbs, actions, showBack }: PageHeaderProps) {
    return (
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1">
                {showBack && (
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-[10px] font-bold text-brand-red uppercase tracking-[0.2em] mb-4 hover:opacity-70 transition-opacity"
                    >
                        <ArrowLeft size={14} />
                        Voltar
                    </button>
                )}
                {breadcrumbs && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">
                        <Home size={12} className="text-brand-red" />
                        <ChevronRight size={12} />
                        {breadcrumbs.map((crumb, i) => {
                            const label = typeof crumb === 'string' ? crumb : crumb.label;
                            return (
                                <React.Fragment key={label}>
                                    <span className={typeof crumb !== 'string' && crumb.active ? "text-white" : ""}>
                                        {label}
                                    </span>
                                    {i < breadcrumbs.length - 1 && <ChevronRight size={12} />}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-display font-black text-white tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-white/40 font-medium text-base">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
