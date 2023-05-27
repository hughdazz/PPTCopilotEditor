FROM node:latest

WORKDIR /home/app

RUN npm config set registry https://registry.npm.taobao.org && npm install

COPY . .

EXPOSE 7777

CMD ["npm", "run", "serve", "--", "--port", "7777"]