import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { logger } from '@/lib/logger';

const resetSchema = z.object({
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetFormData = z.infer<typeof resetSchema>;

/**
 * Handles auth callbacks from Supabase (password recovery, email confirmation, etc.)
 * Supports both PKCE code exchange and hash-based token recovery.
 */
const AuthCallback = () => {
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    const handleSession = async () => {
      const hash = window.location.hash;
      const search = window.location.search;
      const params = new URLSearchParams(search);
      const code = params.get('code');

      logger.log('[AuthCallback] Processing callback...', { 
        hasCode: !!code, 
        hasHash: !!hash,
        hashIncludes: hash.includes('access_token') || hash.includes('type=recovery')
      });

      // Method 1: PKCE code exchange (modern flow)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          logger.error('[AuthCallback] PKCE exchange failed:', error.message);
          setSessionError('El enlace ha expirado o es inválido. Solicita uno nuevo desde el login.');
          setReady(true);
          return;
        }
        logger.log('[AuthCallback] PKCE exchange successful');
        window.history.replaceState(null, '', window.location.pathname);
      }

      // Method 2: Hash-based token (legacy flow) - Supabase handles this automatically
      // Just wait for the session to be established
      
      // Give Supabase a moment to process hash tokens
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error('[AuthCallback] Session error:', sessionError.message);
        setSessionError('Error al verificar la sesión. Intenta nuevamente.');
        setReady(true);
        return;
      }

      if (!session) {
        logger.warn('[AuthCallback] No session found');
        setSessionError('El enlace ha expirado o ya fue utilizado. Solicita uno nuevo desde el login.');
        setReady(true);
        return;
      }

      logger.log('[AuthCallback] Session established successfully');
      setReady(true);
    };

    handleSession();
  }, []);

  const onSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password: data.password });
    
    if (error) {
      logger.error('[AuthCallback] Password update failed:', error.message);
      
      let errorMessage = error.message;
      if (error.message.includes('session')) {
        errorMessage = 'Tu sesión ha expirado. Solicita un nuevo enlace de recuperación.';
        setSessionError(errorMessage);
      }
      
      toast.error('Error al actualizar contraseña', {
        description: errorMessage,
      });
      setIsLoading(false);
      return;
    }

    logger.log('[AuthCallback] Password updated successfully');
    setSuccess(true);
    toast.success('Contraseña actualizada correctamente');
    
    // Redirect after a short delay
    setTimeout(() => {
      navigate('/admin/dashboard', { replace: true });
    }, 1500);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Verificando enlace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-foreground mb-2">Alpina</h1>
          <p className="text-muted-foreground text-sm">Restablecer Contraseña</p>
        </div>

        {success ? (
          <div className="bg-card border border-border p-8 space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="font-serif text-2xl text-foreground">¡Contraseña actualizada!</h2>
            <p className="text-sm text-muted-foreground">
              Redirigiendo al panel de administración...
            </p>
          </div>
        ) : sessionError ? (
          <div className="bg-card border border-border p-8 space-y-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
              <h2 className="font-serif text-xl text-foreground">Enlace inválido</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {sessionError}
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
                autoFocus
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

export default AuthCallback;
