import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { user, isAdmin, isLoading: authLoading, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Only redirect to reset-password if explicitly type=recovery is present
    const hash = window.location.hash ?? '';
    const search = window.location.search ?? '';
    const isRecovery = hash.includes('type=recovery') || search.includes('type=recovery');

    if (isRecovery) {
      navigate('/admin/reset-password', { replace: true });
      return;
    }

    if (!authLoading && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    logger.log('[AdminLogin] Attempting login with:', data.email);
    
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        logger.error('[AdminLogin] Login error:', error);
        let errorMessage = error.message;
        
        // Mensajes de error más descriptivos
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor confirma tu email antes de iniciar sesión';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Demasiados intentos. Espera unos minutos.';
        }
        
        toast.error('Error al iniciar sesión', {
          description: errorMessage,
        });
        setIsLoading(false);
        return;
      }

      logger.log('[AdminLogin] Login successful, waiting for auth state change...');
      // Auth state change will handle redirect
    } catch (err) {
      logger.error('[AdminLogin] Unexpected error:', err);
      toast.error('Error inesperado', {
        description: 'Por favor intenta de nuevo',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-foreground mb-2">Alpina</h1>
          <p className="text-muted-foreground text-sm">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-8 border border-border">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="admin@alpina.cl"
              className="bg-background"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
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

          <Button
            type="submit"
            variant="cta"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Button>

          <div className="pt-4 border-t border-border mt-4">
            <Button
              type="button"
              variant="link"
              className="w-full justify-center"
              onClick={() => setShowForgotPassword(true)}
            >
              ¿Olvidaste tu contraseña?
            </Button>
          </div>
        </form>

        {/* Modal de recuperar contraseña */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border p-8 w-full max-w-md pointer-events-auto">
              <h2 className="font-serif text-2xl text-foreground mb-4">Recuperar Contraseña</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  const { error } = await resetPassword(forgotEmail);
                  setIsLoading(false);
                  
                  if (error) {
                    toast.error('Error al enviar email', { description: error.message });
                    return;
                  }
                  
                  toast.success('Email enviado', {
                    description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
                  });
                  setShowForgotPassword(false);
                  setForgotEmail('');
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@alpina.cl"
                    className="bg-background"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotEmail('');
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="cta"
                    className="flex-1"
                    disabled={isLoading || !forgotEmail}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
