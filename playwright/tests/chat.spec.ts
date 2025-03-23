import { test, expect } from '@playwright/test';

test('【聊天】测试', async ({ page }) => {
  // 访问test App
  await page.goto('http://localhost:3000/chat?appId=67b131b0d9d41c2d4f2b5d7d');

  // 网页标题正确.
  await expect(page).toHaveTitle(/test/);

  // 在文本框中输入"Say Hi"
  await page
    .getByPlaceholder('输入问题，发送 [Enter]/换行 [Ctrl(Alt/Shift) + Enter]')
    .fill('Say Hi');

  // 点击回车按钮
  await page.keyboard.press('Enter');

  // 等待并验证消息
  await expect(page.locator('p', { hasText: 'Say Hi' })).toBeVisible({ timeout: 10000 });

  // 等待回复
  await page.waitForSelector('div:has-text("查看详情")', { timeout: 10000 });

  // BUG：需要点击的元素是page.getByRole('button').nth(2)
  await page.waitForSelector('button.chakra-button', { timeout: 5000 });
  await page.getByRole('button').nth(2).click();

  // 点击确定按钮
  await page.getByRole('button', { name: '确认' }).click();

  // 等待消息被清除
  await expect(page.locator('p', { hasText: 'Say Hi' })).not.toBeVisible({ timeout: 5000 });
});

test('【工作台】测试', async ({ page }) => {
  let urls = [
    'http://localhost:3000/app/list',
    'http://localhost:3000/app/list?type=simple',
    'http://localhost:3000/app/list?type=advanced',
    'http://localhost:3000/app/list?type=plugin'
  ];
  for (let url of urls) {
    await page.goto(url);
    await expect(page).toHaveURL(url);
  }
});

test('【知识库】测试', async ({ page }) => {
  let targets = [
    { url: 'http://localhost:3000/dataset/list', text: '我的知识库' },
    {
      url: 'http://localhost:3000/dataset/detail?datasetId=67b98daac56d7fe0ba8fe6b0',
      text: '数据集'
    }
  ];
  for (let target of targets) {
    await page.goto(target.url);
    await expect(page).toHaveURL(target.url);
    await expect(page.getByText(target.text)).toBeVisible({ timeout: 10000 });
  }

  await page.goto(
    'http://localhost:3000/dataset/detail?datasetId=67b98daac56d7fe0ba8fe6b0&currentTab=test'
  );
  await page.getByRole('textbox', { name: '输入需要测试的文本' }).fill('腾讯');
  // 点击getByRole('button', { name: '测试', exact: true })
  await page.getByRole('button', { name: '测试', exact: true }).click();
  // 等待元素出现：getByText('测试成功')
  await expect(page.getByText('测试结果')).toBeVisible({ timeout: 10000 });
});

test('【工具箱】测试', async ({ page }) => {
  let targets = [
    { url: 'http://localhost:3000/toolkit' },
    { url: 'http://localhost:3000/toolkit?group=systemPlugin&type=tools' },
    { url: 'http://localhost:3000/toolkit?group=systemPlugin&type=search' },
    { url: 'http://localhost:3000/toolkit?group=systemPlugin&type=communication' }
  ];
  for (let target of targets) {
    await page.goto(target.url);
    await expect(page).toHaveURL(target.url);
    if (target.text) {
      await expect(page.getByText(target.text)).toBeVisible({ timeout: 10000 });
    }
  }
});

test('【账号】测试', async ({ page }) => {
  let targets = [
    { url: 'http://localhost:3000/account/info', text: '个人信息' },
    { url: 'http://localhost:3000/account/thirdParty', text: 'laf 账号' },
    { url: 'http://localhost:3000/account/model', text: '可用模型' },
    { url: 'http://localhost:3000/account/apikey', text: 'API 密钥管理' },
    { url: 'http://localhost:3000/account/setting', text: '语言: ' }
  ];
  for (let target of targets) {
    await page.goto(target.url);
    await expect(page).toHaveURL(target.url);
    if (target.text) {
      await expect(page.getByText(target.text).first()).toBeVisible({ timeout: 10000 });
    }
  }
});
