FROM node:18-bullseye

# Install libreoffice
RUN apt-get update && \
        apt-get install -y --no-install-recommends \
            libreoffice libreoffice-writer libreoffice-common fonts-dejavu-core \
            python3 python3-pip poppler-utils pandoc tesseract-ocr tesseract-ocr-vie && \
        pip3 install --no-cache-dir \
            pdf2docx==0.5.5 \
            pymupdf==1.20.0 \
            ocrmypdf==13.6.0 && \
        rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
# Install all deps (including dev) so we can run the TypeScript build
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main.js"]
