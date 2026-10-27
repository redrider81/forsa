import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import Image from "next/image";
import CtaLink from "@/components/cta-link";
import HeroReveal from "@/components/animations/HeroReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import JsonLd, { carolinaPersonSchema } from "@/components/json-ld";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";

export const metadata: Metadata = {
  alternates: pageAlternates("/om-oss", "sv"),
  title: "Carolina von Braun – coach i Göteborg | CVB Coaching",
  description:
    "Diplomerad professionell coach i Göteborg med erfarenhet från arbetsliv, ledarskap och företagande. Individuell coaching och företagscoaching.",
};

const t = svDictionary;

const DISPLAY =
  "font-serif text-[clamp(2.75rem,5.6vw,5.25rem)] font-medium leading-[1.12] tracking-[-0.04em]";
const DISPLAY_SM =
  "font-serif text-[clamp(2.125rem,4.2vw,3.5rem)] font-medium leading-[1.18] tracking-[-0.035em]";
const CHAPTER = "text-xs font-medium tabular-nums tracking-[0.32em]";
const CHAPTER_ON_LIGHT = `${CHAPTER} text-zinc-900`;
const CHAPTER_ON_DARK = `${CHAPTER} text-white`;
const BODY = "text-[1.0625rem] font-[450] leading-[1.75] text-zinc-600";
const BODY_STACK = `space-y-7 ${BODY}`;
/* Mörk yta: ljusare guld och zinc-300 för tillräcklig kontrast mot surface-dark. */
const LABEL_ON_DARK =
  "text-xs font-medium uppercase tracking-[0.16em] text-[#c2a46b]";
const BODY_STACK_ON_DARK = "space-y-7 text-[1.0625rem] font-[450] leading-[1.75] text-zinc-300";
const SECTION_STACK = "mt-32 md:mt-48";
const SECTION_GRID = "grid gap-14 md:grid-cols-12 md:gap-x-8 md:gap-y-16";

