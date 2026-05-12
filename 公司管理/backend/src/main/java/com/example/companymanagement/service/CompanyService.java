package com.example.companymanagement.service;

import com.example.companymanagement.dto.CompanyDTO;
import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.entity.Company;
import com.example.companymanagement.mapper.CompanyMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {
    
    @Autowired
    private CompanyMapper companyMapper;
    
    public PageDTO<Company> list(int pageNum, int pageSize, String name) {
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<Company> page = 
            new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(pageNum, pageSize);
        
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Company> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        
        if (name != null && !name.isEmpty()) {
            query.like(Company::getName, name);
        }
        query.orderByDesc(Company::getCreatedAt);
        
        companyMapper.selectPage(page, query);
        
        return new PageDTO<>(page.getRecords(), page.getTotal(), pageSize, pageNum);
    }
    
    public Company getById(Long id) {
        return companyMapper.selectById(id);
    }
    
    public Company create(CompanyDTO dto) {
        Company company = new Company();
        company.setName(dto.getName());
        company.setAddress(dto.getAddress());
        company.setPhone(dto.getPhone());
        company.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        companyMapper.insert(company);
        return company;
    }
    
    public Company update(Long id, CompanyDTO dto) {
        Company company = companyMapper.selectById(id);
        if (company == null) {
            throw new RuntimeException("公司不存在");
        }
        if (dto.getName() != null) company.setName(dto.getName());
        if (dto.getAddress() != null) company.setAddress(dto.getAddress());
        if (dto.getPhone() != null) company.setPhone(dto.getPhone());
        if (dto.getStatus() != null) company.setStatus(dto.getStatus());
        companyMapper.updateById(company);
        return company;
    }
    
    public void delete(Long id) {
        companyMapper.deleteById(id);
    }
    
    public List<Company> getAll() {
        return companyMapper.selectList(null);
    }
}