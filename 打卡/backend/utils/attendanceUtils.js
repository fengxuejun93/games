const WORK_START_TIME = '09:00:00';
const WORK_END_TIME = '18:00:00';
const LATE_THRESHOLD = '09:30:00';
const EARLY_LEAVE_THRESHOLD = '17:30:00';

const checkAttendanceStatus = (checkInTime, checkOutTime) => {
  if (!checkInTime) return 'absent';
  
  const checkIn = new Date(checkInTime);
  const checkInTimeStr = checkIn.toTimeString().slice(0, 8);
  
  let status = 'normal';
  
  if (checkInTimeStr > LATE_THRESHOLD) {
    status = 'late';
  }
  
  if (checkOutTime) {
    const checkOut = new Date(checkOutTime);
    const checkOutTimeStr = checkOut.toTimeString().slice(0, 8);
    
    if (checkOutTimeStr < EARLY_LEAVE_THRESHOLD) {
      status = 'early_leave';
    }
  }
  
  return status;
};

const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return {
    start: formatDate(monday),
    end: formatDate(sunday)
  };
};

const getMonthRange = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    start: formatDate(firstDay),
    end: formatDate(lastDay)
  };
};

module.exports = {
  WORK_START_TIME,
  WORK_END_TIME,
  LATE_THRESHOLD,
  EARLY_LEAVE_THRESHOLD,
  checkAttendanceStatus,
  formatDate,
  getWeekRange,
  getMonthRange
};