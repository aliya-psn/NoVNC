# NOVNC

### 启动

-   1、被远程主机安装 VNC Server：TightVNC，安装密码设置为 123456（或关闭 authentication 验证），端口默认为5900 可单独设置

配置文件：src/utils/constants.js

-   2、启动本地前端程序（http://localhost:8088/）

node 版本要求：v14

```
npm install
npm run serve
npm run build
```

-   3、启动本地中转代理 node 服务，或使用 pm2 常驻服务

*   启动 node 服务

```
cd ./node
node ./index.js
```

### 部署

-   pm2 常驻服务：

```
npm install pm2 -g
pm2 start index.js --name "vnc"
pm2 list
pm2 start vnc
pm2 stop vnc
```

### 功能

1、连接vnc
2、连接socket

### 参考

​[noVNC](https://github.com/novnc/noVNC)  
[vue2-manage](https://github.com/bailicangdu/vue2-manage)  
[websockettest](https://github.com/jxlhljh/springbootwebsockettest.git)
