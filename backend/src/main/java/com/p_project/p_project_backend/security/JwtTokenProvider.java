package com.p_project.p_project_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long accessTokenValidityInMilliseconds,
            @Value("${jwt.refresh-expiration}") long refreshTokenValidityInMilliseconds) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenValidityInMilliseconds = accessTokenValidityInMilliseconds;
        this.refreshTokenValidityInMilliseconds = refreshTokenValidityInMilliseconds;
    }

    public String createAccessToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return createToken(userDetails.getUsername(), accessTokenValidityInMilliseconds);
    }

    public String createRefreshToken(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return createToken(userDetails.getUsername(), refreshTokenValidityInMilliseconds);
    }

    public String createAccessToken(String email) {
        return createToken(email, accessTokenValidityInMilliseconds);
    }

    public String createRefreshToken(String email) {
        return createToken(email, refreshTokenValidityInMilliseconds);
    }

    private String createToken(String subject, long validityInMilliseconds) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);

        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    /**
     * 만료된 토큰에서도 이메일 추출 (로그아웃 등에서 사용)
     * 잘못된 토큰의 경우 null 반환
     */
    public String getEmailFromTokenEvenIfExpired(String token) {
        try {
            return getEmailFromToken(token);
        } catch (ExpiredJwtException e) {
            // 만료된 토큰이어도 클레임에서 이메일 추출 가능
            return e.getClaims().getSubject();
        } catch (JwtException | IllegalArgumentException e) {
            // 잘못된 형식의 토큰은 null 반환
            log.warn("Invalid JWT token format: {}", e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.info("Invalid JWT signature.");
        } catch (ExpiredJwtException e) {
            log.info("Expired JWT token.");
        } catch (UnsupportedJwtException e) {
            log.info("Unsupported JWT token.");
        } catch (IllegalArgumentException e) {
            log.info("JWT token compact of handler are invalid.");
        }
        return false;
    }
}
