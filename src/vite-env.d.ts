
/// <reference types="vite/client" />

declare global {
  interface Window {
    katex?: {
      render: (tex: string, element: HTMLElement, options?: any) => void;
      renderToString: (tex: string, options?: any) => string;
    };
    renderMathInElement?: (element: HTMLElement, options?: any) => void;
  }
}

export {};
