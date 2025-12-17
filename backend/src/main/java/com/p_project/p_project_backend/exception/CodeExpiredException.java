package com.p_project.p_project_backend.exception;

/**
 * 인증 코드가 만료되었을 때 발생하는 예외
 */
public class CodeExpiredException extends RuntimeException {
    public CodeExpiredException(String message) {
        super(message);
    }
}
