# NYC data sources for address assessment

Portal URLs and dataset names on NYC Open Data shift occasionally — if a
direct link 404s, search the portal by the dataset name given here rather
than guessing at a new URL. Prefer official/government sources for facts
(violations, ownership, crime) and treat commercial sites (StreetEasy,
NeighborhoodScout, Walk Score) as convenience layers on top, not authorities.

## Safety

- **NYC Open Data — NYPD Complaint Data (Current YTD / Historic)**: search
  data.cityofnewyork.us for "NYPD Complaint Data Current Year To Date" and
  "NYPD Complaint Data Historic". Filter by precinct or lat/long radius
  around the address. Look at felony-level offenses, not just total
  complaints.
- **NYPD CompStat 2.0** (compstat.nypdonline.org) — precinct-level
  dashboards with year-over-year trend, easier to skim than raw Open Data.
- **NYC Open Data — 311 Service Requests** — search "311 Service Requests
  from 2010 to Present", filter to the address/zip for quality-of-life
  complaint density (noise, illegal parking, etc.).
- Secondary/cross-check sources: NeighborhoodScout, AreaVibes, Niche.com
  crime pages. These use proprietary scoring — fine as a sanity check, not
  as the primary evidence in the report.

## Value

- **StreetEasy, Zillow, Apartments.com, RentHop** — comps for rent or sale
  price by neighborhood, bed count, and sqft. StreetEasy often flags rent
  stabilization directly on NYC listings.
- **Rent stabilization lookup**: JustFix's "Am I Rent Stabilized" tool
  (whoownswhat.justfix.org has a stabilization tab per building) — cross-
  references DHCR registration data.
- **ACRIS** (a836-acris.nyc.gov, NYC Dept of Finance) — deed and mortgage
  history for sale-price sanity checks and to find the recorded owner entity.
- **NYC Dept of Finance property tax records** — search "NYC property tax
  bills" for the address to see assessed value and any tax abatements
  (421-a, J-51) that affect long-term cost/stability.

## Location

- **Google Maps / Citymapper** for actual transit times to wherever the
  user needs to commute; MTA's subway map for line coverage.
- **Walk Score** (walkscore.com) for a quick walkability number.
- **NYC Flood Hazard Mapper** (nyc.gov/site/planning/data-maps/flood-hazard-
  mapper.page) and **FEMA Flood Map Service Center** (msc.fema.gov/portal/
  search) — check flood zone designation, especially for basement/ground-
  floor units or anywhere near a waterway.
- **GreatSchools.org / InsideSchools.org** — school zone quality, if
  relevant to the user.
- NYC Parks (nycgovparks.org) for nearby green space.

## Landlord & Building

- **HPD Online** (hpdonline.nyc.gov) — search by address for open/closed
  Housing Maintenance Code violations. Class A (non-hazardous) vs Class B
  (hazardous) vs Class C (immediately hazardous, e.g. no heat/hot water,
  lead paint, mold) — Class C counts matter most.
- **DOB NOW / Building Information Search** (a810-dobnow.nyc.gov or DOB's
  building info search) — construction/structural violations, complaints,
  stop-work orders, and Certificate of Occupancy status (confirms legal
  unit count/use — catches illegal conversions).
- **HPD Property Registration** — find the registered owner and managing
  agent of record (via HPD Online's registration tab). Landlords frequently
  hide behind a building-specific LLC; this at least gets the officer/agent
  name on file.
- **JustFix "Who Owns What"** (whoownswhat.justfix.org) — links a building
  to the owner's broader portfolio, aggregates violations/complaints per
  unit across that portfolio, and often surfaces litigation history.
- **NYC Public Advocate's Worst Landlords Watchlist**
  (pubadvocate.nyc.gov/landlordwatchlist) — annual list of the most-cited
  landlords citywide; worth a direct name check.
- **Landlord Watchlist** (landlordwatchlist.com/buildings) — searchable by
  building address or landlord/owner name; surfaces HPD violation counts,
  associated LLCs/portfolio, and whether the owner has appeared on the
  Public Advocate's watchlist. Check this specifically by address, not just
  by owner name, since it's one of the few tools built for building-level
  lookup rather than owner-level lookup.
- **ACRIS** — for deed/ownership chain when HPD registration data is thin
  or the LLC ownership needs tracing further back.
- **NYC Open Data — DOB Violations / DOB Complaints Received** — if the
  DOB portal UI is unreliable, the raw Open Data tables cover the same
  data and can be filtered by BIN (Building Identification Number, look
  this up via the address first).
