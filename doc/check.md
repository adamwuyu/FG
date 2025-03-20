接下来我会提供一些信息，然后需要你进行检查和确认。
## 信息
1. 本项目分为前端和后端两个部分
2. 前端访问的接口都由本项目后端提供
3. 本项后端接到前端的接口访问后，有两种类型的处理方式：
  3.1 类型1: 接口url中带有proApi的，本项目后端会调用proApi项目提供的接口，这些接口由外部的proApi项目提供。proApi接口需要通过JWT认证才能有效获得数据，所以会获取令牌，通过local Storage保存令牌，令牌过期后需要重新登录获取新令牌。
  3.2 类型2: 其它接口调用的是本项目nodejs处理逻辑，不调用外部接口，这些接口的处理逻辑在本项目nodejs中实现，没有JWT认证。
4. JWT_SECRET这个常量，是专门为访问proApi接口而创建的，在此之前，本项目没有JWT_SECRET。

## 检查内容
1. 为什么./projects/app/.env.local 中需要和proApi项目的.env相同的JWT_SECRET？proApi的令牌不是在proApi项目创建、验证吗？本项目不是只需要请求和保存吗？为什么需要和proApi的JWT_SECRET相同？甚至为什么还需要JWT_SECRET？请详细分析和说明。
2. 为什么 /Users/adam/Sites/FG/packages/service/support/permission/controller.ts 中有authJWT函数？
3. 为什么需要 /Users/adam/Sites/FG/projects/app/src/pages/api/support/user/account/refreshToken.ts 因为令牌不是在proApi项目创建、验证吗？
