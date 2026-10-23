#!/bin/bash
set -e

cd /opt/louez

# 1. Odczytanie wersji przekazanej jako argument (np. v1.1.0) lub fallback do latest
TARGET_TAG="${1:-latest}"
echo "🚀 Rozpoczynam wdrożenie wersji: ${TARGET_TAG}"

# 2. Ustawienie taga obrazu w środowisku i pobranie
export LOUEZ_IMAGE_TAG="${TARGET_TAG}"
echo "📦 Pobieram najnowsze obrazy z GHCR dla tagu ${TARGET_TAG}..."
docker compose pull louez background-removal

# 3. Restart kontenerów z nowym obrazem
echo "🔄 Aktualizuję kontenery..."
docker compose up -d --remove-orphans

# 4. Healthcheck - weryfikacja czy aplikacja wstała poprawnie
echo "🩺 Sprawdzam stan aplikacji pod http://localhost:3000/api/health..."
HEALTHY=false
for i in $(seq 1 30); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || true)
  if [ "$STATUS" = "200" ]; then
    echo "✅ Aplikacja działa poprawnie (HTTP 200 OK)"
    HEALTHY=true
    break
  fi
  echo "Oczekiwanie na gotowość aplikacji... próba $i/30 (status: $STATUS)"
  sleep 2
done

if [ "$HEALTHY" != "true" ]; then
  echo "❌ BŁĄD: Aplikacja nie zgłosiła statusu 200 w ciągu 60 sekund!"
  echo "Dumping ostatnich logów kontenera:"
  docker compose logs louez --tail 50
  exit 1
fi

# 5. Bezpieczne czyszczenie nieużywanych, osieroconych obrazów
echo "🧹 Czyszczenie nieużywanych warstw obrazów..."
docker image prune -f

echo "🎉 Wdrożenie wersji ${TARGET_TAG} zakończone sukcesem!"

