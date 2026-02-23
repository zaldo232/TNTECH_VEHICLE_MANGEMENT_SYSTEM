import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 분리한 JSON 파일 import
import translationKO from "./ko.json";
import translationEN from "./en.json";

const resources = {
  ko: { translation: translationKO },
  en: { translation: translationEN }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ko", // 기본 언어
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // 리액트는 이미 xss 방지를 하므로 false
    }
  });

export default i18n;