import { sayHello } from './testDemo';

describe('sayHello 函数测试', () => {
  it('应返回 "Hello, world!"', () => {
    expect(sayHello()).toBe('Hello, world!');
  });
});
