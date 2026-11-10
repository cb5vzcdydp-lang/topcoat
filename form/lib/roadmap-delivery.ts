export type DeliveryStatus='implemented'|'partial'|'pending'|'verification';
export const implementedIds=new Set(`001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 016 017 018 019 020 021 022 023 024 025 026 027 028 029 030 031 032 033 034 035 037 038 039 040 041 042 043 044 045 046 047 048 049 050 051 052 053 054 055 056 057 058 059 060 061 062 063 064 065 066 067 068 069 070 071 073 074 075 076 077 078 079 080 081 082 083 084 085 086 087 088 089 090 091 092 093 094 095 096 097 098 099 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 118 120 121 124 125 126 127 128 129 131 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 158 159 160 161 162 163 164 165 166 167 168 169 170 171 172 173 174 175 176 177 178 179 180 181 182 183 184 186 187 189 190 192 196 197 198 200 201 202 203 205 209 210 211 212 214 215 217 219 220 221 222 223 224 225 227 228 229 230 233 234 236 240`.split(' '));
export const partialIds=new Set(`036 072 122 123 157 185 188 193 194 195 199 206 207 213 216 218 226 235 238 239`.split(' '));
export const verificationIds=new Set(['119','130','132','191','208','231','232','237']);
export function roadmapStatus(id:string):DeliveryStatus{return implementedIds.has(id)?'implemented':partialIds.has(id)?'partial':verificationIds.has(id)?'verification':'pending'}
export const roadmapCategories=['Workout logging','Templates and programming','Exercise library and technique','Strength and training analytics','Cardio and conditioning','Food diary and nutrients','Recipes and meal planning','Weight and body progress','Sleep and recovery','Habits and reminders','Home and navigation','Friends and social','Challenges and rewards','Coaching tools','Imports, exports and portability','Offline use and reliability','Accessibility and preferences','Privacy, safety and control','Health data on the web','Owner tools and free operation'];
export const partialNotes:Record<string,string>={
 '025':'Equipment and muscle filters combine in the picker. Reviewed difficulty/movement classifications are not supplied for the full catalogue.',
 '036':'Private correction records can be saved. A shared owner moderation/publication workflow is pending.',
 '043':'Custom progression settings can be stored. They do not automatically replace the existing progression rules.',
 '045':'Technique notes are saved; automatic graph segmentation by technique change is pending.',
 '057':'Editable walk-run interval sessions are available; a multiweek progression/completion workflow is pending.',
 '069':'Weighed recipe servings retain a snapshot and copies are independent. Legacy recipe logging does not yet retain every version field.',
 '072':'Main food details now require complete known macros, label unknown values and warn about implausible portions. Some legacy entry paths still need an audit.',
 '091':'Dated body-fat bounds now produce checkpoint FFMI bands without projecting current bounds onto history. Weight-scenario ranges across checkpoints remain incomplete.',
 '122':'The selected date is shared across navigation and advanced tools; some legacy screens retain their own date controls.',
 '123':'Workout recovery and account/profile-scoped meal/recipe drafts with Home resume now work on this device. Standalone food-entry/planning drafts and cross-device task sync remain incomplete.',
 '157':'Filtered private coach tasks can be saved; automatic configurable client attention queues are incomplete.',
 '185':'Workouts, mapped imports, stable habit saves and key diary retries are duplicate-safe; some legacy creation endpoints still need work.',
 '188':'New media uploads have recovery receipts, attachment checks and an explicit unattached-file cleanup route. Browser-resumable large uploads and legacy unreceipted media remain outside this flow.',
 '193':'Larger text is available; the full layout/device matrix needs further review.',
 '194':'Primary new inputs are labelled and dialogs trap focus. Full screen-reader certification is pending.',
 '195':'New controls use native keyboard interactions and dialogs restore focus. A complete keyboard-only audit is pending.',
 '199':'Advanced strength trends honor kg/lb. Legacy inputs and all distance/water/export conventions are not yet converted.',
 '206':'Existing coaching consent and disconnect remain. Field-by-field sharing rules are not implemented.',
 '207':'Owners can delete a selected profile. A complete account-wide social/food/media erasure workflow is pending.',
 '210':'Old/largest media can be reviewed and removed manually. Retention schedules and keep-forever exclusions are pending.',
 '213':'All JSON routes now read through bounded streaming input, and media signatures/size caps are checked. Multipart stream-level hardening still needs review.',
 '216':'The privacy explanation accurately describes existing optional AI. The older no-AI instruction was superseded by the user’s later request to preserve AI features.',
 '218':'Configured sources now feed daily logs, Home, sleep and recovery comparisons without changing raw readings. Remaining specialist summaries need a final audit.',
 '225':'Workout/meal import batches can be undone. Health-import rollback is pending.',
 '226':'Source/reference metadata can be saved. Published reference bands are not all annotated with cohort/version evidence.',
 '229':'Loaded media sizes are visible; total usage and platform quota/billing are not available to the app.',
 '235':'Privacy help explains public Site access versus friendship and coaching. Native Site audience administration remains outside the app.',
 '238':'New import, media and history queries are bounded. Some legacy data reads remain unpaginated.',
 '239':'No new paid provider integration was added. Existing AI/R2 remain, so a strict no-paid-service guard cannot be marked complete.',
};
