const db = require('../config/database');

const Attendance = {
  create: async (employee_id, check_in_time, check_out_time = null, status = 'normal') => {
    const [result] = await db.execute(
      'INSERT INTO attendance (employee_id, check_in_time, check_out_time, status) VALUES (?, ?, ?, ?)',
      [employee_id, check_in_time, check_out_time, status]
    );
    return result.insertId;
  },

  findByEmployeeAndDate: async (employee_id, date) => {
    const [rows] = await db.execute(
      'SELECT * FROM attendance WHERE employee_id = ? AND DATE(check_in_time) = ?',
      [employee_id, date]
    );
    return rows[0];
  },

  updateCheckOut: async (id, check_out_time, status) => {
    const [result] = await db.execute(
      'UPDATE attendance SET check_out_time = ?, status = ? WHERE id = ?',
      [check_out_time, status, id]
    );
    return result.affectedRows;
  },

  updateStatus: async (id, status) => {
    const [result] = await db.execute(
      'UPDATE attendance SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  },

  findByEmployee: async (employee_id, start_date, end_date) => {
    const [rows] = await db.execute(`
      SELECT a.*, e.name as employee_name 
      FROM attendance a 
      LEFT JOIN employees e ON a.employee_id = e.id 
      WHERE a.employee_id = ? AND DATE(a.check_in_time) BETWEEN ? AND ?
      ORDER BY a.check_in_time DESC
    `, [employee_id, start_date, end_date]);
    return rows;
  },

  findByDepartment: async (department_id, start_date, end_date) => {
    const [rows] = await db.execute(`
      SELECT a.*, e.name as employee_name, e.department_id 
      FROM attendance a 
      LEFT JOIN employees e ON a.employee_id = e.id 
      WHERE e.department_id = ? AND DATE(a.check_in_time) BETWEEN ? AND ?
      ORDER BY a.check_in_time DESC
    `, [department_id, start_date, end_date]);
    return rows;
  },

  findAll: async (start_date, end_date) => {
    const [rows] = await db.execute(`
      SELECT a.*, e.name as employee_name, e.department_id, d.name as department_name 
      FROM attendance a 
      LEFT JOIN employees e ON a.employee_id = e.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE DATE(a.check_in_time) BETWEEN ? AND ?
      ORDER BY a.check_in_time DESC
    `, [start_date, end_date]);
    return rows;
  },

  getStatisticsByEmployee: async (employee_id, start_date, end_date) => {
    const [rows] = await db.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'normal' THEN 1 ELSE 0 END) as normal_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'early_leave' THEN 1 ELSE 0 END) as early_leave_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leave_days
      FROM attendance 
      WHERE employee_id = ? AND DATE(check_in_time) BETWEEN ? AND ?
    `, [employee_id, start_date, end_date]);
    return rows[0];
  },

  getStatisticsByDepartment: async (department_id, start_date, end_date) => {
    const [rows] = await db.execute(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'normal' THEN 1 ELSE 0 END) as normal_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
        SUM(CASE WHEN status = 'early_leave' THEN 1 ELSE 0 END) as early_leave_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leave_days
      FROM attendance a 
      LEFT JOIN employees e ON a.employee_id = e.id 
      WHERE e.department_id = ? AND DATE(a.check_in_time) BETWEEN ? AND ?
    `, [department_id, start_date, end_date]);
    return rows[0];
  }
};

module.exports = Attendance;