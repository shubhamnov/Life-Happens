# Life Happens

A playful race through life about how everyday money decisions compound over a lifetime.
Start at 23 with a first job and ride (by bus, Metro, scooter or car) down a road toward the finish line at 80: payday coins, birthday flags, a "?" block whenever life happens, a pit stop every 5 years, and an original kart-style chiptune soundtrack.

**The goal:** keep three life rings healthy (🧍 Me, 👨‍👩‍👧 Family & Friends, 🏘️ Community) without running out of money. Money is the fuel, not the score.

- **Play:** https://shubhamnov.github.io/Life-Happens/
- **Tests:** open `tests.html` from the same server (for example `python3 -m http.server`, then visit `http://localhost:8000/tests.html`). It loads `index.html?test=1&seed=N` in a hidden frame and runs the PRD scenario suite plus financial invariants. Same seed, same run.

Everything is a single static `index.html` (HTML, CSS, JS). No build step, backend, account or tracking. Fonts load from Google Fonts; everything else is inline.
Only the best Life Score and sound/speed preferences are kept in the browser's local storage.

## Code map (inside `index.html`)

The first script is the **model** (no DOM access); the second is the **UI**.

| Section | Responsibility |
|---|---|
| 1. Assumptions | Every number the game uses (`A`, `BASE_PRICES`) |
| 3. State | One authoritative state object per run; `newRun()` replaces it entirely |
| 4. Derived values | `monthlyBudget()`: the same function feeds the Monthly Expenses panel and settlement |
| 5b. Life rings | `ringDrivers()` / `ringTargets()`: what fills or drains each ring; `tickRings()` once a month; `RING_FX` one-off bumps per event choice; `lifeEnding()` titles |
| 6. Settlement | `settleMonth()`: one pass per month, guarded by `lastSettledMonth` |
| 7. Transactions | `fundExpense()`, validated purchases; savings never go negative |
| 8. Events | 35+ random events (trips, festivals, scams, startups, accidents, divorce, layoffs…) plus scheduled life stages (marriage, kids, births, school, ageing parents). Choices disclose effects; resolvers apply once (event IDs) |
| 9. Lifecycle | `beginLife`, `advanceMonth`, `resolveEvent`, `endRun` (terminal state blocks all actions). `blockingEvent()`: only "stop" events pause the race; cards (`CARD_DEFAULTS`) wait on the track |
| 10 | Power-ups, one per month: One-time (including ring power-ups: a day with your people, volunteering, donating), Monthly (health cover, parents' cover, term cover…), and Big buys (two-wheeler; car as hatchback, 7-seater or SUV; home as society flat, villa or flat near family; on a loan with a bank check). Also the Pace setting |
| 10c. Pit stops | Every 5 years: `pitReport()` (rings, lap points, one line about the lap, one tip) and `applyPitChoices()` for pace, lifestyle and SIP in one go; `pitPreview()` shows the effect first |
| 11 | Monthly SIP (free to change) |
| 12 | Monthly Plan changes with preview |
| 13 | End-of-run explanation built only from actual state and history |
| UI | Rendering is read-only; one interval clock per run (stale timers shut down), modals pause time |
| Race | Canvas road scene. One month = a fixed stretch of road, so it moves with game time and stops when paused |
| Sound | Original chiptune and effects made with the Web Audio API (no audio files) |

## Decisions on the PRD's open questions (§22)

These are game assumptions, documented in code and in the in-game About panel.

1. **Investment returns:** about 7% a year on average, drawn monthly with volatility (about 3.5% per month), so negative months happen. Market-dip events (−8% to −22%) occur occasionally.
2. **Settlement order:** market move → income → living and fixed costs → vehicle and home EMIs → debt interest and minimum repayment → (retired only) sell investments to cover the gap → anything still unpaid becomes unsecured debt → monthly SIP if everything was paid.
3. **Inability to sustain expenses:** when savings run out, investments are sold automatically (working or retired) to pay bills, EMIs and debt repayments, and a one-time expense paid from savings spills into investments before any debt. A month is *strained* only if something still could not be paid after both were used. Six strained months **in a row** end the run; one fully paid month resets the count.
4. **Tax:** salary is before tax. Income tax follows India's new regime for FY 2025-26, simplified (₹75,000 standard deduction, slabs from 0% to 30%, no tax up to ₹12 lakh taxable with marginal relief, 4% cess), with slabs indexed to in-game inflation. Bonuses are after tax; investment gains are untaxed.
5. **Family:** life stages follow fixed windows. Marriage is asked at 23–24 (yes, not sure, no); weddings happen from 25 and never after 38. Kids (0, 1 or 2) are discussed 1–2 years after the wedding, the second arrives 2–4 years after the first, and no births happen after 40. The spouse does not earn: their living costs are ₹9,000/month. Children cost ₹9,000 (first) and ₹7,000 (second) per month until 21, plus school fees until 18 (government, private or international, chosen at 4). Parents need support from your mid-40s. All at age-23 prices, inflation-indexed.
6. **Insurance:** health cover (chosen at the start) pays 65% of eligible bills for everyone on the policy; the premium grows with a spouse and children and a little with age, and parents are an optional add-on. Term cover (₹1 crore in today's money, until 65) has a premium locked at purchase, so buying young is cheapest; its disability benefit pays 20% of the cover if an accident stops you working for a year. The player never dies.
7. **Retirement:** no pension. From 40 (prompted at 60), salary stops; as at any age, investments are sold automatically when savings run short. This is disclosed when retiring.
8. **Event history:** kept per run for the end-of-run summary and list of major decisions.
9. **Save/resume:** not added; restart always starts a clean run.
10. **Tests:** seeded random generator (`?seed=`), a test API in `?test=1` mode, and `tests.html`.
11. **Life rings and score:** each ring (0–100) moves 4% a month toward a target set by how you live: food, extras and social life, home and ride, savings cushion and debt, marriage, kids, pets, parents, pace and life stage. Event choices add one-off bumps that fade, so people need regular attention. Each month adds up to 10 points to the Life Score, 60% from the weakest ring and 40% from the average. The ending title comes from lifetime ring averages (55+ healthy, under 40 low): Full Life Legend, Home Is Where the Heart Is, Corner Office Empty House, Gave Everything Kept Nothing, People Person, Steady Cruiser, or Lived Fast Ran Out of Fuel if the money runs out.
12. **Big buys trade the rings:** a society flat (₹35L at age-23 prices; Community +12) is social but not showy; an independent villa (₹63L; Me +16, Community −4) has the most show-off value; a flat near family (₹29.75L; Family & Friends +12) is cheapest. Cars: hatchback (₹6L), 7-seater (₹10L; Family & Friends +6) or big SUV (₹15L; Me +8, most show-off value). Show-off value is shown but scores nothing.
13. **Pace:** Hustle gives +1% raises and 1.5× promotion odds but drains the rings (Me −8, Family & Friends −12, Community −6); Chill gives −1% and 0.6× and fills them (+6, +8, +5). On Hustle with a low Family & Friends ring, the game offers to slow down (at most every 5 years). A Me ring under 35 for 9 months brings burnout (at most every 3 years): an unpaid 2-month break, a switch to Chill, or pushing through.
14. **Fewer interruptions:** only big life moments stop the race: marriage, kids, births, school, parents, health scares, accidents, layoffs, divorce, a startup offer, burnout, missing your family, retirement. About 35 small surprises per life (repairs, trips, sales, bonuses, market moves, festivals…) slide onto the track as cards while the race keeps going. You get about 8 seconds to tap (12 for the first two cards); otherwise the cautious default marked on the card happens and the journal notes it. A card still pending after 4 game months (at high speeds) takes its default too.
15. **Pit stops:** every 5 years (ages 28, 33 … 78, so 11 per life) the race stops for a lap report: how each ring moved, points scored, one line built from what happened (promotions, layoffs, tight months, ring changes) and one tip. On the same screen: pace, lifestyle (food and social life one step simpler or fancier together) and SIP (start or raise by about 30% of what is left over, or pause). Changes apply from the next month.

Other model rules: 6% inflation applied at the start of each simulated year (costs are stored at age-23 prices and priced with that year's factor, so nothing is inflated twice); a month-7 review raise, then a yearly appraisal of 11% to 28, 8.5% to 35, 6.5% to 45 and 4.5% after; promotions (at most every 2 years) are bigger and more likely early on (+27% before 28, +20% to 35, +12% to 45, then +6.5%; odds 12% + 6% per Career XP, scaled down with age); an optional education loan at the start (₹8 lakh at 10% over 8 years, ≈₹12,100 EMI) raises the first salary by 25%; your own vehicle adds fuel (₹2,500/month two-wheeler, ₹8,000 car) on top of upkeep; a monthly SIP is invested after bills and skipped, without counting as strain, when cash is short; home loans at 8.5% over 20 years with 20% down + 7% fees, and a bank check that all EMIs stay within 50% of pay; events arrive every 12–20 months, with random openers so no two lives start alike; unsecured debt at 1%/month with a minimum repayment of max(3%, ₹2,000 indexed); vehicle loans at 12%/year over 36 months (two-wheeler ₹1L ≈ ₹3,321 EMI, car ₹6L ≈ ₹19,929 EMI); new loans need all EMIs, including the education loan, within 50% of take-home pay; a missed EMI becomes unsecured debt while the loan keeps amortising; selling a financed vehicle repays 80% of the remaining loan and the rest becomes debt; layoff severance = 1 month's notice pay + 15 days' pay per completed year in the job (capped at 12 months), then 3 months without salary or a 20% lower-paid role.

All values are illustrative. This is educational entertainment, not financial advice.
