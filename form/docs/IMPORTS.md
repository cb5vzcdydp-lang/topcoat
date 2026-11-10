# Importing workout and nutrition history

Open **Import** in the app and choose a workout or nutrition export. CSV and JSON files are read in the browser and normalized records are sent to the selected profile after you review the preview. The original export file is not stored by Form.

Workout imports recognize date, session/workout name, exercise, set number or set count, reps, weight/load, and common unit fields. Per-set rows are grouped into dated sessions; nested JSON sets are supported. Exercise muscle groups are inferred where possible and otherwise marked **Other**.

Nutrition imports recognize date, food/item/meal name, calories or energy, protein, carbohydrates, and fat. Item rows become diary meals. Rows with daily totals but no food name become historical daily nutrition logs.

Exports vary between app versions. Use plain CSV or JSON with recognizable columns. Password-protected exports, ZIP files, spreadsheets, and direct account connections are not supported by this file importer. Use the preview to check the first records before importing. Re-imported workout and food rows use stable identifiers to avoid duplicate entries.

Saved meals belong to the signed-in account and can be reused across its profiles. Program templates are stored without a fixed count limit.
