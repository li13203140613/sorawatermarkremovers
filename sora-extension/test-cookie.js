async function testCookie() {
  const output = document.getElementById('output');

  try {
    // 读取 Auth Cookie (测试环境 - localhost:3000)
    const authCookie = await chrome.cookies.get({
      url: 'http://localhost:3000',
      name: 'sb-zjefhzapfbouslkgllah-auth-token'
    });

    output.textContent = 'Auth Cookie 结果:\n' + JSON.stringify(authCookie, null, 2);

    if (!authCookie) {
      output.textContent += '\n\n❌ 未找到 Auth Cookie！\n可能原因：\n1. 你在网站上没有登录\n2. Cookie 名称不对\n3. 域名不匹配';
    } else {
      output.textContent += '\n\n✅ 找到 Auth Cookie！\n长度: ' + authCookie.value.length;
    }
  } catch (error) {
    output.textContent = '❌ 错误: ' + error.message;
  }
}

document.getElementById('testBtn').addEventListener('click', testCookie);
