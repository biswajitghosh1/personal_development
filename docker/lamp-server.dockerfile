# Use an official Ubuntu base image
FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install Apache, MySQL, PHP, and required extensions
RUN apt-get update && \
    apt-get install -y apache2 mysql-server php libapache2-mod-php php-mysql && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Enable Apache mods
RUN a2enmod rewrite

# Copy a sample PHP file
RUN echo "<?php phpinfo(); ?>" > /var/www/html/index.php

# Expose ports
EXPOSE 80 3306

# Start Apache and MySQL services
CMD service mysql start && apachectl -D FOREGROUND
