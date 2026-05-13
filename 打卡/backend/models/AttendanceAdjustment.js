const db = require('../config/database');

const AttendanceAdjustment = {
  create: async (employee_id, apply_date, check_in_time, check_out_time, reason, status = 'pending') => {
    const [result] = await db.execute(
      'INSERT INTO attendance_adjustments (employee_id, apply_date, check_in_time, check_out_time, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
      [employee_id, apply_date, check_in_time, check_out_time, reason, status]
    );
    return result.insertId;
  },

  findByEmployee: async (employee_id) => {
    const [rows] = await db.execute(`
      SELECT aa.*, e.name as employee_name 
      FROM attendance_adjustments aa 
      LEFT JOIN employees e ON aa.employee_id = e.id 
      WHERE aa.employee_id = ? 
      ORDER BY aa.apply_date DESC
    `, [employee_id]);
    return rows;
  },

  findAll: async () => {
    const [rows] = await db.execute(`
      SELECT aa.*, e.name as employee_name, e.department_id, d.name as department_name 
      FROM attendance_adjustments aa 
      LEFT JOIN employees e ON aa.employee_id = e.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      ORDER BY aa.apply_date DESC
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.execute(`
      SELECT aa.*, e.name as employee_name 
      FROM attendance_adjustments aa 
      LEFT JOIN employees e ON aa.employee_id = e.id 
      WHERE aa.id = ?
    `, [id]);
    return rows[0];
  },

  updateStatus: async (id, status, remark = null) => {
    const [result] = await db.execute(
      'UPDATE attendance_adjustments SET status = ?, remark = ? WHERE id = ?',
      [status, remark, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM attendance_adjustments WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = AttendanceAdjustment;