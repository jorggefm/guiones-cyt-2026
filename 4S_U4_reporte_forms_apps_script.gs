const CONFIG = {
  REPORT_ID: "4S-U4-FORMS-C2-REPORTE-2026",
  SPREADSHEET_ID: "1syDdKN-VWR_iVOWedN9c-5kwKu4s1C1panGUcCGLd4I",
  GOOGLE_CLIENT_ID: "120108159327-6toqcr7bt3rljc8gfhtm7bonpnmueme3.apps.googleusercontent.com",
  SCHOOL_DOMAIN: "colegiomilagrosdedios.edu.pe",
  ADMIN_EMAILS: ["jorge.fernandez@colegiomilagrosdedios.edu.pe"],
  RESPONSES_SHEET: "Respuestas de formulario 1",
  EMAILS_SHEET: "Correos",
  REVIEWS_SHEET: "Revisiones"
};

const QUESTIONS = [
  {n:1,type:"Secuencia de comunicación",max:1,ideal:"Estímulo → receptor → coordinador → señal → efector → respuesta",explanation:"La comunicación corporal comienza con un estímulo, lo detecta un receptor, se coordina la información, se envía una señal y un efector produce la respuesta.",image:"",correct:["Estímulo → receptor → coordinador → señal → efector → respuesta"]},
  {n:2,type:"Identificación de señal",max:1,ideal:"Química",explanation:"La insulina es una hormona: una señal química liberada por el páncreas y transportada por la sangre.",image:"",correct:["Química"]},
  {n:3,type:"Lectura de imagen",max:1,ideal:"C",explanation:"La letra C señala el axón, prolongación que conduce el impulso nervioso desde el cuerpo celular.",image:"assets/4s_u4_examen/neurona_cuadrada.png",correct:["C"]},
  {n:4,type:"Función neuronal",max:1,ideal:"Conecta neuronas dentro del sistema nervioso central e integra la información.",explanation:"La interneurona comunica neuronas dentro del sistema nervioso central y participa en la integración de la información.",image:"",correct:["Conecta neuronas dentro del sistema nervioso central e integra la información."]},
  {n:5,type:"Ruta nerviosa",max:1,ideal:"Receptor → neurona sensorial → sistema nervioso central → neurona motora → efector",explanation:"La información entra por la neurona sensorial, se procesa en el sistema nervioso central y sale por la neurona motora hacia el efector.",image:"",correct:["Receptor → neurona sensorial → sistema nervioso central → neurona motora → efector"]},
  {n:6,type:"Lectura de imagen",max:1,ideal:"A",explanation:"La letra A indica el terminal presináptico, desde donde se liberan neurotransmisores hacia la hendidura sináptica.",image:"assets/4s_u4_examen/sinapsis_cuadrada.png",correct:["A"]},
  {n:7,type:"Selección múltiple con puntaje parcial",max:1,ideal:"Más lento que los impulsos nerviosos; Viaja por la sangre y puede actuar en lugares lejanos; Su efecto suele ser sostenido o duradero",explanation:"El sistema endocrino transmite hormonas por la sangre; su respuesta suele ser más lenta y más duradera que la nerviosa.",image:"",checkbox:true,correct:["Más lento que los impulsos nerviosos","Viaja por la sangre y puede actuar en lugares lejanos","Su efecto suele ser sostenido o duradero"]},
  {n:8,type:"Lectura de imagen",max:1,ideal:"C",explanation:"La letra C señala el páncreas, glándula que participa en la regulación de la glucosa sanguínea.",image:"assets/4s_u4_examen/sistema_endocrino_cuadrada.png",correct:["C"]},
  {n:9,type:"Ruta hormonal",max:1,ideal:"Cambio interno o estímulo → glándula endocrina → hormona → sangre → célula diana → respuesta",explanation:"Una glándula endocrina responde al cambio liberando una hormona que viaja por la sangre hasta su célula diana.",image:"",correct:["Cambio interno o estímulo → glándula endocrina → hormona → sangre → célula diana → respuesta"]},
  {n:10,type:"Selección múltiple con puntaje parcial",max:1,ideal:"Hay más Na+ afuera que adentro; Hay más K+ adentro que afuera; Dentro de la célula hay proteínas con carga negativa; La bomba Na+/K+ expulsa 3 Na+ e introduce 2 K+",explanation:"El potencial de reposo depende de la distribución desigual de iones, de proteínas negativas internas y de la actividad de la bomba Na+/K+.",image:"",checkbox:true,correct:["Hay más Na+ afuera que adentro","Hay más K+ adentro que afuera","Dentro de la célula hay proteínas con carga negativa","La bomba Na+/K+ expulsa 3 Na+ e introduce 2 K+"]},
  {n:11,type:"Lectura de gráfico",max:1,ideal:"B",explanation:"El tramo B corresponde a la despolarización: entra Na+ y el voltaje de membrana aumenta.",image:"assets/4s_u4_examen/potencial_membrana_cuadrada.png",correct:["B"]},
  {n:12,type:"Caso integrador",max:1,ideal:"Predomina una respuesta endocrina: el páncreas libera insulina, la hormona viaja por la sangre y actúa en células diana.",explanation:"Después de comer, el aumento de glucosa activa al páncreas; la insulina circula por la sangre y favorece la captación o almacenamiento de glucosa.",image:"",correct:["Predomina una respuesta endocrina: el páncreas libera insulina, la hormona viaja por la sangre y actúa en células diana."]}
];

