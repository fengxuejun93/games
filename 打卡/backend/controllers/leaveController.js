const LeaveApplication = require('../models/LeaveApplication');
const Attendance = require('../models/Attendance');
const { formatDate } = require('../utils/attendanceUtils');

const applyLeave = async (req, res) => {
  try {
    const { employee_id, start_date, end_date, type, reason } = req.body;
    
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ error: 'Start date must be before end date' });
    }
    
    const id = await LeaveApplication.create(employee_id, start_date, end_date, type, reason);
    res.status(201).json({ id, message: 'Leave application submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLeaveApplications = async (req, res) => {
  try {
    const { employee_id } = req.query;
    
    if (employee_id) {
      const leaves = await LeaveApplication.findByEmployee(employee_id);
      res.json(leaves);
    } else {
      const leaves = await LeaveApplication.findAll();
      res.json(leaves);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveLeave = async (req, res) => {
  try {
    const { id, remark } = req.body;
    const leave = await LeaveApplication.findById(id);
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave application not found' });
    }
    
    await LeaveApplication.updateStatus(id, 'approved', remark);
    
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(d);
      const existingAttendance = await Attendance.findByEmployeeAndDate(leave.employee_id, dateStr);
      
      if (existingAttendance) {
        await Attendance.updateStatus(existingAttendance.id, 'leave');
      } else {
        await Attendance.create(leave.employee_id, null, null, 'leave');
      }
    }
    
    res.json({ message: 'Leave approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectLeave = async (req, res) => {
  try {
    const { id, remark } = req.body;
    await LeaveApplication.updateStatus(id, 'rejected', remark);
    res.json({ message: 'Leave rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { applyLeave, getLeaveApplications, approveLeave, rejectLeave };