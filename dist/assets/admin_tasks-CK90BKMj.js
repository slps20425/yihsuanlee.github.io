import{_ as ze,C as je,r as ce,S as Ve,f as We,F as Ke,h as Xe,j as X,i as Ge,k as Ye,l as be,p as Ze,u as Je,n as Qe,q as et,t as tt,v as nt,e as st,w as rt,x as we,o as ot,y as it,d as ke,a as le,z as at,A as ct}from"./index.esm-DDjZhlwz.js";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Te="firebasestorage.googleapis.com",Re="storageBucket",lt=2*60*1e3,ut=10*60*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class d extends Ke{constructor(t,n,s=0){super(Z(t),`Firebase Storage: ${n} (${Z(t)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,d.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return Z(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var u;(function(e){e.UNKNOWN="unknown",e.OBJECT_NOT_FOUND="object-not-found",e.BUCKET_NOT_FOUND="bucket-not-found",e.PROJECT_NOT_FOUND="project-not-found",e.QUOTA_EXCEEDED="quota-exceeded",e.UNAUTHENTICATED="unauthenticated",e.UNAUTHORIZED="unauthorized",e.UNAUTHORIZED_APP="unauthorized-app",e.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",e.INVALID_CHECKSUM="invalid-checksum",e.CANCELED="canceled",e.INVALID_EVENT_NAME="invalid-event-name",e.INVALID_URL="invalid-url",e.INVALID_DEFAULT_BUCKET="invalid-default-bucket",e.NO_DEFAULT_BUCKET="no-default-bucket",e.CANNOT_SLICE_BLOB="cannot-slice-blob",e.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",e.NO_DOWNLOAD_URL="no-download-url",e.INVALID_ARGUMENT="invalid-argument",e.INVALID_ARGUMENT_COUNT="invalid-argument-count",e.APP_DELETED="app-deleted",e.INVALID_ROOT_OPERATION="invalid-root-operation",e.INVALID_FORMAT="invalid-format",e.INTERNAL_ERROR="internal-error",e.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(u||(u={}));function Z(e){return"storage/"+e}function ne(){const e="An unknown error occurred, please check the error payload for server response.";return new d(u.UNKNOWN,e)}function dt(e){return new d(u.OBJECT_NOT_FOUND,"Object '"+e+"' does not exist.")}function ht(e){return new d(u.QUOTA_EXCEEDED,"Quota for bucket '"+e+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function ft(){const e="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new d(u.UNAUTHENTICATED,e)}function pt(){return new d(u.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function mt(e){return new d(u.UNAUTHORIZED,"User does not have permission to access '"+e+"'.")}function gt(){return new d(u.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function _t(){return new d(u.CANCELED,"User canceled the upload/download.")}function yt(e){return new d(u.INVALID_URL,"Invalid URL '"+e+"'.")}function bt(e){return new d(u.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}function wt(){return new d(u.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+Re+"' property when initializing the app?")}function kt(){return new d(u.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function Tt(){return new d(u.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function Rt(e){return new d(u.UNSUPPORTED_ENVIRONMENT,`${e} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function te(e){return new d(u.INVALID_ARGUMENT,e)}function Ee(){return new d(u.APP_DELETED,"The Firebase app was deleted.")}function Et(e){return new d(u.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function L(e,t){return new d(u.INVALID_FORMAT,"String does not match format '"+e+"': "+t)}function S(e){throw new d(u.INTERNAL_ERROR,"Internal error: "+e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class k{constructor(t,n){this.bucket=t,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,n){let s;try{s=k.makeFromUrl(t,n)}catch{return new k(t,"")}if(s.path==="")return s;throw bt(t)}static makeFromUrl(t,n){let s=null;const r="([A-Za-z0-9.\\-_]+)";function o(f){f.path.charAt(f.path.length-1)==="/"&&(f.path_=f.path_.slice(0,-1))}const i="(/(.*))?$",a=new RegExp("^gs://"+r+i,"i"),c={bucket:1,path:3};function l(f){f.path_=decodeURIComponent(f.path)}const h="v[A-Za-z0-9_]+",y=n.replace(/[.]/g,"\\."),g="(/([^?#]*).*)?$",T=new RegExp(`^https?://${y}/${h}/b/${r}/o${g}`,"i"),R={bucket:1,path:3},A=n===Te?"(?:storage.googleapis.com|storage.cloud.google.com)":n,p="([^?#]*)",O=new RegExp(`^https?://${A}/${r}/${p}`,"i"),b=[{regex:a,indices:c,postModify:o},{regex:T,indices:R,postModify:l},{regex:O,indices:{bucket:1,path:2},postModify:l}];for(let f=0;f<b.length;f++){const _=b[f],E=_.regex.exec(t);if(E){const qe=E[_.indices.bucket];let Y=E[_.indices.path];Y||(Y=""),s=new k(qe,Y),_.postModify(s);break}}if(s==null)throw yt(t);return s}}class At{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function It(e,t,n){let s=1,r=null,o=null,i=!1,a=0;function c(){return a===2}let l=!1;function h(...p){l||(l=!0,t.apply(null,p))}function y(p){r=setTimeout(()=>{r=null,e(T,c())},p)}function g(){o&&clearTimeout(o)}function T(p,...O){if(l){g();return}if(p){g(),h.call(null,p,...O);return}if(c()||i){g(),h.call(null,p,...O);return}s<64&&(s*=2);let b;a===1?(a=2,b=0):b=(s+Math.random())*1e3,y(b)}let R=!1;function A(p){R||(R=!0,g(),!l&&(r!==null?(p||(a=2),clearTimeout(r),y(0)):p||(a=1)))}return y(0),o=setTimeout(()=>{i=!0,A(!0)},n),A}function Ut(e){e(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ct(e){return e!==void 0}function vt(e){return typeof e=="object"&&!Array.isArray(e)}function se(e){return typeof e=="string"||e instanceof String}function ue(e){return re()&&e instanceof Blob}function re(){return typeof Blob<"u"}function de(e,t,n,s){if(s<t)throw te(`Invalid value for '${e}'. Expected ${t} or greater.`);if(s>n)throw te(`Invalid value for '${e}'. Expected ${n} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oe(e,t,n){let s=t;return n==null&&(s=`https://${t}`),`${n}://${s}/v0${e}`}function Ae(e){const t=encodeURIComponent;let n="?";for(const s in e)if(e.hasOwnProperty(s)){const r=t(s)+"="+t(e[s]);n=n+r+"&"}return n=n.slice(0,-1),n}var D;(function(e){e[e.NO_ERROR=0]="NO_ERROR",e[e.NETWORK_ERROR=1]="NETWORK_ERROR",e[e.ABORT=2]="ABORT"})(D||(D={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nt(e,t){const n=e>=500&&e<600,r=[408,429].indexOf(e)!==-1,o=t.indexOf(e)!==-1;return n||r||o}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(t,n,s,r,o,i,a,c,l,h,y,g=!0,T=!1){this.url_=t,this.method_=n,this.headers_=s,this.body_=r,this.successCodes_=o,this.additionalRetryCodes_=i,this.callback_=a,this.errorCallback_=c,this.timeout_=l,this.progressCallback_=h,this.connectionFactory_=y,this.retry=g,this.isUsingEmulator=T,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((R,A)=>{this.resolve_=R,this.reject_=A,this.start_()})}start_(){const t=(s,r)=>{if(r){s(!1,new F(!1,null,!0));return}const o=this.connectionFactory_();this.pendingConnection_=o;const i=a=>{const c=a.loaded,l=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,l)};this.progressCallback_!==null&&o.addUploadProgressListener(i),o.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&o.removeUploadProgressListener(i),this.pendingConnection_=null;const a=o.getErrorCode()===D.NO_ERROR,c=o.getStatus();if(!a||Nt(c,this.additionalRetryCodes_)&&this.retry){const h=o.getErrorCode()===D.ABORT;s(!1,new F(!1,null,h));return}const l=this.successCodes_.indexOf(c)!==-1;s(!0,new F(l,o))})},n=(s,r)=>{const o=this.resolve_,i=this.reject_,a=r.connection;if(r.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());Ct(c)?o(c):o()}catch(c){i(c)}else if(a!==null){const c=ne();c.serverResponse=a.getErrorText(),this.errorCallback_?i(this.errorCallback_(a,c)):i(c)}else if(r.canceled){const c=this.appDelete_?Ee():_t();i(c)}else{const c=gt();i(c)}};this.canceled_?n(!1,new F(!1,null,!0)):this.backoffId_=It(t,n,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&Ut(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class F{constructor(t,n,s){this.wasSuccessCode=t,this.connection=n,this.canceled=!!s}}function xt(e,t){t!==null&&t.length>0&&(e.Authorization="Firebase "+t)}function Dt(e,t){e["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function Bt(e,t){t&&(e["X-Firebase-GMPID"]=t)}function Pt(e,t){t!==null&&(e["X-Firebase-AppCheck"]=t)}function St(e,t,n,s,r,o,i=!0,a=!1){const c=Ae(e.urlParams),l=e.url+c,h=Object.assign({},e.headers);return Bt(h,t),xt(h,n),Dt(h,o),Pt(h,s),new Ot(l,e.method,h,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,r,i,a)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lt(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function Mt(...e){const t=Lt();if(t!==void 0){const n=new t;for(let s=0;s<e.length;s++)n.append(e[s]);return n.getBlob()}else{if(re())return new Blob(e);throw new d(u.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function $t(e,t,n){return e.webkitSlice?e.webkitSlice(t,n):e.mozSlice?e.mozSlice(t,n):e.slice?e.slice(t,n):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ft(e){if(typeof atob>"u")throw Rt("base-64");return atob(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const v={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class J{constructor(t,n){this.data=t,this.contentType=n||null}}function Ht(e,t){switch(e){case v.RAW:return new J(Ie(t));case v.BASE64:case v.BASE64URL:return new J(Ue(e,t));case v.DATA_URL:return new J(zt(t),jt(t))}throw ne()}function Ie(e){const t=[];for(let n=0;n<e.length;n++){let s=e.charCodeAt(n);if(s<=127)t.push(s);else if(s<=2047)t.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(n<e.length-1&&(e.charCodeAt(n+1)&64512)===56320))t.push(239,191,189);else{const o=s,i=e.charCodeAt(++n);s=65536|(o&1023)<<10|i&1023,t.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?t.push(239,191,189):t.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(t)}function qt(e){let t;try{t=decodeURIComponent(e)}catch{throw L(v.DATA_URL,"Malformed data URL.")}return Ie(t)}function Ue(e,t){switch(e){case v.BASE64:{const r=t.indexOf("-")!==-1,o=t.indexOf("_")!==-1;if(r||o)throw L(e,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case v.BASE64URL:{const r=t.indexOf("+")!==-1,o=t.indexOf("/")!==-1;if(r||o)throw L(e,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=Ft(t)}catch(r){throw r.message.includes("polyfill")?r:L(e,"Invalid character found")}const s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return s}class Ce{constructor(t){this.base64=!1,this.contentType=null;const n=t.match(/^data:([^,]+)?,/);if(n===null)throw L(v.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=n[1]||null;s!=null&&(this.base64=Vt(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=t.substring(t.indexOf(",")+1)}}function zt(e){const t=new Ce(e);return t.base64?Ue(v.BASE64,t.rest):qt(t.rest)}function jt(e){return new Ce(e).contentType}function Vt(e,t){return e.length>=t.length?e.substring(e.length-t.length)===t:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class x{constructor(t,n){let s=0,r="";ue(t)?(this.data_=t,s=t.size,r=t.type):t instanceof ArrayBuffer?(n?this.data_=new Uint8Array(t):(this.data_=new Uint8Array(t.byteLength),this.data_.set(new Uint8Array(t))),s=this.data_.length):t instanceof Uint8Array&&(n?this.data_=t:(this.data_=new Uint8Array(t.length),this.data_.set(t)),s=t.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(t,n){if(ue(this.data_)){const s=this.data_,r=$t(s,t,n);return r===null?null:new x(r)}else{const s=new Uint8Array(this.data_.buffer,t,n-t);return new x(s,!0)}}static getBlob(...t){if(re()){const n=t.map(s=>s instanceof x?s.data_:s);return new x(Mt.apply(null,n))}else{const n=t.map(i=>se(i)?Ht(v.RAW,i).data:i.data_);let s=0;n.forEach(i=>{s+=i.byteLength});const r=new Uint8Array(s);let o=0;return n.forEach(i=>{for(let a=0;a<i.length;a++)r[o++]=i[a]}),new x(r,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ve(e){let t;try{t=JSON.parse(e)}catch{return null}return vt(t)?t:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wt(e){if(e.length===0)return null;const t=e.lastIndexOf("/");return t===-1?"":e.slice(0,t)}function Kt(e,t){const n=t.split("/").filter(s=>s.length>0).join("/");return e.length===0?n:e+"/"+n}function Ne(e){const t=e.lastIndexOf("/",e.length-2);return t===-1?e:e.slice(t+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xt(e,t){return t}class m{constructor(t,n,s,r){this.server=t,this.local=n||t,this.writable=!!s,this.xform=r||Xt}}let H=null;function Gt(e){return!se(e)||e.length<2?e:Ne(e)}function Oe(){if(H)return H;const e=[];e.push(new m("bucket")),e.push(new m("generation")),e.push(new m("metageneration")),e.push(new m("name","fullPath",!0));function t(o,i){return Gt(i)}const n=new m("name");n.xform=t,e.push(n);function s(o,i){return i!==void 0?Number(i):i}const r=new m("size");return r.xform=s,e.push(r),e.push(new m("timeCreated")),e.push(new m("updated")),e.push(new m("md5Hash",null,!0)),e.push(new m("cacheControl",null,!0)),e.push(new m("contentDisposition",null,!0)),e.push(new m("contentEncoding",null,!0)),e.push(new m("contentLanguage",null,!0)),e.push(new m("contentType",null,!0)),e.push(new m("metadata","customMetadata",!0)),H=e,H}function Yt(e,t){function n(){const s=e.bucket,r=e.fullPath,o=new k(s,r);return t._makeStorageReference(o)}Object.defineProperty(e,"ref",{get:n})}function Zt(e,t,n){const s={};s.type="file";const r=n.length;for(let o=0;o<r;o++){const i=n[o];s[i.local]=i.xform(s,t[i.server])}return Yt(s,e),s}function xe(e,t,n){const s=ve(t);return s===null?null:Zt(e,s,n)}function Jt(e,t,n,s){const r=ve(t);if(r===null||!se(r.downloadTokens))return null;const o=r.downloadTokens;if(o.length===0)return null;const i=encodeURIComponent;return o.split(",").map(l=>{const h=e.bucket,y=e.fullPath,g="/b/"+i(h)+"/o/"+i(y),T=oe(g,n,s),R=Ae({alt:"media",token:l});return T+R})[0]}function Qt(e,t){const n={},s=t.length;for(let r=0;r<s;r++){const o=t[r];o.writable&&(n[o.server]=e[o.local])}return JSON.stringify(n)}class De{constructor(t,n,s,r){this.url=t,this.method=n,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Be(e){if(!e)throw ne()}function en(e,t){function n(s,r){const o=xe(e,r,t);return Be(o!==null),o}return n}function tn(e,t){function n(s,r){const o=xe(e,r,t);return Be(o!==null),Jt(o,r,e.host,e._protocol)}return n}function Pe(e){function t(n,s){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=pt():r=ft():n.getStatus()===402?r=ht(e.bucket):n.getStatus()===403?r=mt(e.path):r=s,r.status=n.getStatus(),r.serverResponse=s.serverResponse,r}return t}function nn(e){const t=Pe(e);function n(s,r){let o=t(s,r);return s.getStatus()===404&&(o=dt(e.path)),o.serverResponse=r.serverResponse,o}return n}function sn(e,t,n){const s=t.fullServerUrl(),r=oe(s,e.host,e._protocol),o="GET",i=e.maxOperationRetryTime,a=new De(r,o,tn(e,n),i);return a.errorHandler=nn(t),a}function rn(e,t){return e&&e.contentType||t&&t.type()||"application/octet-stream"}function on(e,t,n){const s=Object.assign({},n);return s.fullPath=e.path,s.size=t.size(),s.contentType||(s.contentType=rn(null,t)),s}function an(e,t,n,s,r){const o=t.bucketOnlyServerUrl(),i={"X-Goog-Upload-Protocol":"multipart"};function a(){let b="";for(let f=0;f<2;f++)b=b+Math.random().toString().slice(2);return b}const c=a();i["Content-Type"]="multipart/related; boundary="+c;const l=on(t,s,r),h=Qt(l,n),y="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+h+`\r
--`+c+`\r
Content-Type: `+l.contentType+`\r
\r
`,g=`\r
--`+c+"--",T=x.getBlob(y,s,g);if(T===null)throw kt();const R={name:l.fullPath},A=oe(o,e.host,e._protocol),p="POST",O=e.maxUploadRetryTime,I=new De(A,p,en(e,n),O);return I.urlParams=R,I.headers=i,I.body=T.uploadData(),I.errorHandler=Pe(t),I}class cn{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=D.NO_ERROR,this.sendPromise_=new Promise(t=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=D.ABORT,t()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=D.NETWORK_ERROR,t()}),this.xhr_.addEventListener("load",()=>{t()})})}send(t,n,s,r,o){if(this.sent_)throw S("cannot .send() more than once");if(be(t)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,t,!0),o!==void 0)for(const i in o)o.hasOwnProperty(i)&&this.xhr_.setRequestHeader(i,o[i].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw S("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw S("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw S("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw S("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(t){return this.xhr_.getResponseHeader(t)}addUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",t)}removeUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",t)}}class ln extends cn{initXhr(){this.xhr_.responseType="text"}}function Se(){return new ln}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(t,n){this._service=t,n instanceof k?this._location=n:this._location=k.makeFromUrl(n,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,n){return new B(t,n)}get root(){const t=new k(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Ne(this._location.path)}get storage(){return this._service}get parent(){const t=Wt(this._location.path);if(t===null)return null;const n=new k(this._location.bucket,t);return new B(this._service,n)}_throwIfRoot(t){if(this._location.path==="")throw Et(t)}}function un(e,t,n){e._throwIfRoot("uploadBytes");const s=an(e.storage,e._location,Oe(),new x(t,!0),n);return e.storage.makeRequestWithTokens(s,Se).then(r=>({metadata:r,ref:e}))}function dn(e){e._throwIfRoot("getDownloadURL");const t=sn(e.storage,e._location,Oe());return e.storage.makeRequestWithTokens(t,Se).then(n=>{if(n===null)throw Tt();return n})}function hn(e,t){const n=Kt(e._location.path,t),s=new k(e._location.bucket,n);return new B(e.storage,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fn(e){return/^[A-Za-z]+:\/\//.test(e)}function pn(e,t){return new B(e,t)}function Le(e,t){if(e instanceof ie){const n=e;if(n._bucket==null)throw wt();const s=new B(n,n._bucket);return t!=null?Le(s,t):s}else return t!==void 0?hn(e,t):e}function mn(e,t){if(t&&fn(t)){if(e instanceof ie)return pn(e,t);throw te("To use ref(service, url), the first argument must be a Storage instance.")}else return Le(e,t)}function he(e,t){const n=t==null?void 0:t[Re];return n==null?null:k.makeFromBucketSpec(n,e)}function gn(e,t,n,s={}){e.host=`${t}:${n}`;const r=be(t);r&&(Ze(`https://${e.host}/b`),Je("Storage",!0)),e._isUsingEmulator=!0,e._protocol=r?"https":"http";const{mockUserToken:o}=s;o&&(e._overrideAuthToken=typeof o=="string"?o:Qe(o,e.app.options.projectId))}class ie{constructor(t,n,s,r,o,i=!1){this.app=t,this._authProvider=n,this._appCheckProvider=s,this._url=r,this._firebaseVersion=o,this._isUsingEmulator=i,this._bucket=null,this._host=Te,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=lt,this._maxUploadRetryTime=ut,this._requests=new Set,r!=null?this._bucket=k.makeFromBucketSpec(r,this._host):this._bucket=he(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=k.makeFromBucketSpec(this._url,t):this._bucket=he(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){de("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){de("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const n=await t.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(We(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new B(this,t)}_makeRequest(t,n,s,r,o=!0){if(this._deleted)return new At(Ee());{const i=St(t,this._appId,s,r,n,this._firebaseVersion,o,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(t,n){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,n,s,r).getPromise()}}const fe="@firebase/storage",pe="0.14.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Me="storage";function _n(e,t,n){return e=X(e),un(e,t,n)}function yn(e){return e=X(e),dn(e)}function bn(e,t){return e=X(e),mn(e,t)}function wn(e=Xe(),t){e=X(e);const s=Ge(e,Me).getImmediate({identifier:t}),r=Ye("storage");return r&&kn(s,...r),s}function kn(e,t,n,s={}){gn(e,t,n,s)}function Tn(e,{instanceIdentifier:t}){const n=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return new ie(n,s,r,t,Ve)}function Rn(){ze(new je(Me,Tn,"PUBLIC").setMultipleInstances(!0)),ce(fe,pe,""),ce(fe,pe,"esm2020")}Rn();const En={apiKey:"AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",authDomain:"wise-catty.cc",projectId:"wisecat-8df8d",storageBucket:"wisecat-8df8d.firebasestorage.app",messagingSenderId:"1078479155773",appId:"1:1078479155773:web:cd62907516951aa47db054",measurementId:"G-30M228G3VP"},ae=et(En),An=tt(ae),V=nt(ae,"reservation"),In=wn(ae),me=document.getElementById("authCheck"),q=document.getElementById("mainContent"),z=document.getElementById("loginContent"),j=document.getElementById("taskTableBody"),G=document.getElementById("taskModal"),ge=document.getElementById("newTaskBtn"),_e=document.getElementById("cancelBtn"),M=document.getElementById("taskForm"),$e=document.getElementById("titleInput"),Fe=document.getElementById("priorityInput"),He=document.getElementById("descInput"),ye=document.getElementById("fileInput"),C=document.getElementById("submitBtn"),W=document.querySelector("#taskModal h2");let $=null,N=null,P=[],w={field:"priority",dir:"desc"},U=1;const Q=10;st(An,e=>{if(me&&(me.hidden=!0),e){N=e,q&&(q.hidden=!1),z&&(z.hidden=!0);const t=document.getElementById("userProfileDisplay");if(t){const n=e.displayName||e.email||"Admin",s=e.email||"",r=e.photoURL||`https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=random`;t.className="user-profile",t.innerHTML=`
                <img class="user-avatar" src="${r}" alt="User">
                <div class="user-info">
                    <div class="user-name">${n}</div>
                    <div class="user-email">${s}</div>
                </div>
                <button onclick="(window as any).firebase.auth().signOut()" class="logout-btn">Logout</button>
            `}Un()}else N=null,q&&(q.hidden=!0),z&&(z.hidden=!1)});function Un(){const e=rt(we(V,"dev_task"));ot(e,t=>{P=[],t.forEach(n=>{P.push({id:n.id,...n.data()})}),K()})}function K(){if(!j)return;if(j.innerHTML="",P.length===0){j.innerHTML='<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748b;">No tasks found. Create one!</td></tr>';return}P.sort((r,o)=>{var c,l;let i=r[w.field],a=o[w.field];return w.field==="createdBy"&&(i=((c=r.createdBy)==null?void 0:c.name)||"",a=((l=o.createdBy)==null?void 0:l.name)||""),w.field==="createdAt"&&(i=i!=null&&i.toMillis?i.toMillis():new Date(i).getTime()||0,a=a!=null&&a.toMillis?a.toMillis():new Date(a).getTime()||0),i>a?w.dir==="asc"?1:-1:i<a?w.dir==="asc"?-1:1:0});const e=Math.ceil(P.length/Q);U>e&&(U=e||1);const t=(U-1)*Q,n=t+Q;P.slice(t,n).forEach((r,o)=>{var I,b;const i=document.createElement("tr"),a=t+o+1,c=`p-${r.priority||3}`,l=r.priority||3,h=r.completed===!0,y=h?'<span class="status-badge status-done">● Done</span>':'<span class="status-badge status-pending">○ Pending</span>',g=ee(r.title||"(No Title)"),T=ee(r.content||""),R=ee(((I=r.createdBy)==null?void 0:I.name)||((b=r.createdBy)==null?void 0:b.email)||"Unknown");let A="-";if(r.createdAt){const f=r.createdAt.toDate?r.createdAt.toDate():new Date(r.createdAt);A=f.toLocaleDateString()+" "+f.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}let p="";r.attachment_url&&(p=`<br><a href="${r.attachment_url}" target="_blank" style="font-size: 0.8em; color: var(--accent);">📎 View Attachment</a>`),i.innerHTML=`
            <td style="color: var(--text-secondary); font-size: 0.8em;">${a}</td>
            <td><span class="priority-badge ${c}">P${l}</span></td>
            <td style="font-weight: 500;">
                ${g}
                ${p}
            </td>
            <td style="color: #94a3b8; font-size: 0.9em; max-width: 300px;">
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" 
                     onclick="this.style.whiteSpace=this.style.whiteSpace==='nowrap'?'pre-wrap':'nowrap'"
                     title="Click to expand/collapse">
                    ${T}
                </div>
            </td>
            <td style="font-size: 0.85em; color: #ccc;">${A}</td>
            <td style="font-size: 0.9em;">${R}</td>
            <td>${y}</td>
            <td class="action-cell"></td>
        `;const O=N&&r.createdBy&&N.uid===r.createdBy.uid;if(!h&&O){const f=i.querySelector(".action-cell");if(f){const _=document.createElement("button");_.textContent="✏️",_.style.background="transparent",_.style.border="none",_.style.cursor="pointer",_.style.fontSize="1.2rem",_.style.marginRight="8px",_.title="Edit Task",_.onclick=()=>On(r),f.appendChild(_);const E=document.createElement("button");E.textContent="🗑️",E.style.background="transparent",E.style.border="none",E.style.cursor="pointer",E.style.fontSize="1.2rem",E.title="Delete Task",E.onclick=()=>Nn(r.id),f.appendChild(E)}}j.appendChild(i)}),Cn(e)}function Cn(e){const t=document.getElementById("prevPageBtn"),n=document.getElementById("nextPageBtn"),s=document.getElementById("pageIndicator");s&&(s.textContent=`Page ${U} of ${e||1}`),t&&(t.disabled=U<=1,t.onclick=()=>{U>1&&(U--,K())}),n&&(n.disabled=U>=e,n.onclick=()=>{U<e&&(U++,K())})}document.querySelectorAll("th[data-sort]").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-sort");t&&(w.field===t?w.dir=w.dir==="asc"?"desc":"asc":(w.field=t,w.dir="desc"),K(),vn())})});function vn(){document.querySelectorAll("th[data-sort]").forEach(e=>{var s;const t=e.getAttribute("data-sort");let n=((s=e.textContent)==null?void 0:s.replace(/[↕↑↓]/g,"").trim())||"";w.field===t?(e.textContent=`${n} ${w.dir==="asc"?"↑":"↓"}`,e.style.color="var(--accent)"):(e.textContent=`${n} ↕`,e.style.color="")})}async function Nn(e){if(confirm("Are you sure you want to delete this task? This cannot be undone."))try{await it(ke(V,"dev_task",e))}catch(t){console.error("Error deleting task:",t),alert("Failed to delete task. Check console for details.")}}function ee(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function On(e){$=e.id,W&&(W.textContent="Edit Task"),C&&(C.textContent="Update Task"),$e.value=e.title||"",He.value=e.content||"",Fe.value=(e.priority||3).toString(),G.showModal()}ge&&ge.addEventListener("click",()=>{$=null,W&&(W.textContent="New Task"),C&&(C.textContent="Create Task"),M.reset(),G.showModal()});_e&&_e.addEventListener("click",()=>{G.close(),M.reset()});M&&M.addEventListener("submit",async e=>{if(e.preventDefault(),!N)return;const t=$e.value.trim(),n=He.value.trim(),s=parseInt(Fe.value,10),r=ye.files?ye.files[0]:null;if(!(!t||!n)){C.disabled=!0;try{let o=null;if(r){C.textContent="Uploading...";const i=Date.now(),a=bn(In,`task_attachments/${i}_${r.name}`),c=await _n(a,r);o=await yn(c.ref)}if($){C.textContent="Updating...";const i={title:t,content:n,priority:s,updatedAt:le()};o&&(i.attachment_url=o),await at(ke(V,"dev_task",$),i)}else{C.textContent="Saving...";const i={title:t,content:n,priority:s,attachment_url:o,completed:!1,createdAt:le(),createdBy:{uid:N.uid,email:N.email,name:N.displayName||N.email}};await ct(we(V,"dev_task"),i)}G.close(),M.reset()}catch(o){console.error("Error saving task:",o),alert("Error: "+o.message)}finally{C.disabled=!1,C.textContent=$?"Update Task":"Create Task"}}});
