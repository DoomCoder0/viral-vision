import { DatabaseSync } from 'node:sqlite';
import { resolve, join } from 'node:path';
const db=new DatabaseSync(join(process.env.DATA_DIR?resolve(process.env.DATA_DIR):resolve(import.meta.dirname,'../data'),'inquiries.sqlite'));
console.table(db.prepare('SELECT reference,name,email,goal,received_at FROM inquiries ORDER BY id DESC LIMIT 50').all());
db.close();
