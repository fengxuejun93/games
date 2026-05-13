const AttendanceAdjustment = require('../models/AttendanceAdjustment');
const Attendance = require('../models/Attendance');
const { checkAttendanceStatus } = require('../utils/attendanceUtils');

const applyAdjustment = async (req, res) => {
  try {
    const { employee_id, apply_date, check_in_time, check_out_time, reason } = req.body;
    
    if (!check_in_time && !check_out_time) {
      return res.status(400).json({ error: 'At least one of check_in_time or check_out_time is required' });
    }
    
    const id = await AttendanceAdjustment.create(employee_id, apply_date, check_in_time, check_out_time, reason);
    res.status(201).json({ id, message: 'Adjustment application submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdjustments = async (req, res) => {
  try {
    const { employee_id } = req.query;
    
    if (employee_id) {
      const adjustments = await AttendanceAdjustment.findByEmployee(employee_id);
      res.json(adjustments);
    } else {
      const adjustments = await AttendanceAdjustment.findAll();
      res.json(adjustments);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveAdjustment = async (req, res) => {
  try {
    const { id, remark } = req.body;
    const adjustment = await AttendanceAdjustment.findById(id);
    
    if (!adjustment) {
      return res.status(404).json({ error: 'Adjustment not found' });
    }
    
    await AttendanceAdjustment.updateStatus(id, 'approved', remark);
    
    if (adjustment.check_in_time || adjustment.check_out_time) {
      const status = checkAttendanceStatus(
        adjustment.check_in_time ? `${adjustment.apply_date} ${adjustment.check_in_time}` : null,
        adjustment.check_out_time ? `${adjustment.apply_date} ${adjustment.check_out_time}` : null
      );
      
      const existingAttendance = await Attendance.findByEmployeeAndDate(adjustment.employee_id, adjustment.apply_date);
      
      if (existingAttendance) {
        await Attendance.updateCheckOut(existingAttendance.id, adjustment.check_out_time, status);
      } else {
        const checkInFullTime = adjustment.check_in_time ? `${adjustment.apply_date} ${adjustment.check_in_time}` : null;
        const checkOutFullTime = adjustment.check_out_time ? `${adjustment.apply_date} ${adjustment.check_out_time}` : null;
        await Attendance.create(adjustment.employee_id, checkInFullTime, checkOutFullTime, status);
      }
    }
    
    res.json({ message: 'Adjustment approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectAdjustment = async (req, res) => {
  try {
    const { id, remark } = req.body;
    await AttendanceAdjustment.updateStatus(id, 'rejected', remark);
    res.json({ message: 'Adjustment rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { applyAdjustment, getAdjustments, approveAdjustment, rejectAdjustment };