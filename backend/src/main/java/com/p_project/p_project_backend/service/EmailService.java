package com.p_project.p_project_backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    public void sendVerificationCode(String to, String code) {
        String subject = "[Emoji Diary] 이메일 인증 코드";
        String content = "인증 코드: " + code + "\n\n5분 이내에 입력해주세요.";
        sendEmail(to, subject, content);
    }

    public void sendPasswordResetCode(String to, String code) {
        String subject = "[Emoji Diary] 비밀번호 재설정 인증 코드";
        String content = "인증 코드: " + code + "\n\n5분 이내에 입력해주세요.";
        sendEmail(to, subject, content);
    }

    private void sendEmail(String to, String subject, String content) {
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, false); // true for HTML
            javaMailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
