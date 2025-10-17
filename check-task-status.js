/**
 * 查询 AI Coding 任务状态
 */

const taskId = 'task_01k7r13vg5f3n9tnzh1v73a50s';

// 从环境变量读取 API Key，或者直接在这里设置
const apiKey = 'aicoding-e4d7eeb6087c183ab921ce6039c6113a';

async function checkTaskStatus() {
  try {
    console.log(`正在查询任务: ${taskId}\n`);

    const response = await fetch(`https://api.aicoding.sh/v1/task/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await response.json();

    console.log('='.repeat(60));
    console.log('响应状态码:', response.status);
    console.log('='.repeat(60));
    console.log('完整响应数据:\n');
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(60));

    // 解析任务状态
    if (data.status) {
      console.log('\n任务状态解析:');
      console.log('├─ 状态:', data.status);
      console.log('├─ 消息:', data.message || '无');
      console.log('├─ 进度:', data.progress?.progress_pct || 0, '%');
      console.log('├─ 创建时间:', data.created_at || '未知');
      console.log('└─ 更新时间:', data.updated_at || '未知');

      // 如果失败，显示失败原因
      if (data.status === 'failed') {
        console.log('\n❌ 任务失败！');
        console.log('失败原因:', data.message || '未知原因');
      }

      // 如果完成，显示视频地址
      if (data.status === 'completed' && data.result?.output_url) {
        console.log('\n✅ 任务完成！');
        console.log('视频地址:', data.result.output_url);
      }

      // 如果处理中，显示进度
      if (data.status === 'processing') {
        console.log('\n⏳ 任务处理中...');
        console.log('当前进度:', data.progress?.progress_pct || 0, '%');
      }

      // 如果挂起
      if (data.status === 'pending') {
        console.log('\n⏸️ 任务挂起中，等待处理...');
      }
    }

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    console.error('详细错误:', error);
  }
}

checkTaskStatus();
