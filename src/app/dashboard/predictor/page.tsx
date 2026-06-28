"use client";

export const runtime = "edge";
import React, { useState } from "react";
import { Stethoscope, Activity, RefreshCw, Thermometer, HeartPulse, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function PredictorPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    body_temperature: "38.5",
    breed_type: "Normal Breed",
    milk_production: "15.0",
    respiratory_rate: "32",
    walking_capacity: "12000",
    sleeping_duration: "3.5",
    body_condition_score: "3",
    heart_rate: "60",
    eating_duration: "3.5",
    lying_down_duration: "13",
    ruminating: "6.0",
    rumen_fill: "3",
    faecal_consistency: "ideal",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as any;
      if (data.status === "success") {
        setResult(data);
        toast({ title: "Analysis Complete", description: "Cattle health diagnostic generated." });
      } else {
        toast({ title: "Prediction Failed", description: data.error || "Please try again.", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 p-6 rounded-2xl bg-gradient-to-r from-teal-500/10 via-primary/10 to-teal-500/5 border border-primary/20">
        <div className="p-3 rounded-xl bg-primary text-primary-foreground">
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Livestock Disease Predictor</h1>
          <p className="text-muted-foreground mt-1">
            Input vital signs and daily behavioral metrics trained on real cattle health datasets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Vital Signs & Behavior Data
            </CardTitle>
            <CardDescription>Enter physical health indicators observed in the farm animal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Body Temperature (°C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.body_temperature}
                    onChange={(e) => setFormData({ ...formData, body_temperature: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Breed Type</Label>
                  <Select
                    value={formData.breed_type}
                    onValueChange={(val) => setFormData({ ...formData, breed_type: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal Breed">Normal Breed</SelectItem>
                      <SelectItem value="Cross Breed">Cross Breed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Daily Milk Yield (Liters)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.milk_production}
                    onChange={(e) => setFormData({ ...formData, milk_production: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heart Rate (BPM)</Label>
                  <Input
                    type="number"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Eating Duration (Hours/Day)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.eating_duration}
                    onChange={(e) => setFormData({ ...formData, eating_duration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ruminating Duration (Hours/Day)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.ruminating}
                    onChange={(e) => setFormData({ ...formData, ruminating: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Faecal Consistency</Label>
                  <Select
                    value={formData.faecal_consistency}
                    onValueChange={(val) => setFormData({ ...formData, faecal_consistency: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ideal">Ideal / Normal</SelectItem>
                      <SelectItem value="extremely firm">Extremely Firm</SelectItem>
                      <SelectItem value="very liquid faeces">Very Liquid Faeces / Diarrhea</SelectItem>
                      <SelectItem value="Black faece">Black Faeces</SelectItem>
                      <SelectItem value="Fresh blood in faeces">Fresh Blood in Faeces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Body Condition Score (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.body_condition_score}
                    onChange={(e) => setFormData({ ...formData, body_condition_score: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-bold py-6 gap-2 mt-4" disabled={loading}>
                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Stethoscope className="h-5 w-5" />}
                {loading ? "Analyzing Cattle Dataset..." : "Run Health Diagnostic"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Card */}
        <div>
          {result ? (
            <Card className="border-primary/40 bg-primary/5 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={result.prediction.includes("Healthy") ? "default" : "destructive"}>
                    {result.prediction.includes("Healthy") ? "HEALTHY" : "ATTENTION NEEDED"}
                  </Badge>
                  <span className="text-xs font-bold text-muted-foreground">{result.confidence}% Confidence</span>
                </div>
                <CardTitle className="text-xl font-bold mt-2">{result.prediction}</CardTitle>
                <CardDescription className="text-foreground/90 mt-1">{result.analysis}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <h4 className="font-bold text-sm">Recommended Actions:</h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {result.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
              <Activity className="h-12 w-12 text-muted-foreground/40 mb-3 stroke-1" />
              <h3 className="font-bold text-foreground">Awaiting Input</h3>
              <p className="text-xs mt-1">Fill out the clinical parameters and click 'Run Health Diagnostic' to generate insights.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
