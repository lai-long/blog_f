# 多阶段构建：node 阶段构建产物 → nginx 阶段托管，无独立 Node 运行时
FROM node:22-alpine AS build
WORKDIR /app
# 依赖层单独拷贝，利用 Docker 缓存：lock 文件不变就不重装依赖
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
