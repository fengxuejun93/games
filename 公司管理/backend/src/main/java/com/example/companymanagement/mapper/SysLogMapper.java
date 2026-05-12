package com.example.companymanagement.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.companymanagement.entity.SysLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface SysLogMapper extends BaseMapper<SysLog> {
    List<SysLog> selectByCompanyIdAndTimeRange(@Param("companyId") Long companyId, 
                                                @Param("startTime") LocalDateTime startTime, 
                                                @Param("endTime") LocalDateTime endTime);
    List<SysLog> selectByModule(@Param("module") String module);
}