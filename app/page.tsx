import Hero from "@/components/Hero";
import BrandLogos from "@/components/BrandLogos";
import FeaturedCatalog from "@/components/FeaturedCatalog";
import Testimonials from "@/components/Testimonials";
import ProductIndex from "@/components/ProductIndex";
import Process from "@/components/Process";
import RackSection from "@/components/RackSection";
import { Projects, Cities, FAQ, FaqSchema, CtaBand } from "@/components/Extras";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandLogos />
      <FeaturedCatalog />
      <ProductIndex />
      <Process />
      <Testimonials />
      <RackSection />
      <Projects />
      <Cities />
      <FAQ />
      <FaqSchema />
      <CtaBand />
    </>
  );
}
