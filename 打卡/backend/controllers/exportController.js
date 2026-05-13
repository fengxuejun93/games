const xlsx = require('xlsx');
const Attendance = require('../models/Attendance');

const exportAttendance = async (req, res) => {
  try {
    const { employee_id, department_id, start_date, end_date } = req.query;
    
    let data;
    if (employee_id) {
      data = await Attendance.findByEmployee(employee_id, start_date, end_date);
    } else if (department_id) {
      data = await Attendance.findByDepartment(department_id, start_date, end_date);
    } else {
      data = await Attendance.findAll(start_date, end_date);
    }
    
    const statusMap = {
      'normal': '正常',
      'late': '迟到',
      'early_leave': '早退',
      'absent': '旷工',
      'leave': '请假'
    };
    
    const worksheetData = data.map(item => ({
      '姓名': item.employee_name,
      '部门': item.department_name,
      '打卡日期': item.check_in_time ? new Date(item.check_in_time).toLocaleDateString('zh-CN') : '',
      '上班时间': item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '',
      '下班时间': item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '',
      '状态': statusMap[item.status] || item.status
    }));
    
    const worksheet = xlsx.utils.json_to_sheet(worksheetData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '考勤记录');
    
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance_${start_date}_${end_date}.xlsx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { exportAttendance };