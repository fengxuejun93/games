package com.example.companymanagement.service;

import com.example.companymanagement.dto.DepartmentDTO;
import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.entity.Department;
import com.example.companymanagement.mapper.DepartmentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    
    @Autowired
    private DepartmentMapper departmentMapper;
    
    public PageDTO<Department> list(Long companyId, int pageNum, int pageSize, String name) {
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<Department> page = 
            new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNum, pageSize);
        
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Department> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        
        query.eq(Department::getCompanyId, companyId);
        if (name != null && !name.isEmpty()) {
            query.like(Department::getName, name);
        }
        query.orderByAsc(Department::getParentId).orderByAsc(Department::getName);
        
        departmentMapper.selectPage(page, query);
        
        return new PageDTO<>(page.getRecords(), page.getTotal(), pageSize, pageNum);
    }
    
    public Department getById(Long id) {
        return departmentMapper.selectById(id);
    }
    
    public Department create(DepartmentDTO dto) {
        Department department = new Department();
        department.setCompanyId(dto.getCompanyId());
        department.setName(dto.getName());
        department.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        department.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        departmentMapper.insert(department);
        return department;
    }
    
    public Department update(Long id, DepartmentDTO dto) {
        Department department = departmentMapper.selectById(id);
        if (department == null) {
            throw new RuntimeException("部门不存在");
        }
        if (dto.getName() != null) department.setName(dto.getName());
        if (dto.getParentId() != null) department.setParentId(dto.getParentId());
        if (dto.getStatus() != null) department.setStatus(dto.getStatus());
        departmentMapper.updateById(department);
        return department;
    }
    
    public void delete(Long id) {
        departmentMapper.deleteById(id);
    }
    
    public List<Department> getByCompanyId(Long companyId) {
        return departmentMapper.selectByCompanyId(companyId);
    }
}