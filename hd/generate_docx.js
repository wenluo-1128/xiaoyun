const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageNumber, Footer, Header, Table, TableRow, TableCell, WidthType } = require('docx');

const BASE_DIR = 'c://play_vue3';
const QD_DIR = path.join(BASE_DIR, 'qd');
const HD_DIR = path.join(BASE_DIR, 'hd');
const XY_DIR = path.join(BASE_DIR, 'XIAOYUN1');
const TXT_PATH = path.join(BASE_DIR, '数据表单创建.txt');
const ATTACHMENT_PATH = path.join(BASE_DIR, '附件4：第五届粤港澳大湾区大学生艺术节数智创新类相关要求(2).docx');
const OUTPUT_PATH = path.join(BASE_DIR, '作品文档.docx');

function isTextFile(file) {
  const ext = path.extname(file).toLowerCase();
  const allow = ['.vue', '.js', '.json', '.css', '.md', '.sql', '.txt'];
  return allow.includes(ext);
}

function shouldSkipDir(dir) {
  const name = path.basename(dir).toLowerCase();
  return ['node_modules', 'dist', 'public', '.git', '.vscode', 'logs'].includes(name);
}

function walkFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(full)) continue;
      results.push(...walkFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function readSafe(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    return null;
  }
}

async function extractAttachmentText(file) {
  try {
    const { value } = await mammoth.extractRawText({ path: file });
    return value || '';
  } catch (e) {
    return '';
  }
}

function makeHeader(title, author) {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `${title} — 作者：${author}`, font: 'SimSun', size: 24, bold: true }),
        ],
      }),
    ],
  });
}

function makeFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: ['第 ', PageNumber.CURRENT, ' 页'] })],
      }),
    ],
  });
}

function para(text, opts = {}) {
  const lines = (text || '').split('\n');
  const runs = [];
  for (let i = 0; i < lines.length; i++) {
    runs.push(new TextRun({ text: lines[i], font: opts.font || 'SimSun', size: opts.size || 24, bold: !!opts.bold }));
    if (i < lines.length - 1) runs.push(new TextRun({ break: 1 }));
  }
  return new Paragraph({
    spacing: { line: 360 },
    alignment: opts.alignment || AlignmentType.LEFT,
    children: runs,
  });
}

function heading(text, level = 1) {
  return new Paragraph({
    text,
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    spacing: { line: 360 },
    alignment: AlignmentType.LEFT,
    children: [new TextRun({ text, font: 'SimSun', size: 24, bold: true })],
  });
}

function codeBlock(text) {
  const lines = (text || '').split('\n');
  const runs = [];
  for (let i = 0; i < lines.length; i++) {
    runs.push(new TextRun({ text: lines[i], font: 'Consolas', size: 24 }));
    if (i < lines.length - 1) runs.push(new TextRun({ break: 1 }));
  }
  return new Paragraph({
    spacing: { line: 360 },
    children: runs,
  });
}

function filesTable(files) {
  const rows = [
    new TableRow({
      children: [
        new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [para('文件路径', { bold: true })] }),
        new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [para('类型', { bold: true })] }),
      ],
    }),
  ];
  for (const f of files) {
    rows.push(new TableRow({
      children: [
        new TableCell({ children: [para(f)] }),
        new TableCell({ children: [para(path.extname(f) || '[待补充]')] }),
      ],
    }));
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows });
}

