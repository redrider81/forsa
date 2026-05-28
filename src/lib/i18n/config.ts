export const locales = ["sv", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "sv";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function stripLocaleFromPath(pathname: string): string {
  if (!pathname.startsWith("/")) {
    return "/";
  }

  const segments = pathname.split("/");
  const maybeLocale = segments[1];

  if (isLocale(maybeLocale)) {
    const rest = `/${segments.slice(2).join("/")}`;
    return rest === "/" ? "/" : rest.replace(/\/+$/, "") || "/";
  }

  return pathname === "" ? "/" : pathname;
}

export function toLocalePath(pathname: string, locale: Locale): string {
  const barePath = stripLocaleFromPath(pathname);

  if (locale === defaultLocale) {
    return barePath;
  }

  return barePath === "/" ? `/${locale}` : `/${locale}${barePath}`;
}

export function localeFromPathname(pathname: string): Locale {
  const maybeLocale = pathname.split("/")[1];
  return isLocale(maybeLocale) ? maybeLocale : defaultLocale;
}
