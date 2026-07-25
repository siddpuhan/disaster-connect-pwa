"use client";
import { useState, useEffect, useRef } from "react";

export function useScrollSpy(
  sectionIds: string[],
  rootMargin = "-40% 0px -50% 0px"
): string {
  const [activeId, setActiveId] = useState(sectionIds[0]);
  const visibleRef = useRef(new Set<string>());

  useEffect(() => {
    const visible = visibleRef.current;
    visible.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            visible.add(e.target.id);
          } else {
            visible.delete(e.target.id);
          }
        });

        let current = sectionIds[0];
        for (const id of sectionIds) {
          if (visible.has(id)) {
            current = id;
          }
        }
        setActiveId(current);
      },
      { rootMargin, threshold: 0.05 }
    );

    const elements: HTMLElement[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds.join(","), rootMargin]);

  return activeId;
}
