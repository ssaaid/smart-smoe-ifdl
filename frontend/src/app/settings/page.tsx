/**
 * Paramètres
 * Profil · Sécurité · Préférences
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Globe, User, Lock, Save, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

// ── Main Page ──────────────────────────────────────────────────

export default function SettingsPage() {
  const { user } = useAuthStore();

  // Fallback display values when no authenticated user is present
  const displayPrenom    = user?.prenom     ?? "Saaid";
  const displayNom       = user?.nom        ?? "Salhy";
  const displayEmail     = user?.email      ?? "s.salhy@esef-berrechid.ac.ma";
  const displayRole      = user?.role       ?? "Responsable Qualité";
  const displayDept      = user?.departement ?? "Département IFDL";
  const displayInitials  =
    `${displayPrenom.charAt(0)}${displayNom.charAt(0)}`.toUpperCase();

  // Form state
  const [prenom, setPrenom]       = useState(displayPrenom);
  const [nom, setNom]             = useState(displayNom);
  const [departement, setDept]    = useState(displayDept);

  // Password form state
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd]         = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Preferences state
  const [notifEmail, setNotifEmail]   = useState(true);
  const [rapportHebdo, setRapportHebdo] = useState(false);
  const [langue, setLangue]           = useState('fr');

  const cardVariants = {
    hidden:  { opacity: 0, y: 12 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
  };

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Paramètres
          </h1>
          <p className="page-subtitle">
            Profil · Sécurité · Préférences
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT COLUMN (spans 2) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Informations personnelles */}
          <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Prénom</Label>
                    <Input
                      className="h-9 text-sm"
                      value={prenom}
                      onChange={e => setPrenom(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nom</Label>
                    <Input
                      className="h-9 text-sm"
                      value={nom}
                      onChange={e => setNom(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Adresse email
                    <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">(lecture seule)</span>
                  </Label>
                  <Input
                    className="h-9 text-sm bg-muted/40 cursor-not-allowed"
                    value={displayEmail}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      Rôle
                      <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">(lecture seule)</span>
                    </Label>
                    <Input
                      className="h-9 text-sm bg-muted/40 cursor-not-allowed"
                      value={displayRole}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Département</Label>
                    <Input
                      className="h-9 text-sm"
                      value={departement}
                      onChange={e => setDept(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <Button size="sm" className="text-xs gap-1.5 h-8">
                    <Save className="h-3.5 w-3.5" /> Enregistrer les modifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Changer le mot de passe */}
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Changer le mot de passe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Mot de passe actuel</Label>
                  <Input
                    type="password"
                    className="h-9 text-sm"
                    placeholder="••••••••"
                    value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nouveau mot de passe</Label>
                    <Input
                      type="password"
                      className="h-9 text-sm"
                      placeholder="••••••••"
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Confirmer le nouveau mot de passe</Label>
                    <Input
                      type="password"
                      className="h-9 text-sm"
                      placeholder="••••••••"
                      value={confirmPwd}
                      onChange={e => setConfirmPwd(e.target.value)}
                    />
                  </div>
                </div>

                {newPwd && confirmPwd && newPwd !== confirmPwd && (
                  <p className="text-xs text-red-600">Les mots de passe ne correspondent pas.</p>
                )}

                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Shield className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.
                  </p>
                </div>

                <div className="pt-1">
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 h-8"
                    disabled={!currentPwd || !newPwd || newPwd !== confirmPwd}
                  >
                    <Save className="h-3.5 w-3.5" /> Mettre à jour le mot de passe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6">

          {/* Mon Profil */}
          <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Mon Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center gap-3">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border-2 border-primary/20">
                  {displayInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{displayPrenom} {displayNom}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{displayEmail}</p>
                </div>
                <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold">
                  {displayRole}
                </Badge>
                <Separator className="w-full" />
                <div className="w-full text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-1">Département</p>
                  <p className="text-xs font-medium">{displayDept}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Préférences */}
          <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Préférences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notifications email */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Notifications par email</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Recevoir les alertes qualité et annonces par email
                    </p>
                  </div>
                  <Switch
                    checked={notifEmail}
                    onCheckedChange={setNotifEmail}
                  />
                </div>

                <Separator />

                {/* Rapport hebdomadaire */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Rapport hebdomadaire</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Synthèse ISO 21001 chaque lundi matin
                    </p>
                  </div>
                  <Switch
                    checked={rapportHebdo}
                    onCheckedChange={setRapportHebdo}
                  />
                </div>

                <Separator />

                {/* Langue */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Langue d'interface
                  </Label>
                  <Select value={langue} onValueChange={setLangue}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sécurité */}
          <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Dernière connexion</p>
                    <p className="text-xs font-medium">06/06/2026 à 08h42</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Depuis</p>
                    <p className="text-xs font-medium">Berrechid, Maroc</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Navigateur</p>
                    <p className="text-xs font-medium">Chrome 125</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium">Sessions actives</p>
                  </div>
                  <Badge className={cn("text-[10px] font-semibold", "bg-green-100 text-green-700 border-green-200")}>
                    1 session
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5 h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <Shield className="h-3.5 w-3.5" /> Déconnecter toutes les sessions
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
