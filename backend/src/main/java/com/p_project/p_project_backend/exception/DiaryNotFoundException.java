package com.p_project.p_project_backend.exception;

/**
 * 일기를 찾을 수 없을 때 발생하는 예외
 */
public class DiaryNotFoundException extends RuntimeException {
    public DiaryNotFoundException(String message) {
        super(message);
    }
}
