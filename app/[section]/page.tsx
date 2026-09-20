export const runtime = "edge";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DiscoverSection from "@/components/DiscoverSection";
import MenuSection from "@/components/MenuSection";
import GallerySection from "@/components/GallerySection";
import LocationSection from "@/components/LocationSection";
import BlogSection from "@/components/BlogSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ScrollOnLoad from "@/components/ScrollOnLoad";
import { notFound } from "next/navigation";

const VALID_SECTIONS = ["hero", "about", "menu", "gallery", "blog", "contact", "order"];

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!VALID_SECTIONS.includes(section)) notFound();

  return (
    <>
      <Navbar />
      <ScrollOnLoad section={section} />
      <main>
        <HeroSection />
        <DiscoverSection />
        <MenuSection />
        <GallerySection />
        <LocationSection />
        <BlogSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