const NAME_ALIASES = {
  "adrian eduardo rodriguez melendez":"adrian_rodriguez@colegiomilagrosdedios.edu.pe",
  "aylin hernandez ore":"aylin_hernadez@colegiomilagrosdedios.edu.pe",
  "fabricio andre pena martinez":"fabricio_pena@colegiomilagrosdedios.edu.pe",
  "hola soy andres ochante":"andres_ochante@colegiomilagrosdedios.edu.pe",
  "jesus sanchez":"jesus_sanchez@colegiomilagrosdedios.edu.pe",
  "jorge":"jorge.fernandez@colegiomilagrosdedios.edu.pe",
  "justin bravo":"justin_bravo@colegiomilagrosdedios.edu.pe",
  "noah cuenca gallardo":"noah_cuenca@colegiomilagrosdedios.edu.pe",
  "raymond aleman bella":"raymond_aleman@colegiomilagrosdedios.edu.pe",
  "rodrigo marcelo santos trejo":"rodrigo_santos@colegiomilagrosdedios.edu.pe",
  "stefano zamora":"stefano_zamora@colegiomilagrosdedios.edu.pe",
  "valery ore":"valery_ore@colegiomilagrosdedios.edu.pe",
  "vayolet dulce maria martel":"vayolet_garayar@colegiomilagrosdedios.edu.pe"
};

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === "report" && params.requestId) {
    const cached = CacheService.getScriptCache().get(cacheKey_(params.requestId));
    return json_(cached ? JSON.parse(cached) : {ok:false,pending:true});
  }
  return json_({ok:true,reportId:CONFIG.REPORT_ID,status:"ready"});
}

function doPost(e) {
  const payload = parsePayload_(e);
  const requestId = payload.requestId || Utilities.getUuid();
  try {
    const user = verifyToken_(payload.credential);
    let result;
    if (payload.action === "saveQuestionReview") {
      if (!user.isAdmin) throw new Error("Solo el docente administrador puede guardar cambios.");
      saveQuestionReview_(payload,user);
      result = buildResponse_(user,payload.targetId || payload.studentId || "");
    } else {
      result = buildResponse_(user,payload.targetId || "");
    }
    CacheService.getScriptCache().put(cacheKey_(requestId),JSON.stringify({ok:true,data:result}),300);
  } catch (err) {
    CacheService.getScriptCache().put(cacheKey_(requestId),JSON.stringify({ok:false,message:err.message || String(err)}),300);
  }
  return json_({ok:true,queued:true,requestId:requestId});
}

function buildResponse_(user,targetId) {
  const reports = buildAllReports_();
  if (user.isAdmin) {
    const selected = targetId ? reports.find(function(report){return report.id === targetId;}) : reports[0];
    return {mode:"admin",user:user,reports:reports.map(function(report){return {id:report.id,name:report.name,email:report.email,score20:report.score20,grade:report.grade};}),report:selected || null};
  }
  const report = reports.find(function(item){return normalize_(item.email) === normalize_(user.email) && normalize_(item.name) !== "jorge";});
  return {mode:"student",user:user,report:report || null,message:report ? "" : "No hay un reporte asociado a este correo institucional. El docente puede verificar la pestaña Correos."};
}

