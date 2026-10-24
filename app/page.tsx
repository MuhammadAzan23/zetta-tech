import Hero from "@/components/Hero";
import BrandTicker from "@/components/BrandTicker";
import ProductIndex from "@/components/ProductIndex";
import Process from "@/components/Process";
import RackSection from "@/components/RackSection";
import { Projects, Cities, FAQ, FaqSchema, CtaBand } from "@/components/Extras";

export default function Home() {
  return (
    <>
      <Hero />
      <BrandTicker />
      <ProductIndex />
      <Process />
      <RackSection />
      <Projects />
      <Cities />
      <FAQ />
      <FaqSchema />
      <CtaBand />
    </>
  );
}
