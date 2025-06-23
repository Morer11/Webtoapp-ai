import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyEmailSchema } from "@shared/schema";
import type { z } from "zod";

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { verifyEmail, isVerifyPending } = useAuth();
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
  });

  useEffect(() => {
    // Get email from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setValue('email', emailParam);
    }
  }, [setValue]);

  const onSubmit = async (data: VerifyEmailFormData) => {
    try {
      await verifyEmail(data);
      toast({
        title: "Email verified successfully",
        description: "Welcome to WebToApp AI!",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
    }
  };

  const handleResendCode = async () => {
    // TODO: Implement resend code functionality
    toast({
      title: "Code resent",
      description: "Please check your email for a new verification code",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Verify your email</h2>
          <p className="text-slate-600">
            We've sent a verification code to{" "}
            <span className="font-medium text-slate-900">{email || "your email"}</span>
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <input type="hidden" {...register("email")} value={email} />
              
              <div>
                <Label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className={`text-center text-2xl font-mono tracking-widest ${
                    errors.code ? "border-red-300" : ""
                  }`}
                  {...register("code")}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-br from-primary-600 to-primary-800"
                disabled={isVerifyPending}
              >
                {isVerifyPending ? "Verifying..." : "Verify Email"}
              </Button>
              
              <div className="text-center">
                <p className="text-slate-600">
                  Didn't receive the code?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    className="text-primary-600 hover:text-primary-500 font-medium p-0"
                  >
                    Resend
                  </Button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
