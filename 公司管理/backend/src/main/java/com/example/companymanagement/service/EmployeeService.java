package com.example.companymanagement.service;

import com.example.companymanagement.dto.EmployeeDTO;
import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.UserInfoDTO;
import com.example.companymanagement.entity.Company;
import com.example.companymanagement.entity.Employee;
import com.example.companymanagement.entity.Permission;
import com.example.companymanagement.entity.Role;
import com.example.companymanagement.mapper.CompanyMapper;
import com.example.companymanagement.mapper.EmployeeMapper;
import com.example.companymanagement.mapper.EmployeeRoleMapper;
import com.example.companymanagement.mapper.PermissionMapper;
import com.example.companymanagement.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {
    
    @Autowired
    private EmployeeMapper employeeMapper;
    
    @Autowired
    private EmployeeRoleMapper employeeRoleMapper;
    
    @Autowired
    private PermissionMapper permissionMapper;
    
    @Autowired
    private CompanyMapper companyMapper;
    
    @Autowired
    private SecurityUtil securityUtil;
    
    public PageDTO<Employee> list(Long companyId, int pageNum, int pageSize, String realName) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Employee> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        
        query.eq(Employee::getCompanyId, companyId);
        if (realName != null && !realName.isEmpty()) {
            query.like(Employee::getRealName, realName);
        }
        query.orderByDesc(Employee::getCreatedAt);
        
        List<Employee> records = employeeMapper.selectList(query);
        long total = employeeMapper.selectCount(query);
        
        return new PageDTO<>(records, total, pageSize, pageNum);
    }
    
    public Employee getById(Long id) {
        return employeeMapper.selectById(id);
    }
    
    @Transactional
    public Employee create(EmployeeDTO dto) {
        Employee employee = new Employee();
        employee.setCompanyId(dto.getCompanyId());
        employee.setDepartmentId(dto.getDepartmentId());
        employee.setPositionId(dto.getPositionId());
        employee.setUsername(dto.getUsername());
        employee.setPassword(securityUtil.encodePassword(dto.getPassword()));
        employee.setRealName(dto.getRealName());
        employee.setPhone(dto.getPhone());
        employee.setEmail(dto.getEmail());
        employee.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        employeeMapper.insert(employee);
        return employee;
    }
    
    @Transactional
    public Employee update(Long id, EmployeeDTO dto) {
        Employee employee = employeeMapper.selectById(id);
        if (employee == null) {
            throw new RuntimeException("员工不存在");
        }
        if (dto.getDepartmentId() != null) employee.setDepartmentId(dto.getDepartmentId());
        if (dto.getPositionId() != null) employee.setPositionId(dto.getPositionId());
        if (dto.getUsername() != null) employee.setUsername(dto.getUsername());
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            employee.setPassword(securityUtil.encodePassword(dto.getPassword()));
        }
        if (dto.getRealName() != null) employee.setRealName(dto.getRealName());
        if (dto.getPhone() != null) employee.setPhone(dto.getPhone());
        if (dto.getEmail() != null) employee.setEmail(dto.getEmail());
        if (dto.getStatus() != null) employee.setStatus(dto.getStatus());
        employeeMapper.updateById(employee);
        return employee;
    }
    
    @Transactional
    public void delete(Long id) {
        employeeRoleMapper.deleteByEmployeeId(id);
        employeeMapper.deleteById(id);
    }
    
    public Employee getByUsername(String username) {
        return employeeMapper.selectByUsername(username);
    }
    
    @Transactional
    public void assignRoles(Long employeeId, List<Long> roleIds) {
        employeeRoleMapper.deleteByEmployeeId(employeeId);
        if (roleIds != null && !roleIds.isEmpty()) {
            employeeRoleMapper.insertBatch(employeeId, roleIds);
        }
    }
    
    public UserInfoDTO getUserInfo(Long employeeId) {
        Employee employee = employeeMapper.selectById(employeeId);
        if (employee == null) {
            return null;
        }
        
        List<Role> roles = employeeRoleMapper.selectRolesByEmployeeId(employeeId);
        List<String> roleCodes = roles.stream().map(Role::getCode).collect(Collectors.toList());
        
        List<Long> roleIds = roles.stream().map(Role::getId).collect(Collectors.toList());
        List<Permission> permissions = permissionMapper.selectByRoleIds(roleIds);
        List<String> permissionCodes = permissions.stream().map(Permission::getCode).collect(Collectors.toList());
        
        Company company = companyMapper.selectById(employee.getCompanyId());
        
        UserInfoDTO userInfo = new UserInfoDTO();
        userInfo.setId(employee.getId());
        userInfo.setUsername(employee.getUsername());
        userInfo.setRealName(employee.getRealName());
        userInfo.setCompanyId(employee.getCompanyId());
        userInfo.setCompanyName(company != null ? company.getName() : null);
        userInfo.setRoles(roleCodes);
        userInfo.setPermissions(permissionCodes);
        
        return userInfo;
    }
    
    public List<Role> getEmployeeRoles(Long employeeId) {
        return employeeRoleMapper.selectRolesByEmployeeId(employeeId);
    }
    
    public List<Employee> getByCompanyId(Long companyId) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Employee> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        query.eq(Employee::getCompanyId, companyId);
        query.orderByDesc(Employee::getCreatedAt);
        return employeeMapper.selectList(query);
    }
}