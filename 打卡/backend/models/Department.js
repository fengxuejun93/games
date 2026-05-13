const db = require('../config/database');

const Department = {
  create: async (name, description) => {
    const [result] = await db.execute(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  },

  findAll: async () => {
    const [rows] = await db.execute('SELECT * FROM departments');
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM departments WHERE id = ?', [id]);
    return rows[0];
  },

  update: async (id, name, description) => {
    const [result] = await db.execute(
      'UPDATE departments SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM departments WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = Department;