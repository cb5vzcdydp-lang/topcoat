"""Reproducible import of official AU guides retrieved 24 October 2026.
Inputs (no network): soul.pdf.txt, bettys.pdf.txt, rolld.pdf.txt, madmex.html,
sushi.html. Retain raw guides separately from the app. Never infer missing macros.
"""
import re,json,pathlib,hashlib,sys,html,collections
from html.parser import HTMLParser
root=pathlib.Path(sys.argv[1]);dest=pathlib.Path('lib/au-food-catalogue.json');rows=[r for r in json.loads(dest.read_text()) if r['brand'] not in ['Soul Origin',"Betty's Burgers","Roll'd",'Mad Mex','Sushi Hub']];new=[];rejected=[]
def add(brand,name,size,kj,p,c,f,url,role='main',grams=None,nutrients=None,note=''):
 vals=[kj,p,c,f]
 if any(not isinstance(x,(float,int))or x<0 for x in vals) or kj>60000 or max(p,c,f)>2000 or not name.strip():rejected.append((brand,name,'bounds'));return
 kcal=kj/4.184;macro=4*p+4*c+9*f
 if kcal>0 and abs(kcal-macro)>max(100,kcal*.4):rejected.append((brand,name,'inconsistent energy'));return
 if grams and p+c+f>grams*1.12:rejected.append((brand,name,'inconsistent weight'));return
 nutrients=nutrients or {};nutrients={k:v for k,v in nutrients.items() if isinstance(v,(int,float))and v>=0 and (k=='sodium' or v<= (grams or 1000)) and (k!='sugars' or v<=c+.1) and (k!='saturatedFat' or v<=f+.1)}
 id='au-menu-'+hashlib.sha256((brand+name+size).encode()).hexdigest()[:16]
 new.append(dict(id=id,name=name[:120],brand=brand,servingSize=size[:60],servingGrams=grams,calories=round(kcal,6),protein=p,carbs=c,fat=f,nutrients=nutrients,source=brand+' Australia · official nutrition'+note,sourceUrl=url,retrieved='2026-10-24',type='menu',category='Restaurant',mealRole=role,verification='official'))
# Soul Origin: one per-serving table, every published size, not per-100g rows.
url='https://cdn.shopify.com/s/files/1/0656/0507/5176/files/Sept2026Update-Nutritionals.pdf?v=1790576455';previous=''
for line in (root/'soul.pdf.txt').read_text().splitlines():
 cells=re.split(r'\s{2,}',line.strip())
 try:a=[float(v.replace(',',''))for v in cells[-8:]] if len(cells)>=9 else []
 except:a=[]
 if len(a)==8:
  grams,kj,p,f,sat,c,sugar,sodium=a;prefix=cells[:-8]
  if len(prefix)==1:name=previous;size=prefix[0]
  else:name=' '.join(prefix[:-1]);size=prefix[-1]
  role='drink' if re.search(r'oz|ml',size,re.I) or re.search(r'latte|coffee|matcha|tea|frappe|red bull|fruit blend|iced',name,re.I) else 'dessert' if re.search(r'cake|muffin|cookie|brownie|slice|banana bread',name,re.I) else 'component' if re.search(r'^(chilli mayo|lime mayo|balsamic|lemon olive|habanero)',name,re.I) else 'main'
  add('Soul Origin',name+' · '+size,f'1 {size.lower()} serving ({grams:g} g)',kj,p,c,f,url,role,grams,dict(saturatedFat=sat,sugars=sugar,sodium=sodium),' · September 2026');continue
 if line.strip() and not re.search(r'nutritional|information|allergen|www\.|page|serving|protein|fat total|sodium',line,re.I):previous=line.strip()
