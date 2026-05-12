package com.example.companymanagement.service;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.PositionDTO;
import com.example.companymanagement.entity.Position;
import com.example.companymanagement.mapper.PositionMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PositionService {
    
    @Autowired
    private PositionMapper positionMapper;
    
    public PageDTO<Position> list(Long companyId, int pageNum, int pageSize, String name) {
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<Position> page = 
            new com.baomidou.mybatisplus.core.metadata.IPage<Position>() {};
        
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Position> query = 
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        
        query.eq(Position::getCompanyId, companyId);
        if (name != null && !name.isEmpty()) {
            query.like(Position::getName, name);
        }
        query.orderByAsc(Position::getName);
        
        List<Position> records = positionMapper.selectList(query);
        long total = positionMapper.selectCount(query);
        
        return new PageDTO<>(records, total, pageSize, pageNum);
    }
    
    public Position getById(Long id) {
        return positionMapper.selectById(id);
    }
    
    public Position create(PositionDTO dto) {
        Position position = new Position();
        position.setCompanyId(dto.getCompanyId());
        position.setName(dto.getName());
        position.setDescription(dto.getDescription());
        position.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        positionMapper.insert(position);
        return position;
    }
    
    public Position update(Long id, PositionDTO dto) {
        Position position = positionMapper.selectById(id);
        if (position == null) {
            throw new RuntimeException("岗位不存在");
        }
        if (dto.getName() != null) position.setName(dto.getName());
        if (dto.getDescription() != null) position.setDescription(dto.getDescription());
        if (dto.getStatus() != null) position.setStatus(dto.getStatus());
        positionMapper.updateById(position);
        return position;
    }
    
    public void delete(Long id) {
        positionMapper.deleteById(id);
    }
    
    public List<Position> getByCompanyId(Long companyId) {
        return positionMapper.selectByCompanyId(companyId);
    }
}