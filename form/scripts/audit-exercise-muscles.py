"""Rebuild local muscle assignments; network is never required by the application.
Exact source matches and movement-family estimates are deliberately distinguished.
"""
import json,re,collections,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
norm=lambda s:re.sub(r'[^a-z0-9]+',' ',s.lower()).strip()
source=json.load(open(root/'scripts/data/free-exercise-muscles.json'))
base=json.load(open(root/'lib/tracked-exercises.json'))
text=(root/'lib/exercise-catalogue.ts').read_text()
imports=json.loads(re.search(r'importedWorkoutExerciseNames=(\[.*?\]) as const',text).group(1))
names=list(dict.fromkeys([e['name'] for e in base]+imports))
# Match the actual joint action before broad words (e.g. leg curl precedes curl).
# Sources: public-domain free-exercise-db and ExRx target/synergist references.
rules=[
(r'peter extensions|prime plate loaded banded extension',['Quads'],[],'Leg_Extensions'),
(r'couch stretch',['Quads','Hip flexors'],[],'Intermediate_Hip_Flexor_and_Quad_Stretch'),
(r'shoulder.*(internal|external) rotation',['Rotator cuff'],[],'Cable_Internal_Rotation'),
(r'protraction|serratus|serratas',['Serratus'],[],'https://exrx.net/WeightExercises/SerratusAnterior/BBInclineShoulderRaise'),
(r'lu raise',['Upper back'],['Side delts'],'Side_Lateral_Raise'),
(r'scaption|cable lat raise',['Side delts'],['Front delts'],'Side_Lateral_Raise'),

(r'hip adduction/abduction',['Adductors','Abductors'],[],'Hip_Abduction'),
(r'tibialis|tibia raise|dorsiflexion',['Tibialis'],[],'Anterior_Tibialis-SMR'),
(r'calf|calves|gastrocnemius|soleus|toe press',['Calves'],[],'Standing_Calf_Raises'),
(r'adductor|adduction',['Adductors'],[],'Thigh_Adductor'),
(r'abduct|glute med|piriformis',['Abductors'],['Glutes'],'Thigh_Abductor'),
(r'^(sartorius|lying psoas|psoas cable)|^unilateral hip flexion',['Hip flexors'],[],'Hip_Flexion_with_Band'),
(r'lower back|lumbar extension|spinal extension|superman|reverse hyper',['Lower back'],['Glutes','Hamstrings'],'Hyperextensions_Back_Extensions'),
(r'glute.*(deadlift|romanian|hyperextension)|hip dominant|glute dominant|glute max.*lunge',['Glutes'],['Hamstrings','Quads'],'Barbell_Glute_Bridge'),
(r'romanian|rdl|sldl|stiff.?leg|straight leg deadlift|good morning',['Hamstrings'],['Glutes','Lower back'],'Romanian_Deadlift'),
(r'nordic|hamstring|leg curl|leg.*curls',['Hamstrings'],[], 'Seated_Leg_Curl'),
(r'hip extension|hyperextension|back extension|booty builder.*45 extension',['Glutes','Hamstrings'],['Lower back'],'Hyperextensions_Back_Extensions'),
(r'deadlift|rack pull',['Glutes'],['Quads','Hamstrings','Lower back','Upper back'],'Barbell_Deadlift'),
(r'hip thrust|glute|hip bridge',['Glutes'],['Hamstrings'],'Barbell_Glute_Bridge'),
(r'leg extension|leg extensions|sissy squat',['Quads'],[],'Leg_Extensions'),
(r'squat|leg press|lunge|step.?up|hip press|squat press',['Quads'],['Glutes','Adductors','Calves'],'Barbell_Full_Squat'),
(r'box jump|depth jump|frog jump|jumping|jump squat',['Quads','Glutes'],['Calves','Hamstrings'],'Box_Jump_Multiple_Response'),
(r'neck (flexion|extension|rotation|lateral flexion)|neck harness',['Neck'],[],'Lying_Face_Down_Plate_Neck_Resistance'),
(r'oblique|wood.?chop|twist|side bend|side plank|bicycle',['Obliques'],['Abs'],'Standing_Cable_Wood_Chop'),
(r'rectus abdominis|plank|crunch|sit.?up|sit up|leg raise|knee raise|knee.*raise|ab wheel|ab scissors|jack.?knife|v.?up|dead bug|heel tap|dragon flag|l.sit|toes to bar|garhammer|mountain climber',['Abs'],[], 'Crunches'),
(r'upper back.*(pulldown|pull up)|suspension upper back pull up',['Upper back'],['Lats','Rear delts','Biceps'],'Bent_Over_Barbell_Row'),
(r'upper back.*pull.?apart|retraction|kelso',['Upper back'],['Rear delts'],'Bent_Over_Barbell_Row'),
(r'rear delt|reverse.*(fly|pec deck)|face pull',['Rear delts'],['Upper back'],'Seated_Bent-Over_Rear_Delt_Raise'),
(r'front raise|anterior delt.*(raise|fly)',['Front delts'],[],'Front_Dumbbell_Raise'),
(r'arnold press|anterior delt|shoulder press|overhead press|overhead dumbbell press|behind neck press|handstand|pike push|jammer press|70[° ]|70 deg|65[° ]|65 deg',['Front delts'],['Side delts','Triceps'],'Dumbbell_Shoulder_Press'),
(r'upright row',['Side delts'],['Upper back','Front delts','Biceps'],'Upright_Barbell_Row'),
(r'medial delt|middle delt|lateral raise|cuffed.*lateral|crucifix raise|standing lateral|keegan flap',['Side delts'],['Upper back'],'Side_Lateral_Raise'),
(r'y.?raise|y raise',['Upper back'],['Side delts'],'Seated_Bent-Over_Rear_Delt_Raise'),
(r'shrug',['Upper back'],[],'Barbell_Shrug'),
(r'finger (flexion|extension)|wrist|forearm|4arm|radial deviation|ulnar deviation|brachioradialis|reverse.*curl|pronation|supination',['Forearms'],['Biceps'],'Palms-Down_Wrist_Curl_Over_A_Bench'),
(r'hamstring',['Hamstrings'],[],'Seated_Leg_Curl'),
(r'bicep cirl|curl|elbow flexor',['Biceps'],['Forearms'],'Barbell_Curl'),
(r'newton extension|carter extension|jm smith|arm extension|close grip.*(bench|press|smith)|diamond push|push up.?close|jm press|french press|tricep|pushdown|pressdown|skull|overhead.*extension|cross.*extension|rope.*extension|dumbbell extension|cable extension|arm supported extension|chair dip|floor.*dip|dip machine|seated dip',['Triceps'],[], 'Triceps_Pushdown'),
(r'kickback',['Glutes'],[],'Glute_Kickback'),
(r'lat.*(row|pull)|pullover|rowdown|pull.?around|pullaround|latissimus',['Lats'],['Upper back','Biceps'],'Wide-Grip_Lat_Pulldown'),
(r'pull.?up|pull up|pulldown|pull.down|chin.?up|chin up|rack chin|lever',['Lats'],['Upper back','Biceps','Forearms'],'Pullups'),
(r'dead hang',['Forearms'],[], 'One_Handed_Hang'),
(r'row',['Upper back'],['Lats','Rear delts','Biceps'],'Bent_Over_Barbell_Row'),
(r'larson press|floor press|wide grip smith machine|chess press|dip|push.?up|push up|bench|chest press|pec.*press|flat.*press|incline.*press|decline.*press|cable press|dumbbell press|barbell press|narrow incline smith|close grip smith',['Chest'],['Front delts','Triceps'],'Barbell_Bench_Press_-_Medium_Grip'),
(r'fly|flys|pec deck|pec.*pull|pec.*around',['Chest'],['Front delts'],'Dumbbell_Flyes'),
(r'walking pad|running|treadmill|spinning|cycling|bike',['Quads','Glutes','Calves'],['Hamstrings'],'Running_Treadmill'),
]
json.dump([{'pattern':p,'direct':d,'indirect':s,'basis':'movement-family','reference':r} for p,d,s,r in rules],open(root/'lib/muscle-rules.json','w'),indent=2)
lookup={norm(e['name']):e for e in source}
translate={'quadriceps':['Quads'],'hamstrings':['Hamstrings'],'glutes':['Glutes'],'adductors':['Adductors'],'abductors':['Abductors'],'calves':['Calves'],'chest':['Chest'],'lats':['Lats'],'middle back':['Upper back'],'traps':['Upper back'],'lower back':['Lower back'],'biceps':['Biceps'],'triceps':['Triceps'],'forearms':['Forearms'],'abdominals':['Abs'],'neck':['Neck']}
result={};unresolved=[];counts=collections.Counter()
for name in names:
 n=norm(name); direct=indirect=None;family=None
 for pattern,d,s,f in rules:
  if re.search(pattern,n):direct=list(d);indirect=list(s);family=f;break
 exact=lookup.get(n)
 if exact and not any(m=='shoulders' for m in exact['primaryMuscles']):
  # Use the finer movement-family deltoid/oblique classification where available.
  if not re.search(r'rear delt|front raise|lateral raise|upright row|oblique|twist|side (bend|plank)|bicycle|row|squat|deadlift|curl|press|pulldown|pullup',n):
   direct=list(dict.fromkeys(m for raw in exact['primaryMuscles'] for m in translate.get(raw,[]))) or direct
   indirect=list(dict.fromkeys(m for raw in exact['secondaryMuscles'] for m in translate.get(raw,[]))) if direct else indirect
 if not direct:
  unresolved.append(name);direct=['Other'];indirect=[]
 # Avoid invented specificity for hip-flexion muscles outside the supported anatomy.
 mapped=list(dict.fromkeys(m for raw in exact['primaryMuscles'] for m in translate.get(raw,[]))) if exact else []
 status='source-match' if exact and set(mapped)==set(direct) else 'movement-family' if family else 'needs-review'
 if direct==['Other']:status='outside-map'
 # RDL is a hip hinge; a leg curl is not. Include assistants only for hinge variants.
 if re.search(r'romanian|stiff.?leg|straight leg deadlift|good morning',n) and direct==['Hamstrings']:indirect=['Glutes','Lower back']
 if re.search(r'close grip.*(bench|press|smith)|diamond push|push up.?close|jm press|jm smith|floor.*dip|chair dip',n) and direct==['Triceps']:indirect=['Chest','Front delts']
 if re.search(r'pullover|straight arm',n) and direct==['Lats']:indirect=['Chest','Triceps']
 indirect=[m for m in dict.fromkeys(indirect) if m not in direct]
 ref=exact['id'] if exact else family
 result[n]={'direct':list(dict.fromkeys(direct)),'indirect':indirect,'basis':status,'reference':ref or ''}
 counts[status]+=1
json.dump(result,open(root/'lib/exercise-muscles.json','w'),indent=2);print('Coverage',len(result),dict(collections.Counter(r['basis'] for r in result.values())));print('UNRESOLVED',len(unresolved),'\n'+'\n'.join(unresolved))
