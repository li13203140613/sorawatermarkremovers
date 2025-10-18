import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

/**
 * Cloudflare R2 客户端
 * 使用 S3 兼容 API
 */
export class R2Client {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const endpoint = process.env.R2_ENDPOINT;
    this.bucketName = process.env.R2_BUCKET_NAME || '';
    this.publicUrl = process.env.R2_PUBLIC_URL || '';

    if (!accessKeyId || !secretAccessKey || !endpoint || !this.bucketName) {
      throw new Error('R2 配置不完整，请检查环境变量');
    }

    this.client = new S3Client({
      region: 'auto', // R2 使用 'auto'
      endpoint: endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * 上传文件到 R2
   * @param localFilePath 本地文件路径
   * @param r2Key R2 中的对象键（路径）
   * @param contentType MIME 类型
   * @returns 公开访问 URL
   */
  async uploadFile(
    localFilePath: string,
    r2Key: string,
    contentType?: string
  ): Promise<string> {
    try {
      // 读取文件
      const fileBuffer = fs.readFileSync(localFilePath);

      // 自动检测 MIME 类型
      if (!contentType) {
        const ext = path.extname(localFilePath).toLowerCase();
        contentType = this.getContentType(ext);
      }

      // 上传到 R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: r2Key,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await this.client.send(command);

      // 返回公开 URL
      return this.getPublicUrl(r2Key);
    } catch (error) {
      console.error(`上传失败: ${r2Key}`, error);
      throw error;
    }
  }

  /**
   * 批量上传文件
   * @param files 文件数组 [{localPath, r2Key, contentType}]
   * @param concurrency 并发数
   * @returns 上传结果数组
   */
  async uploadFiles(
    files: Array<{ localPath: string; r2Key: string; contentType?: string }>,
    concurrency: number = 3
  ): Promise<Array<{ r2Key: string; url: string; success: boolean; error?: string }>> {
    const results: Array<{ r2Key: string; url: string; success: boolean; error?: string }> = [];
    const chunks = this.chunkArray(files, concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(async (file) => {
        try {
          const url = await this.uploadFile(file.localPath, file.r2Key, file.contentType);
          return { r2Key: file.r2Key, url, success: true };
        } catch (error) {
          return {
            r2Key: file.r2Key,
            url: '',
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      });

      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);

      // 日志
      console.log(`已上传 ${results.length}/${files.length} 个文件`);
    }

    return results;
  }

  /**
   * 检查文件是否存在
   * @param r2Key R2 对象键
   * @returns 是否存在
   */
  async fileExists(r2Key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: r2Key,
      });
      await this.client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取公开访问 URL
   * @param r2Key R2 对象键
   * @returns 公开 URL
   */
  getPublicUrl(r2Key: string): string {
    // 确保 key 不以 / 开头
    const cleanKey = r2Key.startsWith('/') ? r2Key.slice(1) : r2Key;
    // 确保 publicUrl 以 / 结尾
    const baseUrl = this.publicUrl.endsWith('/') ? this.publicUrl : `${this.publicUrl}/`;
    return `${baseUrl}${cleanKey}`;
  }

  /**
   * 根据文件扩展名获取 MIME 类型
   */
  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * 将数组分块
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

/**
 * 创建 R2 客户端单例
 */
let r2ClientInstance: R2Client | null = null;

export function getR2Client(): R2Client {
  if (!r2ClientInstance) {
    r2ClientInstance = new R2Client();
  }
  return r2ClientInstance;
}
