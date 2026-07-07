#!/usr/bin/env bash
# ============================================================
# SMART SMOE IFDL — Déploiement local Docker
# Usage : ./deploy-local.sh [start|stop|restart|logs|status|clean]
# ============================================================
set -euo pipefail

# ── Couleurs ────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

COMPOSE_FILE="docker/docker-compose.yml"
PROJECT_NAME="smoe_ifdl"

info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Aller à la racine du projet ─────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Vérifications prérequis ─────────────────────────────────
check_prerequisites() {
    info "Vérification des prérequis..."

    command -v docker &>/dev/null || error "Docker n'est pas installé. https://docs.docker.com/get-docker/"

    docker info &>/dev/null || error "Le daemon Docker n'est pas démarré. Lance Docker Desktop ou 'sudo systemctl start docker'."

    if docker compose version &>/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &>/dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        error "docker compose (v2) ou docker-compose (v1) requis."
    fi

    success "Docker $(docker --version | awk '{print $3}' | tr -d ',') — prêt"
}

# ── Initialiser l'environnement ─────────────────────────────
init_env() {
    if [ ! -f ".env" ]; then
        warn "Fichier .env introuvable — copie de .env.example..."
        cp .env.example .env
        success ".env créé depuis .env.example (valeurs par défaut)"
    else
        success ".env existant trouvé"
    fi

    # Créer les répertoires nécessaires
    mkdir -p docker/nginx/conf.d docker/ssl
}

# ── Démarrage ───────────────────────────────────────────────
start() {
    echo ""
    echo -e "${BOLD}${CYAN}================================================${NC}"
    echo -e "${BOLD}${CYAN}   SALHY Abdelilah SMART SMOE MASTER            ${NC}"
    echo -e "${BOLD}${CYAN}   Déploiement local Docker                     ${NC}"
    echo -e "${BOLD}${CYAN}================================================${NC}"
    echo ""

    check_prerequisites
    init_env

    info "Construction des images Docker..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build --parallel

    info "Démarrage des services (PostgreSQL + Redis + Backend + Frontend + Nginx)..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --remove-orphans

    info "Attente du démarrage des services..."
    echo -ne "   "
    for i in $(seq 1 30); do
        echo -n "."
        sleep 2
        # Vérifier que le backend répond
        if curl -sf "http://localhost:3001/api/v1/health" &>/dev/null; then
            echo ""
            break
        fi
        if [ $i -eq 30 ]; then
            echo ""
            warn "Timeout — le backend met du temps à démarrer. Consultez les logs : ./deploy-local.sh logs backend"
        fi
    done

    echo ""
    print_urls
}

# ── Arrêt ───────────────────────────────────────────────────
stop() {
    info "Arrêt des services..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
    success "Services arrêtés"
}

# ── Redémarrage ─────────────────────────────────────────────
restart() {
    stop
    start
}

# ── Logs ────────────────────────────────────────────────────
logs() {
    SERVICE="${1:-}"
    if [ -n "$SERVICE" ]; then
        $COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f "$SERVICE"
    else
        $COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f
    fi
}

# ── Statut ──────────────────────────────────────────────────
status() {
    echo ""
    echo -e "${BOLD}Services :${NC}"
    $COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
    echo ""
    echo -e "${BOLD}Santé des endpoints :${NC}"
    check_endpoint "Frontend"  "http://localhost:3000"
    check_endpoint "Backend"   "http://localhost:3001/api/v1/health"
    check_endpoint "Nginx"     "http://localhost:80"
    check_endpoint "pgAdmin"   "http://localhost:5050"
    echo ""
}

check_endpoint() {
    local name="$1" url="$2"
    if curl -sf "$url" &>/dev/null; then
        echo -e "  ${GREEN}✓${NC} $name → $url"
    else
        echo -e "  ${RED}✗${NC} $name → $url (non disponible)"
    fi
}

# ── Nettoyage complet ───────────────────────────────────────
clean() {
    warn "Suppression de tous les conteneurs, volumes et images du projet..."
    read -r -p "  Confirmer ? (y/N) : " confirm
    [[ "$confirm" =~ ^[Yy]$ ]] || { info "Annulé."; exit 0; }

    $COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down -v --rmi local
    success "Nettoyage terminé"
}

# ── pgAdmin (mode dev) ──────────────────────────────────────
pgadmin() {
    info "Démarrage pgAdmin..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" -p "$PROJECT_NAME" --profile dev up -d pgadmin
    success "pgAdmin disponible sur http://localhost:5050"
    info "Email : ${PGADMIN_EMAIL:-admin@smoe-ifdl.ma}  |  Mot de passe : ${PGADMIN_PASSWORD:-admin123}"
}

# ── Afficher les URLs ────────────────────────────────────────
print_urls() {
    echo -e "${BOLD}${GREEN}================================================${NC}"
    echo -e "${BOLD}${GREEN}  Plateforme démarrée avec succès !             ${NC}"
    echo -e "${BOLD}${GREEN}================================================${NC}"
    echo ""
    echo -e "  ${BOLD}Application${NC}"
    echo -e "  ${CYAN}🌐 Frontend${NC}   → http://localhost:3000"
    echo -e "  ${CYAN}🔌 API${NC}        → http://localhost:3001/api/v1"
    echo -e "  ${CYAN}📖 Swagger${NC}    → http://localhost:3001/api/docs"
    echo -e "  ${CYAN}🔀 Nginx${NC}      → http://localhost:80"
    echo ""
    echo -e "  ${BOLD}Comptes de démonstration${NC}"
    echo -e "  Email    : admin@smoe-ifdl.ma"
    echo -e "  Password : Admin@SMOE2024"
    echo ""
    echo -e "  ${BOLD}Outils${NC}"
    echo -e "  ${YELLOW}🗄  pgAdmin${NC}   → ./deploy-local.sh pgadmin"
    echo ""
    echo -e "  ${BOLD}Commandes utiles${NC}"
    echo -e "  Logs      : ${CYAN}./deploy-local.sh logs [service]${NC}"
    echo -e "  Statut    : ${CYAN}./deploy-local.sh status${NC}"
    echo -e "  Arrêt     : ${CYAN}./deploy-local.sh stop${NC}"
    echo -e "  Nettoyage : ${CYAN}./deploy-local.sh clean${NC}"
    echo ""
}

# ── Aide ────────────────────────────────────────────────────
usage() {
    echo ""
    echo -e "${BOLD}Usage :${NC} ./deploy-local.sh [commande]"
    echo ""
    echo -e "  ${CYAN}start${NC}          Construire et démarrer tous les services"
    echo -e "  ${CYAN}stop${NC}           Arrêter tous les services"
    echo -e "  ${CYAN}restart${NC}        Redémarrer tous les services"
    echo -e "  ${CYAN}status${NC}         Afficher l'état des services"
    echo -e "  ${CYAN}logs [service]${NC} Afficher les logs (backend, frontend, postgres, redis, nginx)"
    echo -e "  ${CYAN}pgadmin${NC}        Démarrer pgAdmin (interface DB)"
    echo -e "  ${CYAN}clean${NC}          Supprimer conteneurs, volumes et images"
    echo ""
}

# ── Dispatch ────────────────────────────────────────────────
case "${1:-start}" in
    start)   start   ;;
    stop)    check_prerequisites; stop    ;;
    restart) check_prerequisites; restart ;;
    logs)    check_prerequisites; logs "${2:-}"  ;;
    status)  check_prerequisites; status  ;;
    pgadmin) check_prerequisites; init_env; pgadmin ;;
    clean)   check_prerequisites; clean   ;;
    *)       usage ;;
esac
