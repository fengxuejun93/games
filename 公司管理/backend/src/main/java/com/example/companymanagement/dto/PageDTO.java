package com.example.companymanagement.dto;

import lombok.Data;

import java.util.List;

@Data
public class PageDTO<T> {
    private List<T> records;
    private Long total;
    private Integer pageSize;
    private Integer pageNum;
    
    public PageDTO(List<T> records, Long total, Integer pageSize, Integer pageNum) {
        this.records = records;
        this.total = total;
        this.pageSize = pageSize;
        this.pageNum = pageNum;
    }
}