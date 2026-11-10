import additionalFoods from '@/lib/au-food-catalogue.json';
import rows from '@/lib/retailer-foods.json';
export async function GET(){return Response.json({source:'Open Food Facts',licence:'ODbL-1.0',sourceUrl:'https://world.openfoodfacts.org',retrieved:'2026-10-19',additionalCatalogue:{source:'Published Australian menus and user-supplied community entries; see per-row provenance',licence:'Source-specific; not covered by the Open Food Facts ODbL grant',foods:additionalFoods},columns:['name','brand','barcode','kcal100g','protein100g','carbs100g','fat100g'],rows});}
