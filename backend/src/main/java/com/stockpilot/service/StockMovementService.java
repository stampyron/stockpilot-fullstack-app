package com.stockpilot.service;

import com.stockpilot.dto.StockMovementRequest;
import com.stockpilot.dto.StockMovementResponse;
import com.stockpilot.entity.Product;
import com.stockpilot.entity.StockMovement;
import com.stockpilot.exception.BadRequestException;
import com.stockpilot.exception.ResourceNotFoundException;
import com.stockpilot.repository.ProductRepository;
import com.stockpilot.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<StockMovementResponse> getAllMovements() {
        return stockMovementRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponse> getMovementsByProduct(Long productId) {
        return stockMovementRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StockMovementResponse recordMovement(StockMovementRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        String type = request.getType().toUpperCase();
        int qty = request.getQuantity();

        if ("OUT".equals(type)) {
            if (product.getQuantity() < qty) {
                throw new BadRequestException("Insufficient stock: only " + product.getQuantity() + " units available");
            }
            product.setQuantity(product.getQuantity() - qty);
        } else {
            product.setQuantity(product.getQuantity() + qty);
        }
        productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setType(type);
        movement.setQuantity(qty);
        movement.setNote(request.getNote());
        StockMovement saved = stockMovementRepository.save(movement);

        log.info("Recorded stock {} of {} units for product '{}' (new stock: {})",
                type, qty, product.getName(), product.getQuantity());

        return mapToResponse(saved);
    }

    private StockMovementResponse mapToResponse(StockMovement movement) {
        StockMovementResponse response = new StockMovementResponse();
        response.setId(movement.getId());
        response.setType(movement.getType());
        response.setQuantity(movement.getQuantity());
        response.setNote(movement.getNote());
        response.setCreatedAt(movement.getCreatedAt());

        if (movement.getProduct() != null) {
            response.setProductId(movement.getProduct().getId());
            response.setProductName(movement.getProduct().getName());
        }
        return response;
    }
}
