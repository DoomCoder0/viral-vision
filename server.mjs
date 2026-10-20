import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const dir=path.dirname(fileURLToPath(import.meta.url));
const publicDir=path.join(dir,'public');
const dataDir=process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(dir,'data');
fs.mkdirSync(dataDir,{recursive:true});
const db=new DatabaseSync(path.join(dataDir,'inquiries.sqlite'));
db.exec(`PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  goal TEXT NOT NULL,
  received_at TEXT NOT NULL
 );`);
const insert=db.prepare('INSERT INTO inquiries(reference,name,email,goal,received_at) VALUES (?,?,?,?,?)');
const list=db.prepare('SELECT reference,name,email,goal,received_at FROM inquiries ORDER BY id DESC LIMIT 100');
const limiter=new Map();
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.webp':'image/webp'};

function sendJson(res,code,data){res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(data));}
function constantTimeEqual(a,b){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function isAdmin(req){
  if(!process.env.ADMIN_PASSWORD)return false;
  const match=(req.headers.authorization||'').match(/^Basic\s+(.+)$/i);
  if(!match)return false;
  try{
    const credentials=Buffer.from(match[1],'base64').toString('utf8');
    return constantTimeEqual(credentials,`${process.env.ADMIN_USER||'admin'}:${process.env.ADMIN_PASSWORD}`);
  }catch{return false;}
}
function unauthorized(res){res.writeHead(401,{'WWW-Authenticate':'Basic realm="Viral Vision Inbox"','cache-control':'no-store'});res.end('Authentication required');}
function safeStatic(req,res,pathname){
  const decoded=decodeURIComponent(pathname);
  const target=path.resolve(publicDir,'.'+decoded);
  if(!target.startsWith(publicDir+path.sep)&&target!==publicDir){sendJson(res,403,{error:'Forbidden'});return;}
  let file=target;
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');}catch{sendJson(res,404,{error:'Not found'});return;}
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){sendJson(res,404,{error:'Not found'});return;}
  res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','x-content-type-options':'nosniff','cache-control':file.endsWith('.html')?'no-cache':'public, max-age=3600'});
  fs.createReadStream(file).pipe(res);
}
function readJson(req){return new Promise((resolve,reject)=>{
  let body='';req.on('data',chunk=>{body+=chunk;if(body.length>12000){reject(new Error('Request too large'));req.destroy();}});
  req.on('end',()=>{try{resolve(JSON.parse(body));}catch{reject(new Error('Invalid JSON'));}});
  req.on('error',reject);
});}
export function createApp(){return http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  const uri=new URL(req.url,'http://localhost');
  const route=uri.pathname;
  if(req.method==='GET'&&route==='/api/health')return sendJson(res,200,{status:'ok',project:'Viral Vision',storage:'SQLite',animation:'Canvas'});
  if(req.method==='GET'&&route==='/api/inquiries'){
    if(!isAdmin(req))return unauthorized(res);
    return sendJson(res,200,{items:list.all()});
  }
  if(req.method==='GET'&&route==='/admin'){
    if(!isAdmin(req))return unauthorized(res);
    return safeStatic(req,res,'/admin.html');
  }
  if(req.method==='POST'&&route==='/api/inquiries'){
    const ip=(req.socket.remoteAddress||'unknown');
    const now=Date.now(); const old=limiter.get(ip)||[];
    const count=old.filter(t=>now-t<60000);
    if(count.length>=6)return sendJson(res,429,{error:'Too many requests. Please wait a minute.'});
    count.push(now);limiter.set(ip,count);
    try{
      const body=await readJson(req);
      if(body.website)return sendJson(res,200,{reference:'RECEIVED'}); // bot honeypot, not stored
      const name=String(body.name||'').trim();
      const email=String(body.email||'').trim();
      const goal=String(body.goal||'').trim();
      if(name.length<2||name.length>90)return sendJson(res,400,{error:'Name must contain 2–90 characters.'});
      if(email.length>200||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return sendJson(res,400,{error:'Enter a valid email address.'});
      if(goal.length<8||goal.length>3000)return sendJson(res,400,{error:'Tell us about your goals (at least 8 characters).'});
      const reference='VV-'+randomUUID().slice(0,8).toUpperCase();
      insert.run(reference,name,email,goal,new Date().toISOString());
      return sendJson(res,201,{success:true,reference});
    }catch(err){return sendJson(res,400,{error:'Invalid request: '+err.message});}
  }
  if(route.startsWith('/api/'))return sendJson(res,404,{error:'API endpoint not found'});
  if(req.method!=='GET'&&req.method!=='HEAD')return sendJson(res,405,{error:'Method not allowed'});
  if(route==='/admin.html')return unauthorized(res);
  try{return safeStatic(req,res,route==='/'?'/index.html':route);}catch{return sendJson(res,400,{error:'Invalid path'});}
});}
const app=createApp();
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||3000);
  app.listen(port,'0.0.0.0',()=>console.log(`Viral Vision full-stack: http://localhost:${port}`));
}
export {app};
