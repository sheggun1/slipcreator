/** GTMC SlipCreator API backend. Deploy as Web App: execute as owner, access Only myself. */
const DB_SHEET_NAME='GTMC SlipCreator Cloud Data', RECORDS_TAB='LoginRecords', SETTINGS_TAB='Settings';
function doGet(e){
  const p=(e&&e.parameter)||{}, action=String(p.action||'ping'), callback=String(p.callback||'');
  let result;
  try{result=apiGet_(action,p);}catch(err){result={ok:false,error:err.message||String(err)};}
  const body=callback&&/^[A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*$/.test(callback)
    ? callback+'('+JSON.stringify(result)+');' : JSON.stringify(result);
  return ContentService.createTextOutput(body).setMimeType(callback?ContentService.MimeType.JAVASCRIPT:ContentService.MimeType.JSON);
}
function doPost(e){
  let payload={};try{payload=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');}catch(err){return json_({ok:false,error:'Invalid JSON body.'});}
  let result;try{result=apiPost_(String(payload.action||''),payload);}catch(err){result={ok:false,error:err.message||String(err)};}
  return json_(result);
}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
function apiGet_(action,p){
  if(action==='ping')return {ok:true,service:'GTMC SlipCreator API',version:'2.0'};
  if(action==='passwordConfigured')return appPasswordConfigured();
  if(action==='verifyPassword')return verifyAppPassword(p.password||'');
  requireAuth_(p.password||'');
  if(action==='getRecords')return getCloudRecords();
  if(action==='getSettings')return getCloudSettings();
  if(action==='status')return getCloudStatus();
  throw new Error('Unknown API action: '+action);
}
function apiPost_(action,p){
  if(action==='setupPassword')return setupAppPassword(p.password);
  requireAuth_(p.password||'');
  if(action==='changePassword')return changeAppPassword(p.oldPassword,p.newPassword);
  if(action==='saveRecords')return saveCloudRecords(p.records);
  if(action==='saveSettings')return saveCloudSettings(p.settings||{});
  throw new Error('Unknown API action: '+action);
}
function requireAuth_(password){if(!verifyAppPassword(password).ok)throw new Error('Unauthorized: app password is incorrect.');}
function getDb_(){
  const props=PropertiesService.getScriptProperties(),id=props.getProperty('SLIPCREATOR_DB_ID');
  if(id){const ss=SpreadsheetApp.openById(id);ensureSheets_(ss);return ss;}
  const ss=SpreadsheetApp.create(DB_SHEET_NAME);props.setProperty('SLIPCREATOR_DB_ID',ss.getId());ensureSheets_(ss);return ss;
}
function ensureSheets_(ss){
  let r=ss.getSheetByName(RECORDS_TAB);if(!r)r=ss.insertSheet(RECORDS_TAB);
  if(r.getLastRow()===0)r.appendRow(['Username','Password','Class','Student','UpdatedAt']);
  let s=ss.getSheetByName(SETTINGS_TAB);if(!s)s=ss.insertSheet(SETTINGS_TAB);
  if(s.getLastRow()===0)s.appendRow(['Key','Value']);
  if(!ss.getSheetByName('Instructions')){const i=ss.insertSheet('Instructions');i.getRange(1,1,4,2).setValues([['IMPORTANT','This spreadsheet contains login credentials. Keep sharing restricted to the owner.'],['Access','Web app deployment must remain restricted to Only myself.'],['Portal URL','https://greaterportal.vercel.app/'],['Data handling','Credentials are stored in this private Google Sheet for cross-device sync.']]);}
}
function db_(){return getDb_();}
function getCloudRecords(){
  const sh=db_().getSheetByName(RECORDS_TAB),values=sh.getDataRange().getValues();
  if(values.length<2)return {records:[],updatedAt:null};
  return {records:values.slice(1).filter(r=>r[0]&&r[1]).map(r=>({username:String(r[0]),password:String(r[1]),klass:String(r[2]||''),student:String(r[3]||'')})),updatedAt:values.slice(1).reduce((a,r)=>r[4]&&(!a||r[4]>a)?r[4]:a,null)};
}
function saveCloudRecords(records){
  if(!Array.isArray(records))throw new Error('Records must be an array.');
  if(records.length>10000)throw new Error('Maximum 10,000 rows per save.');
  const sh=db_().getSheetByName(RECORDS_TAB);sh.clearContents();sh.getRange(1,1,1,5).setValues([['Username','Password','Class','Student','UpdatedAt']]);
  if(records.length){const now=new Date(),rows=records.map(r=>[String(r.username||''),String(r.password||''),String(r.klass||''),String(r.student||''),now]);sh.getRange(2,1,rows.length,5).setValues(rows);}
  return {ok:true,count:records.length,savedAt:new Date().toISOString()};
}
function getCloudSettings(){
  const values=db_().getSheetByName(SETTINGS_TAB).getDataRange().getValues(),out={portalUrl:'https://greaterportal.vercel.app/',schoolLabel:'Greater Tomorrow Model College',cols:4,rows:5};
  values.slice(1).forEach(r=>{if(r[0])out[String(r[0])]=r[1];});return out;
}
function saveCloudSettings(settings){
  const sh=db_().getSheetByName(SETTINGS_TAB),values=sh.getDataRange().getValues(),map={};values.slice(1).forEach((r,i)=>{if(r[0])map[String(r[0])]=i+2;});
  Object.keys(settings||{}).forEach(k=>{if(map[k])sh.getRange(map[k],2).setValue(settings[k]);else sh.appendRow([k,settings[k]]);});return {ok:true,settings:getCloudSettings()};
}
function getCloudStatus(){const ss=db_();return {ok:true,spreadsheetName:ss.getName(),records:getCloudRecords().records.length,spreadsheetUrl:ss.getUrl(),user:Session.getEffectiveUser().getEmail()||'Authorized account'};}
function appPasswordHash_(password,salt){return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+'|'+password));}
function authProps_(){return PropertiesService.getScriptProperties();}
function appPasswordConfigured(){return {configured:!!authProps_().getProperty('SLIPCREATOR_PASS_HASH')};}
function setupAppPassword(password){const p=authProps_();if(p.getProperty('SLIPCREATOR_PASS_HASH'))throw new Error('Password is already configured.');if(!password||String(password).length<8)throw new Error('Password must be at least 8 characters.');const salt=Utilities.getUuid();p.setProperties({SLIPCREATOR_PASS_SALT:salt,SLIPCREATOR_PASS_HASH:appPasswordHash_(String(password),salt)});return {ok:true};}
function verifyAppPassword(password){const p=authProps_(),salt=p.getProperty('SLIPCREATOR_PASS_SALT'),hash=p.getProperty('SLIPCREATOR_PASS_HASH');if(!salt||!hash)return {ok:false,unconfigured:true};return {ok:appPasswordHash_(String(password||''),salt)===hash};}
function changeAppPassword(oldPassword,newPassword){if(!newPassword||String(newPassword).length<8)throw new Error('New password must be at least 8 characters.');if(!verifyAppPassword(oldPassword).ok)throw new Error('Current password is incorrect.');const p=authProps_(),salt=Utilities.getUuid();p.setProperties({SLIPCREATOR_PASS_SALT:salt,SLIPCREATOR_PASS_HASH:appPasswordHash_(String(newPassword),salt)});return {ok:true};}
