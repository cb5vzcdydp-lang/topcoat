"""Normalize a reviewed official AU price/label research report; no network."""
import json,pathlib,sys
source=json.loads(pathlib.Path(sys.argv[1]).read_text());rows=[]
canonical=source if isinstance(source,list) else None
for product in ([] if canonical is not None else source['products']):
 pack=product['pack'];nutrition=product['nutrition'];amount=pack['edibleAmount'];reference=nutrition['referenceAmount'];role=product['role']
 if role=='protein':portions=[amount,amount*2,amount*3,amount*4]
 elif role=='ready-meal':portions=[amount]
 elif role=='carb':portions=[reference,amount,amount*1.5,amount*2]
 elif 'tortilla'in product['name'].lower():portions=[reference,reference*2,reference*3,reference*4]
 elif 'cracker'in product['name'].lower():portions=[20,30,40,60,90]
 elif 'peanut'in product['name'].lower():portions=[15,30,45,60]
 elif pack['unit']=='ml':portions=[250,375,500]
 elif 'bean'in product['name'].lower():portions=[100,150,200,300]
 else:portions=[100,150,200,250,300]
 assert nutrition['unit']==pack['unit'] and product['price']['currency']=='AUD'
 rows.append(dict(id=product['id'],name=product['name'],retailer=product['store'],packLabel=f"{pack['netAmount']:g} {pack['unit']}"+(f" pack · {amount:g} {pack['unit']} edible/drained"if amount!=pack['netAmount']else' pack'),unit=pack['unit'],packAmount=amount,referenceAmount=reference,priceCents=round(product['price']['amount']*100),**{key:nutrition[key]for key in ['calories','protein','carbs','fat']},portionAmounts=sorted(set(portions)),readyToEat=not product['requiresPreparation'],basis=pack['edibleBasis']+'; '+nutrition['calorieBasis'],checkedDate=product['price']['checkedAt'],sourceUrl=product['nutritionSourceUrl'],priceSourceUrl=product['price']['sourceUrl'],provenance='official',notes=(product['notes']+' '+product['price']['scope'])[:500]))
if canonical is not None:rows=canonical
existing=pathlib.Path('lib/supermarket-products.json')
merged={row['id']:row for row in json.loads(existing.read_text())} if existing.exists() else {}
for row in rows:
 assert all(key in row and row[key] is not None for key in ['id','name','retailer','packAmount','referenceAmount','priceCents','calories','protein','carbs','fat','checkedDate','sourceUrl','priceSourceUrl'])
 assert row['priceCents']>0 and row['packAmount']>0 and row['referenceAmount']>0
 merged[row['id']]=row
existing.write_text(json.dumps(list(merged.values()),indent=2,ensure_ascii=False)+'\n')
print('Merged',len(rows),'reviewed official label/price snapshots;',len(merged),'total. Run node tests/supermarket-review.mjs to validate.')
