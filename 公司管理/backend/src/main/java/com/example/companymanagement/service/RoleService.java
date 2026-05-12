package com.example.companymanagement.service;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.RoleDTO;
import com.example.companymanagement.entity.Role;
import com.example.companymanagement.mapper.RoleMapper;
import com.example.companymanagement.mapper.RolePermissionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoleService {
    
    @Autowired
    private RoleMapper roleMapper;
    
    @Autowired
    private RolePermissionMapper rolePermissionMapper;
    
    public PageDTO<Role> list(Long companyId, int pageNum, int pageSize, String name) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Role> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        
        if (companyId != null) {
            query.eq(Role::getCompanyId, companyId);
        } else {
            query.isNull(Role::getCompanyId);
        }
        
        if (name != null && !name.isEmpty()) {
            query.like(Role::getName, name);
        }
        query.orderByAsc(Role::getName);
        
        List<Role> records = roleMapper.selectList(query);
        long total = roleMapper.selectCount(query);
        
        return new PageDTO<>(records, total, pageSize, pageNum);
    }
    
    public Role getById(Long id) {
        return roleMapper.selectById(id);
    }
    
    @Transactional
    public Role create(RoleDTO dto) {
        Role role = new Role();
        role.setCompanyId(dto.getCompanyId());
        role.setName(dto.getName());
        role.setCode(dto.getCode());
        role.setDescription(dto.getDescription());
        role.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        roleMapper.insert(role);
        
        if (dto.getPermissionIds() != null && !dto.getPermissionIds().isEmpty()) {
            rolePermissionMapper.insertBatch(role.getId(), dto.getPermissionIds());
        }
        
        return role;
    }
    
    @Transactional
    public Role update(Long id, RoleDTO dto) {
        Role role = roleMapper.selectById(id);
        if (role == null) {
            throw new RuntimeException("角色不存在");
        }
        if (dto.getName() != null) role.setName(dto.getName());
        if (dto.getCode() != null) role.setCode(dto.getCode());
        if (dto.getDescription() != null) role.setDescription(dto.getDescription());
        if (dto.getStatus() != null) role.setStatus(dto.getStatus());
        roleMapper.updateById(role);
        
        rolePermissionMapper.deleteByRoleId(id);
        if (dto.getPermissionIds() != null && !dto.getPermissionIds().isEmpty()) {
            rolePermissionMapper.insertBatch(id, dto.getPermissionIds());
        }
        
        return role;
    }
    
    @Transactional
    public void delete(Long id) {
        rolePermissionMapper.deleteByRoleId(id);
        roleMapper.deleteById(id);
    }
    
    public List<Role> getByCompanyId(Long companyId) {
        List<Role> systemRoles = roleMapper.selectByCompanyId(null);
        List<Role> companyRoles = roleMapper.selectByCompanyId(companyId);
        
        List<Role> allRoles = new ArrayList<>();
        allRoles.addAll(systemRoles);
        if (companyRoles != null) {
            allRoles.addAll(companyRoles);
        }
        return allRoles;
    }
    
    public List<Long> getRolePermissions(Long roleId) {
        return rolePermissionMapper.selectPermissionIdsByRoleId(roleId);
    }
}