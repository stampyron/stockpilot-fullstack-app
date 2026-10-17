package com.stockpilot.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StockMovementRequest {

    @NotNull(message = "Product is required")
    private Long productId;

    @NotBlank(message = "Movement type is required")
    @Pattern(regexp = "IN|OUT", message = "Movement type must be IN or OUT")
    private String type;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    private String note;
}
