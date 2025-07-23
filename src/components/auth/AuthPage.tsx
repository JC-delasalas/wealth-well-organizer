import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-finance-green-50/30">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-finance-green-100/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-blue-100/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-purple-100/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Enhanced Header with Glassmorphism */}
        <header className="relative p-6 md:p-10">
          {/* Glassmorphism Header Background */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5"></div>

          <div className="relative flex items-center justify-center md:justify-start">
            {/* Enhanced Logo with Neomorphism */}
            <div className="relative">
              <div className="absolute inset-0 bg-finance-green-600 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-br from-finance-green-500 to-finance-green-700 p-4 rounded-2xl shadow-2xl shadow-finance-green-600/25 border border-finance-green-400/20">
                <img
                  src="/lovable-uploads/eb5e50d2-20f4-4a30-840c-4301bd79298e.png"
                  alt="FinanceTracker Logo"
                  className="w-8 h-8 object-contain filter drop-shadow-sm"
                />
              </div>
            </div>

            <div className="ml-4">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                FinanceTracker
              </h1>
              <div className="h-0.5 w-full bg-gradient-to-r from-finance-green-500 to-transparent mt-1 rounded-full"></div>
            </div>
          </div>

          <p className="relative text-center md:text-left text-gray-600 mt-3 text-sm font-medium tracking-wide">
            Wealth Well Organizer - Your Personal Finance Management Solution
          </p>
        </header>

        <div className="relative flex-1 flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 py-12 gap-12 lg:gap-20">
          {/* Left side - Enhanced Hero content */}
          <div className="relative flex-1 max-w-lg lg:max-w-xl text-center lg:text-left">
            {/* Subtle background glow for hero section */}
            <div className="absolute -inset-8 bg-gradient-to-r from-finance-green-50/30 to-transparent rounded-3xl blur-2xl"></div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Master Your
                </span>
                <span className="block bg-gradient-to-r from-finance-green-600 via-finance-green-500 to-finance-green-700 bg-clip-text text-transparent drop-shadow-sm">
                  Financial Future
                </span>
              </h2>

              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-finance-green-200/30 rounded-full blur-sm"></div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-200/20 rounded-full blur-sm"></div>
            </div>

            <p className="relative text-lg md:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
              Take control of your finances with AI-powered insights, smart budgeting, and personalized recommendations designed for your success.
            </p>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              {[
                { icon: Brain, title: "AI Insights", desc: "Smart financial advice powered by machine learning" },
                { icon: BarChart3, title: "Analytics", desc: "Comprehensive reports and data visualization" },
                { icon: Target, title: "Goals", desc: "Savings tracking with progress monitoring" },
                { icon: Shield, title: "Secure", desc: "Bank-level security and data protection" }
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  {/* Neomorphism card with glassmorphism */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/20"></div>
                  <div className="relative bg-white/70 backdrop-blur-sm border border-gray-100/50 rounded-2xl p-6 shadow-xl shadow-black/5">
                    {/* Icon with enhanced styling */}
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-finance-green-500/20 rounded-xl blur-md"></div>
                      <div className="relative bg-gradient-to-br from-finance-green-50 to-finance-green-100/50 p-3 rounded-xl border border-finance-green-200/30">
                        <feature.icon className="w-6 h-6 text-finance-green-600" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center lg:justify-start gap-6 text-center">
              {[
                { value: "10K+", label: "Active Users" },
                { value: "₱2M+", label: "Money Managed" },
                { value: "4.9★", label: "User Rating" }
              ].map((stat, index) => (
                <div key={index} className="relative group">
                  {/* Glassmorphism background with subtle glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/10 border border-white/30"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-finance-green-50/30 to-transparent rounded-2xl"></div>

                  <div className="relative px-6 py-5 rounded-2xl">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-finance-green-600 to-finance-green-700 bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </div>
                  </div>

                  {/* Subtle decorative element */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-finance-green-400/20 rounded-full blur-sm"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Enhanced Auth form */}
          <div className="relative w-full max-w-md">
            {/* Glassmorphism container with multiple layers */}
            <div className="absolute -inset-4 bg-gradient-to-br from-finance-green-100/20 via-white/10 to-blue-100/10 rounded-3xl blur-2xl"></div>
            <div className="absolute -inset-2 bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl shadow-black/10"></div>

            <Card className="relative bg-white/95 backdrop-blur-sm shadow-2xl border border-white/50 rounded-3xl overflow-hidden">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-finance-green-50/20 pointer-events-none"></div>
              <CardHeader className="relative text-center pb-6 pt-8">
                {/* Decorative top border */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-finance-green-500 to-transparent rounded-full"></div>

                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                  Welcome to FinanceTracker
                </CardTitle>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                  Join thousands of users already mastering their finances with our comprehensive wealth management platform
                </p>

                {/* Subtle decorative elements */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-finance-green-300/30 rounded-full"></div>
                <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-blue-300/20 rounded-full"></div>
              </CardHeader>

              <CardContent className="relative px-8 pb-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
                    <TabsTrigger
                      value="signup"
                      className="data-[state=active]:bg-finance-green-600 data-[state=active]:text-white text-gray-700"
                    >
                      Sign Up
                    </TabsTrigger>
                    <TabsTrigger
                      value="signin"
                      className="data-[state=active]:bg-finance-green-600 data-[state=active]:text-white text-gray-700"
                    >
                      Sign In
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signup" className="mt-6">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-gray-900 font-medium">
                          Full Name
                        </Label>
                        <Input
                          id="signup-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                          placeholder="Enter your full name"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-country" className="text-gray-900 font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4 text-finance-green-600" />
                          Country *
                        </Label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={isLoading}>
                          <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200">
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code} className="text-gray-900">
                                <div className="flex items-center justify-between w-full">
                                  <span>{country.name}</span>
                                  <span className="text-xs text-gray-600 ml-2">{country.code}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-gray-900 font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-finance-green-600" />
                          Email *
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                          placeholder="Enter your email address"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-gray-900 font-medium flex items-center gap-2">
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
                            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 pr-10"
                            placeholder="Create a password (min 6 characters)"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-finance-green-600 text-white font-semibold py-3 flex items-center justify-center gap-2"
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
                        <Label htmlFor="signin-email" className="text-gray-900 font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-finance-green-600" />
                          Email *
                        </Label>
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                          placeholder="Enter your email address"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-gray-900 font-medium flex items-center gap-2">
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
                            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 pr-10"
                            placeholder="Enter your password"
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4 text-gray-600" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-finance-green-600 text-white font-semibold py-3 flex items-center justify-center gap-2"
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
                            className="text-sm text-gray-700"
                            disabled={isLoading}
                          >
                            Forgot your password?
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white border border-gray-200">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-gray-900">
                              <Mail className="w-5 h-5 text-finance-green-600" />
                              Reset Password
                            </DialogTitle>
                            <DialogDescription className="text-gray-700">
                              Enter your email address and we'll send you a link to reset your password.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email" className="text-gray-900 font-medium">Email Address</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
                                disabled={isLoading}
                                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                              />
                            </div>
                            <p className="text-sm text-gray-600">
                              We'll send you a secure link to reset your password.
                            </p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsResetPasswordOpen(false)}
                                disabled={isLoading}
                                className="flex-1 border-gray-300 text-gray-700"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={isLoading || !forgotPasswordEmail}
                                className="flex-1 bg-finance-green-600 text-white"
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
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
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

            <div className="mt-8 text-center">
              <div className="relative group">
                {/* Glassmorphism background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/30"></div>
                <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/50">
                  <div className="relative">
                    <div className="absolute inset-0 bg-finance-green-500/10 rounded-full blur-lg"></div>
                    <Smartphone className="relative w-7 h-7 text-finance-green-600 mx-auto mb-3" />
                  </div>
                  <p className="text-sm text-gray-900 font-bold mb-1">Available on all devices</p>
                  <p className="text-xs text-gray-600 font-medium">Access your finances anywhere, anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer with Glassmorphism */}
        <footer className="relative p-6 md:p-10 text-center">
          {/* Glassmorphism footer background */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-t border-white/20 shadow-lg shadow-black/5"></div>

          <div className="relative">
            <p className="text-sm text-gray-600 font-medium mb-3">
              By signing up, you agree to our terms of service and privacy policy
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <span>© 2024 FinanceTracker - Wealth Well Organizer.</span>
              <span className="text-finance-green-600 font-medium">Developed by Millennial_TV.</span>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-finance-green-400/30 to-transparent rounded-full"></div>
          </div>
        </footer>
      </div>
    </div>
  );
};
