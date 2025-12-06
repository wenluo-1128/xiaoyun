# 智能旅游轨迹生成系统

基于LLM模型生成旅游轨迹与网页的智能化旅游规划平台

## 项目简介

本项目是一个基于大语言模型（LLM）的智能旅游轨迹生成系统，能够根据用户需求自动生成个性化的旅游行程规划，并通过现代化的Web界面进行展示。系统结合了前端Vue.js应用、后端Node.js服务和PostgreSQL数据库，为用户提供完整的旅游规划解决方案。

## 功能特性

- **🤖 智能行程生成**：基于LLM模型自动生成个性化旅游轨迹
- **🗺️ 地图集成**：支持高德地图展示旅游路线和景点位置
- **📱 响应式设计**：适配各种设备尺寸，提供优质用户体验
- **💾 数据持久化**：使用PostgreSQL存储旅游计划和用户数据
- **🔐 用户认证**：支持用户注册、登录和个人信息管理
- **📊 数据管理**：完整的旅游数据CRUD操作接口

## 项目结构

```
play_vue3/
├── qd/                    # Vue.js前端应用
│   ├── src/
│   │   ├── App.vue       # 主应用组件
│   │   ├── main.js       # 应用入口
│   │   ├── router/       # 路由配置
│   │   ├── components/   # Vue组件
│   │   ├── api/          # API接口
│   │   └── assets/       # 静态资源
│   ├── package.json
│   └── vite.config.js
│
├── hd/                    # Node.js后端服务
│   ├── src/
│   │   └── index.js      # 服务器入口
│   ├── test/             # 测试文件
│   ├── package.json
│   └── .env              # 环境变量配置
│
├── XIAOYUN1/              # 相关项目文件
│   └── XIAOYUN1/
│       ├── src/          # 源代码
│       ├── public/       # 公共资源
│       └── package.json
│
├── ai/                    # AI相关配置和脚本
├── 数据表单创建.txt       # 数据库表结构定义
└── README.md             # 项目说明文档
```

## 技术栈

### 前端
- **Vue.js 3** - 渐进式JavaScript框架
- **Vue Router 4** - 官方路由管理器
- **Vite** - 下一代前端构建工具
- **高德地图API** - 地图和位置服务

### 后端
- **Node.js** - JavaScript运行环境
- **Express.js** - Web应用框架
- **PostgreSQL** - 关系型数据库
- **Jest** - JavaScript测试框架

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **bcrypt** - 密码加密
- **helmet** - 安全中间件

## 快速开始

### 环境要求

- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm 或 yarn

### 安装依赖

```bash
# 安装前端依赖
cd qd
npm install

# 安装后端依赖
cd ../hd
npm install
```

### 数据库配置

1. 创建PostgreSQL数据库
2. 执行 `数据表单创建.txt` 中的SQL语句创建数据表
3. 配置环境变量

```bash
# hd/.env
DATABASE_URL=postgresql://username:password@localhost:5432/travel_db
PORT=3000
JWT_SECRET=your_jwt_secret
```

### 启动开发服务器

```bash
# 启动后端服务
cd hd
npm start

# 启动前端开发服务器
cd qd
npm run dev
```

## 核心功能

### 1. 旅游轨迹生成

系统能够根据以下信息生成旅游轨迹：
- 目的地
- 旅游天数
- 旅游偏好
- 预算范围
- 特殊需求

### 2. 数据模型

#### 旅游计划表 (travel_plans)
```sql
CREATE TABLE travel_plans (
    id SERIAL PRIMARY KEY,
    plan_data JSONB NOT NULL,     -- 行程完整数据
    query_keyword VARCHAR(255) NOT NULL, -- 查询关键词
    userid INT,                   -- 用户ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 用户表 (users)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(60) NOT NULL,
    name VARCHAR(50) NOT NULL,
    avatar_path VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 开发指南

### API接口

- `POST /api/travel-plans` - 创建旅游计划
- `GET /api/travel-plans/:id` - 获取旅游计划详情
- `PUT /api/travel-plans/:id` - 更新旅游计划
- `DELETE /api/travel-plans/:id` - 删除旅游计划
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 测试

```bash
# 运行后端测试
cd hd
npm test

# 运行特定测试
npm test -- ing_forms_create.test.js
```

## 部署

### 前端构建

```bash
cd qd
npm run build
```

### 生产环境配置

1. 配置生产环境数据库连接
2. 设置适当的环境变量
3. 启用HTTPS
4. 配置反向代理

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至项目维护者
- 查看项目 Wiki 获取更多文档

---

**智能旅游，让每一次出行都充满惊喜！** 🎒✈️🗺️
