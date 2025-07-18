import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
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
  Mail
} from 'lucide-react';

export const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const { signIn, signUp, resetPassword, loading } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !email || !password) return;
    
    setIsSubmitting(true);
    try {
      console.log('Attempting to sign in with:', email);
      const result = await signIn(email, password);
      if (result.error) {
        console.error('Sign in failed:', result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !email || !password) return;
    
    setIsSubmitting(true);
    try {
      console.log('Attempting to sign up with:', email, fullName);
      const result = await signUp(email, password, fullName);
      if (result.error) {
        console.error('Sign up failed:', result.error);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-8">
          <div className="flex items-center justify-center md:justify-start">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
              <img 
                src="/lovable-uploads/eb5e50d2-20f4-4a30-840c-4301bd79298e.png" 
                alt="FinanceTracker Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="ml-3 text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              FinanceTracker
            </h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 md:px-8 py-8 gap-8 lg:gap-16">
          {/* Left side - Hero content */}
          <div className="flex-1 max-w-lg lg:max-w-xl text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Master Your
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent block">
                Financial Future
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Take control of your finances with AI-powered insights, smart budgeting, and personalized recommendations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: Brain, title: "AI Insights", desc: "Smart financial advice" },
                { icon: BarChart3, title: "Analytics", desc: "Detailed reports" },
                { icon: Target, title: "Goals", desc: "Savings tracking" },
                { icon: Shield, title: "Secure", desc: "Bank-level security" }
              ].map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary mb-2" />
                  <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center lg:justify-start gap-8 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">10K+</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">$2M+</div>
                <div className="text-sm text-gray-600">Saved</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="w-full max-w-md">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Get Started Today
                </CardTitle>
                <p className="text-gray-600 text-sm">
                  Join thousands of users already mastering their finances
                </p>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="signup" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/20 backdrop-blur-sm">
                    <TabsTrigger 
                      value="signup" 
                      className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
                    >
                      Sign Up
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signin"
                      className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
                    >
                      Sign In
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signup" className="mt-6">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-gray-700 font-medium">
                          Full Name
                        </Label>
                        <Input
                          id="signup-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/70 transition-all"
                          placeholder="Enter your full name"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-gray-700 font-medium">
                          Email *
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/70 transition-all"
                          placeholder="Enter your email"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-gray-700 font-medium">
                          Password *
                        </Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/70 transition-all"
                          placeholder="Create a password (min 6 characters)"
                          disabled={isLoading}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02]" 
                        disabled={isLoading || !email || !password}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                        <Zap className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signin" className="mt-6">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-gray-700 font-medium">
                          Email *
                        </Label>
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/70 transition-all"
                          placeholder="Enter your email"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-gray-700 font-medium">
                          Password *
                        </Label>
                        <Input
                          id="signin-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/70 transition-all"
                          placeholder="Enter your password"
                          disabled={isLoading}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-semibold py-3 transition-all duration-300 transform hover:scale-[1.02]" 
                        disabled={isLoading || !email || !password}
                      >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                        <TrendingUp className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                    
                    <div className="mt-4 text-center">
                      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="text-sm text-gray-600 hover:text-primary transition-colors"
                            disabled={isLoading}
                          >
                            Forgot your password?
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Mail className="w-5 h-5" />
                              Reset Password
                            </DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email">Email Address</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                placeholder="Enter your email address"
                                required
                                disabled={isLoading}
                              />
                            </div>
                            <p className="text-sm text-gray-600">
                              We'll send you a link to reset your password.
                            </p>
                            <div className="flex gap-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsResetPasswordOpen(false)}
                                disabled={isLoading}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={isLoading || !forgotPasswordEmail}
                                className="flex-1"
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
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>256-bit SSL</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <PiggyBank className="w-3 h-3" />
                      <span>Bank-level Security</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <Smartphone className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-gray-700 font-medium">Available on all devices</p>
                <p className="text-xs text-gray-600">Access your finances anywhere, anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 md:p-8 text-center">
          <p className="text-sm text-gray-600">
            By signing up, you agree to our terms of service and privacy policy
          </p>
        </footer>
      </div>
    </div>
  );
};
