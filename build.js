/* 把 index.html + 所有 CSS/JS 打包成一个可以直接双击、也可以发到手机的单文件 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let html = read('index.html');

/* 内联样式 */
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, f) =>
  '<style>\n' + read(f) + '\n</style>');

/* 内联脚本 */
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, f) =>
  '<script>\n' + read(f) + '\n</script>');

/* 单文件里没有独立的图标/清单文件，去掉引用 */
html = html
  .replace(/[ \t]*<link rel="manifest"[^>]*>\r?\n/g, '')
  .replace(/[ \t]*<link rel="icon"[^>]*>\r?\n/g, '')
  .replace(/[ \t]*<link rel="apple-touch-icon"[^>]*>\r?\n/g, '');

/* 加一句：标识这是离线版 */
html = html.replace('</title>', '</title>\n<!-- 单文件离线版：所有样式与脚本已内联，可直接双击运行或发到手机 -->');

const outDir = path.join(ROOT, 'dist');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, '荣耀·第十区.html');
fs.writeFileSync(outFile, html, 'utf8');

const kb = (fs.statSync(outFile).size / 1024).toFixed(0);
console.log('打包完成：' + outFile);
console.log('体积：' + kb + ' KB');
