package com.example.companymanagement.service;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.entity.Attendance;
import com.example.companymanagement.mapper.AttendanceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {
    
    @Autowired
    private AttendanceMapper attendanceMapper;
    
    public PageDTO<Attendance> list(Long companyId, int pageNum, int pageSize, 
                                    LocalDate startDate, LocalDate endDate, Long employeeId) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Attendance> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        
        query.eq(Attendance::getCompanyId, companyId);
        
        if (employeeId != null) {
            query.eq(Attendance::getEmployeeId, employeeId);
        }
        if (startDate != null) {
            query.ge(Attendance::getAttendanceDate, startDate);
        }
        if (endDate != null) {
            query.le(Attendance::getAttendanceDate, endDate);
        }
        
        query.orderByDesc(Attendance::getAttendanceDate);
        
        List<Attendance> records = attendanceMapper.selectList(query);
        long total = attendanceMapper.selectCount(query);
        
        int start = (pageNum - 1) * pageSize;
        int end = Math.min(start + pageSize, records.size());
        List<Attendance> pageRecords = start < records.size() ? records.subList(start, end) : List.of();
        
        return new PageDTO<>(pageRecords, total, pageSize, pageNum);
    }
    
    public Attendance getById(Long id) {
        return attendanceMapper.selectById(id);
    }
    
    public Attendance create(Attendance attendance) {
        attendanceMapper.insert(attendance);
        return attendance;
    }
    
    public Attendance update(Long id, Attendance attendance) {
        Attendance existing = attendanceMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("考勤记录不存在");
        }
        attendance.setId(id);
        attendanceMapper.updateById(attendance);
        return attendance;
    }
    
    public void delete(Long id) {
        attendanceMapper.deleteById(id);
    }
    
    public List<Attendance> getByCompanyIdAndDateRange(Long companyId, LocalDate startDate, LocalDate endDate) {
        return attendanceMapper.selectByCompanyIdAndDateRange(companyId, startDate, endDate);
    }
    
    public List<Attendance> getByEmployeeIdAndDateRange(Long employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceMapper.selectByEmployeeIdAndDateRange(employeeId, startDate, endDate);
    }
}