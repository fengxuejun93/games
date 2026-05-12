package com.example.companymanagement.controller;

import com.example.companymanagement.dto.PageDTO;
import com.example.companymanagement.dto.PositionDTO;
import com.example.companymanagement.dto.Result;
import com.example.companymanagement.entity.Position;
import com.example.companymanagement.service.PositionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/positions")
public class PositionController {
    
    @Autowired
    private PositionService positionService;
    
    @GetMapping
    public Result<PageDTO<Position>> list(
            @RequestParam Long companyId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String name) {
        PageDTO<Position> page = positionService.list(companyId, pageNum, pageSize, name);
        return Result.success(page);
    }
    
    @GetMapping("/company/{companyId}")
    public Result<List<Position>> getByCompanyId(@PathVariable Long companyId) {
        List<Position> positions = positionService.getByCompanyId(companyId);
        return Result.success(positions);
    }
    
    @GetMapping("/{id}")
    public Result<Position> getById(@PathVariable Long id) {
        Position position = positionService.getById(id);
        return Result.success(position);
    }
    
    @PostMapping
    public Result<Position> create(@RequestBody PositionDTO dto) {
        Position position = positionService.create(dto);
        return Result.success("创建成功", position);
    }
    
    @PutMapping("/{id}")
    public Result<Position> update(@PathVariable Long id, @RequestBody PositionDTO dto) {
        Position position = positionService.update(id, dto);
        return Result.success("更新成功", position);
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        positionService.delete(id);
        return Result.success("删除成功", null);
    }
}