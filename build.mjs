import {mkdir,copyFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.dirname(fileURLToPath(import.meta.url));
await mkdir(path.join(root,'dist','packs'),{recursive:true});
for(const name of ['index.html','styles.css','questions.js','content.js','app.js'])await copyFile(path.join(root,name),path.join(root,'dist',name));
for(const name of ['java-ledger','python-cleaner','local-crawler']){
  const directory=path.join(root,'materials',name);
  const walk=async d=>(await Promise.all((await readdir(d,{withFileTypes:true})).filter(e=>!['__pycache__'].includes(e.name)&&!e.name.endsWith('.class')).map(async e=>e.isDirectory()?walk(path.join(d,e.name)):path.relative(directory,path.join(d,e.name))))).flat();
  const files=await walk(directory);
  const script='import sys,zipfile\nwith zipfile.ZipFile(sys.argv[1], "w", zipfile.ZIP_DEFLATED) as z:\n for name in sys.argv[2:]: z.write(name, name)';
  const result=spawnSync('python',['-c',script,path.join(root,'dist','packs',name+'.zip'),...files],{cwd:directory,encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr||'Packaging failed');
}
console.log('Built static app and 3 learning packs.');
