# שלב 1: בניית ה-Backend
FROM node:22-alpine AS backend-build
WORKDIR /app/backend

# נתקין את כל התלויות של ה-backend
COPY backend/package*.json ./
RUN npm install

# נעתיק את קבצי השרת
COPY backend/ ./

# שלב 2: הרצת האפליקציה (Frontend + Backend)
FROM node:22-alpine
WORKDIR /app

# נעתיק את frontend כפי שהוא
COPY index.html ./
COPY css ./css
COPY js ./js
COPY readme.md ./readme.md

# נעתיק את ה-backend שנבנה בשלב הראשון
COPY --from=backend-build /app/backend ./backend

# נפתח יציאה
EXPOSE 3000

# הפעלת השרת
CMD ["node", "backend/server.js"]
