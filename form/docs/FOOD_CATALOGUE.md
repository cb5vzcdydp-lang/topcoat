# Stored retailer products

`lib/retailer-foods.json` contains 158 products retrieved on 2026-10-19 from Open Food Facts, filtered to Coles or Woolworths brands sold in Australia and complete per-100g energy, protein, carbohydrate and fat records. Columns: name, brand, barcode, kcal, protein g, carbs g, fat g. Source for each record: `https://world.openfoodfacts.org/product/{barcode}`.

Open Food Facts database attribution: https://world.openfoodfacts.org — Open Database Licence (ODbL): https://opendatacommons.org/licenses/odbl/1-0/. The stored subset can be downloaded through `/api/food-catalogue`. These are community-maintained records, not official retailer feeds. Package labels should be checked; this subset is not the complete retailer catalogue. Missing micronutrients remain unknown.

Coles browse returned planned maintenance and Woolworths browse returned delivery controls without product nutrition during this update. No claim of full direct catalogue retrieval is made.
