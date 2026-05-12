package com.example.companymanagement.controller;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.PermissionDTO;
import com.example.companymanagement.dto.Result;
import com.example.companymanagement.entity.Permission;
import com.example.companymanagement.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {
    
    @Autowired
    private PermissionService permissionService;
    
    @GetMapping
    public Result<PageDTO<Permission>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name) {
        PageDTO<Permission> page = permissionService.list(pageNum, pageSize, name);
        return Result.success(page);
    }
    
    @GetMapping("/all")
    public Result<List<Permission>> getAll() {
        List<Permission> permissions = permissionService.getAll();
        return Result.success(permissions);
    }
    
    @GetMapping("/{id}")
    public Result<Permission> getById(@PathVariable Long id) {
        Permission permission = permissionService.getById(id);
        return Result.success(permission);
    }
    
    @PostMapping
    public Result<Permission> create(@RequestBody PermissionDTO dto) {
        Permission permission = permissionService.create(dto);
        return Result.success("创建成功", permission);
    }
    
    @PutMapping("/{id}")
    public Result<Permission> update(@PathVariable Long id, @RequestBody PermissionDTO dto) {
        Permission permission = permissionService.update(id, dto);
        return Result.success("更新成功", permission);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        permissionService.delete(id);
        return Result.success("删除成功", null);
    }
}