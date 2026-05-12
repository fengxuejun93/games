package com.example.companymanagement.service;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.PermissionDTO;
import com.example.companymanagement.entity.Permission;
import com.example.companymanagement.mapper.PermissionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PermissionService {
    
    @Autowired
    private PermissionMapper permissionMapper;
    
    public PageDTO<Permission> list(int pageNum, int pageSize, String name) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Permission> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        
        if (name != null && !name.isEmpty()) {
            query.like(Permission::getName, name);
        }
        query.orderByAsc(Permission::getParentId).orderByAsc(Permission::getSort);
        
        List<Permission> records = permissionMapper.selectList(query);
        long total = permissionMapper.selectCount(query);
        
        return new PageDTO<>(records, total, pageSize, pageNum);
    }
    
    public Permission getById(Long id) {
        return permissionMapper.selectById(id);
    }
    
    public Permission create(PermissionDTO dto) {
        Permission permission = new Permission();
        permission.setName(dto.getName());
        permission.setCode(dto.getCode());
        permission.setParentId(dto.getParentId() != null ? dto.getParentId() : 0L);
        permission.setType(dto.getType() != null ? dto.getType() : 1);
        permission.setPath(dto.getPath());
        permission.setIcon(dto.getIcon());
        permission.setSort(dto.getSort() != null ? dto.getSort() : 0);
        permission.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        permissionMapper.insert(permission);
        return permission;
    }
    
    public Permission update(Long id, PermissionDTO dto) {
        Permission permission = permissionMapper.selectById(id);
        if (permission == null) {
            throw new RuntimeException("权限不存在");
        }
        if (dto.getName() != null) permission.setName(dto.getName());
        if (dto.getCode() != null) permission.setCode(dto.getCode());
        if (dto.getParentId() != null) permission.setParentId(dto.getParentId());
        if (dto.getType() != null) permission.setType(dto.getType());
        if (dto.getPath() != null) permission.setPath(dto.getPath());
        if (dto.getIcon() != null) permission.setIcon(dto.getIcon());
        if (dto.getSort() != null) permission.setSort(dto.getSort());
        if (dto.getStatus() != null) permission.setStatus(dto.getStatus());
        permissionMapper.updateById(permission);
        return permission;
    }
    
    public void delete(Long id) {
        permissionMapper.deleteById(id);
    }
    
    public List<Permission> getAll() {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Permission> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        query.orderByAsc(Permission::getParentId).orderByAsc(Permission::getSort);
        return permissionMapper.selectList(query);
    }
}