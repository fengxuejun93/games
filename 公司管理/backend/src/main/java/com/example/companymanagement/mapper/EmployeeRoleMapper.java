package com.example.companymanagement.mapper;

import com.example.companymanagement.entity.Role;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EmployeeRoleMapper {
    void insertBatch(@Param("employeeId") Long employeeId, @Param("roleIds") List<Long> roleIds);
    void deleteByEmployeeId(@Param("employeeId") Long employeeId);
    List<Role> selectRolesByEmployeeId(@Param("employeeId") Long employeeId);
    List<Long> selectRoleIdsByEmployeeId(@Param("employeeId") Long employeeId);
}