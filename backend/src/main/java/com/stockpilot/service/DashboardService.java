package com.stockpilot.service;

import com.stockpilot.dto.StockMovementResponse;
import com.stockpilot.repository.CategoryRepository;
import com.stockpilot.repository.ProductRepository;
import com.stockpilot.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementService stockMovementService;

    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        List<StockMovementResponse> recentMovements = stockMovementService.getAllMovements();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProducts", productRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("totalSuppliers", supplierRepository.count());
        stats.put("lowStockProducts", productRepository.countByQuantityBetween(1, 5));
        stats.put("outOfStockProducts", productRepository.countByQuantity(0));
        stats.put("recentMovements", recentMovements);
        return stats;
    }
}
