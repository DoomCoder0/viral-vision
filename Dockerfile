FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs ./
COPY public/ ./public/
COPY data/.gitkeep ./data/.gitkeep
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.mjs"]