async function main() {
  const attachmentText = await extractAttachmentText(ATTACHMENT_PATH);
  const attachmentSummary = attachmentText ? attachmentText.trim().slice(0, 4000) : '';

  const qdFiles = walkFiles(QD_DIR).filter(isTextFile);
  const hdFiles = walkFiles(HD_DIR).filter(isTextFile);
  const xyFiles = walkFiles(XY_DIR).filter(isTextFile);

  const txtContent = readSafe(TXT_PATH) || '[待补充]';

  const sections = [];

  // 标题页
  sections.push(heading('作品标题（按附件规范）', 1));
  sections.push(para('作者：温锦圳', { alignment: AlignmentType.CENTER, bold: true }));
  sections.push(para('学校/团队：[待补充]'));
  sections.push(para('联系方式：[待补充]'));

  // 附件格式摘要
  sections.push(heading('附件格式与要求摘要', 1));
  sections.push(para(attachmentSummary || '未能解析附件，采用通行中文文档规范（A4、宋体12号、1.5倍行距、规范页眉页脚）。'));

  // 摘要与关键词
  sections.push(heading('摘要', 1));
  sections.push(para('项目整合前端（qd）、后端（hd）与应用（XIAOYUN1），支持旅行行程生成、地图导航、多段式路线规划、用户登录注册与AI方案生成。'));
  sections.push(heading('关键词', 2));
  sections.push(para('旅游定制；Vue3；Express；PostgreSQL；AI生成；高德地图；JSONB'));

  // 项目概述
  sections.push(heading('项目概述', 1));
  sections.push(para('qd：旅行计划渲染、脚本安全执行与地图路线规划。'));
  sections.push(para('hd：API服务、数据库初始化、表单提交与用户登录注册、安全与监控。'));
  sections.push(para('XIAOYUN1：登录注册、表单采集、AI方案生成并行调用与方案入库。'));

  // 数据库与示例数据
  sections.push(heading('数据库设计与示例数据', 1));
  sections.push(para('整合 /数据表单创建.txt 内容：'));
  sections.push(codeBlock(txtContent));

  // 创新点
  sections.push(heading('创新点与数智特征', 1));
  sections.push(para('1）JSONB 行程存储与检索；2）多段式路线规划与交互式地图；3）外部聊天接口的 AI 方案生成整合；4）安全与监控（限流、认证、错误分类）。'));

  // 文件清单
  sections.push(heading('文件清单（qd）', 1));
  sections.push(filesTable(qdFiles));
  sections.push(heading('文件清单（hd）', 1));
  sections.push(filesTable(hdFiles));
  sections.push(heading('文件清单（XIAOYUN1）', 1));
  sections.push(filesTable(xyFiles));

  // 关键代码片段（节选）
  function addCodeSection(title, filePath) {
    const content = readSafe(filePath) || '[待补充]';
    sections.push(heading(title, 2));
    sections.push(para(`来源：${filePath}`));
    sections.push(codeBlock(content));
  }

  addCodeSection('TravelPlanView.vue（qd）', path.join(QD_DIR, 'src', 'components', 'TravelPlanView.vue'));
  addCodeSection('RoutePlanner.vue（qd）', path.join(QD_DIR, 'src', 'components', 'RoutePlanner.vue'));
  addCodeSection('MapContainer.vue（qd）', path.join(QD_DIR, 'src', 'components', 'MapContainer.vue'));
  addCodeSection('qd 路由配置', path.join(QD_DIR, 'src', 'router', 'index.js'));
  addCodeSection('hd 核心服务（index.js）', path.join(HD_DIR, 'src', 'index.js'));
  addCodeSection('XIAOYUN1 登录弹窗', path.join(XY_DIR, 'src', 'components', 'LoginModal.vue'));
  addCodeSection('XIAOYUN1 定制表单', path.join(XY_DIR, 'src', 'views', 'FormCollectionPage.vue'));
  addCodeSection('XIAOYUN1 路由', path.join(XY_DIR, 'src', 'router', 'index.js'));

  // 空白素材占位
  sections.push(heading('效果展示与素材', 1));
  sections.push(para('截图/演示视频：[待补充]'));

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: { default: makeHeader('数智创新类作品文档', '温锦圳') },
        footers: { default: makeFooter() },
        children: sections,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT_PATH, buffer);
  console.log(`生成成功：${OUTPUT_PATH}`);
}

main().catch((e) => {
  console.error('生成文档失败：', e);
  process.exit(1);
});