package com.p_project.p_project_backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 데이터베이스 인덱스 초기화 설정
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseIndexInitializer {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 일기 내용 검색을 위한 Full-Text 인덱스 생성
     */
    @EventListener(ApplicationReadyEvent.class)
    @Order(1)
    public void createFulltextIndex() {
        try {
            // 1. 테이블 존재 확인
            String checkTableSql = """
                    SELECT COUNT(*)
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                      AND table_name = 'diaries'
                    """;

            Integer tableExists = jdbcTemplate.queryForObject(checkTableSql, Integer.class);

            if (tableExists == null || tableExists == 0) {
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

            Integer indexExists = jdbcTemplate.queryForObject(checkIndexSql, Integer.class);

            if (indexExists != null && indexExists > 0) {
                log.info("FULLTEXT 인덱스가 이미 존재합니다: idx_diaries_title_content");
                return;
            }

            // 3. FULLTEXT 인덱스 생성 (DDL은 JdbcTemplate으로 실행)
            String createIndexSql = """
                    CREATE FULLTEXT INDEX idx_diaries_title_content
                    ON diaries(title, content)
                    """;

            jdbcTemplate.execute(createIndexSql);
            log.info("FULLTEXT 인덱스 생성 완료: idx_diaries_title_content");

        } catch (Exception e) {
            log.error("FULLTEXT 인덱스 생성 중 오류 발생 (무시하고 계속 진행): {}",
                    e.getMessage());
        }
    }
}