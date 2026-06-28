"use client";

export const runtime = "edge";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Tractor, Stethoscope, Loader2, CheckCircle, XCircle, User, Mail, Lock, Phone, Eye, EyeOff, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CowIcon } from "@/components/icons/CowIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'livestock_farmer'>('livestock_farmer');
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const roles = [
    { id: 'user', title: 'Marketplace User', description: 'Browse and purchase livestock produce', icon: ShoppingBag },
    { id: 'livestock_farmer', title: 'Livestock Farmer', description: 'Manage livestock herds & sell produce', icon: Tractor },
  ];

  // Password validation
  useEffect(() => {
    const errors: string[] = [];
    if (formData.password) {
      if (formData.password.length < 8) errors.push("At least 8 characters");
      if (!/[A-Z]/.test(formData.password)) errors.push("One uppercase letter");
      if (!/[a-z]/.test(formData.password)) errors.push("One lowercase letter");
      if (!/[0-9]/.test(formData.password)) errors.push("One number");
    }
    setPasswordErrors(errors);
  }, [formData.password]);

  // Check email availability
  const checkEmailAvailability = useCallback(
    debounce(async (email: string) => {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailStatus("invalid");
        return;
      }

      setCheckingEmail(true);
      setEmailStatus("checking");

      try {
        const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = (await response.json()) as { success?: boolean; available?: boolean };

        if (data.success) {
          setEmailStatus(data.available ? "available" : "taken");
        } else {
          setEmailStatus("invalid");
        }
      } catch {
        setEmailStatus("invalid");
      } finally {
        setCheckingEmail(false);
      }
    }, 600),
    []
  );

  useEffect(() => {
    if (formData.email && formData.email.includes("@")) {
      checkEmailAvailability(formData.email);
    } else {
      setEmailStatus("idle");
    }
  }, [formData.email, checkEmailAvailability]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    } else if (emailStatus === "taken") {
      newErrors.email = "This email is already registered";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordErrors.length > 0) {
      newErrors.password = "Password doesn't meet requirements";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;

      // 2. Send Email Verification
      await sendEmailVerification(user);

      // 3. Create user in our Turso DB
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          role: selectedRole,
          firebaseUid: user.uid,
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (data.success) {
        setIsSuccess(true);
        toast({
          title: "Verification Email Sent!",
          description: "Please check your inbox to verify your account.",
        });
      } else {
        toast({
          title: "Registration failed",
          description: data.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Registration Error",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmailIcon = () => {
    if (checkingEmail || emailStatus === "checking") {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (emailStatus === "available") {
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    }
    if (emailStatus === "taken") {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (emailStatus === "invalid" && formData.email) {
      return <XCircle className="h-4 w-4 text-amber-500" />;
    }
    return <Mail className="h-4 w-4 text-muted-foreground" />;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
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

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center py-8">
            <CardHeader className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription className="text-lg">
                We've sent a verification link to <br />
                <span className="font-bold text-foreground">{formData.email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                You need to verify your email address before you can log in to your account.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Create KhamarBari Account</h1>
            <p className="text-muted-foreground">Select your account type to register</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id as any)}
                  className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary mb-2">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-sm">{role.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                </button>
              );
            })}
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-xl font-bold">Register Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name / Farm Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. Karim Agro Farm"
                      className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      disabled={loading}
                    />
                  </div>
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {getEmailIcon()}
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      disabled={loading}
                    />
                  </div>
                  {emailStatus === "available" && !errors.email && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Email is available</p>
                  )}
                  {emailStatus === "taken" && !errors.email && (
                    <p className="text-xs text-red-600 dark:text-red-400">✕ Email is already taken</p>
                  )}
                  {emailStatus === "checking" && !errors.email && (
                    <p className="text-xs text-muted-foreground">Checking email availability…</p>
                  )}
                  {emailStatus === "invalid" && formData.email && !errors.email && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">Please enter a valid email address</p>
                  )}
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+8801700000000"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: "" });
                      }}
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                      }}
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={loading || (emailStatus !== "available" && emailStatus !== "idle")}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
