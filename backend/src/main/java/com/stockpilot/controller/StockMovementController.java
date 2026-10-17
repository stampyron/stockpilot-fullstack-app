package com.stockpilot.controller;

import com.stockpilot.dto.StockMovementRequest;
import com.stockpilot.dto.StockMovementResponse;
import com.stockpilot.service.StockMovementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @GetMapping
    public List<StockMovementResponse> getAll() {
        return stockMovementService.getAllMovements();
    }

    @GetMapping("/product/{productId}")
    public List<StockMovementResponse> getByProduct(@PathVariable Long productId) {
        return stockMovementService.getMovementsByProduct(productId);
    }

    @PostMapping
    public ResponseEntity<StockMovementResponse> record(@Valid @RequestBody StockMovementRequest request) {
        return ResponseEntity.ok(stockMovementService.recordMovement(request));
    }
}
