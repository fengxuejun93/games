package com.example.companymanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.companymanagement.entity.Position;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PositionMapper extends BaseMapper<Position> {
    List<Position> selectByCompanyId(@Param("companyId") Long companyId);
}