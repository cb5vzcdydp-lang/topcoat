export const commonFoodRows=[
 ['Chicken breast, cooked',165,31,0,3.6],['Chicken thigh, cooked',209,26,0,10.9],['Lean beef mince, cooked',250,26,0,15],['Turkey breast, cooked',135,30,0,1],['Pork loin, cooked',242,27,0,14],['Salmon, cooked',206,22,0,12],['Tuna in springwater, drained',116,26,0,1],['Prawns, cooked',99,24,0.2,0.3],['Egg, whole',143,13,0.7,9.5],['Egg white',52,10.9,0.7,0.2],['Tofu, firm',144,17,2.8,8.7],
 ['White rice, cooked',130,2.7,28,0.3],['Brown rice, cooked',123,2.7,25.6,1],['Pasta, cooked',158,5.8,30.9,0.9],['Oats, dry',379,13.2,67.7,6.5],['White bread',266,8.9,49,3.3],['Wholemeal bread',247,13,41,4.2],['Potato, boiled',87,1.9,20.1,0.1],['Sweet potato, cooked',90,2,20.7,0.2],['Quinoa, cooked',120,4.4,21.3,1.9],['Kidney beans, cooked',127,8.7,22.8,0.5],['Chickpeas, cooked',164,8.9,27.4,2.6],
 ['Banana',89,1.1,22.8,0.3],['Apple',52,0.3,13.8,0.2],['Orange',47,0.9,11.8,0.1],['Strawberries',32,0.7,7.7,0.3],['Blueberries',57,0.7,14.5,0.3],['Avocado',160,2,8.5,14.7],['Broccoli, cooked',35,2.4,7.2,0.4],['Carrot, raw',41,0.9,9.6,0.2],['Spinach, raw',23,2.9,3.6,0.4],['Green beans, cooked',35,1.9,7.9,0.3],['Frozen mixed vegetables, cooked',65,3,12,0.5],
 ['Whole milk',61,3.2,4.8,3.3],['Skim milk',34,3.4,5,0.1],['Greek yoghurt, plain',97,9,3.9,5],['Cheddar cheese',403,24.9,1.3,33.1],['Cottage cheese',98,11.1,3.4,4.3],['Whey protein powder',400,80,8,6],['Olive oil',884,0,0,100],['Peanut butter',588,25,20,50],['Almonds',579,21.2,21.6,49.9],['Honey',304,0.3,82.4,0]
] as const;


export const commonFoods=commonFoodRows.map(([name,calories,protein,carbs,fat])=>({name,brand:"Common food",barcode:"",servingSize:"100 g",servingGrams:100,calories,protein,carbs,fat,nutrients:{},source:"Built-in common foods"}));
