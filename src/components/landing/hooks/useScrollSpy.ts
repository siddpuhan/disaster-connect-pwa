"use client";
import { useState, useEffect, useRef } from "react";

export function useScrollSpy(
  sectionIds: string[],
  rootMargin = "-30% 0px -60% 0px"
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

        if (visible.size === 0) return;

        let current = sectionIds[0];
        for (const id of sectionIds) {
          if (visible.has(id)) {
            current = id;
          }
        }
        setActiveId(current);
      },
      { rootMargin, threshold: 0 }
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
