package com.example.companymanagement.controller;

import com.example.companymanagement.dto.DepartmentDTO;
import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.Result;
import com.example.companymanagement.entity.Department;
import com.example.companymanagement.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
    
    @Autowired
    private DepartmentService departmentService;
    
    @GetMapping
    public Result<PageDTO<Department>> list(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name) {
        PageDTO<Department> page = departmentService.list(companyId, pageNum, pageSize, name);
        return Result.success(page);
    }
    
    @GetMapping("/company/{companyId}")
    public Result<List<Department>> getByCompanyId(@PathVariable Long companyId) {
        List<Department> departments = departmentService.getByCompanyId(companyId);
        return Result.success(departments);
    }
    
    @GetMapping("/{id}")
    public Result<Department> getById(@PathVariable Long id) {
        Department department = departmentService.getById(id);
        return Result.success(department);
    }
    
    @PostMapping
    public Result<Department> create(@RequestBody DepartmentDTO dto) {
        Department department = departmentService.create(dto);
        return Result.success("创建成功", department);
    }
    
    @PutMapping("/{id}")
    public Result<Department> update(@PathVariable Long id, @RequestBody DepartmentDTO dto) {
        Department department = departmentService.update(id, dto);
        return Result.success("更新成功", department);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        departmentService.delete(id);
        return Result.success("删除成功", null);
    }
}