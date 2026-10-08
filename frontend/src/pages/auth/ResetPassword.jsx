import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/ToastContext';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      addToast('Invalid or expired reset token.', 'error');
      navigate('/auth/login');
    }
  }, [token, navigate, addToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, formData.password);
      addToast(response.message, 'success');
      setIsSuccess(true);
    } catch (error) {
      addToast(error.message || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full animate-fade-in-up">
        <Card className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Password Reset Successfully</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
            Your password has been changed. You can now login with your new credentials.
          </p>
          <Button onClick={() => navigate('/auth/login')} className="w-full">
            Go to Login <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in-up">
      <Card>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Reset Password</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          Please enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="New Password"
            type="password"
            name="password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          
          <Input 
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            icon={Lock}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          
          <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
            Reset Password
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
