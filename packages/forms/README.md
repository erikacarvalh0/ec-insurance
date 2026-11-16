# Insurance intake forms

Owned by the Portal & Forms team. Form schemas are product-specific and use progressive disclosure.

## Supported lines

- Auto: vehicle, main driver, intended use and garaging ZIP/CEP
- Residential: property characteristics, use, location and coverage
- Life: age, occupation and desired insured capital
- Health: beneficiaries, age bands, geography and desired coverage
- Business: company, activity, site and insured assets
- Travel: destinations, travel dates and travelers

## First RED tests

- Reject unsupported insurance products.
- Reject missing mandatory common contact details.
- Require fields only for the selected insurance line.
- Do not collect health details in generic contact steps.
- Preserve draft values while switching between steps.

Fixtures must contain fictional identities only. UI must offer privacy notices and accessible error messages.
