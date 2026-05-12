package com.example.companymanagement.controller;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.Result;
import com.example.companymanagement.entity.Salary;
import com.example.companymanagement.service.ExcelService;
import com.example.companymanagement.service.SalaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/salary")
public class SalaryController {
    
    @Autowired
    private SalaryService salaryService;
    
    @Autowired
    private ExcelService excelService;
    
    @GetMapping
    public Result<PageDTO<Salary>> list(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String salaryMonth,
            @RequestParam(required = false) Long employeeId) {
        PageDTO<Salary> page = salaryService.list(companyId, pageNum, pageSize, salaryMonth, employeeId);
        return Result.success(page);
    }
    
    @GetMapping("/{id}")
    public Result<Salary> getById(@PathVariable Long id) {
        Salary salary = salaryService.getById(id);
        return Result.success(salary);
    }
    
    @PostMapping
    public Result<Salary> create(@RequestBody Salary salary) {
        Salary created = salaryService.create(salary);
        return Result.success("创建成功", created);
    }
    
    @PutMapping("/{id}")
    public Result<Salary> update(@PathVariable Long id, @RequestBody Salary salary) {
        Salary updated = salaryService.update(id, salary);
        return Result.success("更新成功", updated);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        salaryService.delete(id);
        return Result.success("删除成功", null);
    }
    
    @PostMapping("/pay")
    public Result<Void> paySalary(@RequestParam Long companyId, @RequestParam String salaryMonth) {
        salaryService.paySalary(companyId, salaryMonth);
        return Result.success("薪资发放成功", null);
    }
    
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam Long companyId,
            @RequestParam(required = false) String salaryMonth) throws IOException {
        List<Salary> salaryList;
        if (salaryMonth != null && !salaryMonth.isEmpty()) {
            salaryList = salaryService.getByCompanyIdAndMonth(companyId, salaryMonth);
        } else {
            salaryList = salaryService.getByCompanyIdAndMonth(companyId, LocalDate.now().toString().substring(0, 7));
        }
        
        byte[] excelBytes = excelService.exportSalary(salaryList);
        
        String filename = "薪资记录_" + (salaryMonth != null ? salaryMonth : LocalDate.now().toString().substring(0, 7)) + ".xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8))
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}