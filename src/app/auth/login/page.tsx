"use client";

export const runtime = "edge";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Tractor, Stethoscope, ShieldCheck, Eye, EyeOff, Loader2, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CowIcon } from "@/components/icons/CowIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'livestock_farmer' | 'receptionist' | 'admin'>('user');
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const roles = [
    { id: 'user', title: 'Marketplace User', description: 'Browse and buy livestock produce', icon: ShoppingBag, color: 'text-teal-500' },
    { id: 'livestock_farmer', title: 'Livestock Farmer', description: 'Manage herd, health & sell produce', icon: Tractor, color: 'text-emerald-500' },
    { id: 'receptionist', title: 'Receptionist', description: 'Manage clinical vet appointments', icon: Stethoscope, color: 'text-cyan-500' },
    { id: 'admin', title: 'Administrator', description: 'Full system management access', icon: ShieldCheck, color: 'text-amber-500' },
  ];

  const getRoleRedirectRoute = (role?: string) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'receptionist':
        return '/dashboard/receptionist';
      case 'livestock_farmer':
        return '/dashboard';
      case 'user':
      default:
        return '/dashboard/marketplace';
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Admin bypass for local admin account (stored in Turso, not Firebase)
      if (formData.email.toLowerCase() === "admin@khamarbari.com") {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            requestedRole: selectedRole,
          }),
        });

        const data = (await response.json()) as { success?: boolean; user?: { role?: string }; error?: string };

        if (data.success) {
          toast({ title: "Login Successful", description: `Welcome back!` });
          const userRole = data.user?.role || selectedRole;
          router.push(getRoleRedirectRoute(userRole));
          router.refresh();
          return;
        } else {
          toast({
            title: "Login failed",
            description: data.error || "Invalid credentials",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Standard Firebase authentication for regular users
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      if (!user.emailVerified) {
        setLoading(false);
        toast({
          title: "Email not verified",
          description: (
            <div className="flex flex-col gap-2">
              <p>Please verify your email before logging in.</p>
              <Button size="sm" variant="outline" onClick={handleResendVerification}>
                Resend Verification Email
              </Button>
            </div>
          ),
          variant: "destructive",
        });
        return;
      }

      const idToken = await user.getIdToken(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          idToken: idToken,
          requestedRole: selectedRole,
        }),
      });

      const data = (await response.json()) as { success?: boolean; user?: { role?: string }; error?: string };

      if (data.success) {
        toast({
          title: "Welcome back!",
          description: "Logged in successfully.",
        });

        const userRole = data.user?.role || selectedRole;
        router.push(getRoleRedirectRoute(userRole));
        router.refresh();
      } else {
        toast({
          title: "Login failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-md">
              <CowIcon className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">Khamar<span className="text-primary">Bari</span></span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-4xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Access Your Account</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select your role to log in to KhamarBari platform.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id as any)}
                  className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                      : "border-border bg-card hover:border-primary/50 hover:bg-accent/5"
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-background shadow-xs ${role.color} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm">{role.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{role.description}</p>
                </button>
              );
            })}
          </div>

          <Card className="max-w-md mx-auto border-shadow">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-xl font-bold">
                Sign In as <span className="text-primary capitalize">{roles.find(r => r.id === selectedRole)?.title}</span>
              </CardTitle>
              <CardDescription>
                Enter your registered credentials below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    disabled={loading}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      disabled={loading}
                      className={errors.password ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <Button type="submit" className="w-full font-semibold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don&apos;t have an account? </span>
                <Link href="/auth/signup" className="text-primary hover:underline font-semibold">
                  Register now
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
