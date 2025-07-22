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
    <div className="min-h-screen bg-white">
      <div className="min-h-screen flex flex-col bg-white">
        {/* Header */}
        <header className="p-4 md:p-8 bg-white">
          <div className="flex items-center justify-center md:justify-start">
            <div className="bg-finance-green-600 p-3 rounded-full">
              <img
                src="/lovable-uploads/eb5e50d2-20f4-4a30-840c-4301bd79298e.png"
                alt="FinanceTracker Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="ml-3 text-2xl md:text-3xl font-bold text-gray-900">
              FinanceTracker
            </h1>
          </div>
          <p className="text-center md:text-left text-gray-700 mt-2 text-sm">
            Wealth Well Organizer - Your Personal Finance Management Solution
          </p>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 md:px-8 py-8 gap-8 lg:gap-16 bg-white">
          {/* Left side - Hero content */}
          <div className="flex-1 max-w-lg lg:max-w-xl text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Master Your
              <span className="text-finance-green-600 block">
                Financial Future
              </span>
            </h2>

            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
              Take control of your finances with AI-powered insights, smart budgeting, and personalized recommendations designed for your success.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: Brain, title: "AI Insights", desc: "Smart financial advice powered by machine learning" },
                { icon: BarChart3, title: "Analytics", desc: "Comprehensive reports and data visualization" },
                { icon: Target, title: "Goals", desc: "Savings tracking with progress monitoring" },
                { icon: Shield, title: "Secure", desc: "Bank-level security and data protection" }
              ].map((feature, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <feature.icon className="w-6 h-6 text-finance-green-600 mb-2" />
                  <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center lg:justify-start gap-8 text-center">
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <div className="text-2xl md:text-3xl font-bold text-finance-green-600">10K+</div>
                <div className="text-sm text-gray-700">Active Users</div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <div className="text-2xl md:text-3xl font-bold text-finance-green-600">₱2M+</div>
                <div className="text-sm text-gray-700">Money Managed</div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <div className="text-2xl md:text-3xl font-bold text-finance-green-600">4.9★</div>
                <div className="text-sm text-gray-700">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="w-full max-w-md">
            <Card className="bg-white shadow-lg border border-gray-200">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Welcome to FinanceTracker
                </CardTitle>
                <p className="text-gray-700 text-sm">
                  Join thousands of users already mastering their finances with our comprehensive wealth management platform
                </p>
              </CardHeader>

              <CardContent>
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

            <div className="mt-6 text-center">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <Smartphone className="w-6 h-6 text-finance-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-900 font-medium">Available on all devices</p>
                <p className="text-xs text-gray-600">Access your finances anywhere, anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 md:p-8 text-center bg-white">
          <p className="text-sm text-gray-700">
            By signing up, you agree to our terms of service and privacy policy
          </p>
          <p className="text-xs text-gray-600 mt-2">
            © 2024 FinanceTracker - Wealth Well Organizer. Developed by Millennial_TV.
          </p>
        </footer>
      </div>
    </div>
  );
};
