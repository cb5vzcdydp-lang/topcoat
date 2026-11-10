# McSmart deals and Ultimate gym cell — 24 October 2026

Added six official AU small-drink portions and 54 fully specified McSmart configurations (48 Meal, six Saver). The catalogue now has 2,119 rows, including 2,116 restaurant portions. The Meal deals tab selects the named offer, burger, extra side and small drink. Browse/search and nearest-macro recommendations include the same configurations. Each complete deal includes its fixed small fries and never receives an additional automatic side. Calculated values sum the exact official component portions; no independently measured whole-deal nutrition is claimed.

Current official composition sources:
- https://www.mcdonalds.com/au/en-au/menu/value-bundle-meals/mcsmart-meal.html: a small Cheeseburger or Chicken ’n Cheese meal, plus 3 McNuggets, Hash Brown, Cookies or Apple Pie.
- https://www.mcdonalds.com/au/en-au/menu/value-bundle-meals/mcsmart-saver.html: small Hamburger meal plus 3 McNuggets.
- Small drink pages and their publicly referenced AU itemDetails nutrition responses, with exact per-serving size and values.

Prices and eligible availability vary by restaurant; the app does not place orders. McSmart Plus was found, but its McDouble nutrition was not retrievable and is not replaced with a Double Cheeseburger. KFC’s official Chris’ Big Bro Combo page confirms two Zinger fillets, bun, lettuce, no mayo and Pepsi Max. Its detailed macro panel could not be retrieved: live product pages require a store/order mode, the browser research tool timed out, and retrieved Oporto/Red Rooster product pages returned dummy placeholders. These dummy/partial values are not imported. No full current KFC/Oporto/Red Rooster/Grill’d catalogue was added or claimed in this update.

The seven-day no-leg-training badge is now **Ultimate gym cell**. Its visual override uses 100% gym / 0% grass and the gym character. This is derived from existing workout/skip history, so previous records require no migration. The seven-day condition, completed-set preservation and once-daily 1,000-point skip bonus are unchanged; actual completed direct leg training clears the badge.

Validation includes all component sums and deal permutations, side double-count prevention, source quantities, the badge’s actual rendered label/character/percentages, missing-history behavior and clearing after leg training. Existing account and diary persistence paths are retained.

---

# Australian menu expansion — 24 October 2026

The catalogue now contains **2,059 distinct reference portions**: **2,056 restaurant portions across 14 brands**, plus three previously verified Spudshed products. Seven KFC/Oporto records remain explicitly marked older community estimates; the other 2,052 catalogue records come from official published sources. This is an expansion of 698 accepted portions, not a claim to cover every Australian restaurant or every menu/customization.

## Newly imported official guides

