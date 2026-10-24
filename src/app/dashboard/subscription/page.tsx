"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Crown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
type Subscription = { plan: "free" | "premium"; startedAt: string | null; expiresAt: string | null; cancelledAt: string | null; price: number; listingLimit: number };
const dateLabel = (value: string | null) => value ? new Date(value).toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" }) : "—";
export default function SubscriptionPage() {
 const { toast } = useToast();
 const [subscription, setSubscription] = useState<Subscription | null>(null);
 const [accountNumber, setAccountNumber] = useState("");
 const [loading, setLoading] = useState(true);
 const [busy, setBusy] = useState(false);
 const [complete, setComplete] = useState(false);
 const [renewing, setRenewing] = useState(false);
 useEffect(() => { fetch("/api/subscription").then(async r => { const d = await r.json(); if (!r.ok || !d.success) throw new Error(d.error || "Could not load subscription"); setSubscription(d.subscription); }).catch((e: any) => toast({ title: "Unable to load subscription", description: e.message, variant: "destructive" })).finally(() => setLoading(false)); }, []);
 const activate = async (event: React.FormEvent) => {
  event.preventDefault(); setBusy(true);
  try {
   const response = await fetch("/api/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountNumber }) });
   const data = await response.json(); if (!response.ok || !data.success) throw new Error(data.error || "Could not activate Premium");
   setSubscription(data.subscription); setComplete(true); setRenewing(false); setAccountNumber("");
   toast({ title: "Premium activated", description: `Your 30-day subscription is active until ${dateLabel(data.subscription.expiresAt)}.` });
  } catch (error: any) { toast({ title: "Could not complete checkout", description: error.message, variant: "destructive" }); }
  finally { setBusy(false); }
 };
 if (loading) return <div className="mx-auto max-w-2xl py-12 text-center text-muted-foreground">Loading subscription…</div>;
 if (!subscription) return <div className="mx-auto max-w-2xl py-12 text-center">Could not load your subscription. Please refresh the page.</div>;
 return <div className="mx-auto max-w-3xl space-y-6">
  <Button variant="ghost" asChild><Link href="/dashboard/profile"><ArrowLeft className="mr-2 h-4 w-4"/>Back to profile</Link></Button>
  <div><h1 className="text-3xl font-bold tracking-tight">KhamarBari Premium</h1><p className="mt-1 text-muted-foreground">One benefit: list up to 200 active products for 30 days.</p></div>
  {complete && <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"><CheckCircle2 className="h-6 w-6 text-emerald-600"/><div><p className="font-semibold">Premium is active</p><p className="text-sm text-muted-foreground">Your listing limit is now 200, until {dateLabel(subscription.expiresAt)}.</p></div></div>}
  <div className="grid gap-5 md:grid-cols-2">
   <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/>Free</CardTitle><CardDescription>For getting started</CardDescription><div className="pt-2 text-3xl font-bold">৳0 <span className="text-sm font-normal text-muted-foreground">forever</span></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">Up to 5 active product listings.</p>{subscription.plan === "free" && <p className="mt-4 text-sm font-semibold text-primary">Your current plan</p>}</CardContent></Card>
   <Card className="border-primary/40 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-primary"/>Premium</CardTitle><CardDescription>For growing farm businesses</CardDescription><div className="pt-2 text-3xl font-bold">৳99 <span className="text-sm font-normal text-muted-foreground">/ 30 days</span></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">Up to 200 active product listings.</p>{subscription.plan === "premium" && <p className="mt-4 text-sm font-semibold text-primary">Your current plan</p>}</CardContent></Card>
  </div>
  {subscription.plan === "premium" && !renewing && <Card><CardHeader><CardTitle>Subscription status</CardTitle><CardDescription>{subscription.cancelledAt ? "Renewal is cancelled. Premium remains active until expiry." : "Your Premium access is active for 30 days from activation."}</CardDescription></CardHeader><CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-muted-foreground">Active until</p><p className="font-semibold">{dateLabel(subscription.expiresAt)}</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => setRenewing(true)}>Extend by 30 days · ৳99</Button><Button asChild variant="outline"><Link href="/dashboard/profile">Back to profile</Link></Button></div></CardContent></Card>}
  {(subscription.plan === "free" || renewing) && <Card><CardHeader><CardTitle>{subscription.plan === "premium" ? "Extend Premium" : "Upgrade with bKash"}</CardTitle><CardDescription>Enter the bKash account number you want to use for checkout.</CardDescription></CardHeader><CardContent><form onSubmit={activate} className="space-y-4"><div className="rounded-xl bg-[#e2136e] p-4 text-white"><div className="text-2xl font-black tracking-tight">bKash</div><p className="mt-1 text-sm text-white/90">Premium subscription checkout</p></div><div className="space-y-2"><Label htmlFor="bkash-account">bKash account number</Label><Input id="bkash-account" type="tel" inputMode="numeric" autoComplete="tel" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="01XXXXXXXXX" maxLength={14} required/><p className="text-xs text-muted-foreground">Use a Bangladesh mobile number. Never enter your bKash PIN or password here.</p></div><div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/><span>This checkout preview does not transfer funds. Premium access is activated for 30 days.</span></div><Button type="submit" className="w-full" disabled={busy}>{busy ? "Activating Premium…" : `Continue · ৳${subscription.price}`}</Button></form></CardContent></Card>}
 </div>;
}
