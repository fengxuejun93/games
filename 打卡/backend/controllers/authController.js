const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findByEmail(email);
    
    if (!employee) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, employee.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: employee.id, email: employee.email, role: employee.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
    
    res.json({
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department_id: employee.department_id,
        department_name: employee.department_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { name, department_id, position, phone, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await Employee.create(name, department_id, position, phone, email, hashedPassword);
    res.status(201).json({ id, message: 'Employee created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login, register };