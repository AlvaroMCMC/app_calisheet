import React from 'react';
import { Dumbbell, Mail, Lock, Eye, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background-dark font-display text-white">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-y-1/3"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-10 py-4 bg-background-dark/80 backdrop-blur-md border-b border-border-dark">
        <div className="flex items-center gap-4">
          <div className="text-primary">
            <Dumbbell size={32} fill="currentColor" />
          </div>
          <h2 className="text-lg font-bold leading-tight hidden sm:block">Calisthenics Tracker</h2>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-text-secondary hidden sm:block">¿No tienes cuenta?</span>
          <a href="#" className="text-primary text-sm font-bold hover:text-primary/80 transition-colors">
            Registrarse
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[480px] flex flex-col gap-6">
          
          <div className="flex flex-col items-center text-center gap-2 mb-4">
            <div className="p-3 bg-primary/10 rounded-full mb-2">
              <Dumbbell size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Bienvenido de nuevo
            </h1>
            <p className="text-text-secondary text-base font-normal max-w-[320px]">
              Ingresa tus credenciales para acceder a tu historial de entrenamiento y progreso.
            </p>
          </div>

          <div className="bg-[#1c2127] rounded-xl border border-border-dark shadow-xl p-6 sm:p-8">
            <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
              <div className="flex flex-col gap-2">
                <label className="text-white text-sm font-semibold" htmlFor="email">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                    <Mail size={20} />
                  </div>
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-border-dark bg-[#151a1f] pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-white text-sm font-semibold" htmlFor="password">
                    Contraseña
                  </label>
                  <a href="#" className="text-primary text-xs font-medium hover:underline">¿Olvidaste tu contraseña?</a>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                    <Lock size={20} />
                  </div>
                  <input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border-dark bg-[#151a1f] pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors">
                    <Eye size={20} />
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 transition-transform active:scale-[0.98]">
                <span>Iniciar Sesión</span>
                <ArrowRight size={20} />
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border-dark"></div>
                <span className="flex-shrink mx-4 text-xs text-text-secondary uppercase font-medium">O continuar con</span>
                <div className="flex-grow border-t border-border-dark"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-border-dark bg-[#252b33] hover:bg-[#2d343d] text-white text-sm font-medium h-10 transition-colors">
                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    Google
                </button>
                <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-border-dark bg-[#252b33] hover:bg-[#2d343d] text-white text-sm font-medium h-10 transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M13.135 6.05c-.26-.82-1.22-1.35-2.25-1.35-1.07 0-1.87.5-2.31 1.05l-.06.08-.04.06c-.66.86-.96 2.11-.66 3.36.19.82.72 2.04 1.76 3.2 1.34 1.49 2.97 2.04 4.09 2.04 1.04 0 2.22-.52 2.76-1.55.33-.63.46-1.36.37-2.05-.13-1.05-.66-2.14-1.74-3.11l-.54-.48c-.68-.61-1.26-1.12-1.38-1.25zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.09 15.69c-.83 1.57-2.67 2.31-4.29 2.31-1.67 0-3.96-.8-5.74-2.77-1.42-1.57-2.13-3.23-2.39-4.35-.39-1.68-.01-3.34.87-4.49l.06-.07.06-.08c.59-.72 1.66-1.39 3.09-1.39 1.46 0 2.8.76 3.16 1.9.43.08.85.22 1.25.43 1.57 1.41 2.34 2.99 2.53 4.54.14 1.07-.06 2.22-.6 3.16z"></path>
                    </svg>
                    Apple
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-xs text-text-secondary">
          © 2024 Calisthenics Tracker. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default LoginView;