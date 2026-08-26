import type { Metadata } from "next";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerCards from "@/components/animations/StaggerCards";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";

export const metadata: Metadata = {
  title: "Carolina von Braun – coach i Göteborg | CVB Coaching",
  description:
    "Carolina von Braun driver CVB Coaching i Göteborg. Kommersiell bakgrund från kapitalmarknad och styrelsearbete, diplomerad coach vid Gothia Akademi.",
};

const t = svDictionary;

const principles = [
  "Konfidentialitet, utan undantag.",
  "Frågor före råd. Du äger dina slutsatser.",
  "Precision framför uppmuntran.",
  "Uppföljning tills något faktiskt har hänt.",
];

const audiences = [
  "Privatpersoner som står inför ett vägval, en förändring eller ett beslut som väger.",
  "Ledare och medarbetare som behöver tänka klart med någon utanför organisationen.",
  "Team och ledningsgrupper där ansvar, prioritering och beslut behöver skärpas.",
  "Organisationer som vill utveckla flera chefer inom ett gemensamt program.",
];

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen bg-zinc-100 text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-10 md:pt-16">

        <section className="relative overflow-hidden border-b border-zinc-300 pb-16 md:pb-20">
          <HeroReveal>
            <div data-hero-line className="mb-5 h-px w-10 bg-line-accent" />
            <p data-hero-label className="text-sm font-medium tracking-[0.12em] text-zinc-600">
              Om Carolina
            </p>
            <h1 data-hero-headline className="mt-6 max-w-3xl text-4xl font-medium leading-tight tracking-tight md:text-6xl">
              Personen du ska ha samtalen med.
            </h1>
            <p data-hero-body className="mt-8 max-w-3xl text-lg leading-8 text-zinc-700">
              Att välja coach är att välja vem man tänker högt inför. Här är vad du behöver veta om
              mig för att avgöra om det ska vara jag.
            </p>
          </HeroReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Varför CVB Coaching finns
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                De flesta av oss har människor omkring oss som vill väl. Färre har någon vars enda
                uppgift är att hjälpa oss tänka färdigt, utan att ha en åsikt om utgången.
              </p>
              <p>
                CVB Coaching finns för att göra den platsen tillgänglig — för den som kommer på egen
                hand och för den som kommer genom sitt arbete.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <div data-col-left className="md:col-span-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#92753a]">
                Coach
              </p>
              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-tight">
                Carolina von Braun
              </h2>
              <p className="mt-3 text-lg leading-8 text-zinc-600">CVB Coaching, Göteborg</p>
            </div>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                Jag är diplomerad coach och driver CVB Coaching i Göteborg. Jag arbetar med
                privatpersoner som står inför något som ska avgöras, och med ledare, team och
                ledningsgrupper genom deras arbetsgivare.
              </p>
              <p>
                Innan det var jag verksam på kapitalmarknaden med värdepappershandel på Nordea, och
                har haft fyra styrelseuppdrag inom fastighetsförvaltning och investeringar. Det har
                gett mig vana vid rum där konsekvenserna är verkliga och besluten inte går att
                skjuta upp — en vana som märks i samtalen, oavsett vem som sitter mitt emot.
              </p>
              <p>
                Jag studerade marknadsföring vid Handelshögskolan vid Göteborgs universitet
                1996–2002. År 2025 diplomerades jag i coachning vid Gothia Akademi, steg 1 och 2, och
                medverkar som utbildningsassistent i akademins ledarskapsutbildningar.
              </p>
              <p>
                Förhållningssättet är coachande, och det är en yrkesroll med tydliga gränser: du äger
                dina mål, dina insikter och dina beslut. Min uppgift är att göra tänkandet klarare,
                inte att leverera svaret.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Principer
            </h2>
            <StaggerCards data-col-right className="grid gap-4 md:col-span-7 md:grid-cols-2">
              {principles.map((item, index) => (
                <div data-card key={item} className="rounded-2xl border border-zinc-300 bg-white p-6 text-zinc-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <p className="text-xs tracking-[0.18em] text-zinc-500">{`0${index + 1}`}</p>
                  {item}
                </div>
              ))}
            </StaggerCards>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Konfidentialitet
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>Vad som sägs i samtalet behandlas konfidentiellt.</p>
              <p>
                När samtalen beställs av någon annan än deltagaren kommer vi överens om vad som
                återkopplas, innan arbetet börjar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <h2 className="text-3xl font-medium tracking-tight">Vilka jag arbetar med</h2>
          <ScrollReveal variant="staggerList" className="mt-8">
            <ul className="space-y-3 text-zinc-700">
              {audiences.map((item) => (
                <li key={item} data-list-item className="flex items-start gap-3 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </section>

        <section className="border-b border-zinc-300 py-16 md:py-20">
          <ScrollReveal variant="splitColumn" className="grid gap-10 md:grid-cols-12">
            <h2 data-col-left className="text-3xl font-medium leading-tight tracking-tight md:col-span-5">
              Göteborg, eller digitalt när det passar bättre
            </h2>
            <div data-col-right className="space-y-6 text-lg leading-8 text-zinc-700 md:col-span-7">
              <p>
                CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt, och var du
                befinner dig avgör inte om det fungerar.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className="py-16 md:py-20">
          <ScrollReveal variant="fadeUp">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-tight md:text-4xl">
              Nästa steg
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-700">
              Skriv några rader om vad du vill ta upp, och välj en tid som passar.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <CtaLink href="/kontakt" variant="primary">{t.cta.primary}</CtaLink>
            </div>
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
