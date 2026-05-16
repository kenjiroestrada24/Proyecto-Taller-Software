import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ChevronRight } from 'lucide-react';
import { login } from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await login({ email, password });
      
      // Guardar información básica en localStorage para el dashboard
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userEmail', data.email);
      
      if (data.role === 'ADMIN') {
        navigate('/admin/super');
      } else {
        localStorage.setItem('storeId', data.storeId);
        navigate('/admin/owner');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20">
      <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-xl shadow-blue-500/5">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Panel de Control</h1>
          <p className="text-slate-400 text-sm mt-2">Gestiona tu tienda y visualiza tus métricas.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-2xl text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="text-center pt-4">
            <p className="text-slate-400 text-xs font-bold">
              ¿Quieres vender en MultiShop? <Link to="/admin/register" className="text-blue-500 hover:underline">Registra tu tienda aquí</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