const audiences = [
  "Privatpersoner som vill utforska en förändring, ett vägval eller ett beslut i livet.",
  "Medarbetare och ledare som vill utvecklas i sin yrkesroll eller hantera utmaningar i arbetslivet.",
  "Människor med ansvar som vill få nya perspektiv på prioriteringar, relationer eller beslut.",
];

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#f4f3ef] text-zinc-900">
      <JsonLd data={carolinaPersonSchema} />

      {/* Hero */}
      <section className="px-6 pb-24 pt-32 md:px-10 md:pb-36 md:pt-44 lg:pb-40 lg:pt-52">
        <div className="mx-auto max-w-7xl">
          <HeroReveal>
            <h1
              data-hero-headline
              className={`max-w-[16ch] text-left ${DISPLAY} text-zinc-900 md:max-w-[18ch]`}
            >
              Personen du ska ha samtalen med.
            </h1>
            <p
              data-hero-body
              className={`mt-16 max-w-xl text-left md:mt-24 ${BODY}`}
            >
              Att välja coach är att välja vem man tänker högt inför. Här är vad du behöver veta om
              mig för att avgöra om det ska vara jag.
            </p>
          </HeroReveal>
        </div>
      </section>

      {/* Ljus yta */}
      <div className="pb-32 md:pb-52">
        <section className="mx-auto max-w-7xl px-6 md:px-10">
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Varför CVB Coaching finns
            </h2>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:pt-4`}>
              <p>
                I vardagen finns det ofta människor att prata med, men inte alltid någon som kan
                lyssna utan att vilja ge råd, komma med lösningar eller påverka vilket beslut du
                fattar.
              </p>
              <p>
                I coaching får du utrymme att utforska det som upptar dig, utmana dina egna tankar
                och upptäcka nya perspektiv. Det är det utrymmet jag vill skapa – både för dig som
                söker coaching på egen hand och för dig som kommer genom ditt arbete.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Mörk yta, samma som Carolina-akten på startsidan. */}
        <section className={`${SECTION_STACK} bg-surface-dark py-24 text-zinc-100 md:py-32 lg:py-40`}>
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <ScrollReveal variant="splitColumn" className={`${SECTION_GRID} md:items-stretch`}>
              <div data-col-left className="md:col-span-5">
                <p className={LABEL_ON_DARK}>Coach</p>
                <h2 className={`mt-6 ${DISPLAY_SM} text-white`}>Carolina von Braun</h2>
              </div>
              <figure className="relative mt-10 aspect-[4/5] w-full max-w-md overflow-hidden rounded-[1.25rem] md:col-span-5 md:row-start-2 md:mt-12 md:aspect-auto md:h-full md:min-h-[20rem] md:rounded-[1.75rem]">
                <Image
                  src="/carolina-von-braun.webp"
                  alt="Carolina von Braun, coach och grundare av CVB Coaching."
                  fill
                  sizes="(min-width: 768px) 20rem, 94vw"
                  className="object-cover object-[center_22%]"
                  quality={80}
                />
              </figure>
              <div
                data-col-right
                className={`${BODY_STACK_ON_DARK} md:col-span-6 md:col-start-7 md:row-start-2 md:mt-12 md:flex md:min-h-0 md:flex-col md:justify-between md:space-y-0 md:gap-8 lg:gap-10`}
              >
                <p>
                  Diplomerad professionell coach med närmare 20 års erfarenhet från arbetsliv, ledarskap
                  och företagande.
                </p>
                <p>
                  Jag driver CVB Coaching i Göteborg. Innan jag började arbeta som coach hade jag
                  säljande och ledande roller inom bank. Jag har också erfarenhet av eget företagande
                  inom finans och fastighet.
                </p>
                <p>
                  Min bakgrund har gett mig erfarenhet av arbetslivets villkor, ansvar och beslut och av
                  att människor kan behöva olika saker för att komma vidare. I dag möter jag både
                  privatpersoner och människor i arbetslivet i min roll som coach.
                </p>
                <p>
                  I våra samtal är jag nyfiken på hur du ser på din situation och vad som ligger bakom
                  dina tankar och val. Jag lyssnar, ställer frågor och utmanar när det behövs. Jag ger
                  dig inte färdiga svar, men hjälper dig att undersöka dina egna resonemang och komma
                  närmare det du vill förstå, besluta eller förändra.
                </p>
                <p>
                  Det är viktigt för mig att samtalen inte bara blir intressanta i stunden, utan också
                  hjälper dig vidare i det som är viktigt för dig.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Konfidentialitet
            </h2>
            <div data-col-right className={`${BODY_STACK} md:col-span-6 md:col-start-7 md:pt-4`}>
              <p>
                Våra coachingsamtal är konfidentiella. Det du delar med mig behandlas med respekt för
                din integritet och förs inte vidare utan ditt samtycke, annat än när det finns en
                rättslig skyldighet att lämna ut information.
              </p>
              <p>
                När ett företag bekostar coachingen är det viktigt att det finns tydlighet kring
                uppdragets ramar och vad som delas med uppdragsgivaren.
              </p>
            </div>
          </ScrollReveal>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-md ${DISPLAY_SM} text-zinc-900 md:col-span-5`}>
              Vilka kan ha nytta av coaching?
            </h2>
            <div data-col-right className="md:col-span-6 md:col-start-7 md:pt-8 lg:pt-12">
              <p className={`mb-8 ${BODY}`}>
                Jag möter både privatpersoner och människor i arbetslivet.
              </p>
              <ScrollReveal variant="staggerList">
                <ul className="divide-y divide-zinc-300 border-y border-zinc-300 text-[1.0625rem] font-[450] leading-[1.7] text-zinc-700">
                  {audiences.map((item) => (
                    <li key={item} data-list-item className="grid grid-cols-[1rem_1fr] gap-5 py-7 md:py-8">
                      <span className="mt-[0.72rem] h-1 w-1 shrink-0 bg-zinc-900" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </ScrollReveal>
        </section>

        <section className={`mx-auto ${SECTION_STACK} max-w-7xl px-6 md:px-10`}>
          <ScrollReveal variant="splitColumn" className={SECTION_GRID}>
            <h2 data-col-left className={`max-w-lg ${DISPLAY_SM} text-balance text-zinc-900 md:col-span-5`}>
              Göteborg, eller digitalt när det passar bättre
            </h2>
            <div data-col-right className={`md:col-span-6 md:col-start-7 md:pt-4 ${BODY}`}>
              <p>
                CVB Coaching finns i Göteborg. Samtalen hålls på plats eller digitalt, och var du
                befinner dig avgör inte om det fungerar.
              </p>
            </div>
          </ScrollReveal>
        </section>
      </div>

      {/* Avslut — samma mörka CTA-yta som startsidan */}
      <section className="bg-surface-dark py-28 text-zinc-100 md:py-36 lg:py-44">
        <ScrollReveal variant="ctaStack" className="mx-auto max-w-7xl px-6 md:px-10">
          <p className={CHAPTER_ON_DARK}>07</p>
          <h2 data-cta-heading className={`mt-10 max-w-3xl ${DISPLAY} text-white md:mt-14`}>
            Boka ett inledande samtal
          </h2>
          <div className="mt-14 grid gap-10 border-t border-white/20 pt-10 md:mt-20 md:grid-cols-12 md:gap-x-8 md:pt-12">
            <p data-cta-body className="max-w-xl text-[1.125rem] font-[450] leading-[1.75] text-zinc-300 md:col-span-5 md:col-start-7">
              Berätta kort vad du vill prata om och välj en tid. Du behöver inte ha formulerat allt.
              Samtalet är konfidentiellt.
            </p>
            <div data-cta-actions className="md:col-span-5 md:col-start-7">
              <CtaLink href="/kontakt" variant="secondary" translucent>
                {t.cta.primary}
              </CtaLink>
              <p className="mt-6 text-[0.875rem] leading-[1.6] text-zinc-400">
                Kort och kostnadsfritt. Inte en coachingsession. Inget åtagande.
              </p>
              <p className="mt-6 text-[0.875rem] leading-[1.6] text-zinc-400">
                Personlig coaching · Konfidentiella samtal · Göteborg eller digitalt
              </p>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
