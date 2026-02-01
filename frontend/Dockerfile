FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install ajv@^6.12.6 ajv-keywords@^3.5.2 --legacy-peer-deps && \
    npm install --legacy-peer-deps

# Copy application
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
