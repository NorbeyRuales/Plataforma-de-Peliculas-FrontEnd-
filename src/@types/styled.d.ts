// src/@types/styled.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    name: 'light' | 'dark';
    colors: {
      // tokens base (presentes en light y dark)
      bg: string;
      surface: string;
      text: string;
      mutedText: string;
      primary: string;
      accent: string;
      border: string;
      shadow: string;

      // tokens extra (opcionales, típicos de dark)
      primaryHover?: string;
      primaryActive?: string;

      success?: string;
      successBg?: string;
      successBorder?: string;

      warning?: string;
      warningBg?: string;
      warningBorder?: string;

      danger?: string;
      dangerBg?: string;
      dangerBorder?: string;

      info?: string;
      infoBg?: string;
      infoBorder?: string;
    };
  }
}
