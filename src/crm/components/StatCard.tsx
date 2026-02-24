import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface StatCardProps {
    label: string;
    value: string | number | undefined;
    icon: LucideIcon;
    color: string;
    trend?: string;
    index: number;
}

export default function StatCard({ label, value, icon: Icon, color, trend, index }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-white/20 transition-all border-white/5 bg-slate-900/40"
        >
            {/* Glow Effect */}
            <div className={cn("absolute -top-12 -right-12 w-24 h-24 blur-[60px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40", color.replace('text-', 'bg-'))} />

            <div className="flex items-center justify-between relative z-10">
                <div className={cn("p-3 rounded-xl bg-white/5", color)}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                        {trend}
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-3xl font-display font-bold text-white tracking-tight">{value}</h3>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mt-1">{label}</p>
            </div>
        </motion.div>
    );
}
