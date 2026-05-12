package com.example.companymanagement.service;

import com.example.companymanagement.entity.Attendance;
import com.example.companymanagement.entity.Employee;
import com.example.companymanagement.entity.Salary;
import com.example.companymanagement.entity.SysLog;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExcelService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public byte[] exportEmployees(List<Employee> employees) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("员工列表");
            
            String[] headers = {"ID", "用户名", "姓名", "部门", "岗位", "电话", "邮箱", "状态", "创建时间"};
            createHeaderRow(sheet, headers);
            
            int rowNum = 1;
            for (Employee emp : employees) {
                Row row = sheet.createRow(rowNum++);
                createCell(row, 0, emp.getId());
                createCell(row, 1, emp.getUsername());
                createCell(row, 2, emp.getRealName());
                createCell(row, 3, emp.getDepartmentId() != null ? emp.getDepartmentId().toString() : "");
                createCell(row, 4, emp.getPositionId() != null ? emp.getPositionId().toString() : "");
                createCell(row, 5, emp.getPhone());
                createCell(row, 6, emp.getEmail());
                createCell(row, 7, emp.getStatus() == 1 ? "在职" : "离职");
                createCell(row, 8, emp.getCreatedAt() != null ? emp.getCreatedAt().format(DATETIME_FORMATTER) : "");
            }
            
            autoSizeColumns(sheet, headers.length);
            
            return workbookToBytes(workbook);
        }
    }
    
    public byte[] exportAttendance(List<Attendance> attendances) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("考勤记录");
            
            String[] headers = {"ID", "员工ID", "考勤日期", "上班时间", "下班时间", "状态", "备注", "创建时间"};
            createHeaderRow(sheet, headers);
            
            int rowNum = 1;
            for (Attendance att : attendances) {
                Row row = sheet.createRow(rowNum++);
                createCell(row, 0, att.getId());
                createCell(row, 1, att.getEmployeeId());
                createCell(row, 2, att.getAttendanceDate() != null ? att.getAttendanceDate().format(DATE_FORMATTER) : "");
                createCell(row, 3, att.getCheckInTime() != null ? att.getCheckInTime().toString() : "");
                createCell(row, 4, att.getCheckOutTime() != null ? att.getCheckOutTime().toString() : "");
                createCell(row, 5, getAttendanceStatus(att.getStatus()));
                createCell(row, 6, att.getRemark());
                createCell(row, 7, att.getCreatedAt() != null ? att.getCreatedAt().format(DATETIME_FORMATTER) : "");
            }
            
            autoSizeColumns(sheet, headers.length);
            
            return workbookToBytes(workbook);
        }
    }
    
    public byte[] exportSalary(List<Salary> salaries) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("薪资记录");
            
            String[] headers = {"ID", "员工ID", "薪资月份", "基本工资", "奖金", "津贴", "扣款", "实发工资", "状态", "备注", "创建时间"};
            createHeaderRow(sheet, headers);
            
            int rowNum = 1;
            for (Salary sal : salaries) {
                Row row = sheet.createRow(rowNum++);
                createCell(row, 0, sal.getId());
                createCell(row, 1, sal.getEmployeeId());
                createCell(row, 2, sal.getSalaryMonth());
                createCell(row, 3, sal.getBasicSalary() != null ? sal.getBasicSalary().toString() : "0.00");
                createCell(row, 4, sal.getBonus() != null ? sal.getBonus().toString() : "0.00");
                createCell(row, 5, sal.getAllowance() != null ? sal.getAllowance().toString() : "0.00");
                createCell(row, 6, sal.getDeduction() != null ? sal.getDeduction().toString() : "0.00");
                createCell(row, 7, sal.getTotalSalary() != null ? sal.getTotalSalary().toString() : "0.00");
                createCell(row, 8, sal.getStatus() == 1 ? "未发放" : "已发放");
                createCell(row, 9, sal.getRemark());
                createCell(row, 10, sal.getCreatedAt() != null ? sal.getCreatedAt().format(DATETIME_FORMATTER) : "");
            }
            
            autoSizeColumns(sheet, headers.length);
            
            return workbookToBytes(workbook);
        }
    }
    
    public byte[] exportLogs(List<SysLog> logs) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("系统日志");
            
            String[] headers = {"ID", "操作人ID", "操作人", "公司ID", "模块", "操作内容", "IP", "状态", "错误信息", "操作时间"};
            createHeaderRow(sheet, headers);
            
            int rowNum = 1;
            for (SysLog log : logs) {
                Row row = sheet.createRow(rowNum++);
                createCell(row, 0, log.getId());
                createCell(row, 1, log.getEmployeeId());
                createCell(row, 2, log.getEmployeeName());
                createCell(row, 3, log.getCompanyId());
                createCell(row, 4, log.getModule());
                createCell(row, 5, log.getOperation());
                createCell(row, 6, log.getIp());
                createCell(row, 7, log.getStatus() == 1 ? "成功" : "失败");
                createCell(row, 8, log.getErrorMsg());
                createCell(row, 9, log.getCreatedAt() != null ? log.getCreatedAt().format(DATETIME_FORMATTER) : "");
            }
            
            autoSizeColumns(sheet, headers.length);
            
            return workbookToBytes(workbook);
        }
    }
    
    private void createHeaderRow(Sheet sheet, String[] headers) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            CellStyle style = sheet.getWorkbook().createCellStyle();
            Font font = sheet.getWorkbook().createFont();
            font.setBold(true);
            style.setFont(font);
            style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderTop(BorderStyle.THIN);
            style.setBorderLeft(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
            cell.setCellStyle(style);
        }
    }
    
    private void createCell(Row row, int column, Object value) {
        Cell cell = row.createCell(column);
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else {
            cell.setCellValue(value.toString());
        }
        CellStyle style = row.getSheet().getWorkbook().createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        cell.setCellStyle(style);
    }
    
    private void autoSizeColumns(Sheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
            int width = sheet.getColumnWidth(i);
            sheet.setColumnWidth(i, Math.min(width + 512, 15360));
        }
    }
    
    private byte[] workbookToBytes(Workbook workbook) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        return outputStream.toByteArray();
    }
    
    private String getAttendanceStatus(Integer status) {
        return switch (status) {
            case 1 -> "正常";
            case 2 -> "迟到";
            case 3 -> "早退";
            case 4 -> "旷工";
            case 5 -> "请假";
            default -> "未知";
        };
    }
}