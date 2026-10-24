#!/usr/bin/env bash
# ============================================================
# PROLICIT – instalação em uma máquina virtual Ubuntu 24.04 (Oracle Cloud)
#
# Uso, conectado na VM por SSH com o usuário "ubuntu":
#   curl -fsSL https://raw.githubusercontent.com/PedroHViudes/prolict/main/deploy/instalar-oracle.sh -o instalar.sh
#   bash instalar.sh
#
# O script instala Node.js 22, MySQL, nginx, pm2 e certbot, baixa o projeto do GitHub,
# cria o banco, gera o .env, compila o front-end e publica tudo em HTTPS
# no endereço  https://<ip-com-tracos>.sslip.io
# Pode ser executado de novo: ele não recria o banco nem sobrescreve o .env existente.
# ============================================================
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/PedroHViudes/prolict.git}"
APP_DIR="${APP_DIR:-$HOME/prolict}"
WEB_DIR="/var/www/prolicit"
SO_TESTE="${SO_TESTE:-0}"   # 1 = pula firewall, HTTPS e serviço (usado só para testar o script)

passo() { echo; echo "==> $*"; }

# ---------- 1. Dados que o script precisa ----------
IP_PUBLICO="${IP_PUBLICO:-$(curl -fsS https://api.ipify.org || true)}"
[ -n "$IP_PUBLICO" ] || { echo "Não consegui descobrir o IP público. Rode: IP_PUBLICO=x.x.x.x bash instalar.sh"; exit 1; }
DOMINIO="${DOMINIO:-${IP_PUBLICO//./-}.sslip.io}"
echo "Endereço do sistema: https://$DOMINIO"

if [ ! -f "$APP_DIR/backend/.env" ]; then
  read -rp "E-mail do Gmail que envia os códigos (SMTP_USER): " SMTP_USER
  read -rsp "Senha de app do Gmail (16 letras, não aparece ao digitar): " SMTP_PASS; echo
  read -rsp "Chave do Gemini (Enter para deixar em branco): " GEMINI_API_KEY; echo
fi
EMAIL_CERT="${EMAIL_CERT:-${SMTP_USER:-}}"

# ---------- 2. Memória extra (swap) para a VM pequena ----------
if [ "$SO_TESTE" != 1 ] && ! swapon --show | grep -q /swapfile; then
  passo "Criando 2 GB de swap"
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile >/dev/null && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

# ---------- 3. Pacotes ----------
passo "Instalando pacotes do sistema"
export DEBIAN_FRONTEND=noninteractive
sudo apt-get update -y
sudo apt-get install -y git curl build-essential python3 nginx mysql-server certbot python3-certbot-nginx
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  passo "Instalando Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
command -v pm2 >/dev/null || sudo npm install -g pm2

# ---------- 4. Código ----------
passo "Baixando o projeto"
if [ -d "$APP_DIR/.git" ]; then git -C "$APP_DIR" checkout -- . && git -C "$APP_DIR" pull --ff-only; else git clone "$REPO_URL" "$APP_DIR"; fi

# ---------- 5. Banco de dados ----------
if [ ! -f "$APP_DIR/backend/.env" ]; then
  passo "Criando o banco de dados"
  DB_PASS="$(openssl rand -hex 16)"
  sudo mysql < "$APP_DIR/backend/banco.sql"
  sudo mysql -e "CREATE USER IF NOT EXISTS 'prolicit'@'localhost' IDENTIFIED BY '$DB_PASS';
                 ALTER USER 'prolicit'@'localhost' IDENTIFIED BY '$DB_PASS';
                 GRANT ALL PRIVILEGES ON prolicit.* TO 'prolicit'@'localhost'; FLUSH PRIVILEGES;"

  passo "Gerando backend/.env"
  umask 077
  cat > "$APP_DIR/backend/.env" <<EOF
DB_HOST=127.0.0.1
DB_USER=prolicit
DB_PASS=$DB_PASS
DB_NAME=prolicit
PORT=3001
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=https://$DOMINIO
TRUST_PROXY=1
GEMINI_API_KEY=${GEMINI_API_KEY:-}
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
EOF
  umask 022
else
  echo "backend/.env já existe: mantido."
fi

# ---------- 6. Dependências e compilação ----------
passo "Instalando dependências do back-end"
(cd "$APP_DIR/backend" && { npm ci --omit=dev || npm install --omit=dev; })
passo "Compilando o front-end"
(cd "$APP_DIR/frontend" && (npm ci || npm install) && VITE_API_URL=/api npm run build)
sudo mkdir -p "$WEB_DIR" && sudo rm -rf "${WEB_DIR:?}"/* && sudo cp -r "$APP_DIR/frontend/dist/." "$WEB_DIR/"

# ---------- 7. nginx ----------
passo "Configurando o nginx"
sudo tee /etc/nginx/sites-available/prolicit >/dev/null <<EOF
server {
    listen 80;
    server_name $DOMINIO;
    root $WEB_DIR;
    index index.html;
    client_max_body_size 12m;   # editais em PDF de até 10 MB

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120s;    # a leitura do edital pela IA pode demorar
    }

    location / {
        try_files \$uri /index.html;  # rotas do React
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/prolicit /etc/nginx/sites-enabled/prolicit
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
if [ "$SO_TESTE" = 1 ]; then sudo nginx -s reload 2>/dev/null || sudo nginx; else sudo systemctl reload nginx; fi

# ---------- 8. Back-end como serviço (pm2) ----------
passo "Iniciando o back-end"
(cd "$APP_DIR/backend" && (pm2 restart prolicit --update-env 2>/dev/null || pm2 start index.js --name prolicit))
pm2 save

[ "$SO_TESTE" = 1 ] && { echo; echo "Modo de teste: firewall, HTTPS e inicialização automática foram pulados."; exit 0; }

sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME" >/dev/null

# ---------- 9. Firewall da VM (as imagens Ubuntu da Oracle bloqueiam tudo menos SSH) ----------
passo "Liberando as portas 80 e 443 no firewall da VM"
for porta in 80 443; do
  sudo iptables -C INPUT -p tcp --dport $porta -m state --state NEW -j ACCEPT 2>/dev/null ||
    sudo iptables -I INPUT 5 -p tcp --dport $porta -m state --state NEW -j ACCEPT
done
sudo netfilter-persistent save >/dev/null 2>&1 || true

# ---------- 10. HTTPS (Let's Encrypt) ----------
passo "Gerando o certificado HTTPS"
if sudo certbot --nginx -d "$DOMINIO" --non-interactive --agree-tos -m "$EMAIL_CERT" --redirect; then
  echo; echo "PRONTO: https://$DOMINIO"
else
  echo; echo "O HTTPS falhou. Confira se as portas 80 e 443 estão liberadas na Security List da Oracle e rode o script de novo."
  echo "Enquanto isso, o sistema responde em http://$DOMINIO"
fi
