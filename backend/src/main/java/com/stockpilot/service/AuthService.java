package com.stockpilot.service;

import com.stockpilot.dto.AuthResponse;
import com.stockpilot.dto.LoginRequest;
import com.stockpilot.dto.RegisterRequest;
import com.stockpilot.entity.User;
import com.stockpilot.exception.BadRequestException;
import com.stockpilot.repository.UserRepository;
import com.stockpilot.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ADMIN");
        userRepository.save(user);

        log.info("Registered new user: {}", request.getEmail());

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse("Registration successful", token, user.getName(), user.getEmail(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        log.info("User logged in: {}", request.getEmail());

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse("Login successful", token, user.getName(), user.getEmail(), user.getRole());
    }
}
