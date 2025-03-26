
前端访问http://localhost:3000/api/proApi/support/user/team/org/list
返回：
```json
{
  "error": "接口不存在",
  "message": "您请求的接口不存在，请访问 /api-docs 获取完整的API文档",
  "path": "/api/support/user/team/org/list?",
  "method": "GET"
}
```
1. 这是新出现的bug，之前没有问题，可能与你刚才的bug fixing有关
2. 实际上proApi中有此接口：
```json
(base) adam@Mac-mini FG-proApi % curl -X GET "http://localhost:3002/api/support/user/team/org/list" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2IxMzEyYWQ5ZDQxYzJkNGYyYjVjZTAiLCJ0ZWFtSWQiOiI2N2QyZTI3NGFiMTQ1NzAwODZkNjMyZWYiLCJ0bWJJZCI6IjY3YjEzMTJhZDlkNDFjMmQ0ZjJiNWNlNyIsImlzUm9vdCI6dHJ1ZSwiZXhwIjoxNzQzNDQxNDU5LCJpYXQiOjE3NDI4MzY2NTl9.vfJRHcBfV3ipNNXqF3lBXGI5f5I10ORXKe3iYDE5Bu4" \
  -H "Content-Type: application/json"
{
  "error": "接口不存在",
  "message": "您请求的接口不存在，请访问 /api-docs 获取完整的API文档",
  "path": "/api/support/user/team/org/list",
  "method": "GET"
}% 
```