| Brand | Accepted portions | Source and reference |
| --- | ---: | --- |
| Soul Origin | 277 | [September 2026 guide](https://cdn.shopify.com/s/files/1/0656/0507/5176/files/Sept2026Update-Nutritionals.pdf?v=1790576455), linked from the official [menu](https://www.soulorigin.com.au/collections); every readable complete row and size, excluding one inconsistent-weight croissant. |
| Betty’s Burgers | 80 | [Current guide](https://d39lx4ijfcfzcm.cloudfront.net/web-assets/9495f976adc9960c9d1f9a9690375937/nutritional-info.pdf), linked from [official nutrition](https://www.bettysburgers.com.au/nutritional-and-allergens); main, kids, breakfast, sides, sauces, shakes and drinks. Four substantially inconsistent-energy rows excluded. Wrapped names and mL portions retained. |
| Roll’d | 73 | [16 September 2026 guide](https://cdn.shopify.com/s/files/1/0979/1117/7508/files/Nitty_Gritty_-_September_2026_-_Sheet1.pdf?v=1790578701), linked from [official nutrition](https://rolld.com.au/pages/nutritional-dietary-allergen-information); per-serve values kept separate from per-100g columns. Soup cups and bowls remain distinct. Two inconsistent roast-duck rows and salad rows lacking an explicitly labelled total-fat column excluded. Section reference weights vary by dish, so no uniform weight is assumed. |
| Mad Mex | 175 | [Official calculator](https://www.madmex.com.au/nutritioncalculator/): 46 accepted component/side/dessert portions and 129 explicit default-base recipes with filling/salsa variants. Calculated recipes sum the calculator’s stated ingredient portions and identify those ingredients in their source description. One inconsistent regular Mexicali Mince ingredient and recipes requiring it are excluded. These are specific configurations, not all possible substitutions. |
| Sushi Hub | 93 | [Official product panels](https://www.sushihub.com.au/our-products/). Distinct published item/platter portions; source weight is unspecified. Platters remain sharing portions and do not become single-person recommendations. |

Published kilojoules are converted with kcal = kJ / 4.184. Calories are not replaced with a macro-derived number. Unpublished micronutrients remain absent. Suspicious sugar/saturated-fat values exceeding the corresponding total are omitted rather than corrected. Source URL, retrieval date and serving reference accompany every row. No US or New Zealand data is substituted for an Australian menu.

## Complete browsing and meal building

The previous screen exposed only the twelve best recommendations. **Browse menu** now exposes all imported restaurant rows with search, brand filters, pagination, and quantity controls, including sides, drinks, desserts and components. Users can combine their exact selections, review the total and explicitly save to a chosen diary meal. A failed save retains the review; a retry uses the same entry ID. Normal food search also includes these records and brand aliases.

**Best matches** still ranks closest to actual remaining calories/protein/carbs/fat first. It now considers two, three and four published portions for small Sushi Hub, Roll’d and pizza servings. Each quantity scales calories, macros, weight when known and only available micronutrients. A published pizza portion is never presented as an entire pizza. Other AI features, account storage and user colour settings are unchanged.

## Remaining coverage limits

Current official KFC pages returned a menu shell; Oporto/Red Rooster pages linked allergen-only documents and their public menu-data endpoints refused retrieval. No access restriction was bypassed. The older explicitly Australian KFC/Oporto community rows remain opt-in, not presented as current verified full menus. Grill’d’s published category/product links returned 404 during this retrieval. TGI Fridays, Pizza Hut, Chicken Treat and Schnitz did not expose complete readable AU macro tables in the retrieved pages. [Taco Bell Australia’s FAQ](https://tacobell.com.au/faq/) states that menu nutrition data is not currently available. These chains are disclosed in coverage instead of receiving fabricated macros. The app therefore **does not yet meet exhaustive all-Australian-menu coverage**.

## Reproducibility and checks

`python scripts/import-au-menu-guides.py <source-directory>` reads the retrieved PDF text and public calculator/product HTML without network or credentials. Raw source documents are kept outside app source/deployments. Stable IDs prevent duplicate imports. The importer rejects missing numeric macros, implausible mass and substantial energy inconsistencies.

Regression checks verify source examples, count/uniqueness, reference units, cup/bowl distinction, component exclusion, calculator recipes, strict/closest matching, multi-portion scaling and exact built-meal diary totals. Browser QA covers all five new brand filters, pagination/search, keyboard tabs, add/remove quantities, mobile and desktop layout, review, failed-save retry, duplicate prevention and persistence after refresh.

---

The following records the previous release and its existing workout/account changes.

# Australian food catalogue, fast-food picker and leg-day game

## Catalogue coverage (23 October 2026)

The additional catalogue contains **1,361 distinct servings: 1,354 from published official sources and seven explicitly labelled older community estimates**, with per-entry source URL, retrieval date and serving reference:

- Hungry Jack's Australia: **349** portions extracted from the nutrition PDFs linked at https://www.hungryjacks.com.au/nutrition-info. Kilojoules are converted to kcal using 4.184; per-serving macros remain the published values. One inconsistent syrup portion was excluded.
- McDonald's Australia: **178** distinct portions from the official AU menu pages and their public `/dnaapp/itemDetails?country=AU&language=en&showLiveData=true&item=…` nutrition responses. The importer followed 189 product pages; 181 had complete nutrient responses, including three duplicates removed. Eight bundles/unavailable items had no usable item response. This does not establish every size/customization is covered. https://www.mcdonalds.com/au/en-au/menu.html
- Zambrero Australia: **101** unambiguous main-meal/filling variants from the official July 2026 PDF, available through https://www.zambrero.com.au/allergens. Ambiguous multi-line/add-on tables were excluded; sauces are excluded wherever the source says without sauce. The readable macro columns were imported; unpublished/ambiguous micros remain unknown.
- Spudshed Waterford: **3** verified product panels (Harvey Fresh full-cream milk, Old El Paso Stand N Stuff tortillas and crispy chicken spice mix). Source URLs are stored on the rows. Full enumeration could not be retrieved: the main site returned 522 and direct shop sitemap/product requests returned 403. No access restrictions were bypassed. https://waterford.spudshed.com.au/
- KFC Australia: the retrieved official guide/product pages did not expose a complete readable macro table. Five explicitly Australian entries from the user-supplied MyFitnessPal import are available as older unverified community estimates, only after opting in. No US items or invented official values were substituted. https://www.kfc.com.au/nutrition-allergen
- TGI Fridays Australia: the Joondalup menu was retrieved but did not supply full macro values. US nutrition data was deliberately not substituted for AU dishes. https://www.tgifridays.com.au/menu/food/joondalup/

- Subway Australia: **171** published serving/component records from the May 2026 guide linked at https://www.subway.com/en-au/menunutrition/nutrition. Different 6-inch subs, regular/large wraps and salads, mini subs, breakfast, sides and components retain their distinct references. Per-100-g duplicate tables are not imported as meals. Components are searchable but do not become suggested whole meals.
- Guzman y Gomez: **293** complete serving rows from the October 2026 guide at https://www.guzmanygomez.com.au/nutrition/. Signed modification rows are excluded. Extras are stored as components, not main dishes.
- Domino's: **242** complete published crust/size portions at https://www.dominos.com.au/menu/nutritional-information/. A published pizza portion is not labelled as a whole pizza; each row retains its actual serving weight. All available parameter records are read, rather than just the displayed default crust.
- Nando's: **17** complete menu tables from pages linked at https://www.nandos.com.au/menu-item. The Great Pretender Protein table was excluded because the published 297 kcal versus its 4.6 g fat / 9.5 g carbohydrate / 17.4 g protein was materially inconsistent; no replacement numbers were guessed.
- Oporto: **two** explicitly Australian older entries from the uploaded MyFitnessPal dataset, behind the community-estimates opt-in. The current official menu returned placeholder products; those were not imported. https://www.oporto.com.au/nutrition-and-allergens/
- Grill'd, Red Rooster and Mad Mex: official sources were consulted and linked in the coverage panel, but no complete standard meal macro tables could be reliably retrieved. These have not been advertised as supported suggestion catalogues.

There are **nine restaurant brands** with some actual food records; this does not cover every Australian chain, independent shop, store-specific dish, size or customization. Community rows preserve their original imported names, have no invented micros, link to the source catalogue export, and retain their unverified provenance in diary notes and the nutrition reference. Source retrieval/import date is not the date those old community nutrition values were measured.

**This is partial catalogue coverage, not all requested catalogues.** The UI includes an explicit coverage/source disclosure. Stored rows contain factual nutrition and product names; no restaurant logos, proprietary description text or images are copied. Existing Open Food Facts attribution/licensing remains separate.

For reproducible imports, `scripts/import-au-chain-catalogue.py <source-directory>` consumes the retrieved Subway/GYG PDF text, Domino's HTML and Nando's HTML files. It makes no network requests, imports only complete numeric rows and deduplicates by stable ID. Raw website files stay outside the application and deployment archive.

Rows are available in normal Food search and the Restaurant filter. Maccas/Macca's, Hungry Jacks and Zambreros query aliases resolve to the branded entries. Source groups are interleaved so a large restaurant result set cannot hide common foods and remote results.

## I want fast food

Food → I want fast food uses actual diary consumption and configured targets for the selected day. It ranks supported main dishes and optional same-restaurant sides by normalized absolute distance from remaining kcal/protein/carbs/fat (energy weighted twice; denominators have a 100 kcal/10 g floor). The closest overall match is first and highlighted, even when it slightly exceeds a target; strict filtering still excludes all overshoots. Ranking updates with the selected day’s totals; no runtime AI or third-party request is needed. Users can filter by restaurant or restrict to every remaining target. Exceeded targets are explicitly shown on closest matches. Zero remaining calories shows an informative state, not fabricated fits. Serving contents, source links and macro totals are reviewed before an explicit diary save. Repeated presses and failed-save retries reuse a stable ID. Only the listed items are included, not unlisted drinks/sauces. Existing diary persistence and nutrition-reference scaling are reused.

## Skip legs for today

The workout logger skips unfinished directly targeted leg exercises, using existing catalogue muscle assignments. Leg muscles: quads, hamstrings, glutes, calves, adductors, abductors, tibialis and hip flexors. Completed and partially completed unilateral sets stay intact. Templates and saved history are unchanged. An explicit confirmation explains the effect. The skip record is saved successfully before session sets are removed; failures leave the session intact.

A client-scoped private `leg-skip` workspace record uses a stable client/date ID. The Home balance derives **1,000 Gym Cell game points once per day**, regardless of duplicate records/retries. The award is not a completed workout and does not enter muscle heatmaps or workout performance ranks. The bonus persists independently of the current draft; restoring skipped sets with session Undo does not award another bonus.

With at least seven calendar days of logged history, no completed direct leg working set in the inclusive selected date minus six days through selected date earns **Ultimate gym cell**, overriding the character balance even if skip bonuses exist. Missing history is neutral; warm-ups, future workouts and unfinished sets do not clear the badge. A newly logged completed working set (including an explicitly completed unilateral side) clears it. This is a game label based on logs, not a claim about unrecorded real-world exercise.

## Account/demo fix

A 401/403 during initial account loading now shows a sign-in screen rather than silently loading Jamie. The example remains available via an explicit Explore button. Successful account loading exits preview; unauthorized responses do not restore cached private data. Settings → Edit my profile name renames an owned personal profile with optimistic concurrency and preserves its ID/history. It cannot rename another account or a coach's assigned client profile. A friend's actual sign-in cannot be completed remotely on their behalf.

## Validation

`tests/fast-food-leg-day.mjs` validates all rows, published reference examples, macro ranking/strict matches, empty states, serving totals, muscle classification, preserved completion data, seven-day boundaries, missing/future history, capped bonus and record validation. `tests/food-search-api.mjs` verifies source balance and the branded aliases. `tests/roadmap-api.mjs` verifies bonus record retry persistence, cross-account rejection and personal-profile rename concurrency/access.

Browser checks cover review → save/retry → diary, normal catalogue search, mobile/desktop widths, skip cancellation/success, bonus persistence/Ultimate badge, and explicit demo versus signed-in account selection. Browser checks use account/API fixtures; public source research was performed against the actual published sites. Physical-device Safari testing was not available.
