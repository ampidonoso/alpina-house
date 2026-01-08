import { useState, useEffect } from 'react';
import { MapPin, Mail, Phone, Calendar, Clock, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { TableRowSkeleton } from '@/components/admin/AdminSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuoteRequest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  model: string | null;
  notes: string | null;
  status: string;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  contacted: 'Contactado',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  const fetchQuotes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar cotizaciones');
      console.error(error);
    } else {
      setQuotes(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('quote_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Error al actualizar estado');
    } else {
      toast.success('Estado actualizado');
      setQuotes(quotes.map(q => q.id === id ? { ...q, status: newStatus } : q));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('quote_requests')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast.error('Error al eliminar cotización');
    } else {
      toast.success('Cotización eliminada');
      setQuotes(quotes.filter(q => q.id !== deleteId));
    }
    setDeleteId(null);
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = searchQuery === '' || 
      q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <AdminPageHeader 
        title="Cotizaciones"
        description="Gestiona las solicitudes de cotización recibidas"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre, email, modelo o ubicación..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="contacted">Contactado</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-foreground">{quotes.length}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{quotes.filter(q => q.status === 'pending').length}</div>
          <div className="text-sm text-muted-foreground">Pendientes</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{quotes.filter(q => q.status === 'contacted').length}</div>
          <div className="text-sm text-muted-foreground">Contactados</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{quotes.filter(q => q.status === 'completed').length}</div>
          <div className="text-sm text-muted-foreground">Completados</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Modelo</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ubicación</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No se encontraron cotizaciones
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{quote.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail size={12} /> {quote.email}
                      </div>
                      {quote.phone && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone size={12} /> {quote.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-foreground">{quote.model || '-'}</span>
                    </td>
                    <td className="p-4">
                      {quote.location ? (
                        <div className="flex items-start gap-1">
                          <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                          <div>
                            <div className="text-foreground text-sm">{quote.location}</div>
                            {quote.location_lat && quote.location_lng && (
                              <a
                                href={`https://www.google.com/maps?q=${quote.location_lat},${quote.location_lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                Ver en mapa
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Select
                        value={quote.status}
                        onValueChange={(value) => handleStatusChange(quote.id, value)}
                      >
                        <SelectTrigger className={`w-32 h-8 text-xs border ${statusColors[quote.status] || ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="contacted">Contactado</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar size={12} />
                        {formatDate(quote.created_at)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedQuote(quote)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(quote.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cotización será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quote Detail Modal */}
      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle de Cotización</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Nombre</div>
                  <div className="font-medium">{selectedQuote.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{selectedQuote.email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Teléfono</div>
                  <div className="font-medium">{selectedQuote.phone || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Modelo</div>
                  <div className="font-medium">{selectedQuote.model || '-'}</div>
                </div>
              </div>
              
              {selectedQuote.location && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ubicación</div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{selectedQuote.location}</div>
                      {selectedQuote.location_lat && selectedQuote.location_lng && (
                        <div className="text-sm text-muted-foreground">
                          {selectedQuote.location_lat.toFixed(6)}, {selectedQuote.location_lng.toFixed(6)}
                          <a
                            href={`https://www.google.com/maps?q=${selectedQuote.location_lat},${selectedQuote.location_lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary hover:underline"
                          >
                            Abrir en Google Maps
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedQuote.notes && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Notas</div>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-wrap">
                    {selectedQuote.notes.split(' | ').map((note, i) => (
                      <div key={i} className="py-1">{note}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Recibida: {formatDate(selectedQuote.created_at)}
                </div>
                <Badge className={statusColors[selectedQuote.status]}>
                  {statusLabels[selectedQuote.status]}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminQuotes;
