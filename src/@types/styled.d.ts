/**
 * @file styled.d.ts
 * @description Module augmentation that defines the design tokens available through styled-components themes.
 */
import 'styled-components';

declare module 'styled-components' {
  /**
   * Shared contract between the light and dark themes exposed through styled-components.
   */
  export interface DefaultTheme {
    name: 'light' | 'dark';
    colors: {
      /** Base color tokens present in both themes. */
      bg: string;
      surface: string;
      text: string;
      mutedText: string;
      primary: string;
      accent: string;
      border: string;
      shadow: string;

      /** Optional interactive state tokens. */
      primaryHover?: string;
      primaryActive?: string;

      /** Optional semantic tokens used by feedback components. */
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
