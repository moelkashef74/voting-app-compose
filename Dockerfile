FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

FROM node:22-alpine

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

    
 