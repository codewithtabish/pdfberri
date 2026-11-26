import { AboutHero } from "./about-hero-section";
import { AboutStory } from "./about-story";
import { AboutMission } from "./about-mission";
import { AboutValues } from "./about-values";
import { AboutFounder } from "./about-founder";
import { AboutSecure } from "./about-secure";
import { AboutTimeline } from "./about-timeline";
import { AboutCta } from "./about-cta";
import { AboutTeam } from "./about-team";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <div className="flex flex-col pb-16">
        <AboutStory />
        <AboutMission />
        <AboutValues />
        <AboutFounder />
        <AboutSecure />
        <AboutTimeline />
        <AboutTeam />
        <AboutCta />
      </div>
    </>
  );
}