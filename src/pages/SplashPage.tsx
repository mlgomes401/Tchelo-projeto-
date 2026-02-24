import React from 'react';
import { motion } from 'motion/react';
import { Rocket, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SplashPage() {
    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 text-center space-y-12 max-w-2xl"
            >
                <div className="space-y-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center justify-center p-5 bg-brand-red rounded-3xl shadow-2xl shadow-brand-red/40 mb-4"
                    >
                        <Rocket className="text-white w-12 h-12" />
                    </motion.div>

                    <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-white">
                        AutoPage <span className="text-brand-red">Pro</span>
                    </h1>

                    <p className="text-white/40 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
                        A plataforma definitiva para acelerar suas vendas automotivas.
                    </p>
                </div>

                <div className="pt-8">
                    <Link to="/crm/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.05, x: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="group flex items-center gap-4 bg-white text-slate-950 px-12 py-6 rounded-full text-xl font-black uppercase tracking-widest shadow-2xl hover:bg-brand-red hover:text-white transition-all duration-300"
                        >
                            Iniciar Agora
                            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                        </motion.button>
                    </Link>
                </div>

                <div className="pt-20 flex items-center justify-center gap-8 opacity-20">
                    <div className="h-px w-12 bg-white" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Powered by AIOS</span>
                    <div className="h-px w-12 bg-white" />
                </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 opacity-10 blur-sm pointer-events-none"
            >
                <Rocket size={100} className="text-white" />
            </motion.div>
        </div>
    );
}
