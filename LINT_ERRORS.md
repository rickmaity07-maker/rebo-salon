# Lint Errors Report - rebo-salon
Generated: 2026-08-08

## Summary
- **Total Errors:** 22
- **Total Warnings:** 18
- **Files with Errors:** 3

---

## Errors by File

### src/app/page.tsx (12 errors, 11 warnings)

| Line | Column | Severity | Rule | Message |
|------|--------|----------|------|---------|
| 14 | 18 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 36 | 59 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 240 | 29 | Error | react-hooks/set-state-in-effect | Calling setState synchronously within an effect can trigger cascading renders |
| 250 | 19 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 330 | 21 | Error | react/no-unescaped-entities | `"` can be escaped with `"`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 330 | 84 | Error | react/no-unescaped-entities | `"` can be escaped with `"`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 371 | 56 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 466 | 32 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 490 | 32 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 535 | 7 | Error | react-hooks/set-state-in-effect | Calling setState synchronously within an effect can trigger cascading renders |
| 582 | 14 | Error | react/no-unescaped-entities | `"` can be escaped with `"`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 582 | 32 | Error | react/no-unescaped-entities | `"` can be escaped with `"`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 758 | 42 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 888 | 21 | Error | prefer-const | `spanClass` is never reassigned. Use `const` instead |

**Warnings in page.tsx:**
- Line 3:67 - `Appointment` is defined but never used (@typescript-eslint/no-unused-vars)
- Line 183:9 - Using `<img>` could result in slower LCP (@next/next/no-img-element)
- Line 250:14 - `err` is defined but never used (@typescript-eslint/no-unused-vars)
- Line 330:21 - Unescaped entity (duplicate of error)
- Line 505:19 - Using `<img>` could result in slower LCP (@next/next/no-img-element)
- Line 505:19 - img elements must have an alt prop (jsx-a11y/alt-text)
- Line 579:9 - Using `<img>` could result in slower LCP (@next/next/no-img-element)
- Line 582:14 - Unescaped entity (duplicate of error)
- Line 832:21 - Using `<img>` could result in slower LCP (@next/next/no-img-element)
- Line 849:21 - Using `<img>` could result in slower LCP (@next/next/no-img-element)
- Line 849:21 - img elements must have an alt prop (jsx-a11y/alt-text)
- Line 861:15 - Using `<img>` could result in slower LCP (@next/next/no-img-element)
- Line 861:15 - img elements must have an alt prop (jsx-a11y/alt-text)
- Line 868:51 - `idx` is defined but never used (@typescript-eslint/no-unused-vars)
- Line 896:21 - Using `<img>` could result in slower LCP (@next/next/no-img-element)
- Line 896:21 - img elements must have an alt prop (jsx-a11y/alt-text)
- Line 914:21 - Using `<img>` could result in slower LCP (@next/next/no-img-element)
- Line 914:21 - img elements must have an alt prop (jsx-a11y/alt-text)

---

### src/context/AppContext.tsx (8 errors, 1 warning)

| Line | Column | Severity | Rule | Message |
|------|--------|----------|------|---------|
| 17 | 65 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 29 | 6 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 158 | 21 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 166 | 21 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 175 | 21 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 199 | 20 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |
| 217 | 20 | Warning | @typescript-eslint/no-unused-vars | `e` is defined but never used |

---

### src/app/api/email/route.ts (1 error)

| Line | Column | Severity | Rule | Message |
|------|--------|----------|------|---------|
| 28 | 19 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |

---

### src/app/api/sms/route.ts (1 error)

| Line | Column | Severity | Rule | Message |
|------|--------|----------|------|---------|
| 34 | 19 | Error | @typescript-eslint/no-explicit-any | Unexpected `any`. Specify a different type |

---

### src/app/layout.tsx (1 warning)

| Line | Column | Severity | Rule | Message |
|------|--------|----------|------|---------|
| 19 | 9 | Warning | @next/next/no-page-custom-font | Custom fonts not added in `pages/_document.js` will only load for a single page |

---

## Error Categories

| Category | Count |
|----------|-------|
| `@typescript-eslint/no-explicit-any` | 12 |
| `react-hooks/set-state-in-effect` | 2 |
| `react/no-unescaped-entities` | 4 |
| `prefer-const` | 1 |
| `@typescript-eslint/no-unused-vars` | 3 |
| `@next/next/no-img-element` | 7 |
| `jsx-a11y/alt-text` | 5 |
| `@next/next/no-page-custom-font` | 1 |

---

## Quick Fix Commands

```bash
# Auto-fix what can be fixed
npm run lint -- --fix

# Check specific file
npx eslint src/app/page.tsx
npx eslint src/context/AppContext.tsx
npx eslint src/app/api/email/route.ts
npx eslint src/app/api/sms/route.ts
```