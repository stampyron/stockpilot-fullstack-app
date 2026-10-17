package com.stockpilot.controller;

import com.stockpilot.entity.Category;
import com.stockpilot.exception.BadRequestException;
import com.stockpilot.exception.ResourceNotFoundException;
import com.stockpilot.repository.CategoryRepository;
import com.stockpilot.repository.ProductRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getOne(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    @PostMapping
    public ResponseEntity<Category> create(@Valid @RequestBody Category category) {
        log.info("Creating category: {}", category.getName());
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable Long id, @Valid @RequestBody Category request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        log.info("Updating category ID: {}", id);
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean hasProducts = productRepository.findAll().stream()
                .anyMatch(p -> p.getCategory() != null && p.getCategory().getId().equals(id));
        if (hasProducts) {
            throw new BadRequestException("Cannot delete category: products are assigned to it");
        }
        log.info("Deleting category ID: {}", id);
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
