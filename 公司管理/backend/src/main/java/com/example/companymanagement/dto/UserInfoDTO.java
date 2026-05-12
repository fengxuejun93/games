package com.example.companymanagement.dto;

import lombok.Data;

import java.util.List;

@Data
public class UserInfoDTO {
    private Long id;
    private String username;
    private String realName;
    private Long companyId;
    private String companyName;
    private List<String> roles;
    private List<String> permissions;
}