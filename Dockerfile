FROM node:20-bullseye

RUN npm config set registry https://registry.npmmirror.com
RUN apt-get update && apt-get install -y git ripgrep && rm -rf /var/lib/apt/lists/*
RUN npm install -g @anthropic-ai/claude-code

WORKDIR /app
ENTRYPOINT ["claude"]