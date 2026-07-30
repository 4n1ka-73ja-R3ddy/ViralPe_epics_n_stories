# Standalone Cyrus Recharge Mock Server Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY cyrus_mock_server.js .

EXPOSE 9090

ENV PORT=9090

CMD ["node", "cyrus_mock_server.js"]
