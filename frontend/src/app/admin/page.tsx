/**
 * Administration Système — Gestion des utilisateurs & configuration SMOE
 * SMART SMOE IFDL · ESEF Berrechid · Master IFDL
 */
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Plus, Search, Filter, User, Mail, Shield,
  Edit2, Ban, X, Send, Clock, CheckCircle2, AlertCircle,
  Info, Lock, Bell, Wrench, Activity, Users, UserCheck,
  LogIn, UserPlus, SlidersHorizontal, Save, Loader2, CheckCircle, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// ── Mock data ─────────────────────────────────────────────────
const users = [
  { id: 1, nom: 'Benali',      prenom: 'Amine',    email: 'a.benali@esef-berrechid.ma',      role: 'admin',               departement: 'Qualité',          is_active: true,  last_login: '2026-06-06T08:30:00' },
  { id: 2, nom: 'Ouhbi',       prenom: 'Fatima',   email: 'f.ouhbi@esef-berrechid.ma',       role: 'responsable_qualite', departement: 'Qualité & Audit',  is_active: true,  last_login: '2026-06-05T16:45:00' },
  { id: 3, nom: 'El Mansouri', prenom: 'Karim',    email: 'k.elmansouri@esef-berrechid.ma',  role: 'directeur',           departement: 'Direction ESEF',   is_active: true,  last_login: '2026-06-04T09:15:00' },
  { id: 4, nom: 'Tahiri',      prenom: 'Sara',     email: 's.tahiri@esef-berrechid.ma',      role: 'enseignant',          departement: 'Pédagogie',        is_active: true,  last_login: '2026-06-03T14:20:00' },
  { id: 5, nom: 'Alami',       prenom: 'Youssef',  email: 'y.alami@esef-berrechid.ma',       role: 'enseignant',          departement: 'Pédagogie',        is_active: true,  last_login: '2026-06-01T11:00:00' },
  { id: 6, nom: 'Radi',        prenom: 'Imane',    email: 'i.radi@esef-berrechid.ma',        role: 'auditeur',            departement: 'Qualité',          is_active: true,  last_login: '2026-05-30T15:30:00' },
  { id: 7, nom: 'Saidi',       prenom: 'Mohammed', email: 'm.saidi@esef-berrechid.ma',       role: 'personnel',           departement: 'Administration',   is_active: false, last_login: '2026-04-15T09:00:00' },
  { id: 8, nom: 'Bensaid',     prenom: 'Nadia',    email: 'n.bensaid@esef-berrechid.ma',     role: 'enseignant',          departement: 'IFDL',             is_active: true,  last_login: '2026-06-02T17:00:00' },
];

const activityLog = [
  { date: '2026-06-06T08:30:00', event: 'Connexion réussie',                                    user: 'a.benali@esef-berrechid.ma',  type: 'info'    },
  { date: '2026-06-05T16:45:00', event: 'Connexion réussie',                                    user: 'f.ouhbi@esef-berrechid.ma',   type: 'info'    },
  { date: '2026-06-04T10:20:00', event: 'Utilisateur créé : n.bensaid@esef-berrechid.ma',       user: 'a.benali@esef-berrechid.ma',  type: 'success' },
  { date: '2026-06-03T11:00:00', event: 'Paramètre modifié : notifications_email=true',         user: 'a.benali@esef-berrechid.ma',  type: 'warning' },
  { date: '2026-06-01T09:00:00', event: 'Compte désactivé : m.saidi@esef-berrechid.ma',         user: 'a.benali@esef-berrechid.ma',  type: 'warning' },
];

const sysConfig = [
  { key: '2fa',           label: '2FA obligatoire',        description: 'Authentification à deux facteurs pour tous les comptes', checked: false },
  { key: 'notif_email',   label: 'Notifications email',    description: 'Envoi automatique de notifications par email',           checked: true  },
  { key: 'maintenance',   label: 'Mode maintenance',       description: 'Mise en maintenance — accès restreint au portail',       checked: false },
  { key: 'journalisation', label: 'Journalisation avancée', description: 'Journalisation détaillée de toutes les actions',        checked: true  },
];