# Betty's: distinct per-serve and per-100g columns; join wrapped food names.
url='https://d39lx4ijfcfzcm.cloudfront.net/web-assets/9495f976adc9960c9d1f9a9690375937/nutritional-info.pdf';pending='';last=None
for line in (root/'bettys.pdf.txt').read_text().splitlines():
 m=re.search(r'(\d+(?:\.\d+)?)\s*(?:[gG]|mL|ml)\s+',line)
 if m:
  nums=[float(v)for v in re.findall(r'\d+(?:\.\d+)?',line[m.start():])]
  if len(nums)==15:
   grams,kj,_,p,_,f,_,sat,_,c,_,sugar,_,sodium,_=nums
   name=line[:m.start()].strip() or pending;pending=''
   if not name:continue
   role='component' if re.search(r'sauce|mayo|aioli|mustard|hot honey|spicy vegan',name,re.I) else 'drink' if re.search(r'shake|soda|coke|fanta|water|sprite|tea|juice|beer',name,re.I) or name in ['CARAMEL','CHOCOLATE','CHOCOLATE PEANUT BUTTER','STRAWBERRY','VANILLA','STRAWBERRY CHEESECAKE'] else 'side' if re.search(r'fries|rings|chicken strips|nuggets',name,re.I) and not 'BURGER' in name else 'dessert' if re.search(r'custard|concrete|sundae|brownie|cookie|chocolate deluxe|vanilla pavlova',name,re.I) else 'main'
   add("Betty's Burgers",name.title(),f'1 menu serving ({grams:g} '+('mL)' if re.search(r'ml',m[0],re.I) else 'g)'),kj,p,c,f,url,role,None if re.search(r'ml',m[0],re.I) else grams,dict(saturatedFat=sat,sugars=sugar,sodium=sodium),' · 22 September 2026');last=new[-1] if new else None;continue
 text=line.strip()
 if text and len(line)-len(line.lstrip())>=10 and len(text)<45 and re.match(r'^[A-Z’ &+\-]+$',text) and not any(w in text for w in ['INFORMATION','ENERGY','PROTEIN','SODIUM','MENU','UPDATED','DIETARY','BURGERS','SAUCES','DESSERT','SIDES','SHARES','WEIGHT']):
  if last and not line[:40].strip()=='' and text in ['DOUBLE-STACKED BEEF','BURGER','STRIPS']:
   last['name']+=' '+text.title();last=None
  else:pending=text;last=None
# Roll'd: fixed-layout per-serve columns. The guide has variable item weights;
# retain published product portion, never assume all items share section weight.
url='https://cdn.shopify.com/s/files/1/0979/1117/7508/files/Nitty_Gritty_-_September_2026_-_Sheet1.pdf?v=1790578701';section='';starts=[];pending='';nutrientKeys=[];last_roll=None
for line in (root/'rolld.pdf.txt').read_text().splitlines():
 if 'Energy (g)' in line:
  section=line.split('Energy')[0].strip();pending='';nutrientKeys=[{'Energy (g)':'kj','Protein (g)':'protein','Fat (g)':'fat','Saturated Fat (g)':'saturatedFat','Trans Fat (g)':'transFat','Carbohydrates (g)':'carbs','Sugars':'sugars','Dietary Fibres':'fibre','Sodium':'sodium'}[m[0]] for m in re.finditer(r'Energy \(g\)|Protein \(g\)|Saturated Fat \(g\)|Trans Fat \(g\)|Fat \(g\)|Carbohydrates \(g\)|Sugars|Dietary Fibres|Sodium',line)];continue
 if line.count('Per Serve')>=7:starts=[m.start()for m in re.finditer('Per Serve',line)];continue
 if line.strip() in ['CUPS','BOWLS'] and section.startswith('PHƠ'):section+=' · '+line.strip().title();continue
 if line.strip().startswith('('):continue
 if len(starts)<7:continue
 # First number in each nutrient group is per-serve; second is per-100g.
 nums=list(re.finditer(r'(?<!\w)\d+(?:\.\d+)?',line))
 if not nums or nums[0].start()<max(27,starts[0]-12):
  text=line[:max(27,starts[0]-5)].strip()
  if text and not re.search(r'average|serve|100g|^\(|Energy|Protein|QTY',text,re.I):
   if last_roll and text in ['Avocado','Breast & Avocado']:last_roll['name']+=' '+text
   else:pending=text
  continue
 bounds=[max(27,x-10) for x in starts]+[len(line)+1];vals=[]
 for i in range(len(starts)):
  center=starts[i]+4;found=sorted(nums,key=lambda m:abs((m.start()+m.end())/2-center));vals.append(float(found[0][0]) if found and abs((found[0].start()+found[0].end())/2-center)<9 else None)
 if len(vals)!=len(nutrientKeys):continue
 nv=dict(zip(nutrientKeys,vals))
 if any(nv.get(k)is None for k in ['kj','protein','carbs','fat']):continue
 name=line[:nums[0].start()].strip() or pending
 if not name or name.startswith('('):continue
 pending='';kj,p,c,f=[nv[k]for k in ['kj','protein','carbs','fat']]
 role='drink' if section=='DRINKS' else 'component' if section=='CONDIMENTS' else 'side' if section=='SIDES' else 'main'
 add("Roll'd",section.title()+' · '+name,'1 published menu portion',kj,p,c,f,url,role,None,{k:v for k,v in nv.items() if k in ['saturatedFat','sugars','fibre','sodium'] and v is not None},' · 16 September 2026; portion weight unspecified');last_roll=new[-1] if new else None
