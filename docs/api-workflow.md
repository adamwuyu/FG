1. 本项目分为前端和后端两个部分
2. 前端访问的接口都由本项目后端提供
3. 本项后端接到前端的接口访问后，有两种类型的处理方式：
  3.1 类型1: 接口url中带有proApi的，本项目**后端**会调用proApi项目提供的接口，这些接口由外部的proApi项目提供。proApi接口需要通过JWT认证才能有效获得数据，所以会获取令牌；令牌获得后返回给**前端**，前端通过local Storage保存令牌，之后访问proApi接口时都需要带着这个token；令牌过期后需要重新登录获取新令牌。
  3.2 类型2: 其它接口调用的是本项目nodejs处理逻辑，不调用外部接口，这些接口的处理逻辑在本项目nodejs中实现，没有JWT认证。
4. 有的接口url不包含proApi，但是逻辑上它又需要访问proApi，比如：
  4.1 登录时**前端**访问/support/user/account/loginByPassword
  4.2 **后端**收到请求后，除了验证用户名密码外，还需要访问http://localhost:3002/api/support/user/auth/login，从而获得用于proApi接口的token，然后把token返回前端
  4.3 **前端**接收到token后，储存为local storage，之后再访问proApi的接口时都需要带着这个token，如果token过期了，需要刷新token
  
BUG: 目前代码逻辑中，后端错误地尝试把token保存在local storage中，而local storage是前端浏览器的特性，后端无法保存和访问。所以：
TODO：
1. 后端需要修改，不能尝试保存token到local storage，而是返回token给前端
2. 前端需要修改，登录时保存token到local storage，之后访问proApi接口时都需要带着这个token，如果token过期了，需要刷新token

5. 如果后端访问 http://localhost:3002/api/support/user/auth/login 遇到问题，请参考以下curl命令：
```bash
(base) adam@Mac-mini FG-proApi % curl -X POST http://localhost:3002/api/support/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "root", "password": "IloveGPT!"}'
{"code":200,"message":"登录成功","data":{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2IxMzEyYWQ5ZDQxYzJkNGYyYjVjZTAiLCJ0ZWFtSWQiOiI2N2QyZTI3NGFiMTQ1NzAwODZkNjMyZWYiLCJpYXQiOjE3NDIzNzgwMzIsImV4cCI6MTc0MjQ2NDQzMn0.xoRYKWrt_rzQEeZUnACVWrb2bVbLUMcwvKyAHMUP3lE","user":{"userId":"67b1312ad9d41c2d4f2b5ce0","username":"root","avatar":"/icon/human.svg","teamId":"67d2e274ab14570086d632ef","teamName":"Test Team"}}}% 
```