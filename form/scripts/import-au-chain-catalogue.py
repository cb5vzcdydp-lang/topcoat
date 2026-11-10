"""Import retrieved public AU nutrition documents. No network or credentials.
Usage: python3 scripts/import-au-chain-catalogue.py /path/to/source-folder
Inputs: subway.pdf.txt, gyg-oct.pdf.txt, dominos.html, nandos/*.html.
Only complete readable numerical serving rows are accepted. See docs/FAST_FOOD_AND_LEG_DAYS.md.
"""
import sys,re,json,html,hashlib,pathlib,collections
root=pathlib.Path(sys.argv[1]);destination=pathlib.Path('lib/au-food-catalogue.json');rows=json.loads(destination.read_text());added=[]
def add(name,brand,size,grams,values,nutrients,url,role='main',note=''):
 if brand=="Nando's" and values[0]>0 and abs(values[0]-(values[1]*4+values[2]*4+values[3]*9))>max(100,values[0]*.35):return
 if len(values)!=4 or any(not isinstance(n,(int,float)) or n<0 for n in values) or values[0]>10000 or (grams and sum(values[1:])>grams*1.15):return
 id='au-menu-'+hashlib.sha256((brand+name+size).encode()).hexdigest()[:16]
 added.append(dict(id=id,name=name[:120],brand=brand,servingSize=size[:60],servingGrams=grams,calories=values[0],protein=values[1],carbs=values[2],fat=values[3],nutrients=nutrients,source=brand+' Australia · official nutrition'+note,sourceUrl=url,retrieved='2026-10-23',type='menu',category='Restaurant',mealRole=role,verification='official'))
# Subway: only Per Serve rows, with explicitly named sandwich/wrap/salad configuration.
url='https://media.subway.com/dam/urn:aaid:aem:07679edc-a6f3-424c-a167-f7864b20da6e/original/as/AUS%20Nutritional%20Web%20Guide%20May%202026.pdf'
section='6-inch sub';title=''
for line in (root/'subway.pdf.txt').read_text().splitlines():
 l=line.strip()
 if 'AVG QTY Per 100g' in l:break
 if l.startswith('Subway 6-Inch') and 'Subs' in l:section='6-inch sub'
 elif l.startswith('Wraps (on regular'):section='Regular wrap'
 elif l.startswith('Wraps (on large'):section='Large wrap'
 elif l.startswith('Salads (regular'):section='Regular salad'
 elif l.startswith('Salads (large'):section='Large salad'
 elif l=='Breakfast Wraps':section='Breakfast wrap'
 elif l=='Mini Subs':section='Mini sub'
 elif l=='Sides & Snacks':section='Side'
 elif l=='Cookies':section='Cookie'
 elif l=='Breads' or l.startswith('Meat, Poultry') or l.startswith('Amount on') or l.startswith('Cheese') or l.startswith('Sauces') or l.startswith('Vegetables'):section='Component'
 c=re.split(r'\s{2,}',l)
 try:a=[float(v.replace(',','')) for v in c[-10:]] if len(c)>=10 else []
 except:a=[]
 if len(a)==10:
  grams,kj,kcal,protein,fat,sat,carbs,sugars,fibre,sodium=a
  name=title if len(c)==10 or c[0].startswith('(') else c[0]
  if name and grams>0:
   role='component' if section=='Component' else 'side' if section=='Side' else 'dessert' if section=='Cookie' else 'main'
   add(f'{section} · {name}','Subway',f'1 {section.lower()} ({grams:g} g)',grams,[kcal,protein,carbs,fat],dict(saturatedFat=sat,sugars=sugars,fibre=fibre,sodium=sodium),url,role,' · May 2026')
  title='';continue
 if l and len(l)<80 and not l.startswith(('(','AVG','Double','values','Subway 6-Inch','Serving','Energy','Protein','Fat,','Sat.','Carb.','Sugars','Dietary','Sodium','AUSTRALIA','May 2026')) and '(' not in l and ')' not in l and not re.match(r'^\d',l):title=l
