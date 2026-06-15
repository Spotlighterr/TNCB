#!/usr/bin/env bash
# Start Flask control API in the background
python3 /app/app.py &

# Run the original startup script to launch Chromium and the desktop
exec /dockerstartup/custom_startup.sh.orig "$@"
