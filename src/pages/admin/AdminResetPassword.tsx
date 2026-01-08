import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const resetSchema = z.object({
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetFormData = z.infer<typeof resetSchema>;

const AdminResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);
  const { updatePassword, session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    const hash = window.location.hash ?? '';
    const search = window.location.search ?? '';
    const params = new URLSearchParams(search);
    const code = params.get('code');

    const looksLikeRecovery =
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      !!code ||
      hash.includes('access_token=') ||
      hash.includes('refresh_token=');

    // Track if we've attempted to process the recovery link
    let processingAttempted = false;

    const processRecoveryLink = async () => {
      // If we received a PKCE code, exchange it for a session
      if (code && !session) {
        processingAttempted = true;
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('[Recovery] PKCE exchange failed:', error.message);
          setLinkExpired(true);
          return;
        }
        // Clear the code from URL after successful exchange
        const newUrl = window.location.pathname;
        window.history.replaceState(null, '', newUrl);
        return;
      }

      // If we have a hash with access_token, let Supabase SDK handle it automatically
      // The SDK's onAuthStateChange will fire with the session
      // Only clear the hash AFTER we confirm we have a session
      if (hash.includes('access_token=') || hash.includes('type=recovery')) {
        processingAttempted = true;
        // Don't clear immediately - wait for session to be established
        // The hash will be cleared after successful password update
      }
    };

    processRecoveryLink();

    // If we're in a recovery flow and no session after processing, wait for SDK
    // Only show expired if we've waited and still no session
    if (!authLoading && !session && !processingAttempted) {
      if (looksLikeRecovery) {
        // Give more time for SDK to process the hash token
        const t = window.setTimeout(() => {
          // Re-check session before marking expired
          supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
            if (!currentSession) {
              setLinkExpired(true);
            }
          });
        }, 3000);
        return () => window.clearTimeout(t);
      }

      // No recovery indicators and no session = expired/invalid
      setLinkExpired(true);
    }
  }, [session, authLoading]);

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    
    const { error } = await updatePassword(data.password);
    
    if (error) {
      toast.error('Error al actualizar contraseña', {
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast.success('Contraseña actualizada correctamente');
    // Mark recovery flow as completed to prevent redirect loops
    window.sessionStorage.removeItem('alpina_recovery_handled');
    navigate('/admin/dashboard');
  };

  const isRecoveryUrl =
    (window.location.hash ?? '').includes('type=recovery') ||
    (window.location.search ?? '').includes('type=recovery') ||
    (window.location.search ?? '').includes('code=') ||
    (window.location.hash ?? '').includes('access_token=');

  if (authLoading || (isRecoveryUrl && !session && !linkExpired)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Validando enlace de recuperación…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-foreground mb-2">Alpina</h1>
          <p className="text-muted-foreground text-sm">Nueva Contraseña</p>
        </div>

        {(!session && linkExpired) ? (
          <div className="bg-card border border-border p-8 space-y-4">
            <h2 className="font-serif text-2xl text-foreground">Enlace inválido o expirado</h2>
            <p className="text-sm text-muted-foreground">
              Vuelve al login y solicita un nuevo enlace en “¿Olvidaste tu contraseña?”.
            </p>
            <Button variant="cta" className="w-full" onClick={() => navigate('/admin')}>
              Volver al Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 border border-border">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="bg-background"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="bg-background"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="cta"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminResetPassword;
