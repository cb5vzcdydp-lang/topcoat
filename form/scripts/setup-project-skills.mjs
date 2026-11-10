#!/usr/bin/env node
// Project-local skill instructions only. No MCP registration, global config or app dependencies.
import {existsSync,lstatSync,mkdirSync,readFileSync,realpathSync,symlinkSync} from 'node:fs';
import {dirname,join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const skills=[
 {repo:'rea',url:'https://github.com/cb5vzcdydp-lang/rea.git',commit:'b2f3dc81fa503c2b9ff0d8625336ed2e74d1e829',path:'.agents/skills/reverse-engineer-anything',name:'reverse-engineer-anything'},
 {repo:'taste-skill',url:'https://github.com/cb5vzcdydp-lang/taste-skill.git',commit:'f6b76575f949707b4e3c37cd86cb44b0b98643e8',path:'skills/taste-skill',name:'design-taste-frontend'},
];
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','inherit']}).trim();
mkdirSync(join(root,'repositories'),{recursive:true});
const target=join(root,'.agents','skills');mkdirSync(target,{recursive:true});
for(const skill of skills){
 const repo=join(root,'repositories',skill.repo);
 if(!existsSync(repo)){
  git(root,'clone','--filter=blob:none','--no-checkout',skill.url,repo);
  git(repo,'fetch','--depth=1','origin',skill.commit);
  git(repo,'checkout','--detach',skill.commit);
 }
 // Refuse to replace an existing checkout or unrelated installation.
 if(git(repo,'remote','get-url','origin')!==skill.url)throw new Error(`Unexpected origin for ${skill.repo}; existing files preserved.`);
 if(git(repo,'rev-parse','HEAD')!==skill.commit)throw new Error(`${skill.repo} differs from the recorded revision; review it before changing the pin.`);
 const source=join(repo,skill.path),dest=join(target,skill.name);
 if(!readFileSync(join(source,'SKILL.md'),'utf8').includes(`name: ${skill.name}`))throw new Error(`Skill identity mismatch: ${skill.name}`);
 let existing;try{existing=lstatSync(dest)}catch(error){if(error.code!=='ENOENT')throw error}
 if(existing){if(!existing.isSymbolicLink()||realpathSync(dest)!==realpathSync(source))throw new Error(`Existing ${dest} preserved; review this conflict manually.`)}
 else symlinkSync(relative(target,source),dest,'dir');
 console.log(`Ready: ${skill.name} (${skill.repo}@${skill.commit.slice(0,7)})`);
}
