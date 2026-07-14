---
name: nyc-address-assessment
description: Assess a specific NYC address as a candidate for our move — safety, rent/price value, neighborhood and commute quality, and landlord/building background (violations, ownership, complaint history). Use this whenever an NYC address, listing URL, or "should we move here / what do you think of this apartment" question comes up, even if the user only pastes an address with no other context. Produces a saved, comparable report in address-assessments/.
---

# NYC Address Assessment

Turn a bare address (or a listing link) into a decision-ready report across four
pillars: **Safety**, **Value**, **Location**, and **Landlord & Building**. The
point is to surface the stuff that's hard to notice on a walkthrough or in
listing photos — open HPD violations, who actually owns the building, whether
the rent is in line with comps, whether the block floods — before signing a
lease.

This skill relies on live web research (WebSearch/WebFetch). If those tools
aren't available in the current session, say so up front and offer to do a
best-effort pass with what you already know, clearly flagged as unverified.

## 1. Collect the essentials

Get, at minimum:
- The full address (street number, street, borough/neighborhood, zip if known)
- Asking rent or price, and unit size/bed-bath count if this is a specific listing
- A listing URL if there is one (StreetEasy/Zillow/etc. often name the
  building, management company, or amenities that save research time)

Don't stall on missing details — if the user only gives an address, proceed
with the research and note in the report whatever couldn't be checked without
a specific unit/price (e.g. value scoring needs an asking rent to compare
against).

## 2. Research each pillar

Read `references/data-sources.md` for the full list of NYC-specific portals,
search phrasings, and what each one is good for — don't guess at dataset
names or URLs from memory, since NYC Open Data resource IDs and portal URLs
shift over time. Below is the shape of what to look for in each pillar.

### Safety
- Precinct-level crime data (major felonies: robbery, burglary, assault,
  grand larceny) for the precinct covering this address, ideally with a
  recent trend (up/down vs. last year) not just a raw count.
- Cross-check against a couple of independent safety-score sources rather
  than trusting one site's proprietary number.
- 311 quality-of-life complaint density nearby (noise, illegal parking,
  homeless encampments) as a texture signal, separate from actual crime.
- Note anything specific to the block: proximity to a subway station
  entrance (mixed bag — convenient but can concentrate late-night activity),
  a park that's unlit at night, a strip with a lot of bars.

### Value
- Pull 3-6 comparable active or recently-closed listings (same neighborhood,
  similar bed count and square footage) and compute $/sqft or a plain rent
  comparison. Say explicitly whether this address is above, at, or below
  comps, and by roughly how much.
- Check rent-stabilization status if it's a rental — a stabilized unit at
  market-adjacent rent is a materially different deal than an unregulated one
  (protections on renewals and increases).
- Note what's included: heat/hot water, utilities, broker fee, parking. A
  "cheaper" apartment with a 15% broker fee or no utilities included can be
  the worse deal.
- If it's a purchase, sanity-check price against recent comparable sales
  (ACRIS or a listing site's sold history) and note property tax / common
  charges if visible.

### Location
- Transit: which subway lines/buses are within a reasonable walk, and
  roughly how long a commute to wherever the user actually needs to go
  (ask if unstated, or note the gap if you can't check).
- Walkability and daily-errand proximity: grocery, pharmacy, laundry.
- Flood zone status — this is a real and under-checked risk in NYC,
  especially post-Ida; check FEMA/NYC flood hazard mapping.
- Noise/environmental factors: elevated train lines, highway proximity,
  hospital with sirens, nightlife-heavy block.
- Parks, schools (if relevant to the user), and general neighborhood
  character — but keep this part brief; it's the most subjective pillar.

### Landlord & Building
This is usually the most valuable pillar because it's the hardest for a
prospective tenant to research on their own:
- Open violations on the building: HPD (housing maintenance code — flag any
  Class C "immediately hazardous" violations specifically) and DOB
  (structural/construction, stop-work orders).
- Who actually owns/manages the building — look past the LLC name to the
  registered owner/managing agent (HPD registration) and, if it takes more
  digging, the deed history (ACRIS). Landlords often hide behind
  building-specific LLCs.
- Landlord portfolio history — check tools like JustFix's "Who Owns What",
  the Public Advocate's Worst Landlords Watchlist, and Landlord Watchlist
  (landlordwatchlist.com/buildings, searchable directly by this address) for
  this owner or their portfolio; a landlord with a pattern of neglect across
  many buildings is a stronger signal than one-off violations.
- Certificate of Occupancy status and any illegal-conversion red flags
  (e.g. a "3-bedroom" that DOB records show as a legal 2-family).
- Eviction filings or heat/hot-water complaint patterns if discoverable.
- Search Reddit (r/AskNYC, r/nyc, r/nycapartments, plus a general search)
  for the building's address and, if known, its name and management
  company/landlord name. Tenant threads often surface things no official
  record does — noise, pests, management responsiveness, disputes over
  deposits. Treat individual anecdotes with appropriate skepticism (one
  angry ex-tenant isn't a pattern), but a recurring complaint across
  multiple threads is a real signal worth including.

If a source is unreachable or returns nothing for this address, say so in
the report rather than silently omitting the section — "no HPD violations
found" and "couldn't check HPD" are very different findings and both matter.

## 3. Score and synthesize

Give each pillar a letter grade (A–F) or a short qualitative call
(Great/Good/Fair/Poor) plus 2-4 bullet points of the concrete evidence
behind it — not just a number with no backing. Then give an overall
recommendation: **Go / Go with caveats / Pass**, with the one or two
things that would most change the picture (e.g. "worth it if rent drops
$150" or "pass unless you can confirm the C violations are closed").

Be direct about red flags. The goal is decision support, not a sales
pitch — if the landlord has a bad record or the price is off-market, say
so clearly rather than softening it into a footnote.

## 4. Save the report

Write the report to `address-assessments/<slug>.md` in this repo, where
`<slug>` is the address lowercased/hyphenated (e.g.
`address-assessments/145-w-86th-st-apt-4b.md`). Use this template:

```markdown
# <Address>

**Assessed:** <date>  |  **Asking:** <rent/price if known>  |  **Overall: <Go/Go with caveats/Pass>**

## Safety — <grade>
- ...

## Value — <grade>
- ...

## Location — <grade>
- ...

## Landlord & Building — <grade>
- ...

## Bottom line
<2-4 sentences: the recommendation and the one or two things that would change it>

## Sources checked
- <list what you actually queried, and note anything you couldn't check>
```

After writing the file, update `address-assessments/SUMMARY.md` — create it
if it doesn't exist — with one row per assessed address (address, overall
call, asking price, and the four pillar grades) so multiple candidates can
be compared side by side at a glance. Keep it sorted with the most recently
assessed address at the top.

Finally, tell the user the bottom line directly in the chat (don't make them
open the file to get the headline), and mention the file path in case they
want to compare it against other candidates later. Offer to render it as a
nicer visual report via the artifact tool if they'd find that useful for
comparing multiple addresses, but don't do it automatically.
