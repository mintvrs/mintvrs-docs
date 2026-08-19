FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ajusta permissoes para nginx rodar como usuario nao-root (mesmo padrao do
# mintvrs-lp). Rodando como root, o nginx faz chown do cache na inicializacao
# e falha se CAP_CHOWN nao estiver disponivel:
#   nginx: [emerg] chown("/var/cache/nginx/client_temp", 101) failed
# Como uid 101 ele nao tenta o chown, entao os diretorios precisam ja
# pertencer a ele desde o build.
#
# A porta 3010 e acima de 1024 e nao exige NET_BIND_SERVICE, entao nao muda —
# service, ingress e nginx.conf ficam intactos.
RUN chown -R nginx:nginx /usr/share/nginx/html \
 && chown -R nginx:nginx /var/cache/nginx \
 && chown -R nginx:nginx /var/log/nginx \
 && touch /var/run/nginx.pid \
 && chown -R nginx:nginx /var/run/nginx.pid

USER 101

EXPOSE 3010

CMD ["nginx", "-g", "daemon off;"]
