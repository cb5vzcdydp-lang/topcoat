import {HttpError} from './errors';
import type {ImportedTemplate} from './import-workout-templates';

type TemplateRow={id:string;name:string;exercises:string;metadata:string|null;version:number};
const snapshot=(row:TemplateRow)=>JSON.stringify({name:row.name,exercises:row.exercises,metadata:row.metadata,version:row.version});
const templateData=(id:string,row:TemplateRow)=>({id,name:row.name,exercises:JSON.parse(row.exercises),...(row.metadata?JSON.parse(row.metadata):{})});

/** Keep reusable templates in the same resumable, undoable batch as its history. */
export async function saveImportedBatchTemplates(db:D1Database,client:string,batch:string,templates:ImportedTemplate[],now:string){
  let created=0,updated=0;
  for(const template of templates){
    const old=await db.prepare('SELECT id,client,name,exercises,metadata,version FROM workout_templates WHERE id=?').bind(template.id).first<TemplateRow&{client:string}>();
    if(old&&old.client!==client)throw new HttpError(404,'Workout template not found.');
    const entryKey='template:'+template.id;
    const prior=await db.prepare('SELECT before_data,after_data FROM import_items WHERE batch=? AND entry_key=?').bind(batch,entryKey).first<{before_data:string|null;after_data:string}>();
    if(old){
      // A manual template, or one edited after this batch started, is never overwritten.
      const metadata=old.metadata?JSON.parse(old.metadata):{};
      if(!metadata.importedDate||metadata.importedDate>=template.importedDate)continue;
      if(prior&&snapshot(old)!==prior.after_data)continue;
    }
    const metadata=JSON.stringify({folder:template.folder,tags:template.tags,favourite:false,loadScale:1,importedDate:template.importedDate,importedSource:template.importedSource,matches:template.matches});
    const next:TemplateRow={id:template.id,name:template.name,exercises:JSON.stringify(template.exercises),metadata,version:old?old.version+1:1};
    const write=old
      ?db.prepare('UPDATE workout_templates SET name=?,exercises=?,metadata=?,updated=?,version=version+1 WHERE id=? AND client=? AND version=?').bind(next.name,next.exercises,next.metadata,now,template.id,client,old.version)
      :db.prepare('INSERT INTO workout_templates(id,client,name,exercises,metadata,created,updated) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(template.id,client,next.name,next.exercises,next.metadata,now,now);
    const result=await db.batch([
      write,
      db.prepare("INSERT INTO import_items(batch,entry_key,table_name,before_data,after_data) SELECT ?,?,'workout_templates',?,? WHERE EXISTS (SELECT 1 FROM workout_templates WHERE id=? AND client=? AND version=? AND name=? AND exercises=? AND metadata=?) ON CONFLICT(batch,entry_key) DO UPDATE SET after_data=excluded.after_data")
        .bind(batch,entryKey,prior?prior.before_data:old?snapshot(old):null,snapshot(next),template.id,client,next.version,next.name,next.exercises,next.metadata),
      db.prepare('INSERT INTO workout_template_history(id,client,version,data,created) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM workout_templates WHERE id=? AND client=? AND version=? AND name=? AND exercises=? AND metadata=?) ON CONFLICT(id,version) DO NOTHING')
        .bind(template.id,client,next.version,JSON.stringify(template),now,template.id,client,next.version,next.name,next.exercises,next.metadata),
    ]);
    if(!result[0].meta.changes)throw new HttpError(409,'A workout template changed during import. Review it before retrying.');
    if(old)updated++;else created++;
  }
  return {templatesCreated:created,templatesUpdated:updated};
}

export async function rollbackImportedTemplate(db:D1Database,client:string,item:{batch:string;entry_key:string;before_data:string|null;after_data:string},now:string){
  const id=item.entry_key.slice('template:'.length);
  const current=await db.prepare('SELECT id,name,exercises,metadata,version FROM workout_templates WHERE id=? AND client=?').bind(id,client).first<TemplateRow>();
  if(!current||snapshot(current)!==item.after_data){
    await db.prepare("UPDATE import_items SET status='modified' WHERE batch=? AND entry_key=?").bind(item.batch,item.entry_key).run();
    return false;
  }
  if(item.before_data){
    const before=JSON.parse(item.before_data) as TemplateRow;
    const restored={...before,id,version:current.version+1};
    const result=await db.batch([
      db.prepare('UPDATE workout_templates SET name=?,exercises=?,metadata=?,updated=?,version=version+1 WHERE id=? AND client=? AND version=?')
        .bind(before.name,before.exercises,before.metadata,now,id,client,current.version),
      db.prepare('INSERT INTO workout_template_history(id,client,version,data,created) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM workout_templates WHERE id=? AND client=? AND version=?) ON CONFLICT(id,version) DO NOTHING')
        .bind(id,client,restored.version,JSON.stringify(templateData(id,restored)),now,id,client,restored.version),
    ]);
    if(!result[0].meta.changes)throw new HttpError(409,'A workout template changed during rollback. Retry to keep the latest edit.');
  }else{
    const result=await db.prepare('DELETE FROM workout_templates WHERE id=? AND client=? AND version=?').bind(id,client,current.version).run();
    if(!result.meta.changes)throw new HttpError(409,'A workout template changed during rollback. Retry to keep the latest edit.');
  }
  await db.prepare("UPDATE import_items SET status='rolled-back' WHERE batch=? AND entry_key=?").bind(item.batch,item.entry_key).run();
  return true;
}
