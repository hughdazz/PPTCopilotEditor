FROM node:16

WORKDIR /home/app

COPY . .

RUN npm config set registry https://registry.npmmirror.com/ && npm install

EXPOSE 7777

# 如果arg server_ip不为空，则替换配置文件中的server_ip
ARG SERVER_IP
# 运行env.py传递参数
RUN python3 env.py $SERVER_IP

CMD ["npm", "run", "serve", "--", "--port", "7777"]