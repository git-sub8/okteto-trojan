const express = require("express");
const app = express();
const port = 3000;
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");

app.get("/", (req, res) => {
  res.send("hello wolrd");
});

//获取系统进程表
app.get("/status", (req, res) => {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>命令行执行结果：\n" + stdout + "</pre>");
    }
  });
});

//启动web
app.get("/start", (req, res) => {
  let cmdStr =
    "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send("命令行执行结果：" + "启动成功!");
    }
  });
});

//获取系统版本、内存信息
app.get("/info", (req, res) => {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    } else {
      res.send(
        "命令行执行结果：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});

//文件系统只读测试
app.get("/test", (req, res) => {
  fs.writeFile("./test.txt", "这里是新创建的文件内容!", function (err) {
    if (err) res.send("创建文件失败，文件系统权限为只读：" + err);
    else res.send("创建文件成功，文件系统权限为非只读：");
  });
});

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://127.0.0.1:8080/", // 需要跨域处理的请求地址
    changeOrigin: true, // 默认false，是否需要改变原始主机头为目标URL
    ws: true, // 是否代理websockets
    pathRewrite: {
      // 请求中去除/api
      "^/api": "/qwe",
    },
    onProxyReq: function onProxyReq(proxyReq, req, res) {},
  })
);

/* keepalive  begin */
function keepalive() {
  // 1.请求主页，保持唤醒
  let okteto_app_url =
    "https://okteto-trojan-git-sub8.cloud.okteto.net";
  request(okteto_app_url, function (error, response, body) {
    if (!error) {
      console.log("保活-主页发包成功！");
      console.log("保活-响应报文:", body);
    } else console.log("保活-请求错误: " + error);
  });

  // 2.请求服务器进程状态列表，若web没在运行，则调起
  request(okteto_app_url + "/status", function (error, response, body) {
    if (!error) {
      if (body.indexOf("./web.js -c ./config.json") != -1) {
        console.log("保活-web正在运行");
      } else {
        console.log("保活-web未运行,发请求调起");
        request(okteto_app_url + "/start", function (err, resp, body) {
          if (!err) console.log("保活-调起web成功:" + body);
          else console.log("保活-请求调起web错误:" + err);
        });
      }
    } else console.log("保活-请求进程表出现错误: " + error);
  });

  // 3.登陆session保活，这可能是多余的。请根据自己抓包填写cookie及相关请求头
  var headers = {
    Host: "cloud.okteto.com",
    Cookie:
      "private-endpoint=MTY4MzY4NzYxNXwxZ3RsSzhmLWczd1pzaFF6YjhFb084ZXBDNU1NQjJoVjh4dEIyc0Q5UFJ5S0NnV29XTERnMmVMZXZjYjFmd1VRSDZpOEhCSVdYMGIyMDVzcmVIdGdWX0liNG5jYUtHN1E2V2dkSFg3VDBOUkx3TzRaaGVsa3dPTWFERU02aFdfWVhHbXoyMVpWWmZJejlMU3NvWEZqY2pVc0hfMC1QYjV5OU83MGRCLS1HaHc9fEX2XyZ2DF3kuyMguR0AtpWyl5vzALmVmPYzLiaUlZBm; mp_92fe782cdffa212d8f03861fbf1ea301_mixpanel=%7B%22distinct_id%22%3A%20%227b7ae28c-462f-4aa8-b84c-d0b00a7e4215%22%2C%22%24device_id%22%3A%20%22188038384096d0-0e03b537252f6b-26031b51-1fa400-1880383840a558%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22%24user_id%22%3A%20%227b7ae28c-462f-4aa8-b84c-d0b00a7e4215%22%2C%22%24search_engine%22%3A%20%22google%22%7D;
      '"Not_A Brand";v="99", "Google Chrome";v="112", "Chromium";v="112"',
    "content-type": "application/json",
    "sec-ch-ua-mobile": "?0",
    authorization: "Bearer bVfSx4CGwWzPveCX62CVwbotKmigPc0aKwPaJy9U",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
    "sec-ch-ua-platform": '"Windows"',
    accept: "*/*",
    origin: "https://cloud.okteto.com",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    referer: "https://cloud.okteto.com/spaces/git-sub8?resourceId=e6fed3b6-41d0-4007-a52e-1940ff14eaf0",
    "accept-language": "zh-CN,zh;q=0.9,ru;q=0.8,en;q=0.7,fr;q=0.6,de;q=0.5",
  };

  var dataString =
    '{"query":"query getSpace($spaceId: String!) {\\n  space(id: $spaceId) {\\n    id\\n    status\\n    quotas {\\n      ...QuotasFields\\n    }\\n    members {\\n      ...MemberFields\\n    }\\n    apps {\\n      ...AppFields\\n    }\\n    stacks {\\n      ...StackFields\\n    }\\n    gitDeploys {\\n      ...GitDeployFields\\n    }\\n    devs {\\n      ...DevFields\\n    }\\n    deployments {\\n      ...DeploymentFields\\n    }\\n    pods {\\n      ...PodFields\\n    }\\n    functions {\\n      ...FunctionFields\\n    }\\n    statefulsets {\\n      ...StatefulsetFields\\n    }\\n    jobs {\\n      ...JobFields\\n    }\\n    cronjobs {\\n      ...CronjobFields\\n    }\\n    volumes {\\n      ...VolumeFields\\n    }\\n    externals {\\n      ...ExternalResourceFields\\n    }\\n    scope\\n    persistent\\n  }\\n}\\n\\nfragment QuotasFields on Quotas {\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  pods {\\n    ...QuotaFields\\n  }\\n  storage {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment QuotaFields on Resource {\\n  limits\\n  limitsTotal\\n  requests\\n  requestsTotal\\n  total\\n  used\\n}\\n\\nfragment MemberFields on Member {\\n  id\\n  avatar\\n  email\\n  externalID\\n  name\\n  owner\\n}\\n\\nfragment AppFields on App {\\n  id\\n  name\\n  version\\n  chart\\n  icon\\n  description\\n  repo\\n  config\\n  status\\n  actionName\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment StackFields on Stack {\\n  id\\n  name\\n  yaml\\n  status\\n  actionName\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment GitDeployFields on GitDeploy {\\n  id\\n  name\\n  icon\\n  yaml\\n  repository\\n  repoFullName\\n  branch\\n  status\\n  actionName\\n  variables {\\n    name\\n    value\\n  }\\n  github {\\n    installationId\\n  }\\n  gitCatalogItem {\\n    id\\n    name\\n  }\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment DevFields on Dev {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  divert\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment EndpointFields on Endpoint {\\n  url\\n  private\\n  divert\\n}\\n\\nfragment DeploymentFields on Deployment {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  devmode\\n  repository\\n  path\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment PodFields on Pod {\\n  id\\n  name\\n  yaml\\n  createdAt\\n  updatedAt\\n  error\\n  status\\n  deployedBy\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment FunctionFields on Function {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  devmode\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment StatefulsetFields on StatefulSet {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  devmode\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment JobFields on Job {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment CronjobFields on CronJob {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment VolumeFields on Volume {\\n  id\\n  name\\n  createdByDevmode\\n  deployedBy\\n  yaml\\n  status\\n  createdAt\\n  updatedAt\\n  storage {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment ExternalResourceFields on ExternalResource {\\n  id\\n  name\\n  createdAt\\n  updatedAt\\n  deployedBy\\n  endpoints {\\n    url\\n  }\\n  notes {\\n    path\\n    markdown\\n  }\\n}","variables":{"spaceId":"hrzyang"},"operationName":"getSpace"}';

  var options = {
    url: "https://cloud.okteto.com/graphql",
    method: "POST",
    headers: headers,
    body: dataString,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let externalID = "hrzyang"; //这里也可以换成自己的邮箱
      if (body.indexOf(externalID) != -1)
        console.log("externalID为hrzyang的用户session保活成功");
      else console.log("登陆session失效,保活失败");
    } else console.log("登陆session保活-发请求出错:" + error);
  });
}

// 9秒执行一次上述请求
setInterval(keepalive, 9 * 1000);
/* keepalive  end */

/* init  begin */

// 1.启动web.js
let startCMD =
  "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &";
exec(startCMD, function (err, stdout, stderr) {
  if (err) {
    console.log("初始化-启动web.js-失败:" + err);
  } else {
    console.log("初始化-启动web.js成功!");
  }
});

// 2. 安装ps命令
let cmdStr = "apt-get update && apt-get -y install procps";
exec(cmdStr, function (err, stdout, stderr) {
  if (err) console.log("初始化-安装ps命令包procps失败:" + err);
  else console.log("初始化-安装ps命令包procps成功!");
});

/* init  end */
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
