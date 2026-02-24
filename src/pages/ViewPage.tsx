import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SalesPage } from '../components/SalesPage';
import { VehicleData } from '../types';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/vehicles/${id}`);
        if (!response.ok) throw new Error('Página não encontrada');
        const result = await response.json();
        
        // Fetch status separately if needed, or update server.ts to return it
        // For now, let's assume server.ts returns { ...data, status }
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (data) {
      document.title = `${data.model} ${data.version} - ${data.year} | AutoPage Pro`;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
        <p className="text-white/50 font-medium">Carregando oferta...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="p-4 bg-red-500/10 rounded-full">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Ops! Algo deu errado</h1>
          <p className="text-white/50 max-w-xs mx-auto">
            {error || 'Não conseguimos encontrar a página que você está procurando.'}
          </p>
        </div>
        <Link 
          to="/" 
          className="flex items-center gap-2 text-brand-red font-bold hover:underline"
        >
          <ArrowLeft size={20} />
          Voltar ao Início
        </Link>
      </div>
    );
  }

  return <SalesPage data={data} />;
}
