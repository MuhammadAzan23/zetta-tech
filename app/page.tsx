import Hero from "@/components/Hero";
import BrandTicker from "@/components/BrandTicker";
import Testimonials from "@/components/Testimonials";
import ProductIndex from "@/components/ProductIndex";
import Process from "@/components/Process";
import RackSection from "@/components/RackSection";
import { Projects, Cities, FAQ, FaqSchema, CtaBand } from "@/components/Extras";
import { catalogBrands } from "@/lib/catalog";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandTicker brands={catalogBrands} />
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
