import React, { useState } from 'react';
import { ArrowLeft, Lock, User, Loader2 } from 'lucide-react';
import { View } from '../App';
import { useAuth } from '../context/AuthContext';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onViewChange: (view: View) => void; // ✅ CORREGIDO: Cambiar de string a View
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onViewChange }) => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(credentials.username, credentials.password);
      if (result.success) {
        onLoginSuccess(); // Cambiar de onViewChange('admin') a onLoginSuccess()
      } else {
        setError(result.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      setError('Error al intentar iniciar sesión');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => onViewChange('home')} // ✅ Ahora funciona correctamente
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver al inicio</span>
        </button>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-black" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
            <p className="text-gray-400 mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="username"
                  required
                  value={credentials.username}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none"
                  placeholder="Ingresa tu usuario"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  required
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 outline-none"
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg transition-colors flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-300'}`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Ingresa tus credenciales de administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;