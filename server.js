// 服务器代码
// (什么屎山)

var HTTP = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require("querystring");
var path = require('path');

const ip = '127.0.0.1';
const host = 80;

HTTP.createServer(function (req, res) {

        // apis
        if (req.method == 'POST') {
        let postdata = '';
        req.setEncoding('utf-8');//设置编码
        req.addListener('data', function(pds) {
            postdata += pds;
        })
        req.addListener('end', function() { 

            try {
                var param = querystring.parse(postdata);
            } catch {
                res.write('{"Result":"false"}');
                return;
            }
            // 登录api
            if (req.url == '/api/login') {
                // console.log(param);
                var users = fs.createReadStream('./data/users/data.json');
                var str = '';
                users.on('data', chunk => {
                    str += chunk;
                });
                users.on('end', () => {
                    console.log('[INFO | ACCOUNT] | ' + getTime() + " 正在登录。数据:" + JSON.stringify(param) + " | IP: " + getIp(req))
                    try {
                        var s = JSON.parse(str);
                    } catch {
                        res.end('{"Resultt":"false"}');
                        return;
                    }
                    for (i in s) {
                        if (i == param.token) {
                            if (s[i].regPwd == param.pwd) {
                                console.log('[INFO | ACCOUNT] | ' + getTime() + " token和密码均正确");
                                // 登陆成功
                                // 设置cookie(自动登录)
                                res.setHeader(
                                    'Set-Cookie',['token=' + param.token + ';path=/','pwd=' + param.pwd + ';path=/']
                                );
                                console.log('[INFO | ACCOUNT] | ' + getTime() + " 成功设置cookie");
                                res.end('{"Result":"true"}');
                                return;
                            }
                        }
                    }
                    console.log('[INFO | ACCOUNT] | ' + getTime() + " token或密码错误")
                    res.end('{"Result":"false"}');
                    return;
                })
            }

            // 注册api
            else if (req.url == '/api/reg') {
                console.log('[INFO | ACCOUNT] | ' + getTime() + " 正在注册账号。数据:" + JSON.stringify(param) + " | IP: " + getIp(req))
                var s = fs.createReadStream('./data/regTokens/data.json');
                var u = fs.createReadStream('./data/users/data.json');
                var str = '';
                s.on('data', chunk => {
                    str += chunk.toString();
                })
                s.on('end', () => {
                    try {                    
                        var s = JSON.parse(str).tokens;
                    } catch {
                        res.end('{"Resultt":"false"}');
                        return;
                    }
                    for (i in s) {
                        if (param.regToken == s[i]) {
                            console.log('[INFO | ACCOUNT] | ' + getTime() + " Token正确, 使用Token:" + param.regToken + " | IP: " + getIp(req));
                            var p = JSON.parse(str);
                            p.tokens.splice(i, 1);  // 去除已用token
                            fs.writeFile(path.join(__dirname, './data/regTokens/data.json'), JSON.stringify(p), 'utf8', function(err){});    // 覆盖文件
                            console.log('[INFO | ACCOUNT] | ' + getTime() + " 服务器已覆盖新的Tokens文件");
                            
                            var m = '';
                            u.on('data', chunk => {m += chunk});
                            u.on('end', () => {
                                let arr = JSON.parse(m);
                                var d = Date.now().toString();
                                let tk = param.regToken, pwd = param.regPwd;
                                arr[d] = {"regToken":tk, "regPwd":pwd, "name":param.name};
                                let newArr = JSON.stringify(arr)
                                console.log('[INFO | ACCOUNT] | ' + getTime() + " 已创建账号: " + newArr);
                                fs.writeFile(path.join(__dirname, './data/users/data.json'), newArr, 'utf8', function(err){});    // 覆盖文件
                                console.log('[INFO | ACCOUNT] | ' + getTime() + " 服务器已覆盖新的帐号文件");
                                res.end('{"Result":"true","tk":"' + d + '"}');
                            })

                            return;
                        }
                    }
                    console.log('[INFO | ACCOUNT] | ' + getTime() + " Token错误, 使用Token:" + param.regToken + " | IP: " + getIp(req));
                    res.end('{"Result":"false","tk":"' + 0 + '"}');
                });
            }

            // 获取文章内容
            else if (req.url == '/api/artical_full') {
                console.log("[INFO] | " + getTime() + "有用户正在获取文章内容 | id: " + param.artical_id + " | ip: " + getIp(req));
                isLogin(req, function(resu, username) {
                    if (resu) {
                        var artical = fs.createReadStream('./data/articals/data.json');     // 文章json
                        var str = '';
                        artical.on('data', chunk => {
                            str += chunk;
                        })
                        console.log("[INFO] | " + getTime() + "文章获取完毕, 开始遍历");
                        artical.on('end', () => {
                            try {
                                var a = JSON.parse(str).articals;
                            } catch {
                                res.end('{"Resultt":"false"}');
                                return;
                            }
                            var artical_id = param.artical_id;
                            for (i in a) {
                                if (i == artical_id) {
                                    console.log("[INFO] | " + getTime() + "找到目标文章");
                                    var p = '{"Result":"true","title":"' + a[i].title + '","content":"' + a[i].content + '","author":"' + a[i].author + '","date":"' + a[i].date + '"}';
                                    res.end(p);
                                    console.log("[INFO] | " + getTime() + "已传输");
                                    return;
                                }
                            }
                            console.log("[INFO] | " + getTime() + "未找到文章");
                            res.end('{"Result":"false"}');
                            return;
                        });
                    } else {
                        console.log("[INFO] | " + getTime() + "用户未登录");
                        res.end('{"Result":"false"}');
                        return;
                    }
                });
                return;
            }

            // 新建文章api
            else if (req.url == '/api/create_artical') {
                console.log("[INFO] | " + getTime() + "正在创建文章 | ip: " + getIp(req));
                isLogin(req, function(resu, username) {
                    if (resu) {
                        var artical = fs.createReadStream('./data/articals/data.json');     // 文章json
                        var str = '';
                        artical.on('data', chunk => {
                            str += chunk;
                        })
                        console.log("[INFO] | " + getTime() + "文章获取完毕");
                        artical.on('end', () => {
                            var p = JSON.parse(str);
                            var aid = p.curArticals + 1;

                            var title = param.Title;
                            var content = param.Content;
                            // 引号和反斜杠兼容措施
                            content = content.replace(/"/g, "'"); 
                            content = content.replace(/\\/g, ""); 
                            var isa = param.isAnonymous;
                            var d = new Date();
                            var date = d.getFullYear() + "/" + d.getMonth() + "/" + d.getDay();
                            if (title == undefined || content == undefined || isa == undefined) {
                                res.end('{"Result":"false"}');
                                return;
                            }
                            if (isa == "false") {
                                usn = username;
                            } else {
                                usn = "匿名";
                            }
                            console.log("[INFO] | " + getTime() + "文章信息获取完毕 | title: " + title + " | content: " + content + " | isa: " + isa + " | date: " + date);
                            p.articals[aid] = {"title":title, "author":usn, "date":date, "content":content};
                            p.curArticals++;
                            fs.writeFile(path.join(__dirname, './data/articals/data.json'), JSON.stringify(p), 'utf8', function(err){});    // 覆盖文件
                            console.log("[INFO] | " + getTime() + "文章覆写完毕")
                            res.end('{"Result":"true"}');
                            return;
                        });
                        return;
                    } else {
                        res.end('{"Result":"false"}');
                        return;
                    }
                });
                return;
            }
        })
    }
    
    if (req.method == 'GET') {
        var pathname = url.parse(req.url).pathname;
        var postfix = pathname.match(/(\.[^.]+|)$/)[0];//取得后缀名
        var parameter = url.parse(req.url);
        var params = querystring.parse(parameter.query);      // 访问参数
        // 访问参数是一个json形式，直接params.sth访问即可。

        if (pathname == '/') {
            res.write('<script>location.replace("/pages/index.html")</script>');
            res.end();
        }
        
        fs.readFile('.' + pathname, function (err, data){
            console.log("[INFO] | " + getTime() + "有用户正在连接: 目标:" + pathname + " | 用户IP: " + getIp(req));

            //  发送响应数据
            if ((postfix == ".html" || postfix == ".htm") && err) {
                pipeErr(req, res, err)
                return;
            } else {
                if (
                    pathname == '/server.js' || 
                    pathname == '/run.bat' || 
                    pathname == 'node.exe' || 
                    pathname == '/data/regTokens/data.json' || 
                    pathname == '/data/users/data.json' ||
                    pathname == '/data/articals/data.json'
                ) {
                    pipeErr(req, res, null);
                    return;
                }

                if (postfix == '.html' || postfix == '.htm') {
                    // 已登录状态
                    if (parameter.pathname == '/pages/index.html') {
                        res.writeHead(200, {'Content-Type' : 'text/html;charset=utf-8'});
                        isLogin(req, function(resu, username) {
                            if (resu) {
                                // 传输文章预览
                                console.log('[INFO] | ' + getTime() + "正在获取文章预览 | 用户IP:" + getIp(req));
                                var str = fs.readFileSync('.' + pathname).toString();       // html文件
                                var articalprev = fs.createReadStream('./data/articals/data.json');     // 文章json
                                var prev = '';        // 接收文章的str形式
                                articalprev.on('data', chunk => {
                                    prev += chunk;
                                });
                                console.log('[INFO] | ' + getTime() + "文章预览获取完毕");
                                articalprev.on('end', () => {
                                    var s = JSON.parse(prev).articals;
                                    for (i in s) {      // 遍历每一篇文章
                                        var author = s[i].author;
                                        var date = s[i].date;
                                        var title = s[i].title;
                                        var contentprev = s[i].content //.substring(0,30);
                                        str += '<a href="/pages/read.html?artical_id=' + i.toString() + '"><div class="main-content"><span class="content-title">' + title + '</span><span class="content-prev">' + contentprev + '</span><span class="content-auth">' + author + '</span><span class="content-date">' + date + '</span></div></a>';
                                    }
                                    console.log('[INFO] | ' + getTime() + "文章预览遍历完毕");
                                    str += "<style>#tpc {display: none}</style><script>document.getElementById('top-container').innerHTML = '欢迎, <strong>" + username + "</strong>'</script><div class='bottom-container'></div>";
                                    res.write(str);
                                    res.end();
                                    console.log('[INFO] | ' + getTime() + "已传输");
                                    return;   
                                })  
                                return;
                            } else {
                                console.log('[INFO] | ' + getTime() + "用户未登录 | 用户IP:" + getIp(req));
                                if (pathname == '/pages/index.html') {
                                    var str = fs.readFileSync('.' + pathname).toString();
                                    str += "<div class='unLogined'>您未登录，请登陆后查看</div><div class='bottom-container'></div>"
                                    res.write(str);
                                    res.end();
                                    return;
                                }
                            }
                        });
                        return;
                    } else if (parameter.pathname == '/pages/account/login.html') {
                        res.writeHead(200, {'Content-Type' : 'text/html;charset=utf-8'});
                        isLogin(req, function(resu, username) {
                            if (resu) {
                                var str = '';
                                str = "<script>alert('您已登录, 请勿重复登录'); location.replace('/pages/index.html');</script>";
                                res.end(str);
                                return;     
                            } else {
                                res.end(data);
                                return;
                            }
                        });
                        return;
                    } else if (parameter.pathname == '/pages/write.html') {
                        res.writeHead(200, {'Content-Type' : 'text/html;charset=utf-8'});
                        isLogin(req, function(resu, username) {
                            if (!resu) {
                                var str = '';
                                str = "<script>location.replace('/pages/index.html');</script>";
                                res.end(str);
                                return;     
                            }
                            res.end(data);
                            return;
                        }) 
                        return;
                    } 
                }
            }
            res.writeHead(200, {'Content-Type' : 'text/html;charset=utf-8'});
            res.end(data);  // 响应html
        });
    }

}).listen(host)

// 验证登录状态
function isLogin (req, rem) {
    var Cookies = {};
    req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
        var parts = Cookie.split('=');
        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    var users = fs.createReadStream('./data/users/data.json');
    var str = '';
    users.on('data', chunk => {
        str += chunk;
    });
    users.on('end', () => {
        var s = JSON.parse(str);
        for (i in s) {
            if (i == Cookies.token && s[i].regPwd == Cookies.pwd) {
                rem(true, s[i].name);
                return;
            }
        }
        rem(false);
        return;
    });
}

var pipeErr = function(req, res, err = null) {
    if (err) {
        console.log("[ERRO] | " + getTime() + " 连接错误, 信息: " + err.message + " | 用户IP:" + getIp(req));
    }
    res.writeHead(200, {'Content-Type' : 'text/html;charset=utf-8'});
    fs.createReadStream('./pages/err/404.html').pipe(res);
}

var getIp = function(req) {
    var ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddres || req.socket.remoteAddress || '';
    if(ip.split(',').length>0){
      ip = ip.split(',')[0];
    }
    return ip;
};

var getTime = function() {
    var d = new Date();
    return d.getFullYear() + "/" + d.getMonth() + "/" + d.getDay() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}

console.log("[INFO] Server is running on " + ip + ":" + host + ".");