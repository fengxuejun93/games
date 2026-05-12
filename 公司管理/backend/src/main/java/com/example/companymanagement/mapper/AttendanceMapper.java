package com.example.companymanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.companymanagement.entity.Attendance;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface AttendanceMapper extends BaseMapper<Attendance> {
    List<Attendance> selectByCompanyIdAndDateRange(@Param("companyId") Long companyId, 
                                                    @Param("startDate") LocalDate startDate, 
                                                    @Param("endDate") LocalDate endDate);
    List<Attendance> selectByEmployeeIdAndDateRange(@Param("employeeId") Long employeeId, 
                                                     @Param("startDate") LocalDate startDate, 
                                                     @Param("endDate") LocalDate endDate);
}