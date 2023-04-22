# ShoutingWall<br/>一个为学校同学开发的网站式的喊话墙

「ShoutingWall」是一个轻量化的喊话墙软件, 原本为我们学校的学生开发。<br/>
且为防止老师查看进行了特别优化, 加入了计划型注册和验证登录系统。<br/>
它存在的意义即为学生提供一个发泄的空间, 而不必每日提心吊胆地害怕说错话。<br/><br/>

这是一个基于Node.js开发的网站, 已注册登录的用户可以在此发布一些内容并查看他人发布的内容。<br/>

![头图] images/backgrounds/fm.png

--------
### 特性
- 拥有相对严格的注册和登录机制。
- 支持匿名发布。
- 相对完全的log机制。
- ......

--------
### 使用方法
Windows用户请先从此处下载Nodejs:https://nodejs.org/ , 然后再程序根目录运行:<br/>
<b><i>node server.js</i></b>
或使用批处理文件:
```bat
@ECHO OFF
color a
node server.js
PAUSE
```
<br/>
MacOS和Linux的方法类似且同理。<br/>
运行完毕后打开浏览器, 地址栏输入:<br/>
<b><i>localhost</i></b>

--------
### Apis及释义
(JSON的值均为String类型)<br/>
路径 | 类型 | 释义 | 参数 | 返回值<br/>
/api/login | POST | 提供登录服务 | {"token":token, 'pwd':pwd} | {"Result":result}<br/>
/api/reg | POST | 提供注册服务 | {"regToken":token, 'regPwd':pwd, 'name':name} | {"Result":result,"tk":tk}<br/>
/api/artical_full | POST | 获取完整文章 | {'artical_id':id} | {"Result":result,"title":title,"content":content,"author":author,"date":date}<br/>
/api/create_artical | POST | 创建文章 | {"Title":title, "Content":content, "isAnonymous":isAnonymous} | {"Result":result}

--------
### 更新进度
- 2023/4/15 更新初版

--------
### 计划更新
- 公告系统
- 敏感词屏蔽
- IP更换检测
- 设备更换检测
- ......

--------
©2023 daniuge233.<br/>
images/backgrounds/bg1.png来源于网络, 侵删。
