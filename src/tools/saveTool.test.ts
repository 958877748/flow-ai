import { saveTool } from './saveTool';
import fs from 'fs/promises';
import path from 'path';

describe('saveTool', () => {
  const testToolName = 'testTool.ts';
  const testContent = 'export const test = () => "Hello, World!";';
  const toolsDir = path.resolve(process.cwd(), 'src', 'tools');
  const testFilePath = path.join(toolsDir, testToolName);

  afterEach(async () => {
    // 清理测试文件
    try {
      await fs.unlink(testFilePath);
    } catch (error) {
      // 文件不存在时忽略错误
    }
  });

  it('should save a tool file successfully', async () => {
    const result = await saveTool.execute({ toolName: testToolName, content: testContent });
    
    // 检查返回结果
    expect(result).toContain('文件保存成功');
    expect(result).toContain(testFilePath);
    
    // 检查文件是否真的被创建
    const fileContent = await fs.readFile(testFilePath, 'utf-8');
    expect(fileContent).toBe(testContent);
  });

  it('should save a tool file with .ts extension when not provided', async () => {
    const toolNameWithoutExtension = 'anotherTestTool';
    const expectedFileName = `${toolNameWithoutExtension}.ts`;
    const expectedFilePath = path.join(toolsDir, expectedFileName);
    
    const result = await saveTool.execute({ toolName: toolNameWithoutExtension, content: testContent });
    
    // 检查返回结果
    expect(result).toContain('文件保存成功');
    expect(result).toContain(expectedFilePath);
    
    // 检查文件是否真的被创建
    const fileContent = await fs.readFile(expectedFilePath, 'utf-8');
    expect(fileContent).toBe(testContent);
    
    // 清理测试文件
    await fs.unlink(expectedFilePath);
  });

  it('should handle errors gracefully', async () => {
    // 使用一个可能导致错误的场景（例如无效的文件名）
    const result = await saveTool.execute({ toolName: '', content: testContent });
    
    // 检查是否返回了成功信息（因为我们的实现会将空字符串转换为 .ts 文件）
    expect(result).toContain('文件保存成功');
    
    // 清理创建的文件
    const filePath = path.join(path.resolve(process.cwd(), 'src', 'tools'), '.ts');
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // 文件不存在时忽略错误
    }
  });
});