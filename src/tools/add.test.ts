import { add } from './add';

describe('add', () => {
  it('should correctly add two numbers', async () => {
    const result = await add.execute({ a: 2, b: 3 });
    expect(result).toBe('5');
  });

  it('should correctly add negative numbers', async () => {
    const result = await add.execute({ a: -2, b: 3 });
    expect(result).toBe('1');
  });

  it('should correctly add floating point numbers', async () => {
    const result = await add.execute({ a: 1.5, b: 2.5 });
    expect(result).toBe('4');
  });
});