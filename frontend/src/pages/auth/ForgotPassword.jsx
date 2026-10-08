import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useToast } from '../../components/common/ToastContext';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      addToast(response.message, 'success');
      setIsSent(true);
    } catch (err) {
      addToast(err.message || 'Failed to send reset link', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full animate-fade-in-up">
      <Card>
        <Link to="/auth/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </Link>
        
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Forgot Password</h2>
        
        {!isSent ? (
          <>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Email Address"
                type="email"
                name="email"
                icon={Mail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                error={error}
              />
              
              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                <Send className="w-4 h-4 mr-2" />
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 animate-fade-in-up">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Check your email</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              We've sent password reset instructions to <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>.
            </p>
            {/* Note: In a real app, this link would come from the email. It's just for demo purposes here. */}
            <Link to="/auth/reset-password?token=mock_token_123" className="block mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              [Demo] Go to Reset Password page
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
