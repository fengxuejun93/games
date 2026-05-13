const LateStatistics = require('../models/LateStatistics');
const Attendance = require('../models/Attendance');

const LATE_THRESHOLD = process.env.LATE_THRESHOLD || 3;

const calculateMonthlyLateCount = async (employee_id, year, month) => {
  const start_date = `${year}-${String(month).padStart(2, '0')}-01`;
  const end_date = new Date(year, month, 0).toISOString().split('T')[0];
  
  const stats = await Attendance.getStatisticsByEmployee(employee_id, start_date, end_date);
  return stats?.late_days || 0;
};

const updateLateStatistics = async (employee_id, check_in_time) => {
  const date = new Date(check_in_time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  const late_count = await calculateMonthlyLateCount(employee_id, year, month);
  await LateStatistics.createOrUpdate(employee_id, year, month, late_count);
  
  return { late_count, threshold: LATE_THRESHOLD, exceeded: late_count > LATE_THRESHOLD };
};

const getEmployeeLateStatus = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const stats = await LateStatistics.getByEmployeeAndMonth(employee_id, year, month);
    const exceeded = stats.late_count > LATE_THRESHOLD;
    
    res.json({
      late_count: stats.late_count,
      threshold: LATE_THRESHOLD,
      exceeded,
      remaining: Math.max(0, LATE_THRESHOLD - stats.late_count)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExceededEmployees = async (req, res) => {
  try {
    const { department_id, threshold } = req.query;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    let employees = await LateStatistics.getExceededEmployees(year, month, threshold || LATE_THRESHOLD);
    
    if (department_id) {
      employees = employees.filter(e => e.department_id === parseInt(department_id));
    }
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMonthlyLateStats = async (req, res) => {
  try {
    const { department_id } = req.query;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    if (department_id) {
      const stats = await LateStatistics.getDepartmentLateStats(department_id, year, month);
      res.json({ year, month, ...stats });
    } else {
      const stats = await LateStatistics.getMonthlyLateStats(year, month);
      res.json({ year, month, employees: stats });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  updateLateStatistics, 
  getEmployeeLateStatus, 
  getExceededEmployees, 
  getMonthlyLateStats,
  LATE_THRESHOLD 
};