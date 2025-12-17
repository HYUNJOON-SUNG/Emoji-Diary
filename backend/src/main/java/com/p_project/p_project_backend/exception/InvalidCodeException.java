package com.p_project.p_project_backend.exception;

/**
 * 인증 코드가 유효하지 않을 때 발생하는 예외
 */
public class InvalidCodeException extends RuntimeException {
    public InvalidCodeException(String message) {
        super(message);
    }
}
