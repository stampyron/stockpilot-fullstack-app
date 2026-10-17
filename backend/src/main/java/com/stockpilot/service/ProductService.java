package com.stockpilot.service;

import com.stockpilot.dto.ProductRequest;
import com.stockpilot.dto.ProductResponse;
import com.stockpilot.entity.Category;
import com.stockpilot.entity.Product;
import com.stockpilot.entity.Supplier;
import com.stockpilot.exception.BadRequestException;
import com.stockpilot.exception.ResourceNotFoundException;
import com.stockpilot.repository.CategoryRepository;
import com.stockpilot.repository.ProductRepository;
import com.stockpilot.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "name", "price", "quantity");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getProducts(String keyword, Long categoryId, String sortBy, String direction) {
        String safeSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "id";
        Sort sort = "asc".equalsIgnoreCase(direction)
                ? Sort.by(safeSortBy).ascending()
                : Sort.by(safeSortBy).descending();

        return productRepository.searchAndFilterProducts(keyword, categoryId, sort)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        log.info("Creating new product: {}", request.getName());
        Product product = new Product();
        applyRequestToEntity(product, request);
        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        log.info("Updating product ID {}: {}", id, request.getName());
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        applyRequestToEntity(product, request);
        return mapToResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        log.info("Deleting product ID: {}", id);
        productRepository.deleteById(id);
    }

    private void applyRequestToEntity(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setImageUrl(request.getImageUrl());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BadRequestException("Category not found"));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new BadRequestException("Supplier not found"));
            product.setSupplier(supplier);
        } else {
            product.setSupplier(null);
        }
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setQuantity(product.getQuantity());
        response.setImageUrl(product.getImageUrl());

        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }
        if (product.getSupplier() != null) {
            response.setSupplierId(product.getSupplier().getId());
            response.setSupplierName(product.getSupplier().getName());
        }
        return response;
    }
}