# GYG: standard portions only; adjustments with signed numbers are excluded.
url='https://www.guzmanygomez.com.au/wp-content/uploads/2026/10/261008_NUTRITION_ALLERGEN_GUIDE_420X297MM.pdf';section='';pending=False
for line in (root/'gyg-oct.pdf.txt').read_text().splitlines():
 if 'SERVE SIZE' in line and 'ENERGY' in line:pending=True;continue
 if pending and line[:50].strip():section=line[:50].strip();pending=False
 c=re.split(r'\s{2,}',line.strip())
 if len(c)!=11 or not section:continue
 try:a=[float(v.replace(',','')) for v in c[1:]]
 except:continue
 grams,kj,kcal,protein,fat,sat,carbs,sugar,fibre,sodium=a
 if grams<=0 or re.search(r'swap|for spicy|remove',c[0],re.I):continue
 role='component' if re.search(r'extras|sauce|filling',section,re.I) else 'side' if re.search(r'fries|sides',section,re.I) else 'dessert' if re.search(r'churro|dessert',section,re.I) else 'main'
 add(f'{section.title()} · {c[0]}','Guzman y Gomez',f'1 menu serving ({grams:g} g)',grams,[kcal,protein,carbs,fat],dict(saturatedFat=sat,sugars=sugar,fibre=fibre,sodium=sodium),url,role,' · October 2026')
# Domino's: read every supplied crust/size record, not just the displayed default.
s=(root/'dominos.html').read_text();cards=list(re.finditer(r'<div class="card"[^>]+data-productservinginfo="([^"]*)"[^>]*>',s))
for i,match in enumerate(cards):
 block=s[match.end():cards[i+1].start() if i+1<len(cards) else len(s)]
 nameMatch=re.search(r'class="product-card-heading">(.*?)</div>',block,re.S)
 if not nameMatch:continue
 name=html.unescape(re.sub('<[^>]+>','',nameMatch[1])).strip();params={}
 for pid,label in re.findall(r'<span id="[^"]*-serving-parameter-([^"]+)" class="serving-info-name">(.*?)</span>',block):params[pid]=html.unescape(label.strip())
 data=json.loads(html.unescape(match[1]));variants={}
 for raw in re.findall(r"data-servinginfo='([^']+)'",block):
  item=json.loads(html.unescape(raw));variants[item['Id']]=item['Name']
 for vid,variant in variants.items():
  n={params[v['ServingParameterId']]:v['Value'] for v in data if v['ServingId']==vid and v['ServingParameterId'] in params}
  try:grams=float(n['Serving Size']);values=[float(n[k]) for k in ['Energy (Calories)','Protein','Carbohydrate','Fat - Total']]
  except:continue
  nutrients={key:float(n[src]) for key,src in [('saturatedFat','Fat - Sat'),('sugars','Sugars'),('sodium','Sodium')] if src in n and re.match(r'^\d*\.?\d+$',n[src])}
  pizza='Servings per pizza' in block;role='main' if pizza else 'drink' if re.search('shake|cola|pepsi|water|sunkist',name,re.I) else 'dessert' if re.search('brownie|sundae|choc|ice cream',name,re.I) else 'side'
  add(('Pizza · ' if pizza else '')+name+(' · '+variant if variant else ''),"Domino's",f'1 published portion ({grams:g} g)',grams,values,nutrients,'https://www.dominos.com.au/menu/nutritional-information/',role)
# Nando's: actual HTML tables, with no generated food data.
for path in (root/'nandos').glob('*.html'):
 s=path.read_text();m=re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',s,re.S)
 if not m:continue
 title=json.loads(m[1]).get('props',{}).get('pageProps',{}).get('title');n={}
 if not title:continue
 for table in re.findall(r'<table\b.*?</table>',s,re.S):
  cells=[html.unescape(re.sub('<[^>]+>','',v)).strip() for v in re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>',table,re.S)]
  for k,v in zip(cells[::2],cells[1::2]):
   val=re.match(r'^([\d,.]+)',v)
   if val and (k!='Energy' or 'kcal' in v.lower()):n[k]=float(val[1].replace(',',''))
 if not all(k in n for k in ['Energy','Total Fat','Total Carb','Protein']):continue
 grams=n.get('Weight');role='side' if re.search('chips|halloumi sticks|broccoli',title,re.I) else 'main'
 add(title,"Nando's",f'1 menu serving'+(f' ({grams:g} g)' if grams else ''),grams,[n['Energy'],n['Protein'],n['Total Carb'],n['Total Fat']],{k:n[v] for k,v in [('saturatedFat','Saturated Fat'),('sugars','Sugar'),('sodium','Sodium')] if v in n},'https://www.nandos.com.au/menu-item/'+path.stem,role)
seen={row['id'] for row in rows};new=[]
for row in added:
 if row['id'] not in seen:rows.append(row);new.append(row);seen.add(row['id'])
destination.write_text(json.dumps(rows,indent=2)+'\n');print('Added:',dict(collections.Counter(row['brand'] for row in new)));print('Total:',len(rows))
