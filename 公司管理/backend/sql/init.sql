CREATE DATABASE IF NOT EXISTS example_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE example_db;

CREATE TABLE IF NOT EXISTS company (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '公司ID',
    name VARCHAR(100) NOT NULL COMMENT '公司名称',
    address VARCHAR(255) COMMENT '公司地址',
    phone VARCHAR(20) COMMENT '联系电话',
    status TINYINT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公司表';

CREATE TABLE IF NOT EXISTS department (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '部门ID',
    company_id BIGINT NOT NULL COMMENT '所属公司ID',
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    parent_id BIGINT DEFAULT 0 COMMENT '上级部门ID',
    status TINYINT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_company (company_id),
    FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

CREATE TABLE IF NOT EXISTS position (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '岗位ID',
    company_id BIGINT NOT NULL COMMENT '所属公司ID',
    name VARCHAR(100) NOT NULL COMMENT '岗位名称',
    description VARCHAR(500) COMMENT '岗位描述',
    status TINYINT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_company (company_id),
    FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='岗位表';

CREATE TABLE IF NOT EXISTS role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
    company_id BIGINT COMMENT '所属公司ID（NULL表示系统角色）',
    name VARCHAR(50) NOT NULL COMMENT '角色名称',
    code VARCHAR(50) NOT NULL COMMENT '角色编码',
    description VARCHAR(500) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_code (code),
    INDEX idx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE IF NOT EXISTS permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '权限ID',
    name VARCHAR(100) NOT NULL COMMENT '权限名称',
    code VARCHAR(100) NOT NULL COMMENT '权限编码',
    parent_id BIGINT DEFAULT 0 COMMENT '上级权限ID',
    type TINYINT DEFAULT 1 COMMENT '类型 1-菜单 2-按钮',
    path VARCHAR(255) COMMENT '菜单路径',
    icon VARCHAR(100) COMMENT '菜单图标',
    sort INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

CREATE TABLE IF NOT EXISTS role_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE CASCADE,
    UNIQUE KEY uk_role_permission (role_id, permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

CREATE TABLE IF NOT EXISTS employee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '员工ID',
    company_id BIGINT NOT NULL COMMENT '所属公司ID',
    department_id BIGINT COMMENT '所属部门ID',
    position_id BIGINT COMMENT '岗位ID',
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '联系电话',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    status TINYINT DEFAULT 1 COMMENT '状态 1-在职 0-离职',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_username (username),
    INDEX idx_company (company_id),
    INDEX idx_department (department_id),
    INDEX idx_position (position_id),
    FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL,
    FOREIGN KEY (position_id) REFERENCES position(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

CREATE TABLE IF NOT EXISTS employee_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID',
    employee_id BIGINT NOT NULL COMMENT '员工ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
    UNIQUE KEY uk_employee_role (employee_id, role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工角色关联表';

CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '考勤ID',
    employee_id BIGINT NOT NULL COMMENT '员工ID',
    company_id BIGINT NOT NULL COMMENT '公司ID',
    attendance_date DATE NOT NULL COMMENT '考勤日期',
    check_in_time TIME COMMENT '上班时间',
    check_out_time TIME COMMENT '下班时间',
    status TINYINT DEFAULT 1 COMMENT '状态 1-正常 2-迟到 3-早退 4-旷工 5-请假',
    remark VARCHAR(500) COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_employee (employee_id),
    INDEX idx_company (company_id),
    INDEX idx_date (attendance_date),
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考勤表';

CREATE TABLE IF NOT EXISTS salary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '薪资ID',
    employee_id BIGINT NOT NULL COMMENT '员工ID',
    company_id BIGINT NOT NULL COMMENT '公司ID',
    salary_month VARCHAR(7) NOT NULL COMMENT '薪资月份（YYYY-MM）',
    basic_salary DECIMAL(10,2) DEFAULT 0 COMMENT '基本工资',
    bonus DECIMAL(10,2) DEFAULT 0 COMMENT '奖金',
    allowance DECIMAL(10,2) DEFAULT 0 COMMENT '津贴',
    deduction DECIMAL(10,2) DEFAULT 0 COMMENT '扣款',
    total_salary DECIMAL(10,2) DEFAULT 0 COMMENT '实发工资',
    status TINYINT DEFAULT 1 COMMENT '状态 1-未发放 2-已发放',
    remark VARCHAR(500) COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_employee (employee_id),
    INDEX idx_company (company_id),
    INDEX idx_month (salary_month),
    FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES company(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='薪资表';

CREATE TABLE IF NOT EXISTS sys_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    employee_id BIGINT COMMENT '操作用户ID',
    employee_name VARCHAR(50) COMMENT '操作用户名',
    company_id BIGINT COMMENT '公司ID',
    module VARCHAR(100) COMMENT '操作模块',
    operation VARCHAR(200) COMMENT '操作内容',
    ip VARCHAR(50) COMMENT '操作IP',
    user_agent VARCHAR(500) COMMENT '用户代理',
    status TINYINT DEFAULT 1 COMMENT '操作状态 1-成功 0-失败',
    error_msg VARCHAR(1000) COMMENT '错误信息',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_employee (employee_id),
    INDEX idx_company (company_id),
    INDEX idx_module (module),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统日志表';

INSERT INTO role (id, company_id, name, code, description) VALUES 
(1, NULL, '超级管理员', 'super_admin', '系统超级管理员，拥有所有权限'),
(2, NULL, '公司管理员', 'company_admin', '公司管理员，管理本公司数据'),
(3, NULL, '普通员工', 'employee', '普通员工，基础数据查看权限');

INSERT INTO permission (id, name, code, parent_id, type, path, icon, sort) VALUES
(1, '系统管理', 'system', 0, 1, '/system', 'setting', 1),
(2, '公司管理', 'company', 0, 1, '/company', 'building', 2),
(3, '部门管理', 'department', 0, 1, '/department', 'users', 3),
(4, '员工管理', 'employee', 0, 1, '/employee', 'user', 4),
(5, '角色管理', 'role', 1, 1, '/system/role', 'team', 1),
(6, '权限管理', 'permission', 1, 1, '/system/permission', 'lock', 2),
(7, '日志管理', 'log', 1, 1, '/system/log', 'file-text', 3),
(8, '考勤管理', 'attendance', 0, 1, '/attendance', 'clock', 5),
(9, '薪资管理', 'salary', 0, 1, '/salary', 'wallet', 6),
(10, '公司列表', 'company_list', 2, 2, '', '', 1),
(11, '公司新增', 'company_add', 2, 2, '', '', 2),
(12, '公司编辑', 'company_edit', 2, 2, '', '', 3),
(13, '公司删除', 'company_delete', 2, 2, '', '', 4),
(14, '部门列表', 'department_list', 3, 2, '', '', 1),
(15, '部门新增', 'department_add', 3, 2, '', '', 2),
(16, '部门编辑', 'department_edit', 3, 2, '', '', 3),
(17, '部门删除', 'department_delete', 3, 2, '', '', 4),
(18, '员工列表', 'employee_list', 4, 2, '', '', 1),
(19, '员工新增', 'employee_add', 4, 2, '', '', 2),
(20, '员工编辑', 'employee_edit', 4, 2, '', '', 3),
(21, '员工删除', 'employee_delete', 4, 2, '', '', 4),
(22, '员工头像', 'employee_avatar', 4, 2, '', '', 5),
(23, '角色列表', 'role_list', 5, 2, '', '', 1),
(24, '角色新增', 'role_add', 5, 2, '', '', 2),
(25, '角色编辑', 'role_edit', 5, 2, '', '', 3),
(26, '角色删除', 'role_delete', 5, 2, '', '', 4),
(27, '权限列表', 'permission_list', 6, 2, '', '', 1),
(28, '权限新增', 'permission_add', 6, 2, '', '', 2),
(29, '权限编辑', 'permission_edit', 6, 2, '', '', 3),
(30, '权限删除', 'permission_delete', 6, 2, '', '', 4),
(31, '日志列表', 'log_list', 7, 2, '', '', 1),
(32, '日志导出', 'log_export', 7, 2, '', '', 2),
(33, '考勤列表', 'attendance_list', 8, 2, '', '', 1),
(34, '考勤新增', 'attendance_add', 8, 2, '', '', 2),
(35, '考勤编辑', 'attendance_edit', 8, 2, '', '', 3),
(36, '考勤删除', 'attendance_delete', 8, 2, '', '', 4),
(37, '考勤导出', 'attendance_export', 8, 2, '', '', 5),
(38, '薪资列表', 'salary_list', 9, 2, '', '', 1),
(39, '薪资新增', 'salary_add', 9, 2, '', '', 2),
(40, '薪资编辑', 'salary_edit', 9, 2, '', '', 3),
(41, '薪资删除', 'salary_delete', 9, 2, '', '', 4),
(42, '薪资发放', 'salary_pay', 9, 2, '', '', 5),
(43, '薪资导出', 'salary_export', 9, 2, '', '', 6);

INSERT INTO role_permission (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9),
(1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17),
(1, 18), (1, 19), (1, 20), (1, 21), (1, 22), (1, 23), (1, 24), (1, 25),
(1, 26), (1, 27), (1, 28), (1, 29), (1, 30), (1, 31), (1, 32), (1, 33),
(1, 34), (1, 35), (1, 36), (1, 37), (1, 38), (1, 39), (1, 40), (1, 41),
(1, 42), (1, 43);

INSERT INTO role_permission (role_id, permission_id) VALUES
(2, 3), (2, 4), (2, 5), (2, 8), (2, 9),
(2, 14), (2, 15), (2, 16), (2, 17),
(2, 18), (2, 19), (2, 20), (2, 21), (2, 22),
(2, 23), (2, 24), (2, 25), (2, 26),
(2, 33), (2, 34), (2, 35), (2, 36), (2, 37),
(2, 38), (2, 39), (2, 40), (2, 41), (2, 42), (2, 43);

INSERT INTO role_permission (role_id, permission_id) VALUES
(3, 14), (3, 18), (3, 33);

INSERT INTO company (id, name, address, phone) VALUES
(1, '示例公司', '北京市朝阳区科技园区', '010-12345678');

INSERT INTO department (id, company_id, name) VALUES
(1, 1, '技术部'),
(2, 1, '人事部'),
(3, 1, '财务部');

INSERT INTO position (id, company_id, name) VALUES
(1, 1, '高级工程师'),
(2, 1, '项目经理'),
(3, 1, '人事专员'),
(4, 1, '财务主管');

INSERT INTO employee (id, company_id, department_id, position_id, username, password, real_name, phone, email, status) VALUES
(1, 1, 1, 2, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', '超级管理员', '13800138000', 'admin@example.com', 1);

INSERT INTO employee_role (employee_id, role_id) VALUES
(1, 1);