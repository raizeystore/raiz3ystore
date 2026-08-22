# RAIZ3Y — Vercel / React Best Practices

Use for all Next.js and React implementation work.

## Performance rules
- Prefer Server Components by default; use Client Components only where browser interactivity is required.
- Avoid sequential data-fetch waterfalls; parallelize independent server work.
- Keep client bundles small and avoid shipping server-only logic or secrets.
- Use dynamic imports for genuinely heavy optional client features.
- Avoid unnecessary context providers and broad rerenders.
- Keep images optimized and sized; avoid layout shift.
- Use caching intentionally and never cache user-specific authenticated responses incorrectly.
- Keep third-party scripts minimal and defer non-critical work.
- Measure before adding complexity; protect Core Web Vitals.

## Code quality
- Keep components focused and typed.
- Separate domain logic, data access, and UI.
- Do not use client-side authorization as a security boundary.
