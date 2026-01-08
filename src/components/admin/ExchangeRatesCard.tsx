import { RefreshCw, DollarSign, Building2, Euro, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useExchangeRates, useSyncExchangeRates } from '@/hooks/useExchangeRates';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ExchangeRatesCard = () => {
  const { data: rates, isLoading } = useExchangeRates();
  const { mutate: syncRates, isPending: isSyncing } = useSyncExchangeRates();

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, HH:mm", { locale: es });
    } catch {
      return 'Fecha desconocida';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-medium">Tipos de Cambio</CardTitle>
          <CardDescription>
            Sincronización automática diaria desde mindicador.cl
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => syncRates()}
          disabled={isSyncing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Actualizando...' : 'Actualizar ahora'}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : rates ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* USD Rate */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dólar (USD)</p>
                  <p className="text-lg font-semibold">${formatCurrency(rates.usd_to_clp)} CLP</p>
                </div>
              </div>

              {/* UF Rate */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Building2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">UF</p>
                  <p className="text-lg font-semibold">${formatCurrency(rates.uf_to_clp)} CLP</p>
                </div>
              </div>

              {/* EUR Rate */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <div className="p-2 rounded-full bg-purple-500/10">
                  <Euro className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Euro (EUR)</p>
                  <p className="text-lg font-semibold">${formatCurrency(rates.eur_to_clp)} CLP</p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <Clock className="h-4 w-4" />
              <span>Última actualización: {formatDate(rates.updated_at)}</span>
              <span className="text-xs">• Fuente: {rates.source}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No hay tipos de cambio registrados.</p>
            <Button
              variant="default"
              size="sm"
              className="mt-3"
              onClick={() => syncRates()}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sincronizar ahora
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeRatesCard;
