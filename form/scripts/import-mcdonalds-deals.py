"""Import official small drink responses and current McSmart configurations.
Run with directory of {sourceUrl,response} itemDetails JSON files, retrieved from
public AU product pages. Never substitute a different burger or derive missing macros.
"""
import pathlib,json,sys,hashlib,collections
p=pathlib.Path('lib/au-food-catalogue.json');rows=json.loads(p.read_text());added=[]
for f in sorted(pathlib.Path(sys.argv[1]).glob('*.json')):
 data=json.loads(f.read_text());item=data['response']['item'];n={v['nutrient_name_id']:v for v in item.get('nutrient_facts',{}).get('nutrient',[])}
 if not all(k in n for k in ['energy_kcal','protein','carbohydrate','fat','primary_serving_size']):continue
 values={k:float(n[src]['value'])for k,src in [('calories','energy_kcal'),('protein','protein'),('carbs','carbohydrate'),('fat','fat')]};size=float(n['primary_serving_size']['value']);unit=n['primary_serving_size']['uom'];name=item.get('item_marketing_name') or item['item_name'];id='au-mcd-drink-'+str(item['id'])
 added.append(dict(id=id,name=name,brand="McDonald's",servingSize=f'{size:g} {unit}',servingGrams=size if unit=='g' else None,**values,nutrients={k:float(n[src]['value'])for k,src in [('sodium','sodium'),('sugars','sugars'),('saturatedFat','saturated_fat')]if src in n},source="McDonald's Australia · official item nutrition",sourceUrl=data['sourceUrl'],retrieved='2026-10-24',type='menu',category='Restaurant',mealRole='drink',verification='official'))
# Replace these known generated rows to make reruns deterministic and avoid duplicates.
rows=[r for r in rows if not r.get('deal') and not r['id'].startswith('au-mcd-drink-')]+added
byname={r['name']:r for r in rows if r['brand']=="McDonald's"}
fries=byname['Sml Fries'];drinks=added
configs=[('mcsmart-meal','McSmart Meal',['Cheeseburger','O/N Chicken N Cheese'],['3 Pc Chicken Mcnuggets','Hash Brown','Mcdonalds Cookies','O/N Hot Apple Pie']),('mcsmart-saver','McSmart Saver',['Hamburger'],['3 Pc Chicken Mcnuggets'])]
alias={'O/N Chicken N Cheese':"Chicken 'n Cheese",'3 Pc Chicken Mcnuggets':'3 McNuggets','Mcdonalds Cookies':'Cookies','O/N Hot Apple Pie':'Apple Pie','SML COKE':'Small Coca-Cola','SMALL FANTA® ORANGE':'Small Fanta','Sml Sparkling Water':'Small Sparkling Water'}
for key,title,mainNames,extras in configs:
 for mainName in mainNames:
  for extraName in extras:
   for drink in drinks:
    main=byname[mainName];extra=byname[extraName];parts=[main,fries,extra,drink];selection={'main':main['id'],'extra':extra['id'],'drink':drink['id']};id='au-deal-'+hashlib.sha256((key+json.dumps(selection,sort_keys=True)).encode()).hexdigest()[:16]
    name=title+' · '+alias.get(mainName,mainName)+' + '+alias.get(extraName,extraName)+' + '+alias.get(drink['name'],drink['name'])
    totals={k:sum(x[k]for x in parts)for k in ['calories','protein','carbs','fat']};nutrients={k:sum(x['nutrients'][k]for x in parts)for k in sorted(set.intersection(*(set(x['nutrients'])for x in parts)))}
    rows.append(dict(id=id,name=name[:120],brand="McDonald's",servingSize='1 configured small meal',servingGrams=None,**totals,nutrients=nutrients,source="McDonald's Australia · calculated sum of official portions: "+', '.join(x['name']+' ('+x['servingSize']+')'for x in parts),sourceUrl='https://www.mcdonalds.com/au/en-au/menu/value-bundle-meals/'+key+'.html',retrieved='2026-10-24',type='menu',category='Restaurant',mealRole='combo',verification='official',deal={'key':key,'title':title,'selection':selection,'contents':[x['id']for x in parts]}))
p.write_text(json.dumps(rows,indent=2)+'\n');print('Official small drinks',len(added),'configured McSmart meals',sum(1 for r in rows if r.get('deal')),'total catalogue',len(rows));print('Drinks',[r['name']for r in drinks])
