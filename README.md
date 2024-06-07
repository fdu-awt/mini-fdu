# mini-fdu

## 技术栈

- node.js 18.3.0
- vue-router
- vue-store
- three.js

```shell
npm install three --save
```

- element-plus (Message, MessageBox, Notification)
```shell
npm install element-plus --save
```

- axios
```shell
npm install axios --save
```

## 项目启动

```shell
npm install
```

```shell
#Compiles and hot-reloads for development
npm run serve
```

## docker部署

修改 `.env.production` 中的后端ip地址

```shell
# Compiles and minifies for production
npm run build
# 构建镜像
docker build -t mini-fdu-front:1.0.0 .
```

本地启动镜像
```shell
docker run -d --name mini-fdu-front -p 80:80 mini-fdu-front:1.0.0
```