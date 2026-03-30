# Stage 1 : récupérer tous les portfolios existants
FROM propentatech/portfolios-formation-web2026:latest AS source

# Stage 2 : image plate depuis nginx:alpine
FROM nginx:alpine
COPY --from=source /usr/share/nginx/html /usr/share/nginx/html
COPY --from=source /etc/nginx/conf.d /etc/nginx/conf.d

RUN mkdir -p /usr/share/nginx/html/portfolio-Sterling-black24/
RUN rm -rf /usr/share/nginx/html/portfolio-Sterling-black24/*

COPY . /usr/share/nginx/html/portfolio-Sterling-black24/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
