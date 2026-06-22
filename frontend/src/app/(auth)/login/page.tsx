/**
 * Login Page — SMART SMOE IFDL
 * Authentification JWT · Design institutionnel
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import {
  Shield, Eye, EyeOff, LogIn, AlertCircle,
  Award, Users, BarChart3, CheckCircle2, Lock, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api, useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

// ── Validation schema ─────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe requis'),
});
type LoginForm = z.infer<typeof loginSchema>;

// ── Feature cards ─────────────────────────────────────────────
const features = [
  { icon: Shield,       label: 'ISO 21001 Conforme',       desc: 'Référentiel international' },
  { icon: BarChart3,    label: 'KPI Temps Réel',           desc: 'Indicateurs de performance' },
  { icon: Users,        label: '7 Profils Utilisateurs',   desc: 'RBAC granulaire' },
  { icon: CheckCircle2, label: 'Audit & Non-Conformités',  desc: 'Amélioration continue' },
];

const demoAccounts = [
  { role: 'Admin Principal',     email: 'abdelilah.salhy@uhp.ac.ma', color: 'bg-red-100 text-red-700' },
  { role: 'Administrateur',      email: 'admin@smoe-ifdl.ma',        color: 'bg-red-100 text-red-700' },
  { role: 'Resp. Qualité',       email: 'qualite@smoe-ifdl.ma',      color: 'bg-blue-100 text-blue-700' },
  { role: 'Coordonnateur',       email: 'coord@smoe-ifdl.ma',        color: 'bg-purple-100 text-purple-700' },
];

export default function LoginPage() {
  const router   = useRouter();
  const setAuth  = useAuthStore(s => s.setAuth);
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error,   setError]       = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@smoe-ifdl.ma', password: 'Admin@SMOE2024' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.post('/auth/login', data);
      const payload = res?.data ?? res;
      setAuth(payload.user, payload.access_token, payload.refresh_token);
      toast.success(`Bienvenue, ${payload.user.prenom} ${payload.user.nom} !`);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Email ou mot de passe incorrect';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel — Branding ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d3b7a 0%, #1a5fb4 50%, #0a2f63 100%)' }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          {/* Logo & Title */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/25">
                <Image src="/logo.jpeg" alt="ESEF Logo" width={48} height={48} className="object-cover w-full h-full" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl leading-tight">SMART SMOE IFDL</h1>
                <p className="text-blue-200 text-xs">Système Intelligent de Management ISO 21001</p>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-white text-3xl xl:text-4xl font-bold leading-tight mb-3">
                Pilotez la Qualité<br />
                <span className="text-blue-300">de votre Master IFDL</span>
              </h2>
              <p className="text-blue-200/80 text-sm leading-relaxed max-w-md">
                Plateforme complète de management qualité conforme à la norme ISO 21001.
                Tableaux de bord, KPI, audits, risques et amélioration continue.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-3">
              {features.map(f => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <f.icon className="h-4 w-4 text-blue-200" />
                    <span className="text-white text-xs font-semibold">{f.label}</span>
                  </div>
                  <p className="text-blue-300/70 text-[11px]">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 pt-8 border-t border-white/10">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
              <Image src="/logo-esef.jpg" alt="ESEF Berrechid" width={40} height={40} className="object-contain w-full h-full" />
            </div>
            <div>
              <p className="text-white/90 text-xs font-semibold">ESEF Berrechid</p>
              <p className="text-blue-300/70 text-[11px]">Université Hassan 1er · Settat</p>
            </div>
            <div className="ml-auto">
              <Badge className="bg-white/15 text-white border-white/25 text-[10px]">
                <Award className="h-2.5 w-2.5 mr-1" />
                ISO 21001:2018
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ───────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6"
        >

          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <Image src="/logo.jpeg" alt="ESEF Logo" width={40} height={40} className="object-cover w-full h-full" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">SMART SMOE IFDL</h1>
              <p className="text-muted-foreground text-xs">ISO 21001 · ESEF Berrechid</p>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">Connexion</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Accédez à votre espace SMOE IFDL
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@esef-berrechid.ma"
                  className={cn('pl-9 h-10', errors.email && 'border-red-500')}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn('pl-9 pr-10 h-10', errors.password && 'border-red-500')}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  Comptes de démonstration
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setValue('email', acc.email);
                    setValue('password', 'Admin@SMOE2024');
                  }}
                  className="text-left p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded', acc.color)}>
                    {acc.role}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{acc.email}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              Mot de passe démo : <code className="bg-muted px-1 rounded">Admin@SMOE2024</code>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-muted-foreground">
            ESEF Berrechid · Université Hassan 1er · Master IFDL
            <br />
            <span className="text-primary font-medium">SMART SMOE IFDL v1.0.0</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
