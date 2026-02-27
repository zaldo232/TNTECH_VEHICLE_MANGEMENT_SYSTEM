/**
 * @file        i18n.js
 * @description 시스템의 다국어 지원(한국어, 영어)을 위한 환경 설정 및 초기화 파일입니다.
 * 각 언어별 JSON 파일을 불러와 리액트 컴포넌트 내에서 t() 함수를 통해 변환된 텍스트를 출력합니다.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 언어별 번역 데이터(JSON) 로드
import translationKO from "./ko.json";
import translationEN from "./en.json";

/**
 * [번역 리소스 정의]
 * ko: 한국어 번역 파일 매핑
 * en: 영어 번역 파일 매핑
 */
const resources = {
  ko: { translation: translationKO },
  en: { translation: translationEN }
};

i18n
  .use(initReactI18next) // i18next를 리액트 환경에서 사용하도록 연결
  .init({
    resources,
    lng: "ko",          // 애플리케이션 시작 시 기본 언어 설정
    fallbackLng: "en",  // 현재 설정된 언어에 번역 키가 없을 경우 대체할 언어
    
    /**
     * [인터폴레이션 설정]
     * 번역 문구 내에 변수를 삽입할 때의 처리 방식
     */
    interpolation: {
      escapeValue: false // 리액트는 기본적으로 XSS 공격을 방지하므로 추가 이스케이핑 비활성화
    }
  });

export default i18n;