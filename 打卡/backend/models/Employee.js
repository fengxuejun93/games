const db = require('../config/database');

const Employee = {
  create: async (name, department_id, position, phone, email, password, role = 'employee') => {
    const [result] = await db.execute(
      'INSERT INTO employees (name, department_id, position, phone, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, department_id, position, phone, email, password, role]
    );
    return result.insertId;
  },

  findAll: async () => {
    const [rows] = await db.execute(`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id
    `);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.execute(`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = ?
    `, [id]);
    return rows[0];
  },

  findByEmail: async (email) => {
    const [rows] = await db.execute(`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.email = ?
    `, [email]);
    return rows[0];
  },

  update: async (id, name, department_id, position, phone, email) => {
    const [result] = await db.execute(
      'UPDATE employees SET name = ?, department_id = ?, position = ?, phone = ?, email = ? WHERE id = ?',
      [name, department_id, position, phone, email, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result.affectedRows;
  },

  findByDepartment: async (departmentId) => {
    const [rows] = await db.execute(`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.department_id = ?
    `, [departmentId]);
    return rows;
  }
};

module.exports = Employee;