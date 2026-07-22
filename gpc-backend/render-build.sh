#!/usr/bin/env bash
# Install Chromium for Puppeteer PDF generation
apt-get update && apt-get install -y chromium-browser || true

# Install dependencies and build
npm install
npx prisma generate
npm run build