package com.stockpilot.controller;

import com.stockpilot.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@Slf4j
public class UploadController {

    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/gif", "image/webp");

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPG, PNG, GIF or WEBP images are allowed");
        }

        File folder = new File(uploadDir).getAbsoluteFile();
        if (!folder.exists() && !folder.mkdirs()) {
            throw new IOException("Could not create upload directory: " + folder.getAbsolutePath());
        }

        String extension = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + extension;

        File destination = new File(folder, fileName);

        // Copy the stream explicitly - MultipartFile#transferTo with relative paths
        // can resolve against the servlet container temp directory instead of the working dir.
        try (InputStream in = file.getInputStream();
             OutputStream out = new FileOutputStream(destination)) {
            in.transferTo(out);
        }

        log.info("Uploaded file: {} ({} bytes) to {}", fileName, file.getSize(), destination.getAbsolutePath());

        return ResponseEntity.ok(Map.of("url", "/uploads/" + fileName));
    }
}
