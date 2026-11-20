#!/bin/bash
# Exécuté sur le serveur : construit l'image du site, remplace le frontend k3s
# et publie l'Ingress de paperatlas.net.
#   usage : remote.sh <tag> [--scale-down-old]
set -euo pipefail

export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
K=$(command -v k3s || echo /usr/local/bin/k3s)
kc() { "$K" kubectl "$@"; }

TAG="${1:?tag manquant}"
SCALE_DOWN="${2:-}"
NS=paperatlas-dz
WORK="/opt/paperatlas-net/$TAG"

rm -rf "$WORK" && mkdir -p "$WORK"
tar -xzf /tmp/paperatlas-net.tgz -C "$WORK"
find "$WORK/deploy" -type f -exec sed -i 's/\r$//' {} +

echo "== build image paperatlas-net:$TAG =="
docker build -f "$WORK/deploy/Dockerfile" -t "paperatlas-net:$TAG" "$WORK"
docker save "paperatlas-net:$TAG" | "$K" ctr -n k8s.io images import -

echo "== remplacement du frontend =="
sed "s#__IMAGE__#docker.io/library/paperatlas-net:$TAG#" "$WORK/deploy/frontend.yaml" | kc replace -f -
kc -n "$NS" rollout status deploy/frontend --timeout=180s

echo "== ingress paperatlas.net =="
kc apply -f "$WORK/deploy/ingress.yaml"

if [ "$SCALE_DOWN" = "--scale-down-old" ]; then
  echo "== arrêt de l'ancienne pile (données conservées) =="
  kc -n "$NS" scale deploy/bff deploy/postgrest deploy/postgres --replicas=0
fi

kc -n "$NS" get deploy,pods,ingress,certificate
