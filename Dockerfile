FROM node:22-alpine

WORKDIR /app

# התקנת תלויות של ה-backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# העתקת שאר הקבצים (frontend + backend)
COPY . .

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "backend/server.js"]
