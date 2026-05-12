package com.example.companymanagement.service;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.entity.Salary;
import com.example.companymanagement.mapper.SalaryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SalaryService {
    
    @Autowired
    private SalaryMapper salaryMapper;
    
    public PageDTO<Salary> list(Long companyId, int pageNum, int pageSize, 
                                String salaryMonth, Long employeeId) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Salary> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        
        query.eq(Salary::getCompanyId, companyId);
        
        if (employeeId != null) {
            query.eq(Salary::getEmployeeId, employeeId);
        }
        if (salaryMonth != null && !salaryMonth.isEmpty()) {
            query.eq(Salary::getSalaryMonth, salaryMonth);
        }
        
        query.orderByDesc(Salary::getSalaryMonth);
        
        List<Salary> records = salaryMapper.selectList(query);
        long total = salaryMapper.selectCount(query);
        
        int start = (pageNum - 1) * pageSize;
        int end = Math.min(start + pageSize, records.size());
        List<Salary> pageRecords = start < records.size() ? records.subList(start, end) : List.of();
        
        return new PageDTO<>(pageRecords, total, pageSize, pageNum);
    }
    
    public Salary getById(Long id) {
        return salaryMapper.selectById(id);
    }
    
    public Salary create(Salary salary) {
        calculateTotalSalary(salary);
        salaryMapper.insert(salary);
        return salary;
    }
    
    public Salary update(Long id, Salary salary) {
        Salary existing = salaryMapper.selectById(id);
        if (existing == null) {
            throw new RuntimeException("薪资记录不存在");
        }
        salary.setId(id);
        calculateTotalSalary(salary);
        salaryMapper.updateById(salary);
        return salary;
    }
    
    public void delete(Long id) {
        salaryMapper.deleteById(id);
    }
    
    public void paySalary(Long companyId, String salaryMonth) {
        List<Salary> salaries = salaryMapper.selectByCompanyIdAndMonth(companyId, salaryMonth);
        for (Salary salary : salaries) {
            salary.setStatus(2);
            salaryMapper.updateById(salary);
        }
    }
    
    private void calculateTotalSalary(Salary salary) {
        BigDecimal basic = salary.getBasicSalary() != null ? salary.getBasicSalary() : BigDecimal.ZERO;
        BigDecimal bonus = salary.getBonus() != null ? salary.getBonus() : BigDecimal.ZERO;
        BigDecimal allowance = salary.getAllowance() != null ? salary.getAllowance() : BigDecimal.ZERO;
        BigDecimal deduction = salary.getDeduction() != null ? salary.getDeduction() : BigDecimal.ZERO;
        
        BigDecimal total = basic.add(bonus).add(allowance).subtract(deduction);
        salary.setTotalSalary(total);
    }
    
    public List<Salary> getByCompanyIdAndMonth(Long companyId, String salaryMonth) {
        return salaryMapper.selectByCompanyIdAndMonth(companyId, salaryMonth);
    }
    
    public List<Salary> getByEmployeeId(Long employeeId) {
        return salaryMapper.selectByEmployeeId(employeeId);
    }
}