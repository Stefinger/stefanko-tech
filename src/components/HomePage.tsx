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
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';

/**
 * The homepage, in one language.
 *
 * There is a single markup tree for both locales: the English and Czech routes
 * differ only in which locale they hand to this component. `getMessages` runs
 * on the server, so only the active dictionary is serialised to the client.
 */
export function HomePage({ locale }: { locale: Locale }) {
  return (
    <LocaleProvider locale={locale} messages={getMessages(locale)}>
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
    </LocaleProvider>
  );
}
