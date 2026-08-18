import { enDictionary } from "@/lib/i18n/dictionaries/en";
import { svDictionary } from "@/lib/i18n/dictionaries/sv";
import { defaultLocale, type Locale } from "@/lib/i18n/config";

export type Dictionary = {
  localeLabel: string;
  languageSwitcher: {
    ariaLabel: string;
    english: string;
    swedish: string;
    switchToEnglish: string;
    switchToSwedish: string;
  };
  nav: {
    mainAria: string;
    mobileAria: string;
    menuOpen: string;
    menuClose: string;
    home: string;
    coaching: string;
    about: string;
    contact: string;
    leadershipLabel: string;
    coachingLabel: string;
    startHereLabel: string;
    unsureTitle: string;
    unsureBody: string;
    bookFirstCall: string;
    login: string;
  };
  footer: {
    description: string;
    location: string;
    services: string;
    about: string;
    portal: string;
    login: string;
    copyright: string;
  };
  form: {
    generalError: string;
    emailError: string;
    fieldRequired: string;
    selectRequired: string;
    successMessage: string;
    submitError: string;
    ariaLabel: string;
    optional: string;
    sections: {
      contact: string;
      situation: string;
      nextStep: string;
    };
    fields: {
      name: string;
      organization: string;
      role: string;
      email: string;
      phone: string;
      city: string;
      question: string;
      phase: string;
      situation: string;
      clarity: string;
      timing: string;
    };
    submit: {
      idle: string;
      submitting: string;
    };
  };
};

export function getDictionary(locale: Locale): Dictionary {
  if (locale === "en") {
    return enDictionary;
  }

  return svDictionary;
}

export function getDictionaryForOptionalLocale(locale?: Locale): Dictionary {
  return getDictionary(locale ?? defaultLocale);
}
