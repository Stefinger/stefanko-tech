import { BlobJourneyRoot } from '@/components/blob/BlobJourneyRoot';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { UncertaintySection } from '@/components/sections/UncertaintySection';
import { ClaritySection } from '@/components/sections/ClaritySection';
import { DecisionsSection } from '@/components/sections/DecisionsSection';
import { BuildSection } from '@/components/sections/BuildSection';
import { ProofSection } from '@/components/sections/ProofSection';
import { FinalCtaSection } from '@/components/sections/FinalCtaSection';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <BlobJourneyRoot>
      <Navbar />
      <main>
        <HeroSection />
        <UncertaintySection />
        <ClaritySection />
        <DecisionsSection />
        <BuildSection />
        <ProofSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </BlobJourneyRoot>
  );
}
