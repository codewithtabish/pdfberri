import type { Metadata } from "next";
import HomeHero from "./hero-section";
import PopularTools from "./popular-tools";



export default function HomePage() {
  return (
    <>
      <HomeHero />
      <PopularTools/>
    </>
  );
}