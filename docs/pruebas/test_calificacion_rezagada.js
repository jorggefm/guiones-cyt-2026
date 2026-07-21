// Helpers reales copiados de Codigo.gs
function normalize_(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();}
function levenshtein_(a,b){const m=[];for(let i=0;i<=b.length;i++)m[i]=[i];for(let j=0;j<=a.length;j++)m[0][j]=j;
for(let i=1;i<=b.length;i++)for(let j=1;j<=a.length;j++)m[i][j]=b.charAt(i-1)===a.charAt(j-1)?m[i-1][j-1]:Math.min(m[i-1][j-1]+1,m[i][j-1]+1,m[i-1][j]+1);return m[b.length][a.length];}
function similarity_(a,b){const L=Math.max(a.length,b.length);return L?1-levenshtein_(a,b)/L:1;}
function accepted_(value,cands,th){const a=normalize_(value);if(!a)return false;const lim=th||0.82;
return cands.some(c=>{const e=normalize_(c);return a.indexOf(e)!==-1||e.indexOf(a)!==-1||similarity_(a,e)>=lim;});}
function correctNumber_(v,e){return Number(v)===e?1:0;}

const src = require('fs').readFileSync(process.argv[2],'utf8');
eval(src.replace(/^const /gm,'var ').replace(/\bconsole\.error/g,'//'));

function run(nombre, data, esperado){
  const r = REZ_scoreAutomatic_(data);
  const ok = Math.abs(r.points - esperado) < 0.01;
  console.log((ok?'  OK  ':' FALLA') + ' | ' + nombre.padEnd(42) + ' esperado ' + esperado + '  obtuvo ' + r.points);
  if(!ok) console.log('        desglose:', JSON.stringify(r.per));
  return ok;
}

const PERFECTO = {
  q1:'b', q2_fecundacion:1,q2_morula:2,q2_blastocisto:3,q2_implantacion:4,q2_gastrulacion:5,
  q3_a:'implantacion_placenta',q3_b:'forma_embrion',q3_c:'cavidad_interna',
  q4_estructura:'trofoblasto',
  q5_ecto:'encefalo_medula_epidermis',q5_meso:'musculos_huesos_corazon_sangre',q5_endo:'digestivo_respiratorio',
  q7_layer:'mesodermo', q7_d1:'huesos', q7_d2:'sangre',
  q8:'neurulación', q9:'b', q10_a:'embrion', q10_d:'placenta', q11:'a'
};
const c = o => Object.assign({}, PERFECTO, o);
let todo = true;
console.log('\n=== MAXIMO Y VACIO ===');
todo &= run('todo correcto', PERFECTO, 14);
todo &= run('todo vacio', {}, 0);
console.log('\n=== Q7: no repetir el mismo derivado ===');
todo &= run('huesos + sangre (dos validos)', c({q7_d1:'huesos',q7_d2:'sangre'}), 14);
todo &= run('huesos + huesos (repetido) -> -0.5', c({q7_d1:'huesos',q7_d2:'huesos'}), 13.5);
todo &= run('huesos + hueso (sinonimo mismo) -> -0.5', c({q7_d1:'huesos',q7_d2:'hueso'}), 13.5);
todo &= run('huesos + pulmones (uno malo) -> -0.5', c({q7_d1:'huesos',q7_d2:'pulmones'}), 13.5);
todo &= run('corazon + riñones', c({q7_d1:'corazon',q7_d2:'riñones'}), 14);
todo &= run('capa mal + 2 derivados ok -> -0.5', c({q7_layer:'ectodermo'}), 13.5);
console.log('\n=== TOLERANCIA ORTOGRAFICA ===');
todo &= run('"neurulacion" sin tilde', c({q8:'neurulacion'}), 14);
todo &= run('"neurulasion" (1 error)', c({q8:'neurulasion'}), 14);
todo &= run('"organogenesis" (termino errado)', c({q8:'organogenesis'}), 13);
todo &= run('"mesodermo" -> "mezodermo"', c({q7_layer:'mezodermo'}), 14);
todo &= run('"musculo" singular', c({q7_d1:'musculo',q7_d2:'sangre'}), 14);
console.log('\n=== PARCIALES PROPORCIONALES ===');
todo &= run('Q2: 3 de 5 -> 1.2 (pierde 0.8)', c({q2_implantacion:5,q2_gastrulacion:4}), 13.2);
todo &= run('Q3: 2 de 3 imposible (se fuerza la 3a)', c({q3_c:'forma_embrion'}), 13.33);
todo &= run('Q5: 1 de 3 -> pierde 1.33', c({q5_meso:'x',q5_endo:'y'}), 12.67);
todo &= run('Q10: solo A -> pierde 0.5', c({q10_d:'x'}), 13.5);
console.log('\n=== ALTERNATIVAS (ojo Q11 = a) ===');
todo &= run('Q11 marca b (la vieja correcta)', c({q11:'b'}), 12.5);
todo &= run('Q1 marca a', c({q1:'a'}), 13);
todo &= run('Q9 marca d', c({q9:'d'}), 12.5);
console.log('\n' + (todo ? '>>> TODO CORRECTO' : '>>> HAY FALLAS'));
