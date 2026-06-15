FROM kasmweb/chromium:1.15.0

USER root

# Move original custom startup script to .orig
RUN mv /dockerstartup/custom_startup.sh /dockerstartup/custom_startup.sh.orig

# Copy our custom wrapper startup script
COPY custom_startup.sh /dockerstartup/custom_startup.sh
RUN chmod +x /dockerstartup/custom_startup.sh

# Install flask and requests using apt-get
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-flask \
    python3-requests \
    && rm -rf /var/lib/apt/lists/*

USER 1000
