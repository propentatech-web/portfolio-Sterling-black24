FROM propentatech/portfolios-formation-dev-web2026:latest

RUN mkdir -p /usr/share/nginx/html/portfolio-Sterling-black24/
RUN rm -rf /usr/share/nginx/html/portfolio-Sterling-black24/*

COPY . /usr/share/nginx/html/portfolio-Sterling-black24/

RUN sed -i 's|root   /usr/share/nginx/html;|root   /usr/share/nginx/html/portfolio-Sterling-black24;|g' /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
