package com.example.companymanagement.service;

import com.example.companymanagement.dto.LoginDTO;
import com.example.companymanagement.dto.UserInfoDTO;
import com.example.companymanagement.entity.Employee;
import com.example.companymanagement.util.JwtUtil;
import com.example.companymanagement.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
    
    @Autowired
    private EmployeeService employeeService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private SecurityUtil securityUtil;
    
    public Map<String, Object> login(LoginDTO dto) {
        Employee employee = employeeService.getByUsername(dto.getUsername());
        
        if (employee == null) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        if (!securityUtil.matchesPassword(dto.getPassword(), employee.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }
        
        if (employee.getStatus() != 1) {
            throw new RuntimeException("用户已离职");
        }
        
        String token = jwtUtil.generateToken(employee.getId(), employee.getUsername(), employee.getCompanyId());
        
        UserInfoDTO userInfo = employeeService.getUserInfo(employee.getId());
        
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userInfo", userInfo);
        
        return result;
    }
    
    public UserInfoDTO getUserInfo(Long employeeId) {
        return employeeService.getUserInfo(employeeId);
    }
    
    public boolean hasPermission(Long employeeId, String permissionCode) {
        UserInfoDTO userInfo = employeeService.getUserInfo(employeeId);
        if (userInfo == null) {
            return false;
        }
        
        if (userInfo.getRoles().contains("super_admin")) {
            return true;
        }
        
        return userInfo.getPermissions().contains(permissionCode);
    }
}