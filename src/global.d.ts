interface Grecaptcha {
  ready: (callback: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}
// eslint-disable-next-line no-var
declare var grecaptcha: Grecaptcha
