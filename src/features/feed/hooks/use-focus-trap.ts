import { useEffect, type RefObject } from "react";

export function useFocusTrap(containerRef: RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const element = containerRef.current;
    const selector = 'button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(element.querySelectorAll<HTMLElement>(selector));
    const timer = setTimeout(() => getFocusable()[0]?.focus(), 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = getFocusable();
      if (!elements.length) return;
      const [first, last] = [elements[0], elements[elements.length - 1]];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    element.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      element.removeEventListener("keydown", onKeyDown);
    };
  }, [active, containerRef]);
}
