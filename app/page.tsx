import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DiscoverSection from "@/components/DiscoverSection";
import MenuSection from "@/components/MenuSection";
import GallerySection from "@/components/GallerySection";
import LocationSection from "@/components/LocationSection";
import BlogSection from "@/components/BlogSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
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
