FROM alpine:latest

# Install required packages
RUN apk add --no-cache \
    postgresql-client \
    rsync \
    bash \
    dcron \
    && rm -rf /var/cache/apk/*

# Copy backup script
COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Create backup directory
RUN mkdir -p /backup

# Setup cron
COPY crontab /etc/crontabs/root

CMD ["crond", "-f", "-d", "8"]
