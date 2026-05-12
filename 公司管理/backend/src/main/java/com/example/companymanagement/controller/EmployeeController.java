package com.example.companymanagement.controller;

import com.example.companymanagement.dto.EmployeeDTO;
import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.Result;
import com.example.companymanagement.entity.Employee;
import com.example.companymanagement.entity.Role;
import com.example.companymanagement.service.EmployeeService;
import com.example.companymanagement.service.ExcelService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    
    @Autowired
    private EmployeeService employeeService;
    
    @Autowired
    private ExcelService excelService;
    
    @GetMapping
    public Result<PageDTO<Employee>> list(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String realName) {
        PageDTO<Employee> page = employeeService.list(companyId, pageNum, pageSize, realName);
        return Result.success(page);
    }
    
    @GetMapping("/{id}")
    public Result<Employee> getById(@PathVariable Long id) {
        Employee employee = employeeService.getById(id);
        return Result.success(employee);
    }
    
    @GetMapping("/{id}/roles")
    public Result<List<Role>> getEmployeeRoles(@PathVariable Long id) {
        List<Role> roles = employeeService.getEmployeeRoles(id);
        return Result.success(roles);
    }
    
    @PostMapping
    public Result<Employee> create(@RequestBody EmployeeDTO dto) {
        Employee employee = employeeService.create(dto);
        return Result.success("创建成功", employee);
    }
    
    @PutMapping("/{id}")
    public Result<Employee> update(@PathVariable Long id, @RequestBody EmployeeDTO dto) {
        Employee employee = employeeService.update(id, dto);
        return Result.success("更新成功", employee);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return Result.success("删除成功", null);
    }
    
    @PostMapping("/{id}/roles")
    public Result<Void> assignRoles(@PathVariable Long id, @RequestBody Map<String, List<Long>> body) {
        List<Long> roleIds = body.get("roleIds");
        employeeService.assignRoles(id, roleIds);
        return Result.success("角色分配成功", null);
    }
    
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(@RequestParam Long companyId) throws IOException {
        List<Employee> employees = employeeService.getByCompanyId(companyId);
        byte[] excelBytes = excelService.exportEmployees(employees);
        
        String filename = "员工列表_" + LocalDate.now().toString() + ".xlsx";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + URLEncoder.encode(filename, StandardCharsets.UTF_8))
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}