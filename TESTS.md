# TESTS.md

## How to run all tests
```bash
npm test
```

## Test files

### `tests/auditEngine.test.ts`
All tests cover the core audit engine in `/lib/auditEngine.ts`.

| # | Test name | What it covers |
|---|---|---|
| 1 | Solo user on Team plan gets downgrade recommendation | Cursor Business with 1 seat → recommends Pro, savings > 0, isOptimal = false |
| 2 | User on optimal plan gets no manufactured savings | GitHub Copilot Individual for solo coder → savings = 0, isOptimal = true |
| 3 | High spend triggers Credex CTA flag | OpenAI API $600 + Gemini Ultra $300 → showCredex = true, totalMonthlySavings > $500 |
| 4 | High API usage triggers model optimisation suggestion | Anthropic API $300/mo → recommends Haiku, savings > 0 |
| 5 | Edge case: zero spend and zero seats does not crash | Cursor Pro with $0 spend, 0 seats → no throw, valid result returned |
| 6 | Wrong tool for use case gets flagged | Windsurf Pro for Writing use case → isOptimal = false, savings > 0 |

## Running with coverage
```bash
npx vitest run --coverage
```