const Attendance = require('../models/Attendance');
const { checkAttendanceStatus, formatDate, getWeekRange, getMonthRange } = require('../utils/attendanceUtils');

const checkIn = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const now = new Date();
    const today = formatDate(now);
    
    const existingAttendance = await Attendance.findByEmployeeAndDate(employee_id, today);
    
    if (existingAttendance) {
      return res.status(400).json({ error: 'Already checked in today' });
    }
    
    const status = checkAttendanceStatus(now, null);
    const id = await Attendance.create(employee_id, now, null, status);
    
    res.json({ id, check_in_time: now, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkOut = async (req, res) => {
  try {
    const { employee_id } = req.body;
    const now = new Date();
    const today = formatDate(now);
    
    const attendance = await Attendance.findByEmployeeAndDate(employee_id, today);
    
    if (!attendance) {
      return res.status(400).json({ error: 'No check-in record found' });
    }
    
    if (attendance.check_out_time) {
      return res.status(400).json({ error: 'Already checked out today' });
    }
    
    const status = checkAttendanceStatus(attendance.check_in_time, now);
    await Attendance.updateCheckOut(attendance.id, now, status);
    
    res.json({ check_out_time: now, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDailyAttendance = async (req, res) => {
  try {
    const { employee_id, date } = req.query;
    const attendance = await Attendance.findByEmployeeAndDate(employee_id, date || formatDate(new Date()));
    res.json(attendance || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAttendanceList = async (req, res) => {
  try {
    const { employee_id, start_date, end_date } = req.query;
    
    if (employee_id) {
      const attendance = await Attendance.findByEmployee(employee_id, start_date, end_date);
      res.json(attendance);
    } else {
      const attendance = await Attendance.findAll(start_date, end_date);
      res.json(attendance);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStatistics = async (req, res) => {
  try {
    const { employee_id, department_id, period, date } = req.query;
    let start_date, end_date;
    
    switch (period) {
      case 'week':
        const weekRange = getWeekRange(date || new Date());
        start_date = weekRange.start;
        end_date = weekRange.end;
        break;
      case 'month':
        const monthRange = getMonthRange(date || new Date());
        start_date = monthRange.start;
        end_date = monthRange.end;
        break;
      default:
        start_date = formatDate(new Date());
        end_date = formatDate(new Date());
    }
    
    if (employee_id) {
      const stats = await Attendance.getStatisticsByEmployee(employee_id, start_date, end_date);
      res.json({ period: period || 'day', start_date, end_date, ...stats });
    } else if (department_id) {
      const stats = await Attendance.getStatisticsByDepartment(department_id, start_date, end_date);
      res.json({ period: period || 'day', start_date, end_date, ...stats });
    } else {
      res.status(400).json({ error: 'employee_id or department_id required' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id, check_in_time, check_out_time, status } = req.body;
    
    if (check_in_time || check_out_time) {
      const attendance = await Attendance.findById(id);
      const newStatus = status || checkAttendanceStatus(check_in_time || attendance.check_in_time, check_out_time || attendance.check_out_time);
      await Attendance.updateCheckOut(id, check_out_time, newStatus);
    } else if (status) {
      await Attendance.updateStatus(id, status);
    }
    
    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { checkIn, checkOut, getDailyAttendance, getAttendanceList, getStatistics, updateAttendance };