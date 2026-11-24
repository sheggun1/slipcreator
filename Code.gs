/** GTMC SlipCreator cloud backend. Deploy as web app: Execute as Me; Who has access: Only myself. */
const DB_SHEET_NAME = 'GTMC SlipCreator Cloud Data';
const RECORDS_TAB = 'LoginRecords';
const SETTINGS_TAB = 'Settings';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('GTMC Login Slip Creator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
function getDb_() {
  const id = PropertiesService.getScriptProperties().getProperty('SLIPCREATOR_DB_ID');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create(DB_SHEET_NAME);
  PropertiesService.getScriptProperties().setProperty('SLIPCREATOR_DB_ID', ss.getId());
  ensureSheets_(ss);
  return ss;
}
function ensureSheets_(ss) {
  let r=ss.getSheetByName(RECORDS_TAB);
  if(!r) r=ss.insertSheet(RECORDS_TAB);
  if(r.getLastRow()===0) r.appendRow(['Username','Password','Class','Student','UpdatedAt']);
  let s=ss.getSheetByName(SETTINGS_TAB);
  if(!s) s=ss.insertSheet(SETTINGS_TAB);
  if(s.getLastRow()===0) s.appendRow(['Key','Value']);
  if(!ss.getSheetByName('Instructions')) {
    const i=ss.insertSheet('Instructions');
    i.getRange(1,1,4,2).setValues([['IMPORTANT','This spreadsheet contains login credentials. Keep sharing restricted to the owner.'],['Access','Only the account that owns/deploys this script should access the web app.'],['Portal URL','https://greaterportal.vercel.app/'],['Data handling','Credentials are stored in this private Google Sheet for cross-device sync.']]);
  }
}
function db_(){const ss=getDb_();ensureSheets_(ss);return ss;}
function getCloudRecords(){
  const sh=db_().getSheetByName(RECORDS_TAB);const values=sh.getDataRange().getValues();
  if(values.length<2)return {records:[],updatedAt:null};
  return {records:values.slice(1).filter(r=>r[0]&&r[1]).map(r=>({username:String(r[0]),password:String(r[1]),klass:String(r[2]||''),student:String(r[3]||'')})),updatedAt:values.slice(1).reduce((a,r)=>r[4]&&(!a||r[4]>a)?r[4]:a,null)};
}
function saveCloudRecords(records){
  if(!Array.isArray(records))throw new Error('Invalid records data.');
  if(records.length>10000)throw new Error('Maximum 10,000 rows per save.');
  const sh=db_().getSheetByName(RECORDS_TAB);
  sh.clearContents();sh.getRange(1,1,1,5).setValues([['Username','Password','Class','Student','UpdatedAt']]);
  if(records.length){
    const now=new Date();
    const rows=records.map(r=>[String(r.username||''),String(r.password||''),String(r.klass||''),String(r.student||''),now]).filter(()=>true);
    sh.getRange(2,1,rows.length,5).setValues(rows);
  }
  return {ok:true,count:records.length,savedAt:new Date().toISOString()};
}
function getCloudSettings(){
  const sh=db_().getSheetByName(SETTINGS_TAB);const values=sh.getDataRange().getValues();const out={portalUrl:'https://greaterportal.vercel.app/',schoolLabel:'Greater Tomorrow Model College',cols:4,rows:5};
  values.slice(1).forEach(r=>{if(r[0])out[String(r[0])]=r[1]});
  return out;
}
function saveCloudSettings(settings){
  const sh=db_().getSheetByName(SETTINGS_TAB);const values=sh.getDataRange().getValues();const map={};
  values.slice(1).forEach((r,i)=>{if(r[0])map[String(r[0])]=i+2});
  Object.keys(settings||{}).forEach(k=>{const val=settings[k];if(map[k])sh.getRange(map[k],2).setValue(val);else sh.appendRow([k,val])});
  return {ok:true,settings:getCloudSettings()};
}
function getCloudStatus(){const ss=db_();return {ok:true,spreadsheetName:ss.getName(),records:getCloudRecords().records.length,spreadsheetUrl:ss.getUrl(),user:Session.getEffectiveUser().getEmail()||'Authorized account'};}

function appPasswordHash_(password,salt){return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+'|'+password));}
function authProps_(){return PropertiesService.getScriptProperties();}
function appPasswordConfigured(){return {configured:!!authProps_().getProperty('SLIPCREATOR_PASS_HASH')};}
function setupAppPassword(password){const p=authProps_();if(p.getProperty('SLIPCREATOR_PASS_HASH'))throw new Error('Password is already configured.');if(!password||String(password).length<8)throw new Error('Password must be at least 8 characters.');const salt=Utilities.getUuid();p.setProperties({SLIPCREATOR_PASS_SALT:salt,SLIPCREATOR_PASS_HASH:appPasswordHash_(String(password),salt)});return {ok:true};}
function verifyAppPassword(password){const p=authProps_();const salt=p.getProperty('SLIPCREATOR_PASS_SALT'),hash=p.getProperty('SLIPCREATOR_PASS_HASH');if(!salt||!hash)return {ok:false,unconfigured:true};return {ok:appPasswordHash_(String(password||''),salt)===hash};}
function changeAppPassword(oldPassword,newPassword){if(!newPassword||String(newPassword).length<8)throw new Error('New password must be at least 8 characters.');if(!verifyAppPassword(oldPassword).ok)throw new Error('Current password is incorrect.');const p=authProps_(),salt=Utilities.getUuid();p.setProperties({SLIPCREATOR_PASS_SALT:salt,SLIPCREATOR_PASS_HASH:appPasswordHash_(String(newPassword),salt)});return {ok:true};}