// ── Helpers ────────────────────────────────────────────────────
const roleConfig: Record<string, { label: string; style: string }> = {
  admin:               { label: 'Admin',             style: 'bg-red-100 text-red-800 border-red-200'       },
  directeur:           { label: 'Directeur',         style: 'bg-purple-100 text-purple-800 border-purple-200' },
  responsable_qualite: { label: 'Resp. Qualité',     style: 'bg-blue-100 text-blue-800 border-blue-200'    },
  auditeur:            { label: 'Auditeur',          style: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  enseignant:          { label: 'Enseignant',        style: 'bg-green-100 text-green-800 border-green-200' },
  personnel:           { label: 'Personnel',         style: 'bg-gray-100 text-gray-700 border-gray-200'   },
};

const logTypeConfig: Record<string, { icon: React.ReactNode; style: string }> = {
  info:    { icon: <Info className="h-3 w-3" />,          style: 'text-blue-600 bg-blue-50'   },
  success: { icon: <CheckCircle2 className="h-3 w-3" />,  style: 'text-green-600 bg-green-50' },
  warning: { icon: <AlertCircle className="h-3 w-3" />,   style: 'text-amber-600 bg-amber-50' },
  error:   { icon: <X className="h-3 w-3" />,             style: 'text-red-600 bg-red-50'     },
};

function getInitials(prenom: string, nom: string): string {
  return `${prenom[0]}${nom[0]}`.toUpperCase();
}

function avatarColor(role: string): string {
  const map: Record<string, string> = {
    admin:               'bg-red-500',
    directeur:           'bg-purple-500',
    responsable_qualite: 'bg-blue-500',
    auditeur:            'bg-indigo-500',
    enseignant:          'bg-green-500',
    personnel:           'bg-gray-400',
  };
  return map[role] ?? 'bg-gray-400';
}

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui, " + d.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  return d.toLocaleDateString('fr-MA');
}

