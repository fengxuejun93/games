package com.example.companymanagement.controller;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.Result;
import com.example.companymanagement.dto.RoleDTO;
import com.example.companymanagement.entity.Role;
import com.example.companymanagement.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    
    @Autowired
    private RoleService roleService;
    
    @GetMapping
    public Result<PageDTO<Role>> list(
            @RequestParam(required = false) Long companyId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name) {
        PageDTO<Role> page = roleService.list(companyId, pageNum, pageSize, name);
        return Result.success(page);
    }
    
    @GetMapping("/company/{companyId}")
    public Result<List<Role>> getByCompanyId(@PathVariable Long companyId) {
        List<Role> roles = roleService.getByCompanyId(companyId);
        return Result.success(roles);
    }
    
    @GetMapping("/{id}")
    public Result<Role> getById(@PathVariable Long id) {
        Role role = roleService.getById(id);
        return Result.success(role);
    }
    
    @GetMapping("/{id}/permissions")
    public Result<List<Long>> getRolePermissions(@PathVariable Long id) {
        List<Long> permissions = roleService.getRolePermissions(id);
        return Result.success(permissions);
    }
    
    @PostMapping
    public Result<Role> create(@RequestBody RoleDTO dto) {
        Role role = roleService.create(dto);
        return Result.success("创建成功", role);
    }
    
    @PutMapping("/{id}")
    public Result<Role> update(@PathVariable Long id, @RequestBody RoleDTO dto) {
        Role role = roleService.update(id, dto);
        return Result.success("更新成功", role);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return Result.success("删除成功", null);
    }
}