package com.p_project.p_project_backend.exception;

/**
 * 공지사항을 찾을 수 없을 때 발생하는 예외
 */
public class NoticeNotFoundException extends RuntimeException {
    public NoticeNotFoundException(String message) {
        super(message);
    }
}
