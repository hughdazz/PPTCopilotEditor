FROM node:16

WORKDIR /home/app

COPY . .

RUN npm install

EXPOSE 7777

CMD ["npm", "run", "serve", "--", "--port", "7777"]