function buildAllReports_() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const values = ss.getSheetByName(CONFIG.RESPONSES_SHEET).getDataRange().getValues();
  const headers = values[0];
  const emailMap = getEmailMap_();
  const overrides = getReviewOverrides_();
  const reports = [];
  for (let i=1;i<values.length;i+=1) {
    const row = values[i];
    const name = String(row[3] || "").trim();
    if (!name) continue;
    const id = "4S-FORM-U4-" + String(i).padStart(2,"0");
    const email = resolveEmail_(name,emailMap);
    const details = QUESTIONS.map(function(question,qIndex){
      const answer = String(row[4+qIndex] || "").trim();
      let score = scoreQuestion_(question,answer);
      let comment = commentQuestion_(question,answer,score);
      const override = overrides[id+"|"+question.n];
      if (override) {score=override.score;comment=override.comment;}
      return {id:id,n:question.n,type:question.type,prompt:String(headers[4+qIndex] || ""),answer:answer,ideal:question.ideal,explanation:question.explanation,image:question.image,score:score,max:question.max,status:status_(score,question.max),comment:comment,editable:true};
    });
    const total = round2_(details.reduce(function(sum,item){return sum+Number(item.score || 0);},0));
    const score20 = round2_(total/12*20);
    reports.push({id:id,name:name,email:email,section:"4S",rawGoogleScore:String(row[1] || ""),rawGoogleScore20:Number(row[2] || 0),basePoints:total,total:total,score20:score20,grade:grade_(score20),general:sharedGeneralComment_(score20),reviewedAt:Utilities.formatDate(new Date(),"America/Lima","dd/MM/yyyy HH:mm"),details:details});
  }
  return reports;
}

function scoreQuestion_(question,answer) {
  if (question.checkbox) {
    const selected = splitSelections_(answer);
    const correct = question.correct.map(normalize_);
    const hits = selected.filter(function(part,index,array){return correct.indexOf(part)!==-1 && array.indexOf(part)===index;}).length;
    return round2_(hits/correct.length*question.max);
  }
  const normalized = normalize_(answer);
  return question.correct.some(function(value){return normalize_(value)===normalized;}) ? question.max : 0;
}

function commentQuestion_(question,answer,score) {
  if (question.checkbox) {
    const selected = splitSelections_(answer);
    const correct = question.correct.map(normalize_);
    const hits = selected.filter(function(part,index,array){return correct.indexOf(part)!==-1 && array.indexOf(part)===index;}).length;
    return "Marcaste "+hits+" de "+correct.length+" opciones correctas. Cada acierto suma una parte proporcional y los distractores no descuentan.";
  }
  return score>=question.max ? "Respuesta correcta." : "Revisa la respuesta ideal y la explicación científica.";
}

function splitSelections_(answer) {
  return String(answer || "").split(/[,;\n]+/).map(normalize_).filter(Boolean);
}

function saveQuestionReview_(payload,user) {
  const studentId=String(payload.studentId || "").trim();
  const question=Number(payload.question);
  const definition=QUESTIONS.find(function(item){return item.n===question;});
  const score=Math.max(0,Math.min(definition ? definition.max : 1,Number(payload.score)));
  const comment=String(payload.comment || "").trim();
  if (!studentId || !question || !isFinite(score)) throw new Error("Datos incompletos para guardar.");
  const sheet=getOrCreateSheet_(CONFIG.REVIEWS_SHEET,["submissionId","correo","nombre","pregunta","puntaje","comentario","actualizado","actualizadoPor"]);
  const reports=buildAllReports_();
  const report=reports.find(function(item){return item.id===studentId;});
  const values=sheet.getDataRange().getValues();
  for (let i=1;i<values.length;i+=1) {
    if (String(values[i][0])===studentId && Number(values[i][3])===question) {
      sheet.getRange(i+1,1,1,8).setValues([[studentId,report ? report.email : "",report ? report.name : "",question,score,comment,new Date(),user.email]]);
      return;
    }
  }
  sheet.appendRow([studentId,report ? report.email : "",report ? report.name : "",question,score,comment,new Date(),user.email]);
}

