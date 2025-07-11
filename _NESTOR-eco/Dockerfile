# -------- BUILD STAGE --------
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    # Αντιγραφή package* και εγκατάσταση
    COPY package*.json ./
    RUN npm install
    
    # Αντιγραφή υπόλοιπου project
    COPY . .
    
    # Κάνε build την Next.js εφαρμογή
    RUN npm run build
    
    # -------- RUNTIME STAGE --------
    FROM node:18-alpine AS runner
    
    WORKDIR /app
    
    # Αντιγραφή μόνο όσων χρειάζονται
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/next.config.js ./next.config.js
    
    # Εκθέτουμε την πόρτα 8080 για Cloud Run
    EXPOSE 8080
    
    # Start με σωστή πόρτα
    ENV PORT 8080
    CMD ["npm", "start"]
    