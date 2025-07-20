import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useCountryCurrency } from '@/hooks/useCurrency';
import {
  Loader2,
  TrendingUp,
  Shield,
  Smartphone,
  BarChart3,
  PiggyBank,
  Target,
  Brain,
  Zap,
  Mail,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('PH'); // Default to Philippines
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const { signIn, signUp, resetPassword, loading } = useAuth();
  const { countries, getCountryDefaultCurrency } = useCountryCurrency();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !email || !password) return;
    
    setIsSubmitting(true);
    try {
      // Attempting to sign in - logging removed for security
      const result = await signIn(email, password);
      if (result.error) {
        console.error('Sign in failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !email || !password || !selectedCountry) return;

    setIsSubmitting(true);
    try {
      // Attempting to sign up - logging removed for security
      const result = await signUp(email, password, fullName, selectedCountry);
      if (result.error) {
        console.error('Sign up failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !forgotPasswordEmail) return;
    
    setIsSubmitting(true);
    try {
      console.log('Attempting to reset password for:', forgotPasswordEmail);
      const result = await resetPassword(forgotPasswordEmail);
      if (!result.error) {
        setIsResetPasswordOpen(false);
        setForgotPasswordEmail('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <div className="min-h-screen bg-finance-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-finance-green-400/20 to-finance-green-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-finance-green-300/20 to-finance-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-finance-green-200/10 to-finance-green-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-8">
          <div className="flex items-center justify-center md:justify-start">
            <div className="glass-card-green p-3 rounded-full">
              <img
                src="/lovable-uploads/eb5e50d2-20f4-4a30-840c-4301bd79298e.png"
                alt="FinanceTracker Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="ml-3 text-2xl md:text-3xl font-bold bg-gradient-to-r from-finance-green-600 to-finance-green-800 bg-clip-text text-transparent">
              FinanceTracker
            </h1>
          </div>
          <p className="text-center md:text-left text-white mt-2 text-sm">
            Wealth Well Organizer - Your Personal Finance Management Solution
          </p>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 md:px-8 py-8 gap-8 lg:gap-16">
          {/* Left side - Hero content */}
          <div className="flex-1 max-w-lg lg:max-w-xl text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Master Your
              <span className="text-finance-green-400 block">
                Financial Future
              </span>
            </h2>

            <p className="text-lg md:text-xl text-white mb-8 leading-relaxed">
              Take control of your finances with AI-powered insights, smart budgeting, and personalized recommendations designed for your success.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: Brain, title: "AI Insights", desc: "Smart financial advice powered by machine learning" },
                { icon: BarChart3, title: "Analytics", desc: "Comprehensive reports and data visualization" },
                { icon: Target, title: "Goals", desc: "Savings tracking with progress monitoring" },
                { icon: Shield, title: "Secure", desc: "Bank-level security and data protection" }
              ].map((feature, index) => (
                <div key={index} className="glass-card rounded-xl p-4 hover:glass-card-green transition-all duration-300 group">
                  <feature.icon className="w-6 h-6 text-finance-green-400 mb-2 group-hover:text-finance-green-300 transition-colors" />
                  <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                  <p className="text-xs text-white/80">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center lg:justify-start gap-8 text-center">
              <div className="glass-card p-4 rounded-lg">
                <div className="text-2xl md:text-3xl font-bold text-finance-green-400">10K+</div>
                <div className="text-sm text-white">Active Users</div>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <div className="text-2xl md:text-3xl font-bold text-finance-green-400">₱2M+</div>
                <div className="text-sm text-white">Money Managed</div>
              </div>
              <div className="glass-card p-4 rounded-lg">
                <div className="text-2xl md:text-3xl font-bold text-finance-green-400">4.9★</div>
                <div className="text-sm text-white">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="w-full max-w-md">
            <Card className="glass-card-green shadow-2xl border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-finance-gray-900">
                  Welcome to FinanceTracker
                </CardTitle>
                <p className="text-finance-gray-600 text-sm">
                  Join thousands of users already mastering their finances with our comprehensive wealth management platform
                </p>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 glass-card">
                    <TabsTrigger
                      value="signup"
                      className="data-[state=active]:btn-finance-primary data-[state=active]:text-white transition-all duration-300"
                    >
                      Sign Up
                    </TabsTrigger>
                    <TabsTrigger
                      value="signin"
                      className="data-[state=active]:btn-finance-primary data-[state=active]:text-white transition-all duration-300"
                    >
                      Sign In
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signup" className="mt-6">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-finance-gray-700 font-medium">
                          Full Name
                        </Label>
                        <Input
                          id="signup-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="input-finance"
                          placeholder="Enter your full name"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-country" className="text-finance-gray-700 font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4 text-finance-green-600" />
                          Country *
                        </Label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={isLoading}>
                          <SelectTrigger className="input-finance">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-0">
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code} className="hover:bg-finance-green-50">
                                <div className="flex items-center justify-between w-full">
                                  <span>{country.name}</span>
                                  <span className="text-xs text-finance-gray-500 ml-2">{country.code}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-finance-gray-700 font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-finance-green-600" />
                          Email *
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="input-finance"
                          placeholder="Enter your email address"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-finance-gray-700 font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4 text-finance-green-600" />
                          Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="input-finance pr-10"
                            placeholder="Create a password (min 6 characters)"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-finance-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-finance-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full btn-finance-primary font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        disabled={isLoading || !email || !password || !selectedCountry}
                      >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {!isLoading && <CheckCircle className="h-4 w-4" />}
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signin" className="mt-6">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-finance-gray-700 font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-finance-green-600" />
                          Email *
                        </Label>
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="input-finance"
                          placeholder="Enter your email address"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-finance-gray-700 font-medium flex items-center gap-2">
                          <Shield className="w-4 h-4 text-finance-green-600" />
                          Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-finance pr-10"
                            placeholder="Enter your password"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-finance-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-finance-gray-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full btn-finance-primary font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        disabled={isLoading || !email || !password}
                      >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {!isLoading && <Shield className="h-4 w-4" />}
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </form>
                    
                    <div className="mt-4 text-center">
                      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-sm text-finance-gray-600 hover:text-finance-green-600 transition-colors"
                            disabled={isLoading}
                          >
                            Forgot your password?
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md glass-card border-0">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-finance-gray-900">
                              <Mail className="w-5 h-5 text-finance-green-600" />
                              Reset Password
                            </DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email" className="text-finance-gray-700 font-medium">Email Address</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
                                disabled={isLoading}
                                className="input-finance"
                              />
                            </div>
                            <p className="text-sm text-finance-gray-600">
                              We'll send you a secure link to reset your password.
                            </p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsResetPasswordOpen(false)}
                                disabled={isLoading}
                                className="flex-1 btn-finance-secondary"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={isLoading || !forgotPasswordEmail}
                                className="flex-1 btn-finance-primary"
                              >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Reset Link
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Trust indicators */}
                <div className="mt-6 pt-6 border-t border-finance-green-200/30">
                  <div className="flex items-center justify-center gap-4 text-xs text-finance-gray-600">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-finance-green-600" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PiggyBank className="w-3 h-3 text-finance-green-600" />
                      <span>Bank-level Security</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <div className="glass-card rounded-xl p-4">
                <Smartphone className="w-6 h-6 text-finance-green-600 mx-auto mb-2" />
                <p className="text-sm text-finance-gray-700 font-medium">Available on all devices</p>
                <p className="text-xs text-finance-gray-600">Access your finances anywhere, anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 md:p-8 text-center">
          <p className="text-sm text-finance-gray-600">
            By signing up, you agree to our terms of service and privacy policy
          </p>
          <p className="text-xs text-finance-gray-500 mt-2">
            © 2024 FinanceTracker - Wealth Well Organizer. Developed by JC de las Alas.
          </p>
        </footer>
      </div>
    </div>
  );
};
