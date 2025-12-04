package com.p_project.p_project_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return ResponseEntity.badRequest().body(
                Map.of("success", false, "error", Map.of("code", "VALIDATION_ERROR", "message", errorMessage)));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<?> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("success", false, "error",
                        Map.of("code", "INVALID_CREDENTIALS", "message", ex.getMessage())));
    }

    @ExceptionHandler(AdminNotFoundException.class)
    public ResponseEntity<?> handleAdminNotFoundException(AdminNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("success", false, "error",
                        Map.of("code", "ADMIN_NOT_FOUND", "message", ex.getMessage())));
    }
}