// ── Add User Modal ─────────────────────────────────────────────
function AddUserForm({ onClose, onAdd }: { onClose: () => void; onAdd: (u: any) => void }) {
  const [nom, setNom]           = useState('');
  const [prenom, setPrenom]     = useState('');
  const [email, setEmail]       = useState('');
  const [role, setRole]         = useState('enseignant');
  const [departement, setDept]  = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async () => {
    if (!nom.trim() || !prenom.trim() || !email.trim() || !password.trim()) {
      setError('Nom, prénom, email et mot de passe sont requis.'); return;
    }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', { nom, prenom, email, password, role, departement: departement || undefined });
      onAdd(data.user ?? data);
      onClose();
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = e?.response?.data?.message;
      if (status === 403) {
        setError('Accès refusé — vous devez être connecté avec un compte administrateur.');
      } else {
        setError(Array.isArray(msg) ? msg.join(', ') : msg || "Erreur lors de la création de l'utilisateur.");
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Ajouter un utilisateur</h3>
            <p className="text-xs text-muted-foreground">SMART SMOE IFDL · ESEF Berrechid</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Nom *</Label>
              <Input placeholder="Benali" className="h-9 text-sm" value={nom} onChange={e => setNom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Prénom *</Label>
              <Input placeholder="Amine" className="h-9 text-sm" value={prenom} onChange={e => setPrenom(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Email *</Label>
            <Input type="email" placeholder="prenom.nom@esef-berrechid.ma" className="h-9 text-sm" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Rôle *</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3" value={role} onChange={e => setRole(e.target.value)}>
                <option value="enseignant">Enseignant</option>
                <option value="auditeur">Auditeur</option>
                <option value="responsable_qualite">Resp. Qualité</option>
                <option value="directeur">Directeur</option>
                <option value="personnel">Personnel</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Département</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3" value={departement} onChange={e => setDept(e.target.value)}>
                <option value="">Sélectionner...</option>
                <option value="Qualité">Qualité</option>
                <option value="Qualité & Audit">Qualité & Audit</option>
                <option value="Direction ESEF">Direction ESEF</option>
                <option value="Pédagogie">Pédagogie</option>
                <option value="IFDL">IFDL</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Mot de passe temporaire *</Label>
            <Input type="password" placeholder="••••••••" className="h-9 text-sm" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSubmit} disabled={loading}>
              <Send className="h-3 w-3" /> {loading ? 'Création...' : "Créer l'utilisateur"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Edit User Modal ────────────────────────────────────────────
function EditUserModal({ user, onClose, onSaved }: { user: any; onClose: () => void; onSaved: (u: any) => void }) {
  const [nom,        setNom]   = useState(user.nom ?? '');
  const [prenom,     setPrenom]= useState(user.prenom ?? '');
  const [email,      setEmail] = useState(user.email ?? '');
  const [role,       setRole]  = useState(user.role ?? 'enseignant');
  const [dept,       setDept]  = useState(user.departement ?? '');
  const [loading,    setLoading] = useState(false);
  const [error,      setError]   = useState('');

  const handleSave = async () => {
    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      setError('Nom, prénom et email sont requis.'); return;
    }
    setLoading(true); setError('');
    try {
      const { data } = await api.patch(`/users/${user.id}`, {
        nom, prenom, email, role, departement: dept || null,
      });
      onSaved(data);
      toast.success('Utilisateur modifié !');
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Erreur lors de la modification.');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Modifier l'utilisateur</h3>
            <p className="text-xs text-muted-foreground">{user.prenom} {user.nom}</p>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Nom *</Label>
              <Input className="h-9 text-sm" value={nom} onChange={e => setNom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Prénom *</Label>
              <Input className="h-9 text-sm" value={prenom} onChange={e => setPrenom(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Email *</Label>
            <Input type="email" className="h-9 text-sm" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Rôle</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3"
                value={role} onChange={e => setRole(e.target.value)}>
                <option value="enseignant">Enseignant</option>
                <option value="auditeur_interne">Auditeur</option>
                <option value="responsable_qualite">Resp. Qualité</option>
                <option value="coordonnateur">Coordonnateur</option>
                <option value="directeur">Directeur</option>
                <option value="personnel">Personnel</option>
                <option value="etudiant">Étudiant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Département</Label>
              <select className="w-full h-9 rounded-lg border border-input bg-background text-xs px-3"
                value={dept} onChange={e => setDept(e.target.value)}>
                <option value="">—</option>
                <option value="Qualité">Qualité</option>
                <option value="Qualité & Audit">Qualité & Audit</option>
                <option value="Direction ESEF">Direction ESEF</option>
                <option value="Pédagogie">Pédagogie</option>
                <option value="IFDL">IFDL</option>
                <option value="Administration">Administration</option>
                <option value="Direction">Direction</option>
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="flex-1 h-8 text-xs gap-1" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function AdminPage() {
  const currentUser = useAuthStore(s => s.user);
  const [search,       setSearch]       = useState('');
  const [showForm,     setShowForm]     = useState(false);
  const [editUser,     setEditUser]     = useState<any>(null);
  const [userList,     setUserList]     = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [togglingId,   setTogglingId]   = useState<string | null>(null);

  useEffect(() => {
    api.get('/users')
      .then((res: any) => setUserList(res.data ?? res))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleToggleActive = async (u: any) => {
    setTogglingId(u.id);
    try {
      const { data } = await api.patch(`/users/${u.id}`, { is_active: !u.is_active });
      setUserList(prev => prev.map(x => x.id === u.id ? { ...x, ...data } : x));
      toast.success(u.is_active ? `${u.prenom} ${u.nom} désactivé` : `${u.prenom} ${u.nom} réactivé`);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUsers = userList.filter(u =>
    `${u.prenom} ${u.nom}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.departement ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    actifs:      userList.filter(u => u.is_active).length,
    admins:      userList.filter(u => u.role === 'admin').length,
    enseignants: userList.filter(u => u.role === 'enseignant').length,
    last_audit:  '2026-06-01',
  };

  return (
    <div className="page-container animate-fade-up">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Administration Système
          </h1>
          <p className="page-subtitle">
            Gestion des utilisateurs · Configuration SMOE · Journaux système · ESEF Berrechid
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {currentUser && (
            <p className="text-[10px] text-muted-foreground">
              Connecté : <span className="font-semibold text-foreground">{currentUser.prenom} {currentUser.nom}</span>
              {' '}·{' '}
              <span className={cn('font-semibold', currentUser.role === 'admin' ? 'text-red-600' : 'text-amber-600')}>
                {currentUser.role}
              </span>
            </p>
          )}
          <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Ajouter un utilisateur
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Utilisateurs actifs',  value: stats.actifs,                                                                             color: 'text-foreground', icon: <Users className="h-4 w-4" /> },
          { label: 'Admins',               value: stats.admins,                                                                              color: 'text-red-600',    icon: <Shield className="h-4 w-4" /> },
          { label: 'Enseignants',          value: stats.enseignants,                                                                         color: 'text-green-600',  icon: <UserCheck className="h-4 w-4" /> },
          { label: 'Dernier audit système', value: new Date(stats.last_audit).toLocaleDateString('fr-MA', { day: '2-digit', month: 'short', year: 'numeric' }), color: 'text-primary',  icon: <Activity className="h-4 w-4" /> },
        ].map(s => (
          <Card key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <p className="stat-label">{s.label}</p>
              <span className={cn('opacity-60', s.color)}>{s.icon}</span>
            </div>
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Gestion des utilisateurs
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9 h-8 text-xs w-52"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                <Filter className="h-3.5 w-3.5" /> Filtrer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Département</th>
                  <th>Statut</th>
                  <th>Dernière connexion</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => {
                  const rc = roleConfig[u.role] ?? roleConfig.personnel;
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      {/* Avatar + Name */}
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                            u.is_active ? avatarColor(u.role) : 'bg-gray-300',
                          )}>
                            {getInitials(u.prenom, u.nom)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{u.prenom} {u.nom}</p>
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-2.5 w-2.5" />{u.email}
                        </span>
                      </td>
                      {/* Role Badge */}
                      <td>
                        <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded border', rc.style)}>
                          {rc.label}
                        </span>
                      </td>
                      {/* Département */}
                      <td>
                        <span className="text-xs text-muted-foreground">{u.departement}</span>
                      </td>
                      {/* Status */}
                      <td>
                        {u.is_active ? (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            Actif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                            Inactif
                          </span>
                        )}
                      </td>
                      {/* Last login */}
                      <td>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {u.last_login ? formatRelativeDate(u.last_login) : '—'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost" size="sm" className="h-7 w-7 p-0"
                            title="Modifier"
                            onClick={() => setEditUser(u)}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost" size="sm" className="h-7 w-7 p-0"
                            title={u.is_active ? 'Désactiver' : 'Réactiver'}
                            disabled={togglingId === u.id}
                            onClick={() => handleToggleActive(u)}
                          >
                            {togglingId === u.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                              : <Ban className={cn('h-3.5 w-3.5', u.is_active ? 'text-red-400' : 'text-green-500')} />
                            }
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom grid: System Config + Activity Log */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* System Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Configuration Système
            </CardTitle>
            <p className="text-xs text-muted-foreground">Paramètres de la plateforme SMART SMOE</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {sysConfig.map((cfg, i) => {
              const icons: Record<string, React.ReactNode> = {
                '2fa':            <Lock className="h-4 w-4 text-muted-foreground" />,
                notif_email:      <Bell className="h-4 w-4 text-muted-foreground" />,
                maintenance:      <Wrench className="h-4 w-4 text-muted-foreground" />,
                journalisation:   <Activity className="h-4 w-4 text-muted-foreground" />,
              };
              return (
                <motion.div
                  key={cfg.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0">{icons[cfg.key]}</div>
                    <div>
                      <p className="text-xs font-semibold">{cfg.label}</p>
                      <p className="text-[10px] text-muted-foreground">{cfg.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={cfg.checked}
                    disabled
                    aria-label={cfg.label}
                    className="flex-shrink-0"
                  />
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Journal d'activité — 5 derniers événements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activityLog.map((log, i) => {
              const lc = logTypeConfig[log.type] ?? logTypeConfig.info;
              const eventIcons: Record<string, React.ReactNode> = {
                info:    <LogIn className="h-3 w-3" />,
                success: <UserPlus className="h-3 w-3" />,
                warning: <AlertCircle className="h-3 w-3" />,
              };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn('flex items-start gap-3 p-2.5 rounded-lg', lc.style.split(' ').slice(1).join(' '))}
                >
                  <span className={cn('flex-shrink-0 mt-0.5', lc.style.split(' ')[0])}>
                    {eventIcons[log.type] ?? lc.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{log.event}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{log.user}</span>
                      <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{new Date(log.date).toLocaleString('fr-MA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {showForm && (
          <AddUserForm
            onClose={() => setShowForm(false)}
            onAdd={u => setUserList(prev => [u, ...prev])}
          />
        )}
        {editUser && (
          <EditUserModal
            user={editUser}
            onClose={() => setEditUser(null)}
            onSaved={updated => {
              setUserList(prev => prev.map(x => x.id === updated.id ? { ...x, ...updated } : x));
              setEditUser(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
