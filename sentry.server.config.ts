import * as Sentry from "@sentry/nextjs";

const PUBLIC_SENTRY_DSN = "https://901df7042fdba7a82728a99929c21355@o4511954068504576.ingest.us.sentry.io/4511955816087552";
const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN ?? PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  sendDefaultPii: false,
  tracesSampleRate: 0.1,
});
