const Employee = require('../models/Employee');
const Department = require('../models/Department');

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department_id, position, phone, email } = req.body;
    
    const affectedRows = await Employee.update(id, name, department_id, position, phone, email);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await Employee.delete(id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await Department.findById(id);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const id = await Department.create(name, description);
    res.status(201).json({ id, message: 'Department created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const affectedRows = await Department.update(id, name, description);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const affectedRows = await Department.delete(id);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};