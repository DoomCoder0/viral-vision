import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const scratch=await mkdtemp(join(tmpdir(),'vv-api-test-'));
process.env.DATA_DIR=scratch;
process.env.ADMIN_USER='admin';
process.env.ADMIN_PASSWORD='test-only-password';
const { app } = await import('../server.mjs');

test('frontend, SQLite persistence, API validation, and protected inbox', async () => {
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  const root=`http://127.0.0.1:${app.address().port}`;
  try {
    const health=await fetch(root+'/api/health');
    assert.equal(health.status,200);
    assert.equal((await health.json()).storage,'SQLite');
    const html=await(await fetch(root+'/')).text();
    assert.match(html,/particle-canvas/);
    assert.doesNotMatch(html,/particle-wave\.mp4/);
    const animation=(await(await fetch(root+'/particles.js')).text());
    assert.match(animation,/requestAnimationFrame/);
    const invalid=await fetch(root+'/api/inquiries',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'A',email:'wrong',goal:'hi'})});
    assert.equal(invalid.status,400);
    const result=await fetch(root+'/api/inquiries',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Test person',email:'test@example.com',goal:'We need a performance marketing strategy for our business.'})});
    assert.equal(result.status,201);
    const reference=(await result.json()).reference;
    assert.match(reference,/^VV-[0-9A-F]{8}$/);
    const unauthorized=await fetch(root+'/api/inquiries');
    assert.equal(unauthorized.status,401);
    const auth='Basic '+Buffer.from('admin:test-only-password').toString('base64');
    const resultInbox=await fetch(root+'/api/inquiries',{headers:{Authorization:auth}});
    assert.equal(resultInbox.status,200);
    const {items}=await resultInbox.json();
    assert.equal(items[0].reference,reference);
    assert.equal(items[0].email,'test@example.com');
    const adminPage=await fetch(root+'/admin',{headers:{Authorization:auth}});
    assert.equal(adminPage.status,200);
  } finally {
    await new Promise(resolve=>app.close(resolve));
    await rm(scratch,{recursive:true,force:true});
  }
});
