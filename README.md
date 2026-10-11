# Life Happens

A playful, story-driven game about how everyday money decisions compound over a lifetime.
Start at 22 with a first job, live month by month, handle life events, and try to keep up with your costs until age 80.

- **Play:** https://shubhamnov.github.io/Life-Happens/
- **Tests:** open `tests.html` from the same server (for example `python3 -m http.server`, then visit `http://localhost:8000/tests.html`). It loads `index.html?test=1&seed=N` in a hidden frame and runs the PRD scenario suite plus financial invariants. Same seed, same run.

Everything is a single static `index.html` (HTML, CSS, JS). No build step, backend, account or tracking.
Only the personal-best age and sound/speed preferences are kept in the browser's local storage.

## Code map (inside `index.html`)

The first script is the **model** (no DOM access); the second is the **UI**.

| Section | Responsibility |
|---|---|
| 1. Assumptions | Every number the game uses (`A`, `BASE_PRICES`) |
| 3. State | One authoritative state object per run; `newRun()` replaces it entirely |
| 4. Derived values | `monthlyBudget()`: the same function feeds the Monthly Expenses panel and settlement |
| 6. Settlement | `settleMonth()`: one pass per month, guarded by `lastSettledMonth` |
| 7. Transactions | `fundExpense()`, validated purchases; savings never go negative |
| 8. Events | Eligibility, choices that disclose effects, resolvers that apply once (event IDs) |
| 9. Lifecycle | `beginLife`, `advanceMonth`, `resolveEvent`, `endRun` (terminal state blocks all actions) |
| 10–11 | Optional choices (one per month) and Monthly Expenses changes with preview |
| 12 | End-of-run explanation built only from actual state and history |
| UI | Rendering is read-only; one interval clock per run (stale timers shut down), modals pause time |

## Decisions on the PRD's open questions (§22)

These are game assumptions, documented in code and in the in-game About panel.

1. **Investment returns:** about 7% a year on average, drawn monthly with volatility (about 3.5% per month), so negative months happen. Market-dip events (−8% to −22%) occur occasionally.
2. **Settlement order:** market move → income → living and fixed costs → vehicle EMI → debt interest and minimum repayment → (retired only) sell investments to cover the gap → anything still unpaid becomes unsecured debt.
3. **Inability to sustain expenses:** a month is *strained* if any bill, EMI or minimum debt repayment could not be paid. Six strained months **in a row** end the run; one fully paid month resets the count. Debt counts, so a large investment balance no longer hides runaway debt.
4. **Tax:** salary, bonus and costs are take-home amounts; investment gains are untaxed.
5. **Family costs:** marriage adds ₹6,000/month net shared-household cost (partner income not modelled). Children add ₹12,000 (first) and ₹9,000 (second) per month at age-22 prices, inflation-indexed, ending at age 21.
6. **Health cover:** ₹1,000/month premium (indexed); pays 65% of your own medical bills; not parents' bills.
7. **Retirement:** no pension. From 40 (prompted at 60), salary stops; investments are sold automatically when savings run short. This is disclosed when retiring.
8. **Event history:** kept per run for the end-of-run summary and list of major decisions.
9. **Save/resume:** not added; restart always starts a clean run.
10. **Tests:** seeded random generator (`?seed=`), a test API in `?test=1` mode, and `tests.html`.

Other model rules: 6% inflation applied at the start of each simulated year (costs are stored at age-22 prices and priced with that year's factor, so nothing is inflated twice); 5% annual raises plus a month-7 review raise; Career XP raises the *chance* of an extra promotion raise; unsecured debt at 1%/month with a minimum repayment of max(3%, ₹2,000 indexed); vehicle loans at 12%/year over 36 months (two-wheeler ₹1L ≈ ₹3,321 EMI, car ₹6L ≈ ₹19,929 EMI); a missed EMI becomes unsecured debt while the loan keeps amortising; selling a financed vehicle repays 80% of the remaining loan and the rest becomes debt; layoff = 1.5 months' severance plus 3 months without salary, then pay resumes at the previous level.

All values are illustrative. This is educational entertainment, not financial advice.
