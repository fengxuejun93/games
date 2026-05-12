package com.example.companymanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.companymanagement.entity.Salary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SalaryMapper extends BaseMapper<Salary> {
    List<Salary> selectByCompanyIdAndMonth(@Param("companyId") Long companyId, @Param("salaryMonth") String salaryMonth);
    List<Salary> selectByEmployeeId(@Param("employeeId") Long employeeId);
    Salary selectByEmployeeIdAndMonth(@Param("employeeId") Long employeeId, @Param("salaryMonth") String salaryMonth);
}