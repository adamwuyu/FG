# FastGPT Playwright 测试流程规范

## 1. 环境准备

### 技术栈
- Playwright v1.50.1
- Node.js v18.17.1
- TypeScript

### 环境配置
- 在 `.env.local` 文件中配置敏感信息（如测试账号密码）
- 使用 `storageState.json` 保存登录状态，避免重复登录

## 2. 项目结构

```
/playwright
├── .env.local          # 环境变量配置
├── playwright.config.ts # Playwright 配置文件
├── tests               # 测试文件目录
│   ├── login.setup.ts  # 登录设置
│   ├── *.spec.ts       # 功能测试文件
├── storageState.json   # 存储登录状态
```

## 3. 测试编写流程

### 步骤一：配置认证（如需要）
1. 使用 `login.setup.ts` 进行登录认证
2. 认证流程会生成 `storageState.json` 文件
3. 后续测试可通过配置使用该状态文件，无需重复登录

### 步骤二：创建测试文件
1. 在 `tests` 目录下创建 `[功能名称].spec.ts` 文件
2. 文件命名规范：使用小写字母，以 `.spec.ts` 为后缀

### 步骤三：编写测试用例
1. 导入必要的模块：
   ```typescript
   import { test, expect } from '@playwright/test';
   ```

2. 定义测试用例：
   ```typescript
   test('【模块名】测试描述', async ({ page }) => {
     // 测试代码
   });
   ```

3. 测试用例命名规范：
   - 使用中文方括号标识模块：【模块名】
   - 简洁描述测试目的

### 步骤四：编写测试步骤
1. 页面导航：
   ```typescript
   await page.goto('http://localhost:3000/路径');
   ```

2. 元素交互：
   ```typescript
   // 填写表单
   await page.fill('选择器', '值');
   
   // 点击按钮
   await page.getByRole('button', { name: '按钮文本' }).click();
   
   // 键盘操作
   await page.keyboard.press('Enter');
   ```

3. 断言验证：
   ```typescript
   // URL 验证
   await expect(page).toHaveURL('预期URL');
   
   // 文本验证
   await expect(page.getByText('预期文本')).toBeVisible({ timeout: 10000 });
   
   // 元素存在性验证
   await expect(page.locator('选择器')).toBeVisible();
   ```

## 4. 最佳实践

### 选择器策略
按优先级排序：
1. 使用 `getByRole`：`page.getByRole('button', { name: '确认' })`
2. 使用 `getByText`：`page.getByText('预期文本')`
3. 使用 `getByPlaceholder`：`page.getByPlaceholder('输入问题')`
4. 使用 CSS 选择器（最后选择）：`page.locator('button.chakra-button')`

### 等待策略
1. 设置合理的超时时间：
   ```typescript
   await expect(page.getByText('测试结果')).toBeVisible({ timeout: 10000 });
   ```

2. 对于异步操作，使用 `waitForSelector` 或 `waitForURL`：
   ```typescript
   await page.waitForSelector('div:has-text("查看详情")', { timeout: 10000 });
   await page.waitForURL('http://localhost:3000/app/list');
   ```

### 测试组织
1. 相关测试分组：将相关功能的测试放在同一个测试文件中
2. 使用循环测试多个类似场景：
   ```typescript
   let targets = [
     { url: '路径1', text: '预期文本1' },
     { url: '路径2', text: '预期文本2' }
   ];
   for (let target of targets) {
     await page.goto(target.url);
     await expect(page).toHaveURL(target.url);
     await expect(page.getByText(target.text)).toBeVisible();
   }
   ```

## 5. 运行测试

### 运行所有测试
```bash
npx playwright test
```

### 运行特定测试文件
```bash
npx playwright test tests/chat.spec.ts
```

### 运行特定测试用例
```bash
npx playwright test -g "【聊天】测试"
```

### 生成测试报告
```bash
npx playwright show-report
```

## 6. 调试技巧

1. 使用 `--debug` 标志进行调试：
   ```bash
   npx playwright test --debug
   ```

2. 添加调试点：
   ```typescript
   await page.pause();
   ```

3. 截图或视频记录：
   ```typescript
   await page.screenshot({ path: 'screenshot.png' });
   ```
