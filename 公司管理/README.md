# 多公司企业管理系统

## 项目简介

本系统是一个前后端分离的多公司企业管理系统，支持创建多个独立公司，各公司数据隔离，超级管理员可管理所有公司，各公司管理员只管理自己公司内部数据。

## 技术栈

### 后端
- Java 21
- Spring Boot 3.2.0
- MyBatis Plus 3.5.5
- MySQL 8.0+
- JWT 0.12.3

### 前端
- Vue 3
- Element Plus
- Vue Router 4
- Pinia
- Axios
- Vite

## 项目结构

```
公司管理/
├── backend/                    # 后端项目
│   ├── src/main/java/
│   │   └── com/example/companymanagement/
│   │       ├── controller/     # 控制层
│   │       ├── service/        # 服务层
│   │       ├── mapper/         # 数据访问层
│   │       ├── entity/         # 实体类
│   │       ├── dto/            # 数据传输对象
│   │       ├── config/         # 配置类
│   │       ├── util/           # 工具类
│   │       └── Application.java
│   ├── src/main/resources/
│   │   ├── mapper/             # MyBatis映射文件
│   │   └── application.yml     # 应用配置
│   ├── sql/                    # SQL脚本
│   └── pom.xml
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   ├── components/         # 公共组件
│   │   ├── router/             # 路由配置
│   │   ├── store/              # 状态管理
│   │   ├── api/                # API封装
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 功能模块

1. **登录注册** - 用户登录认证
2. **公司管理** - 新增、编辑、禁用、删除公司
3. **部门管理** - 每个公司可自定义创建多个部门
4. **岗位管理** - 岗位的增删改查
5. **员工管理** - 员工信息管理、分配部门和岗位、分配角色
6. **角色管理** - 角色增删改查、权限分配
7. **权限管理** - 菜单和按钮权限管理

## 角色权限

| 角色 | 权限 |
|------|------|
| 超级管理员 | 所有权限，可管理所有公司 |
| 公司管理员 | 管理本公司的部门、员工、角色 |
| 普通员工 | 基础数据查看权限 |

## 数据库配置

### 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS example_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE example_db;
```

### 导入SQL脚本

执行 `backend/sql/init.sql` 文件，包含所有表结构和初始数据。

### 修改配置文件

编辑 `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/example_db?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
```

## 启动方式

### 后端启动

1. 进入后端目录：
```bash
cd backend
```

2. 使用Maven运行：
```bash
mvn spring-boot:run
```

或者打包后运行：
```bash
mvn clean package
java -jar target/company-management-1.0.0.jar
```

后端服务默认端口：`http://localhost:8080`

### 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

前端服务默认端口：`http://localhost:3000`

## 访问系统

打开浏览器访问：`http://localhost:3000`

### 初始账号

系统预置了角色和权限，但需要先创建公司和员工。

#### 超级管理员账号

首次使用需要通过数据库插入超级管理员：

```sql
INSERT INTO employee (username, password, real_name, company_id, status) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '超级管理员', 1, 1);

INSERT INTO employee_role (employee_id, role_id) VALUES (1, 1);
```

密码为：`admin123`

## API接口说明

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/info | 获取用户信息 |
| POST | /api/auth/logout | 用户退出 |

### 公司管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/companies | 公司列表（分页） |
| GET | /api/companies/all | 获取所有公司 |
| GET | /api/companies/{id} | 获取公司详情 |
| POST | /api/companies | 新增公司 |
| PUT | /api/companies/{id} | 更新公司 |
| DELETE | /api/companies/{id} | 删除公司 |

### 部门管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/departments | 部门列表 |
| GET | /api/departments/company/{companyId} | 获取公司所有部门 |
| GET | /api/departments/{id} | 获取部门详情 |
| POST | /api/departments | 新增部门 |
| PUT | /api/departments/{id} | 更新部门 |
| DELETE | /api/departments/{id} | 删除部门 |

### 岗位管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/positions | 岗位列表 |
| GET | /api/positions/company/{companyId} | 获取公司所有岗位 |
| GET | /api/positions/{id} | 获取岗位详情 |
| POST | /api/positions | 新增岗位 |
| PUT | /api/positions/{id} | 更新岗位 |
| DELETE | /api/positions/{id} | 删除岗位 |

### 员工管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/employees | 员工列表 |
| GET | /api/employees/{id} | 获取员工详情 |
| GET | /api/employees/{id}/roles | 获取员工角色 |
| POST | /api/employees | 新增员工 |
| PUT | /api/employees/{id} | 更新员工 |
| DELETE | /api/employees/{id} | 删除员工 |
| POST | /api/employees/{id}/roles | 分配角色 |

### 角色管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/roles | 角色列表 |
| GET | /api/roles/company/{companyId} | 获取公司所有角色 |
| GET | /api/roles/{id} | 获取角色详情 |
| GET | /api/roles/{id}/permissions | 获取角色权限 |
| POST | /api/roles | 新增角色 |
| PUT | /api/roles/{id} | 更新角色 |
| DELETE | /api/roles/{id} | 删除角色 |

### 权限管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/permissions | 权限列表 |
| GET | /api/permissions/all | 获取所有权限 |
| GET | /api/permissions/{id} | 获取权限详情 |
| POST | /api/permissions | 新增权限 |
| PUT | /api/permissions/{id} | 更新权限 |
| DELETE | /api/permissions/{id} | 删除权限 |

## 注意事项

1. 确保MySQL服务已启动，且数据库配置正确
2. 后端启动前需要先导入SQL脚本
3. 前端代理已配置指向后端服务，确保后端服务正常运行
4. JWT密钥在生产环境应使用更安全的配置方式