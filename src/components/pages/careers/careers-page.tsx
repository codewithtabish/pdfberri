import { CareersHero } from "./careers-hero";
import { CareersWhy } from "./careers-why";
import { CareersHowWeWork } from "./careers-how-we-work";
import { CareersPositions } from "./careers-positions";
import { CareersProcess } from "./careers-process";
import { CareersNoRole } from "./careers-no-role";
import { CareersCta } from "./careers-cta";

export default function CareersPage() {
  return (
    <>
      <CareersHero />
      <div className="flex flex-col gap-16 pt-12 pb-16 sm:gap-20">
        <CareersWhy />
        <CareersHowWeWork />
        <CareersPositions />
        <CareersProcess />
        <CareersNoRole />
        <CareersCta />
      </div>
    </>
  );
}