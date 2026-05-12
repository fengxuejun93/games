package com.example.companymanagement.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RolePermissionMapper {
    void insertBatch(@Param("roleId") Long roleId, @Param("permissionIds") List<Long> permissionIds);
    void deleteByRoleId(@Param("roleId") Long roleId);
    List<Long> selectPermissionIdsByRoleId(@Param("roleId") Long roleId);
}