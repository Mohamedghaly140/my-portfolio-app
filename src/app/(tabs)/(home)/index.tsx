import { AskMohamedCTA } from '@/components/ask-mohamed-cta';
import { Screen } from '@/components/ui';

import { AboutTeaser } from '@/features/home/components/about-teaser';
import { CTABanner } from '@/features/home/components/cta-banner';
import { FeaturedProjects } from '@/features/home/components/featured-projects';
import { HeroSection } from '@/features/home/components/hero-section';
import { LatestArticle } from '@/features/home/components/latest-article';
import { SkillsHighlight } from '@/features/home/components/skills-highlight';
import { StatsStrip } from '@/features/home/components/stats-strip';

export default function HomeScreen() {
  return (
    <Screen>
      <HeroSection />
      <StatsStrip />
      <FeaturedProjects />
      <LatestArticle />
      <SkillsHighlight />
      <AboutTeaser />
      <AskMohamedCTA variant="banner" />
      <CTABanner />
    </Screen>
  );
}