# Mad Mex: source calculator ingredient portions and its explicit default recipe.
# Every filling/salsa combination retains the exact selected ingredient portions.
class MadParser(HTMLParser):
 def __init__(self):super().__init__();self.name='';self.ingredients={};self.products=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'ingredient-title'in a:self.name=a['ingredient-title']
  if 'ingredient-plus'in a.get('class','').split() and self.name:self.ingredients[self.name]=a
  if 'product-ingredients-info'in a.get('class','').split():self.products.append(a)
mp=MadParser();mp.feed((root/'madmex.html').read_text());parts={};url='https://www.madmex.com.au/nutritioncalculator/'
for name,a in mp.ingredients.items():
 try:kj,p,c,f=[float(a[k])for k in ['energy_serving-val','protein_serving-val','carbohydrate_serving-val','fat_total_serving-val']]
 except:continue
 if abs(kj/4.184-(p*4+c*4+f*9))>max(100,kj/4.184*.4):rejected.append(('Mad Mex',name,'inconsistent calculator component'));continue
 parts[name]=(kj,p,c,f,a)
 role='side' if re.search(r'fries|corn chips &',name,re.I) else 'dessert' if 'Churros'in name else 'component'
 add('Mad Mex',name,'1 calculator ingredient portion',kj,p,c,f,url,role,None,dict(sodium=float(a.get('sodium_serving-val',0)),saturatedFat=float(a.get('fat_saturated_serving-val',0)),sugars=float(a.get('sugar_serving-val',0))),' · published calculator component; kcal from kJ')
for product in mp.products:
 base=product.get('data-ingredients','').split(',');small=product.get('data-size')=='small';size=' (SML)' if small else ''
 fillings=[n for n in parts if parts[n][4].get('category-val')=='fillings' and ('(SML)'in n)==small]
 salsa=[n for n in parts if 'Salsa'in n and ('(SML)'in n)==small]
 if not salsa:salsa=['Mild Salsa (Fire-Roasted Tomato)'+size]
 for filling in fillings:
  for sauce in salsa:
   names=[n for n in base if 'Salsa'in n or 'salsa'in n]
   recipe=[n for n in base if n not in names]+[sauce,filling]
   if not all(n in parts for n in recipe):rejected.append(('Mad Mex',product.get('product-name'),'missing recipe component'));continue
   totals=[sum(parts[n][i]for n in recipe)for i in range(4)];title=product.get('product-name','').title()+' · '+filling+' · '+sauce
   add('Mad Mex',title,'1 '+product.get('product-name','').lower()+' · default base',*totals,url,'main',None,note=' · calculator sum: '+', '.join(recipe)+'; kcal from kJ')
# Sushi Hub: published product panels, including platter portions as platters.
url='https://www.sushihub.com.au/our-products/';s=(root/'sushi.html').read_text();previous_end=0
for m in re.finditer(r'<table\b.*?</table>',s,re.S):
 block=s[previous_end:m.start()];previous_end=m.end();titles=re.findall(r'<div[^>]*class="title-h\d[^\"]*"[^>]*>(.*?)</div>',block,re.S)
 if not titles:continue
 name=html.unescape(re.sub('<[^>]+>','',titles[-1])).strip();cells=re.findall(r'<td[^>]*>(.*?)</td>',m[0],re.S);data={}
 for cell in cells:
  text=html.unescape(re.sub('<[^>]+>',' ',cell));n=re.search(r'([\d.]+)\s*(g|kJ)',text)
  if n:
   for k in ['Protein','Total Fat','Carbohydrate','Energy']:
    if k in text:data[k]=float(n[1])
 if not all(k in data for k in ['Protein','Total Fat','Carbohydrate','Energy']):continue
 platter='platter'in name.lower();size='1 published menu portion (weight unspecified)'
 if platter:
  portions=re.findall(r'<strong>([^<]*pcs[^<]*)</strong>',block,re.I);size=(html.unescape(portions[-1]) if portions else '1 whole platter')[:60]
 add('Sushi Hub',name,size,data['Energy'],data['Protein'],data['Carbohydrate'],data['Total Fat'],url,'sharing' if platter else 'main')
for row in new:row['id']='au-menu-'+hashlib.sha256((row['brand']+row['name']+row['servingSize']).encode()).hexdigest()[:16]
seen={r['id']for r in rows};accepted=[]
for row in new:
 if row['id']not in seen:rows.append(row);accepted.append(row);seen.add(row['id'])
dest.write_text(json.dumps(rows,indent=2)+'\n');print('Added',dict(collections.Counter(r['brand']for r in accepted)));print('Rejected',rejected);print('Total',len(rows))
