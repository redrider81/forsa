/**
 * A database read failed. Thrown instead of returning an empty result, so a
 * technical fault is never mistaken for "no data" — an empty consent list
 * must not lift a restriction, and an empty client list must not turn into
 * "not found". The message is generic: it reaches error boundaries and logs,
 * never table contents or personal data.
 */
export class PortalDataError extends Error {
  constructor(source: string) {
    super(`CVB Base: database read failed (${source})`);
    this.name = "PortalDataError";
  }
}
