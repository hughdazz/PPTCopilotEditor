FROM node:16

WORKDIR /home/app

COPY . .

RUN npm config set registry https://registry.npmmirror.com/ && npm install

EXPOSE 7777

CMD ["npm", "run", "serve", "--", "--port", "7777"]