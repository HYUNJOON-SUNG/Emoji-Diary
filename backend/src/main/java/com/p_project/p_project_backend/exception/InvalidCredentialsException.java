package com.p_project.p_project_backend.exception;

/**
 * 자격 증명이 유효하지 않을 때 발생하는 예외
 */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
