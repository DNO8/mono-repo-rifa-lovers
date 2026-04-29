declare module 'react-google-recaptcha' {
  import { Component } from 'react';

  interface ReCAPTCHAProps {
    sitekey: string;
    onChange?: (token: string | null) => void;
    theme?: 'light' | 'dark';
    type?: 'image' | 'audio';
    tabindex?: number;
    onExpired?: () => void;
    onErrored?: () => void;
    stoken?: string;
    hl?: string;
    size?: 'compact' | 'normal' | 'invisible';
    badge?: 'bottomright' | 'bottomleft' | 'inline';
    isolated?: boolean;
  }

  export default class ReCAPTCHA extends Component<ReCAPTCHAProps> {
    reset(): void;
    execute(): void;
    getValue(): string | null;
    getWidgetId(): number;
  }
}
