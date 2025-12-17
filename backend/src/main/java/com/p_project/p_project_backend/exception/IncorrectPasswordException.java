package com.p_project.p_project_backend.exception;

/**
 * 비밀번호가 일치하지 않을 때 발생하는 예외
 */
public class IncorrectPasswordException extends RuntimeException {
    public IncorrectPasswordException(String message) {
        super(message);
    }
}
