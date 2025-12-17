package com.p_project.p_project_backend.exception;

import com.p_project.p_project_backend.entity.ErrorLog;
import com.p_project.p_project_backend.entity.User;
import com.p_project.p_project_backend.repository.ErrorLogRepository;
import com.p_project.p_project_backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 전역 예외 처리 핸들러
 */
@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler {

        private final ErrorLogRepository errorLogRepository;
        private final UserRepository userRepository;

        /**
         * 유효성 검사 예외 처리
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex,
                        HttpServletRequest request) {
                String errorMessage = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
                String errorCode = "VALIDATION_ERROR";

                logError(ex, ErrorLog.Level.WARN, errorCode, errorMessage, request);

                return ResponseEntity.badRequest().body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", errorMessage)));
        }

        /**
         * 자격 증명 오류 처리
         */
        @ExceptionHandler(InvalidCredentialsException.class)
        public ResponseEntity<?> handleInvalidCredentialsException(InvalidCredentialsException ex,
                        HttpServletRequest request) {
                String errorCode = "INVALID_CREDENTIALS";
                String message = "아이디 또는 비밀번호가 일치하지 않습니다.";

                logError(ex, ErrorLog.Level.WARN, errorCode, message, request);

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", message)));
        }

        /**
         * 인증 코드 불일치 처리
         */
        @ExceptionHandler(InvalidCodeException.class)
        public ResponseEntity<?> handleInvalidCodeException(InvalidCodeException ex, HttpServletRequest request) {
                String errorCode = "INVALID_CODE";
                String message = "인증 코드가 일치하지 않습니다";

                logError(ex, ErrorLog.Level.WARN, errorCode, message, request);

                return ResponseEntity.badRequest().body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", message)));
        }

        /**
         * 인증 코드 만료 처리
         */
        @ExceptionHandler(CodeExpiredException.class)
        public ResponseEntity<?> handleCodeExpiredException(CodeExpiredException ex, HttpServletRequest request) {
                String errorCode = "CODE_EXPIRED";
                String message = "인증 시간이 만료되었습니다. 재발송해주세요";

                logError(ex, ErrorLog.Level.WARN, errorCode, message, request);

                return ResponseEntity.badRequest().body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", message)));
        }

        /**
         * 비밀번호 불일치 처리
         */
        @ExceptionHandler(IncorrectPasswordException.class)
        public ResponseEntity<?> handleIncorrectPasswordException(IncorrectPasswordException ex,
                        HttpServletRequest request) {
                String errorCode = "INCORRECT_PASSWORD";
                String message = "현재 비밀번호가 일치하지 않습니다";

                logError(ex, ErrorLog.Level.WARN, errorCode, message, request);

                return ResponseEntity.badRequest().body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", message)));
        }

        /**
         * 관리자 미발견 예외 처리
         */
        @ExceptionHandler(AdminNotFoundException.class)
        public ResponseEntity<?> handleAdminNotFoundException(AdminNotFoundException ex, HttpServletRequest request) {
                String errorCode = "ADMIN_NOT_FOUND";

                logError(ex, ErrorLog.Level.WARN, errorCode, ex.getMessage(), request);

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", ex.getMessage())));
        }

        /**
         * 잘못된 인자 예외 처리
         */
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException ex,
                        HttpServletRequest request) {
                String errorCode = "INVALID_INPUT";

                logError(ex, ErrorLog.Level.WARN, errorCode, ex.getMessage(), request);

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", ex.getMessage())));
        }

        /**
         * 일기 미발견 예외 처리
         */
        @ExceptionHandler(DiaryNotFoundException.class)
        public ResponseEntity<?> handleDiaryNotFoundException(DiaryNotFoundException ex, HttpServletRequest request) {
                String errorCode = "DIARY_NOT_FOUND";

                logError(ex, ErrorLog.Level.WARN, errorCode, ex.getMessage(), request);

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", ex.getMessage())));
        }

        /**
         * 공지사항 미발견 예외 처리
         */
        @ExceptionHandler(NoticeNotFoundException.class)
        public ResponseEntity<?> handleNoticeNotFoundException(NoticeNotFoundException ex, HttpServletRequest request) {
                String errorCode = "NOTICE_NOT_FOUND";

                logError(ex, ErrorLog.Level.WARN, errorCode, ex.getMessage(), request);

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", ex.getMessage())));
        }

        /**
         * 런타임 예외 처리
         */
        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<?> handleRuntimeException(RuntimeException ex, HttpServletRequest request) {
                String errorCode = "INTERNAL_SERVER_ERROR";

                logError(ex, ErrorLog.Level.ERROR, errorCode, ex.getMessage(), request);

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", ex.getMessage())));
        }

        /**
         * 기타 예외 처리
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<?> handleException(Exception ex, HttpServletRequest request) {
                String errorCode = "INTERNAL_SERVER_ERROR";

                logError(ex, ErrorLog.Level.ERROR, errorCode, "An unexpected error occurred: " + ex.getMessage(),
                                request);

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                                Map.of("success", false, "error",
                                                Map.of("code", errorCode, "message", "An unexpected error occurred")));
        }

        // --- Helper Method ---
        /**
         * 에러 로그 DB 저장
         */
        private void logError(Exception ex, ErrorLog.Level level, String errorCode, String message,
                        HttpServletRequest request) {
                try {
                        User user = null;
                        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                                user = userRepository.findByEmail(email).orElse(null);
                        }

                        ErrorLog errorLog = ErrorLog.builder()
                                        .level(level)
                                        .message(message)
                                        .errorCode(errorCode)
                                        .endpoint(request.getRequestURI())
                                        .user(user)
                                        .stackTrace(getStackTrace(ex))
                                        .createdAt(LocalDateTime.now())
                                        .build();

                        errorLogRepository.save(errorLog);
                } catch (Exception e) {
                        log.error("Failed to save error log", e);
                }
        }

        private String getStackTrace(Exception e) {
                StringWriter sw = new StringWriter();
                PrintWriter pw = new PrintWriter(sw);
                e.printStackTrace(pw);
                return sw.toString();
        }
}
