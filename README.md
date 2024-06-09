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

1.修改 `.env.production` 中的后端ip地址

2.为生产环境进行编译
```shell
npm run build
# 构建镜像
# 本地构建
docker build -t mini-fdu-front:1.0.0 .
```

3.构建镜像
```shell
# 本地构建
docker build -t mini-fdu-front:1.0.0 .
# 构建并推送到docker hub
## 如果需要推送到自己的docker hub，需要先登录，并更改 zmarkgo 为自己的用户名
docker build -t zmarkgo/mini-fdu-front:1.0.0 .
docker push zmarkgo/mini-fdu-front:1.0.0
```

4.本地启动镜像
 ```shell
 docker run -d --name mini-fdu-front -p 80:80 mini-fdu-front:1.0.0
 ```