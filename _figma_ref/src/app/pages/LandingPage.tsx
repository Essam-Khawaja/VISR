import { Link } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { HeroIllustration } from "../components/HeroIllustration";
import { Target, Map, Sparkles } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5EFDF" }}>
      <Navigation />

      <section className="w-full pt-12 pb-0">
        <div className="max-w-[980px] mx-auto px-6 text-center">
          <h1
            className="text-[56px] tracking-tight leading-[1.1] mb-2"
            style={{ color: "#1d1d1f" }}
          >
            Constellation
          </h1>

          <p
            className="text-[28px] tracking-tight mb-6"
            style={{
              fontFamily: 'ui-serif, Georgia, serif',
              fontWeight: 300,
              color: "#6e6e73"
            }}
          >
            You tell us what, we tell you how.
          </p>

          <div className="flex items-center justify-center gap-6 mb-16">
            <Link
              to="/how-it-works"
              style={{
                fontFamily: '"Nunito", sans-serif',
                fontSize: 17,
                fontWeight: 600,
                color: "#7A6E62",
                textDecoration: "none",
              }}
            >
              Learn more ›
            </Link>
            <Link
              to="/onboarding"
              style={{
                fontFamily: '"Nunito", sans-serif',
                fontSize: 17,
                fontWeight: 700,
                color: "white",
                backgroundColor: "#9B8FBF",
                textDecoration: "none",
                borderRadius: 999,
                padding: "12px 28px",
              }}
            >
              Get started
            </Link>
          </div>

          <div
            className="relative w-full rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #0a1612 0%, #1a2520 100%)",
              padding: "60px 40px"
            }}
          >
            <HeroIllustration />
          </div>
        </div>
      </section>

      <section className="w-full py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#933B5B]/10 flex items-center justify-center">
                <Target className="w-8 h-8" style={{ color: "#933B5B" }} />
              </div>
              <h3 className="text-[24px] mb-2" style={{ color: "#1d1d1f" }}>
                Goal-first planning
              </h3>
              <p className="text-[17px] leading-relaxed" style={{ color: "#6e6e73" }}>
                Start with where you want to go. We'll map the steps to get you there.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#AABAAE]/10 flex items-center justify-center">
                <Map className="w-8 h-8" style={{ color: "#AABAAE" }} />
              </div>
              <h3 className="text-[24px] mb-2" style={{ color: "#1d1d1f" }}>
                Visual roadmaps
              </h3>
              <p className="text-[17px] leading-relaxed" style={{ color: "#6e6e73" }}>
                See your entire degree as an orbital map. Navigate with clarity and purpose.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#B5728A]/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8" style={{ color: "#B5728A" }} />
              </div>
              <h3 className="text-[24px] mb-2" style={{ color: "#1d1d1f" }}>
                Designed for you
              </h3>
              <p className="text-[17px] leading-relaxed" style={{ color: "#6e6e73" }}>
                Every constellation is unique. Build a plan that reflects your priorities.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
