FROM nginx:1.25-alpine

LABEL description="PaperAtlas - static SPA served by nginx"

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY out/ /usr/share/nginx/html/

RUN test -f /usr/share/nginx/html/index.html \
 && chmod -R a+rX /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
