/**
 * IA SMOE Assistant — Chatbot ISO 21001
 * Powered by OpenAI · Connaissance ISO 21001 + Documentation IFDL
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Send, User, Sparkles, RefreshCw, Copy,
  BookOpen, Shield, BarChart3, ClipboardCheck, FileText,
  MessageSquare, Lightbulb, ChevronDown, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  typing?: boolean;
}

// ── Suggested prompts ─────────────────────────────────────────
const suggestions = [
  { icon: Shield,        text: 'Qu\'est-ce que la norme ISO 21001 ?',                    cat: 'ISO' },
  { icon: BookOpen,      text: 'Comment rédiger une procédure qualité ?',                cat: 'Documentation' },
  { icon: BarChart3,     text: 'Quels sont les KPI recommandés pour un Master ?',        cat: 'KPI' },
  { icon: ClipboardCheck,text: 'Comment préparer un audit interne ISO 21001 ?',          cat: 'Audit' },
  { icon: FileText,      text: 'Explique le processus PR-02 Réalisation pédagogique',    cat: 'Processus' },
  { icon: Lightbulb,     text: 'Quelles sont les étapes d\'amélioration continue PDCA ?', cat: 'Qualité' },
  { icon: Shield,        text: 'Comment évaluer la satisfaction des parties intéressées ?', cat: 'Satisfaction' },
  { icon: BarChart3,     text: 'Comment construire une matrice des risques 5×5 ?',        cat: 'Risques' },
];

// ── Simulated AI responses (in production: real OpenAI call) ──
const fakeResponses: Record<string, string> = {
  default: `Je suis l'**Assistant IA SMOE IFDL**, spécialisé en management qualité ISO 21001 pour le Master IFDL de l'ESEF Berrechid.

Je peux vous aider sur :
- 📋 **ISO 21001** : Exigences, clauses, interprétation
- 📊 **KPI & Indicateurs** : Définition, suivi, analyse
- ⚠️ **Risques** : Identification, évaluation, traitement
- 🔍 **Audits** : Planification, conduite, constats
- 📁 **Documentation** : Rédaction, procédures, manuel qualité
- 🎯 **Amélioration continue** : PDCA, actions correctives

Comment puis-je vous aider aujourd'hui ?`,

  iso21001: `## ISO 21001:2018 — Systèmes de management des organismes d'éducation

La norme **ISO 21001:2018** est un référentiel international spécifique aux organismes d'éducation. Elle spécifie les exigences d'un **SMOE** (Système de Management des Organismes d'Éducation).

### Principales clauses :

| Clause | Titre | Points clés |
|--------|-------|-------------|
| **§4** | Contexte | Analyse PESTEL, parties intéressées, domaine d'application |
| **§5** | Leadership | Direction, politique qualité, rôles/responsabilités |
| **§6** | Planification | Risques, objectifs, modifications |
| **§7** | Support | Ressources, compétences, communication, documentation |
| **§8** | Réalisation | Conception pédagogique, prestataires |
| **§9** | Évaluation | Satisfaction, audit interne, revue de direction |
| **§10** | Amélioration | NC, actions correctives, amélioration continue |

### Spécificités vs ISO 9001 :
- Focus sur les **apprenants** comme bénéficiaires principaux
- Prise en compte des **parties intéressées vulnérables**
- Exigences sur l'**inclusion** et l'**accessibilité**
- Indicateurs **pédagogiques** spécifiques

Souhaitez-vous des détails sur une clause en particulier ?`,

  kpi: `## KPI Recommandés pour un Master IFDL

### KPI Pédagogiques (Processus PR-02)
| Code | Indicateur | Unité | Cible recommandée |
|------|-----------|-------|-------------------|
| KPI-01 | Taux de réussite aux examens | % | ≥ 85% |
| KPI-02 | Taux de diplomation | % | ≥ 90% |
| KPI-03 | Taux d'insertion professionnelle | % | ≥ 75% |
| KPI-04 | Note moyenne des mémoires | /20 | ≥ 14 |

### KPI Satisfaction (Processus PR-04)
| Code | Indicateur | Unité | Cible |
|------|-----------|-------|-------|
| KPI-05 | Satisfaction étudiants | % | ≥ 80% |
| KPI-06 | Satisfaction enseignants | % | ≥ 78% |
| KPI-07 | Satisfaction employeurs | % | ≥ 75% |

### KPI Qualité (Processus PR-04)
| Code | Indicateur | Unité | Cible |
|------|-----------|-------|-------|
| KPI-08 | Taux traitement NC | % | ≥ 95% |
| KPI-09 | Délai traitement réclamations | Jours | ≤ 10j |
| KPI-10 | Score conformité ISO 21001 | % | ≥ 85% |

### KPI Infrastructure (Processus PR-03)
| Code | Indicateur | Unité | Cible |
|------|-----------|-------|-------|
| KPI-11 | Disponibilité Moodle | % | ≥ 99% |
| KPI-12 | Taux actualisation cours | % | ≥ 80% |

💡 **Conseil** : Commencez par les 5 KPI les plus critiques pour votre contexte et augmentez progressivement.`,
};

function getResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('iso 21001') || lower.includes('norme') || lower.includes('smoe')) return fakeResponses.iso21001;
  if (lower.includes('kpi') || lower.includes('indicateur') || lower.includes('performance')) return fakeResponses.kpi;
  return fakeResponses.default;
}

// ── Markdown-like renderer ─────────────────────────────────────
function MessageContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h3 key={i} className="font-bold text-base mt-2 mb-1">{line.replace('## ', '')}</h3>;
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-1.5 mb-0.5">{line.replace('### ', '')}</h4>;
        if (line.startsWith('| ')) {
          return (
            <div key={i} className="overflow-x-auto">
              <table className="text-xs border-collapse w-full my-1">
                <tbody>
                  <tr>
                    {line.split('|').filter(Boolean).map((cell, j) => (
                      <td key={j} className={cn('border border-border px-2 py-1', line.includes('---') ? 'hidden' : '')}
                        dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                      />
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-xs"
          dangerouslySetInnerHTML={{ __html: line.replace('- ', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />;
        if (!line.trim()) return <br key={i} />;
        return (
          <p key={i} className="text-sm"
            dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
          />
        );
      })}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: fakeResponses.default,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI response delay
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const response = getResponse(text);
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-52px)] page-container py-4 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              IA SMOE Assistant
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-[10px] h-4">
                <Sparkles className="h-2.5 w-2.5 mr-1" /> AI
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground">
              Expert ISO 21001 · Documentation IFDL · ESEF Berrechid
            </p>
          </div>
        </div>
        <Button
          variant="outline" size="sm" className="text-xs gap-1 h-7"
          onClick={() => setMessages([{id: '0', role: 'assistant', content: fakeResponses.default, timestamp: new Date()}])}
        >
          <RefreshCw className="h-3 w-3" /> Nouvelle conversation
        </Button>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              {/* Avatar */}
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white shadow-sm',
                msg.role === 'user'
                  ? 'bg-primary'
                  : 'bg-gradient-to-br from-purple-500 to-blue-600'
              )}>
                {msg.role === 'user'
                  ? <User className="h-4 w-4" />
                  : <Brain className="h-4 w-4" />
                }
              </div>

              {/* Bubble */}
              <div className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm relative group',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-card border border-border rounded-tl-sm'
              )}>
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <MessageContent content={msg.content} />
                )}

                <div className={cn(
                  'flex items-center gap-2 mt-1.5',
                  msg.role === 'user' ? 'justify-end' : 'justify-between'
                )}>
                  <span className={cn(
                    'text-[10px]',
                    msg.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                  )}>
                    {msg.timestamp.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                    >
                      {copied === msg.id
                        ? <Check className="h-3 w-3 text-green-500" />
                        : <Copy className="h-3 w-3 text-muted-foreground" />
                      }
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="mb-3 flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" /> Suggestions de questions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {suggestions.slice(0, 4).map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.text)}
                className="text-left p-2.5 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all group text-xs"
              >
                <s.icon className="h-4 w-4 text-primary mb-1 group-hover:scale-110 transition-transform" />
                <p className="line-clamp-2 leading-snug">{s.text}</p>
                <span className="text-[10px] text-muted-foreground mt-1 block">{s.cat}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0">
        <div className="relative bg-card border border-border rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question sur ISO 21001, les KPI, les audits, les procédures SMOE..."
            className="w-full bg-transparent text-sm px-4 py-3 pr-12 resize-none focus:outline-none min-h-[52px] max-h-36"
            rows={1}
            disabled={loading}
          />
          <Button
            size="icon"
            className="absolute right-2 bottom-2 h-8 w-8 rounded-xl"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-1.5">
          IA SMOE Assistant · Connaissances ISO 21001 · Données IFDL 2025–2026
          &nbsp;·&nbsp; Entrée pour envoyer, Maj+Entrée pour nouvelle ligne
        </p>
      </div>
    </div>
  );
}
