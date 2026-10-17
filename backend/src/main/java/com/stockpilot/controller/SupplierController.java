package com.stockpilot.controller;

import com.stockpilot.entity.Supplier;
import com.stockpilot.exception.BadRequestException;
import com.stockpilot.exception.ResourceNotFoundException;
import com.stockpilot.repository.ProductRepository;
import com.stockpilot.repository.SupplierRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Slf4j
public class SupplierController {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public List<Supplier> getAll() {
        return supplierRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getOne(@PathVariable Long id) {
        return supplierRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
    }

    @PostMapping
    public ResponseEntity<Supplier> create(@Valid @RequestBody Supplier supplier) {
        log.info("Creating supplier: {}", supplier.getName());
        return ResponseEntity.ok(supplierRepository.save(supplier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> update(@PathVariable Long id, @Valid @RequestBody Supplier request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        supplier.setName(request.getName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        log.info("Updating supplier ID: {}", id);
        return ResponseEntity.ok(supplierRepository.save(supplier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean hasProducts = productRepository.findAll().stream()
                .anyMatch(p -> p.getSupplier() != null && p.getSupplier().getId().equals(id));
        if (hasProducts) {
            throw new BadRequestException("Cannot delete supplier: products are linked to it");
        }
        log.info("Deleting supplier ID: {}", id);
        supplierRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
