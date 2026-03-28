# 云途绘迹

基于LLM模型生成旅游轨迹与网页的智能化旅游规划平台

## 项目简介

云途绘迹是一个基于大语言模型（LLM）的智能旅游轨迹生成系统，能够根据用户需求自动生成个性化的旅游行程规划，并通过现代化的Web界面进行展示。系统结合了前端Vue.js应用、后端Node.js服务和PostgreSQL数据库，为用户提供完整的旅游规划解决方案。

## 功能特性

- **AI智能对话**：基于LLM模型进行智能旅游咨询和行程生成
- **个性化表单定制**：通过表单收集用户旅游偏好，生成定制化行程
- **旅游轨迹展示**：支持高德地图展示旅游路线和景点位置
- **响应式设计**：适配各种设备尺寸，提供优质用户体验
- **数据持久化**：使用PostgreSQL存储旅游计划、用户数据和HTML内容
- **用户认证**：支持用户注册、登录和个人信息管理
- **RESTful API**：完整的旅游数据CRUD操作接口
- **API文档**：集成Swagger UI提供API在线文档

## 项目结构

```
play_vue3/github/
├── qd/                          # Vue.js前端应用
│   ├── src/
│   │   ├── App.vue             # 主应用组件
│   │   ├── main.js             # 应用入口
│   │   ├── router/             # 路由配置
│   │   ├── views/              # 页面组件
│   │   ├── stores/              # 状态管理
│   │   ├── config.js            # 前端配置
│   │   └── assets/             # 静态资源
│   ├── public/                 # 公共资源
│   ├── package.json
│   └── vite.config.js          # Vite配置
│
├── hd/                          # Node.js后端服务
│   ├── src/
│   │   ├── index.js            # 服务器入口
│   │   ├── config/              # 配置文件
│   │   ├── controllers/         # 控制器
│   │   ├── routes/              # 路由定义
│   │   ├── middleware/          # 中间件
│   │   ├── utils/               # 工具函数
│   │   └── logs/                # 日志文件
│   ├── .env                     # 环境变量配置
│   ├── package.json
│   └── test/                    # 测试文件
│
├── 数据表单创建.txt              # 数据库表结构定义
└── README.md                    # 项目说明文档
```

## 技术栈

### 前端

- **Vue.js 3** - 渐进式JavaScript框架
- **Vue Router 4** - 官方路由管理器
- **Vite 7** - 下一代前端构建工具
- **Pinia** - 状态管理
- **高德地图JSAPI** - 地图和位置服务
- **Iconify Vue** - 图标组件库
- **Animate.css** - CSS动画库
- **Marked** - Markdown解析

### 后端

- **Node.js** - JavaScript运行环境
- **Express.js** - Web应用框架
- **PostgreSQL** - 关系型数据库
- **bcrypt** - 密码加密
- **helmet** - 安全中间件
- **cors** - 跨域资源共享
- **morgan** - HTTP日志
- **express-rate-limit** - 请求限流
- **swagger-ui-express** - API文档
- **Jest** - JavaScript测试框架

## 快速开始

### 环境要求

- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm 或 pnpm

### 安装依赖

```bash
# 安装前端依赖
cd qd
pnpm install

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
PORT=3005
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=postgres
PG_USER=postgres
PG_PASSWORD=your_password
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60
```

### 启动开发服务器

```bash
# 启动后端服务
cd hd
npm start

# 启动前端开发服务器
cd qd
pnpm run dev
```

## 页面路由

| 路径 | 页面名称 | 描述 |
|------|----------|------|
| `/` | 首页 | 重定向至关于页面 |
| `/about` | 首页 | 项目介绍页面 |
| `/ai-chat` | AI对话 | 智能旅游咨询和行程生成 |
| `/form` | 定制表单 | 用户旅游偏好表单提交 |
| `/profile` | 个人中心 | 用户信息管理 |
| `/route-planner` | 路线展示 | 旅游路线规划展示 |
| `/travel-plan-view` | 计划详情 | 旅游计划详情查看 |

## 数据模型

### travel_plans（旅游计划表）

| 字段 | 类型 | 描述 |
|------|------|------|
| id | SERIAL | 自增主键 |
| plan_data | JSONB | 行程完整数据 |
| query_keyword | VARCHAR(255) | 查询关键词 |
| userid | INT | 用户ID |
| created_at | TIMESTAMP | 创建时间 |

### users（用户表）

| 字段 | 类型 | 描述 |
|------|------|------|
| id | SERIAL | 自增主键 |
| phone | VARCHAR(15) | 手机号（唯一） |
| password | VARCHAR(60) | 密码（加密存储） |
| name | VARCHAR(50) | 用户名 |
| avatar_path | VARCHAR(255) | 头像路径 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### html（HTML内容表）

| 字段 | 类型 | 描述 |
|------|------|------|
| id | SERIAL | 自增主键 |
| codeid | VARCHAR(255) | 代码标识符 |
| userid | INT | 用户ID |
| html | TEXT | HTML内容 |
| code | VARCHAR(500) | 代码描述 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### user_info（用户搜索信息表）

| 字段 | 类型 | 描述 |
|------|------|------|
| id | SERIAL | 自增主键 |
| userid | INT | 用户ID |
| query_keyword | VARCHAR(255) | 搜索关键词 |
| depart_time | VARCHAR(60) | 出发时间 |
| destination | VARCHAR(40) | 目的地 |
| the_count | VARCHAR(40) | 出行人数 |
| budget | VARCHAR(40) | 预算 |
| theme | VARCHAR(60) | 旅游主题 |

## API接口

### 用户认证

- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录

### 旅游计划

- `GET /api/travel-plans` - 获取所有旅游计划
- `GET /api/travel-plans/:id` - 获取旅游计划详情
- `POST /api/travel-plans` - 创建旅游计划
- `PUT /api/travel-plans/:id` - 更新旅游计划
- `DELETE /api/travel-plans/:id` - 删除旅游计划

### 表单数据

- `GET /api/ing-forms/query` - 查询表单数据
- `POST /api/ing-forms/create` - 创建表单记录
- `POST /api/ing-forms/update-json` - 更新JSON数据
- `POST /api/ing-forms/update-html` - 更新HTML内容

### 用户信息

- `GET /api/user-info` - 获取用户信息
- `POST /api/user-info` - 创建用户信息
- `PUT /api/user-info/:id` - 更新用户信息
- `DELETE /api/user-info/:id` - 删除用户信息

### 其他

- `GET /api/docs` - Swagger API文档
- `GET /health` - 健康检查

## 前端配置

前端通过 `qd/src/config.js` 配置文件管理API端点：

```javascript
export const API_ENDPOINTS = {
  LOGIN: '/api/users/login',
  REGISTER: '/api/users/register',
  CREATE_FORM: '/api/ing-forms/create',
  QUERY_FORM: '/api/ing-forms/query',
  USER_DATA: '/api/data/user'
}
```

Vite开发服务器代理配置（`vite.config.js`）将 `/api` 请求转发至后端服务器 `http://8.138.163.187:3005`。

## 测试

```bash
# 运行后端测试
cd hd
npm test
```

## 许可证

本项目采用 MIT 许可证。

---

**智能旅游，让每一次出行都充满惊喜！**