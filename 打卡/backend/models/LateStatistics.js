const db = require('../config/database');

const LateStatistics = {
  createOrUpdate: async (employee_id, year, month, late_count) => {
    const [existing] = await db.execute(
      'SELECT * FROM late_statistics WHERE employee_id = ? AND year = ? AND month = ?',
      [employee_id, year, month]
    );

    if (existing.length > 0) {
      await db.execute(
        'UPDATE late_statistics SET late_count = ? WHERE employee_id = ? AND year = ? AND month = ?',
        [late_count, employee_id, year, month]
      );
    } else {
      await db.execute(
        'INSERT INTO late_statistics (employee_id, year, month, late_count) VALUES (?, ?, ?, ?)',
        [employee_id, year, month, late_count]
      );
    }
  },

  getByEmployeeAndMonth: async (employee_id, year, month) => {
    const [rows] = await db.execute(
      'SELECT * FROM late_statistics WHERE employee_id = ? AND year = ? AND month = ?',
      [employee_id, year, month]
    );
    return rows[0] || { late_count: 0 };
  },

  getMonthlyLateStats: async (year, month) => {
    const [rows] = await db.execute(`
      SELECT ls.*, e.name as employee_name, e.department_id, d.name as department_name
      FROM late_statistics ls
      LEFT JOIN employees e ON ls.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE ls.year = ? AND ls.month = ?
      ORDER BY ls.late_count DESC
    `, [year, month]);
    return rows;
  },

  getExceededEmployees: async (year, month, threshold = 3) => {
    const [rows] = await db.execute(`
      SELECT ls.*, e.name as employee_name, e.department_id, d.name as department_name
      FROM late_statistics ls
      LEFT JOIN employees e ON ls.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE ls.year = ? AND ls.month = ? AND ls.late_count > ?
      ORDER BY ls.late_count DESC
    `, [year, month, threshold]);
    return rows;
  },

  getDepartmentLateStats: async (department_id, year, month) => {
    const [rows] = await db.execute(`
      SELECT 
        COUNT(*) as total_employees,
        SUM(CASE WHEN ls.late_count > 0 THEN 1 ELSE 0 END) as late_employees,
        SUM(ls.late_count) as total_late_count,
        AVG(ls.late_count) as avg_late_count
      FROM late_statistics ls
      LEFT JOIN employees e ON ls.employee_id = e.id
      WHERE e.department_id = ? AND ls.year = ? AND ls.month = ?
    `, [department_id, year, month]);
    return rows[0];
  }
};

module.exports = LateStatistics;