import { test as setup } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载.env.local文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

setup('登陆', async ({ page, context }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="username"]', 'root');

  // 从.env.local获取密码
  const password = process.env.PASSWORD;
  console.log('password', password);

  if (!password) {
    throw new Error('PASSWORD is not set');
  }
  await page.fill('input[name="password"]', password);
  await page.getByRole('button', { name: 'agree' }).click();
  await page.getByRole('button', { name: 'English(US)' }).click();
  await page.waitForTimeout(500);
  await page.getByRole('menuitem', { name: '简体中文' }).click();
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:3000/app/list');
  await context.storageState({ path: 'storageState.json' });
});
