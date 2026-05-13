const db = require('../config/database');

const LeaveApplication = {
  create: async (employee_id, start_date, end_date, type, reason, status = 'pending') => {
    const [result] = await db.execute(
      'INSERT INTO leave_applications (employee_id, start_date, end_date, type, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
      [employee_id, start_date, end_date, type, reason, status]
    );
    return result.insertId;
  },

  findByEmployee: async (employee_id) => {
    const [rows] = await db.execute(`
      SELECT la.*, e.name as employee_name 
      FROM leave_applications la 
      LEFT JOIN employees e ON la.employee_id = e.id 
      WHERE la.employee_id = ? 
      ORDER BY la.start_date DESC
    `, [employee_id]);
    return rows;
  },

  findAll: async () => {
    const [rows] = await db.execute(`
      SELECT la.*, e.name as employee_name, e.department_id, d.name as department_name 
      FROM leave_applications la 
      LEFT JOIN employees e ON la.employee_id = e.id 
      LEFT JOIN departments d ON e.department_id = d.id 
      ORDER BY la.start_date DESC
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.execute(`
      SELECT la.*, e.name as employee_name 
      FROM leave_applications la 
      LEFT JOIN employees e ON la.employee_id = e.id 
      WHERE la.id = ?
    `, [id]);
    return rows[0];
  },

  updateStatus: async (id, status, remark = null) => {
    const [result] = await db.execute(
      'UPDATE leave_applications SET status = ?, remark = ? WHERE id = ?',
      [status, remark, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM leave_applications WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = LeaveApplication;