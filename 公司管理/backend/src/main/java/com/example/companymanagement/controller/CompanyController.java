package com.example.companymanagement.controller;

import com.example.companymanagement.dto.CompanyDTO;
import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.Result;
import com.example.companymanagement.entity.Company;
import com.example.companymanagement.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {
    
    @Autowired
    private CompanyService companyService;
    
    @GetMapping
    public Result<PageDTO<Company>> list(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name) {
        PageDTO<Company> page = companyService.list(pageNum, pageSize, name);
        return Result.success(page);
    }
    
    @GetMapping("/all")
    public Result<List<Company>> getAll() {
        List<Company> companies = companyService.getAll();
        return Result.success(companies);
    }
    
    @GetMapping("/{id}")
    public Result<Company> getById(@PathVariable Long id) {
        Company company = companyService.getById(id);
        return Result.success(company);
    }
    
    @PostMapping
    public Result<Company> create(@RequestBody CompanyDTO dto) {
        Company company = companyService.create(dto);
        return Result.success("创建成功", company);
    }
    
    @PutMapping("/{id}")
    public Result<Company> update(@PathVariable Long id, @RequestBody CompanyDTO dto) {
        Company company = companyService.update(id, dto);
        return Result.success("更新成功", company);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        companyService.delete(id);
        return Result.success("删除成功", null);
    }
}