function getEmailMap_() {
  const sheet=getOrCreateSheet_(CONFIG.EMAILS_SHEET,["Correo institucional","Nombre","Rol","Fuente"]);
  const values=sheet.getDataRange().getValues();
  const map={};
  for (let i=1;i<values.length;i+=1) {
    const email=String(values[i][0] || "").trim().toLowerCase();
    const name=String(values[i][1] || "").trim();
    if (email && name) map[normalize_(name)]=email;
  }
  return map;
}

function resolveEmail_(name,emailMap) {
  const key=normalize_(name);
  if (NAME_ALIASES[key]) return NAME_ALIASES[key];
  if (emailMap[key]) return emailMap[key];
  const candidates=Object.keys(emailMap).filter(function(item){return item.indexOf(key)!==-1 || key.indexOf(item)!==-1;});
  return candidates.length ? emailMap[candidates[0]] : "";
}

function getReviewOverrides_() {
  const sheet=getOrCreateSheet_(CONFIG.REVIEWS_SHEET,["submissionId","correo","nombre","pregunta","puntaje","comentario","actualizado","actualizadoPor"]);
  const values=sheet.getDataRange().getValues();
  const map={};
  for (let i=1;i<values.length;i+=1) {
    const id=String(values[i][0] || "").trim();
    const q=Number(values[i][3]);
    if (id && q) map[id+"|"+q]={score:Number(values[i][4]),comment:String(values[i][5] || "")};
  }
  return map;
}

function getOrCreateSheet_(name,headers) {
  const ss=SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet=ss.getSheetByName(name);
  if (!sheet) sheet=ss.insertSheet(name);
  if (sheet.getLastRow()===0) sheet.appendRow(headers);
  return sheet;
}

function verifyToken_(credential) {
  if (!credential) throw new Error("Falta iniciar sesión con Google.");
  const response=UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?id_token="+encodeURIComponent(credential),{muteHttpExceptions:true});
  if (response.getResponseCode()!==200) throw new Error("No se pudo verificar el token de Google.");
  const info=JSON.parse(response.getContentText());
  if (info.aud!==CONFIG.GOOGLE_CLIENT_ID) throw new Error("El identificador OAuth no coincide.");
  const email=String(info.email || "").toLowerCase();
  if (!email.endsWith("@"+CONFIG.SCHOOL_DOMAIN)) throw new Error("Usa tu cuenta institucional @"+CONFIG.SCHOOL_DOMAIN+".");
  return {email:email,name:info.name || email,picture:info.picture || "",isAdmin:CONFIG.ADMIN_EMAILS.map(function(item){return item.toLowerCase();}).indexOf(email)!==-1};
}

function parsePayload_(e){const text=e&&e.postData&&e.postData.contents?e.postData.contents:"{}";return JSON.parse(text || "{}");}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function cacheKey_(requestId){return CONFIG.REPORT_ID+":"+requestId;}
function normalize_(value){return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9+]+/g," ").trim();}
function round2_(value){return Math.round((Number(value)||0)*100)/100;}
function status_(score,max){if(score>=max)return "CORRECTA";if(score>0)return "PARCIAL";return "INCORRECTA";}
function grade_(score20){if(score20>=17)return "AD";if(score20>=12)return "A";return "B";}
function sharedGeneralComment_(score20){if(score20>=17)return "Logro destacado: comprendiste y aplicaste los contenidos centrales con claridad. Revisa los comentarios para seguir afinando tus explicaciones.";if(score20>=12)return "Logro esperado: comprendiste los contenidos centrales. Revisa cada comentario para precisar mejor las relaciones cientificas.";return "Estas en proceso: usa las respuestas ideales y los comentarios para reforzar los contenidos y sus relaciones cientificas.";}
function generalComment_(score20){if(score20>=17)return "Logro destacado: comprendes muy bien la relación y coordinación nerviosa y endocrina.";if(score20>=12)return "Logro esperado. Revisa los comentarios para precisar las rutas de comunicación y la regulación corporal.";return "Necesitas reforzar las rutas nerviosas, hormonales y el potencial de membrana. Revisa cada explicación.";}


