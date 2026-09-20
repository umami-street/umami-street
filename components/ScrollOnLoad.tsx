"use client";
import { useEffect } from "react";

export default function ScrollOnLoad({ section }: { section: string }) {
  useEffect(() => {
    const el = document.getElementById(section);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 150);
    }
  }, [section]);
  return null;
}
