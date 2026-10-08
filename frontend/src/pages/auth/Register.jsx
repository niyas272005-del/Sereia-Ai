import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/ToastContext';
import { authService } from '../../services/authService';
import { cn } from '../../utils/cn';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Simple Password Strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength(formData.password);

  const getStrengthColor = () => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const response = await authService.register(formData);
      addToast(response.message, 'success');
      navigate('/auth/login');
    } catch (error) {
      addToast(error.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in-up">
      <Card>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 text-center">Create an Account</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-6 text-sm">Join Sereia Wellness today.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Username"
            type="text"
            name="username"
            icon={User}
            placeholder="your_username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />
          
          <div className="space-y-1">
            <Input 
              label="Password"
              type="password"
              name="password"
              icon={Lock}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
            
            {formData.password && !errors.password && (
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden transition-all">
                <div 
                  className={cn("h-full transition-all duration-300", getStrengthColor())}
                  style={{ width: `${strength}%` }}
                />
              </div>
            )}
          </div>
          
          <Input 
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            icon={CheckCircle2}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          
          <div className="pt-2">
            <label className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
              <input 
                type="checkbox" 
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white/50 dark:bg-slate-800/50" 
              />
              <span className="leading-snug">
                I agree to the <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</a>
              </span>
            </label>
            {errors.acceptTerms && <p className="mt-1.5 text-sm text-red-500 animate-fade-in-up">{errors.acceptTerms}</p>}
          </div>
          
          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            Create Account
          </Button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
