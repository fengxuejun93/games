CREATE DATABASE IF NOT EXISTS attendance_db;

USE attendance_db;

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department_id INT,
  position VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('employee', 'admin') DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  check_in_time DATETIME,
  check_out_time DATETIME,
  status ENUM('normal', 'late', 'early_leave', 'absent', 'leave') DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS attendance_adjustments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  apply_date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS leave_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type ENUM('sick', 'personal', 'annual', 'maternity', 'paternity') DEFAULT 'personal',
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS late_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  late_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  UNIQUE KEY unique_employee_month (employee_id, year, month)
);

INSERT INTO departments (name, description) VALUES 
('技术部', '负责公司技术研发'),
('人事部', '负责公司人力资源管理'),
('财务部', '负责公司财务管理'),
('市场部', '负责公司市场推广');

INSERT INTO employees (name, department_id, position, phone, email, password, role) VALUES 
('管理员', 2, '人事主管', '13800138000', 'admin@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', 'admin'),
('张三', 1, '高级工程师', '13800138001', 'zhangsan@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', 'employee'),
('李四', 1, '工程师', '13800138002', 'lisi@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', 'employee'),
('王五', 3, '财务主管', '13800138003', 'wangwu@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', 'employee'),
('赵六', 4, '市场经理', '13800138004', 'zhaoliu@company.com', '$2b$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq', 'employee');