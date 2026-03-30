# Stage 1 : récupérer tout le contenu de la base (tous les portfolios)
FROM propentatech/portfolios-formation-dev-web2026:latest AS source

# Stage 2 : image plate — repart de nginx:alpine pour éviter max depth exceeded
FROM nginx:alpine
COPY --from=source /usr/share/nginx/html /usr/share/nginx/html
COPY --from=source /etc/nginx/conf.d /etc/nginx/conf.d

RUN mkdir -p /usr/share/nginx/html/portfolio-Sterling-black24/
RUN rm -rf /usr/share/nginx/html/portfolio-Sterling-black24/*

COPY . /usr/share/nginx/html/portfolio-Sterling-black24/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
