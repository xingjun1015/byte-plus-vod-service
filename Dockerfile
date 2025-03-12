FROM node:20.18-alpine AS build

WORKDIR /app
COPY ./package.json .
RUN npm install 

COPY ./src  .

FROM node:20.18-slim 

RUN apt-get update && \
    apt-get -y install fuse curl && \
    curl -L -O https://github.com/GoogleCloudPlatform/gcsfuse/releases/download/v0.39.2/gcsfuse_0.39.2_amd64.deb && \
    dpkg --install gcsfuse_0.39.2_amd64.deb && \
    mkdir -p /app/data

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["npm","run","dev"]
