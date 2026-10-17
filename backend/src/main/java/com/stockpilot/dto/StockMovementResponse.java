package com.stockpilot.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StockMovementResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String type;
    private Integer quantity;
    private String note;
    private LocalDateTime createdAt;
}
