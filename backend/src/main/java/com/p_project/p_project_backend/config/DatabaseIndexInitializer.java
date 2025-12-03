package com.p_project.p_project_backend.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseIndexInitializer {

    @PersistenceContext
    private EntityManager entityManager;

    @EventListener(ApplicationReadyEvent.class)
    @Order(1) // 다른 초기화보다 먼저 실행
    public void createFulltextIndex() {
        try {
            // 1. 테이블 존재 확인
            String checkTableSql = """
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_schema = DATABASE() 
                  AND table_name = 'diaries'
                """;
            
            Long tableExists = ((Number) entityManager.createNativeQuery(checkTableSql)
                .getSingleResult()).longValue();
            
            if (tableExists == 0) {
                log.warn("diaries 테이블이 아직 생성되지 않았습니다. 인덱스 생성을 건너뜁니다.");
                return;
            }

            // 2. 인덱스 존재 확인
            String checkIndexSql = """
                SELECT COUNT(*) 
                FROM information_schema.statistics 
                WHERE table_schema = DATABASE() 
                  AND table_name = 'diaries' 
                  AND index_name = 'idx_diaries_title_content'
                """;
            
            Long indexExists = ((Number) entityManager.createNativeQuery(checkIndexSql)
                .getSingleResult()).longValue();
            
            if (indexExists > 0) {
                log.info("FULLTEXT 인덱스가 이미 존재합니다: idx_diaries_title_content");
                return;
            }

            // 3. FULLTEXT 인덱스 생성
            String createIndexSql = """
                CREATE FULLTEXT INDEX idx_diaries_title_content 
                ON diaries(title, content)
                """;
            
            entityManager.createNativeQuery(createIndexSql).executeUpdate();
            log.info("FULLTEXT 인덱스 생성 완료: idx_diaries_title_content");
            
        } catch (Exception e) {
            // 인덱스가 이미 존재하거나 다른 오류 발생 시
            // 애플리케이션 시작을 막지 않도록 에러만 로깅
            log.error("FULLTEXT 인덱스 생성 중 오류 발생 (무시하고 계속 진행): {}", 
                     e.getMessage());
            // 에러를 다시 던지지 않아서 애플리케이션 시작은 계속됨
        }
    }
}

