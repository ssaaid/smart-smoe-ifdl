/**
 * AppLayout — Main Layout with Sidebar + Topbar
 * SALHY Abdelilah SMART SMOE MASTER · ISO 21001
 */
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderOpen, GitBranch, Target, AlertTriangle,
  ClipboardCheck, FileX, Wrench, Smile, MessageSquare, GraduationCap,
  Bell, BookOpen, Brain, Settings, LogOut, ChevronLeft, ChevronRight,
  Search, Moon, Sun, User, Shield, Award, Menu, X, ChevronDown,
  BarChart3, Users, FileText, Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/auth-store';

// ── Roles with access to management features (not etudiant) ───
const MANAGERS = ['admin', 'responsable_qualite', 'coordonnateur', 'enseignant', 'personnel_admin', 'auditeur'];

// ── Navigation structure ───────────────────────────────────────
const navSections = [
  {
    title: 'Principal',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    ],
  },
  {
    title: 'Pilotage Qualité',
    items: [
      { href: '/kpi',       icon: Target,        label: 'KPI & Indicateurs', badge: '3',  roles: MANAGERS },
      { href: '/processes', icon: GitBranch,      label: 'Processus SMOE',   badge: null, roles: MANAGERS },
      { href: '/documents', icon: FolderOpen,     label: 'Gestion Doc.',     badge: null },
      { href: '/risks',     icon: AlertTriangle,  label: 'Risques',          badge: '3',  badgeVariant: 'destructive' as const, roles: MANAGERS },
    ],
  },
  {
    title: 'Amélioration',
    items: [
      { href: '/audits',    icon: ClipboardCheck, label: 'Audits Internes',  badge: '2',  roles: MANAGERS },
      { href: '/findings',  icon: FileX,          label: 'Non-Conformités',  badge: '5',  badgeVariant: 'destructive' as const, roles: MANAGERS },
      { href: '/actions',   icon: Wrench,         label: 'Actions Correctives', badge: '12', roles: MANAGERS },
    ],
  },
  {
    title: 'Parties Intéressées',
    items: [
      { href: '/satisfaction', icon: Smile,         label: 'Satisfaction',  badge: null },
      { href: '/complaints',   icon: MessageSquare, label: 'Réclamations',  badge: '7' },
    ],
  },
  {
    title: 'Ressources',
    items: [
      { href: '/trainings',     icon: GraduationCap, label: 'Compétences & Formation', badge: null },
      { href: '/communication', icon: Bell,           label: 'Communication',          badge: '4' },
    ],
  },
  {
    title: 'Rapports & ISO',
    items: [
      { href: '/reports',    icon: BookOpen, label: 'Revue de Direction', badge: null, roles: MANAGERS },
      { href: '/iso-center', icon: Award,    label: 'ISO 21001 Center',  badge: null },
      { href: '/admin',      icon: Users,    label: 'Administration',     badge: null, roles: ['admin'] },
    ],
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className={cn('flex flex-col h-full', isMobile ? 'w-64' : collapsed ? 'w-16' : 'w-60')}>

      {/* ── Logo ──────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-4 border-b',
        'border-white/10 flex-shrink-0',
        collapsed && !isMobile ? 'justify-center px-2' : ''
      )}>
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center flex-shrink-0">
          <Shield className="h-4 w-4 text-blue-300" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight">SMART SMOE</p>
            <p className="text-[10px] text-blue-300/80 truncate">IFDL · ESEF Berrechid</p>
          </div>
        )}
      </div>

      {/* ── Search ────────────────────────────────────────── */}
      {(!collapsed || isMobile) && (
        <div className="px-3 py-2 flex-shrink-0">
          <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-blue-200/60 border border-white/10">
            <Search className="h-3 w-3" />
            <span>Rechercher...</span>
            <kbd className="ml-auto text-[9px] bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>
      )}

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-thin">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            item => !item.roles || item.roles.includes(user?.role ?? '')
          );
          if (visibleItems.length === 0) return null;
          return (
          <div key={section.title} className="mb-1">
            {(!collapsed || isMobile) && (
              <p className="sidebar-section-title">{section.title}</p>
            )}
            {collapsed && !isMobile && (
              <div className="my-1 border-t border-white/10" />
            )}
            {visibleItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <TooltipProvider key={item.href} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'sidebar-nav-item',
                          isActive && 'active',
                          collapsed && !isMobile && 'justify-center px-2'
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {(!collapsed || isMobile) && (
                          <>
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.badge && (
                              <Badge
                                className={cn(
                                  'h-4 min-w-4 px-1 text-[9px] font-bold',
                                  item.badgeVariant === 'destructive'
                                    ? 'bg-red-500 text-white hover:bg-red-500'
                                    : 'bg-blue-500/30 text-blue-200 hover:bg-blue-500/30'
                                )}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && !isMobile && (
                      <TooltipContent side="right" className="text-xs">
                        {item.label}
                        {item.badge && <span className="ml-2 text-red-400">({item.badge})</span>}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
          );
        })}
      </nav>

      {/* ── User Footer ───────────────────────────────────── */}
      <div className={cn(
        'border-t border-white/10 p-2 flex-shrink-0',
        collapsed && !isMobile ? 'flex flex-col items-center gap-1' : 'space-y-1'
      )}>
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer">
            <Avatar className="h-7 w-7 border border-blue-400/30">
              <AvatarFallback className="bg-blue-500/20 text-blue-200 text-xs font-bold">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/90 truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[10px] text-blue-300/60 truncate">{user?.role}</p>
            </div>
          </div>
        )}

        <div className={cn('flex gap-1', collapsed && !isMobile ? 'flex-col' : 'px-1')}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-blue-300/60 hover:text-white hover:bg-white/10"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {mounted && theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Thème</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/settings">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-300/60 hover:text-white hover:bg-white/10">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Paramètres</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-400/70 hover:text-red-300 hover:bg-red-500/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Déconnexion</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Desktop Sidebar ──────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden lg:flex sidebar flex-col relative flex-shrink-0 overflow-hidden"
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-primary border-2 border-background flex items-center justify-center hover:scale-110 transition-transform z-10"
        >
          {collapsed
            ? <ChevronRight className="h-3 w-3 text-white" />
            : <ChevronLeft  className="h-3 w-3 text-white" />}
        </button>
      </motion.aside>

      {/* ── Mobile Sidebar ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 z-50 sidebar flex flex-col lg:hidden"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Topbar ───────────────────────────────────────── */}
        <header className="h-13 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Home className="h-3 w-3" />
            <span>/</span>
            <span className="font-medium text-foreground capitalize">
              {pathname.split('/')[1] || 'dashboard'}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* ISO Badge */}
            <Badge variant="outline" className="hidden sm:flex items-center gap-1 text-[10px] py-0.5">
              <Shield className="h-3 w-3 text-green-600" />
              ISO 21001
            </Badge>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {/* AI Assistant — masqué pour etudiant */}
            {user?.role !== 'etudiant' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/ai-assistant">
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs hidden sm:flex">
                        <Brain className="h-3.5 w-3.5 text-purple-500" />
                        IA SMOE
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Assistant IA ISO 21001</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* User */}
            <Avatar className="h-7 w-7 cursor-pointer">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* ── Page Content ───────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
