FROM node:16

WORKDIR E:/Programming/VCT/WebApp

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]