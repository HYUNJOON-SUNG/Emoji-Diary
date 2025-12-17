

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@/shared/styles/index.css";

/**
 * 애플리케이션 진입점
 * - React 루트 렌더링
 * - 전역 스타일 로드
 */
createRoot(document.getElementById("root")!).render(<App />);
