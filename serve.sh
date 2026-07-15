#!/bin/bash
cd "$(dirname "$0")"
PORT=8080

IP=$(ipconfig getifaddr en0 2>/dev/null)
if [ -z "$IP" ]; then
  IP=$(ipconfig getifaddr en1 2>/dev/null)
fi

echo ""
echo "Сервер запущен. На iPhone:"
echo ""
if [ -n "$IP" ]; then
  echo "  http://${IP}:${PORT}/"
else
  echo "  http://ВАШ-IP-MAC:${PORT}/"
  echo "  (IP Mac: Системные настройки → Сеть → Wi‑Fi → Подробнее)"
fi
echo ""
echo "iPhone и Mac должны быть в одной Wi‑Fi сети."
echo "Для PWA откройте ссылку в Safari → Поделиться → На экран «Домой»."
echo "Нужны все файлы: index.html, manifest.webmanifest, sw.js, icons/"
echo "Нажмите Ctrl+C для остановки."
echo ""

python3 -m http.server "$PORT"
