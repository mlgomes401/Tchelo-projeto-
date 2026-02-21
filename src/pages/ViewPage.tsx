import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SalesPage } from '../components/SalesPage';
import { VehicleData } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

export function ViewPage() {
  const { id } = useParams();
  const [data, setData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/vehicles/${id}`);
        if (!response.ok) throw new Error();
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(true);
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
        <p className="text-white/60 font-medium">Carregando oferta premium...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-6 px-6 text-center">
        <AlertCircle className="w-20 h-20 text-brand-red" />
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold">Página não encontrada</h1>
          <p className="text-white/60">O veículo que você procura pode ter sido vendido ou o link está incorreto.</p>
        </div>
        <Link to="/" className="btn-primary">
          Criar minha própria página
        </Link>
      </div>
    );
  }

  return <SalesPage data={data} />;
}
