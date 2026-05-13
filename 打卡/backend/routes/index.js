const authController = require('../controllers/authController');
const attendanceController = require('../controllers/attendanceController');
const adjustmentController = require('../controllers/adjustmentController');
const leaveController = require('../controllers/leaveController');
const employeeController = require('../controllers/employeeController');
const exportController = require('../controllers/exportController');
const lateController = require('../controllers/lateController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

module.exports = (app) => {
  app.post('/api/login', authController.login);
  app.post('/api/register', authenticateToken, requireAdmin, authController.register);
  
  app.post('/api/attendance/checkin', authenticateToken, attendanceController.checkIn);
  app.post('/api/attendance/checkout', authenticateToken, attendanceController.checkOut);
  app.get('/api/attendance/daily', authenticateToken, attendanceController.getDailyAttendance);
  app.get('/api/attendance/list', authenticateToken, attendanceController.getAttendanceList);
  app.get('/api/attendance/statistics', authenticateToken, attendanceController.getStatistics);
  app.put('/api/attendance', authenticateToken, requireAdmin, attendanceController.updateAttendance);
  
  app.post('/api/adjustment/apply', authenticateToken, adjustmentController.applyAdjustment);
  app.get('/api/adjustment/list', authenticateToken, adjustmentController.getAdjustments);
  app.post('/api/adjustment/approve', authenticateToken, requireAdmin, adjustmentController.approveAdjustment);
  app.post('/api/adjustment/reject', authenticateToken, requireAdmin, adjustmentController.rejectAdjustment);
  
  app.post('/api/leave/apply', authenticateToken, leaveController.applyLeave);
  app.get('/api/leave/list', authenticateToken, leaveController.getLeaveApplications);
  app.post('/api/leave/approve', authenticateToken, requireAdmin, leaveController.approveLeave);
  app.post('/api/leave/reject', authenticateToken, requireAdmin, leaveController.rejectLeave);
  
  app.get('/api/employees', authenticateToken, requireAdmin, employeeController.getAllEmployees);
  app.get('/api/employees/:id', authenticateToken, requireAdmin, employeeController.getEmployeeById);
  app.put('/api/employees/:id', authenticateToken, requireAdmin, employeeController.updateEmployee);
  app.delete('/api/employees/:id', authenticateToken, requireAdmin, employeeController.deleteEmployee);
  
  app.get('/api/departments', authenticateToken, employeeController.getAllDepartments);
  app.get('/api/departments/:id', authenticateToken, employeeController.getDepartmentById);
  app.post('/api/departments', authenticateToken, requireAdmin, employeeController.createDepartment);
  app.put('/api/departments/:id', authenticateToken, requireAdmin, employeeController.updateDepartment);
  app.delete('/api/departments/:id', authenticateToken, requireAdmin, employeeController.deleteDepartment);
  
  app.get('/api/export/attendance', authenticateToken, exportController.exportAttendance);

app.get('/api/late/status', authenticateToken, lateController.getEmployeeLateStatus);
app.get('/api/late/exceeded', authenticateToken, requireAdmin, lateController.getExceededEmployees);
app.get('/api/late/stats', authenticateToken, lateController.getMonthlyLateStats);
};