import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/ToastContext';
import { authService } from '../../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    // Clear error when user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await authService.login({ email: formData.email, password: formData.password });
      addToast('Successfully logged in!', 'success');
      navigate('/dashboard'); // Mock redirect
    } catch (error) {
      addToast(error.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in-up">
      <Card>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 text-center">Welcome Back</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Username"
            type="text"
            name="email"
            icon={Mail}
            placeholder="demo_user"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            hint="Default: demo_user"
            autoComplete="username"
          />
          
          <Input 
            label="Password"
            type="password"
            name="password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            hint="Default: password123"
          />
          
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <input 
                type="checkbox" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white/50 dark:bg-slate-800/50" 
              />
              <span>Remember me</span>
            </label>
            
            <Link to="/auth/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          
          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>
          
          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or continue with</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          
          <Button type="button" variant="outline" className="w-full bg-white/50 dark:bg-slate-800/50">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>
        </form>
        
        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
            Register now
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
