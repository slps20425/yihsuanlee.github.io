import{_ as Ke,C as Ge,r as ue,S as Xe,a as Ye,F as Ze,g as Je,c as G,b as Qe,d as et,i as Te,p as tt,u as nt,x as st,e as rt,f as ot,h as it,G as at,O as ct,v as lt,y as ut,z as Re,o as dt,A as ht,k as se,n as te,B as ft,D as pt,l as mt,m as gt,q as _t}from"./index.esm-BpHxYyIE.js";/**
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
 */const Ee="firebasestorage.googleapis.com",Ae="storageBucket",yt=2*60*1e3,wt=10*60*1e3;/**
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
 */class d extends Ze{constructor(t,n,s=0){super(Z(t),`Firebase Storage: ${n} (${Z(t)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,d.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return Z(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var u;(function(e){e.UNKNOWN="unknown",e.OBJECT_NOT_FOUND="object-not-found",e.BUCKET_NOT_FOUND="bucket-not-found",e.PROJECT_NOT_FOUND="project-not-found",e.QUOTA_EXCEEDED="quota-exceeded",e.UNAUTHENTICATED="unauthenticated",e.UNAUTHORIZED="unauthorized",e.UNAUTHORIZED_APP="unauthorized-app",e.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",e.INVALID_CHECKSUM="invalid-checksum",e.CANCELED="canceled",e.INVALID_EVENT_NAME="invalid-event-name",e.INVALID_URL="invalid-url",e.INVALID_DEFAULT_BUCKET="invalid-default-bucket",e.NO_DEFAULT_BUCKET="no-default-bucket",e.CANNOT_SLICE_BLOB="cannot-slice-blob",e.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",e.NO_DOWNLOAD_URL="no-download-url",e.INVALID_ARGUMENT="invalid-argument",e.INVALID_ARGUMENT_COUNT="invalid-argument-count",e.APP_DELETED="app-deleted",e.INVALID_ROOT_OPERATION="invalid-root-operation",e.INVALID_FORMAT="invalid-format",e.INTERNAL_ERROR="internal-error",e.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(u||(u={}));function Z(e){return"storage/"+e}function re(){const e="An unknown error occurred, please check the error payload for server response.";return new d(u.UNKNOWN,e)}function bt(e){return new d(u.OBJECT_NOT_FOUND,"Object '"+e+"' does not exist.")}function kt(e){return new d(u.QUOTA_EXCEEDED,"Quota for bucket '"+e+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function Tt(){const e="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new d(u.UNAUTHENTICATED,e)}function Rt(){return new d(u.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function Et(e){return new d(u.UNAUTHORIZED,"User does not have permission to access '"+e+"'.")}function At(){return new d(u.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function It(){return new d(u.CANCELED,"User canceled the upload/download.")}function Ut(e){return new d(u.INVALID_URL,"Invalid URL '"+e+"'.")}function Ct(e){return new d(u.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}function vt(){return new d(u.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+Ae+"' property when initializing the app?")}function Nt(){return new d(u.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function xt(){return new d(u.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function Bt(e){return new d(u.UNSUPPORTED_ENVIRONMENT,`${e} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function ne(e){return new d(u.INVALID_ARGUMENT,e)}function Ie(){return new d(u.APP_DELETED,"The Firebase app was deleted.")}function Ot(e){return new d(u.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function S(e,t){return new d(u.INVALID_FORMAT,"String does not match format '"+e+"': "+t)}function L(e){throw new d(u.INTERNAL_ERROR,"Internal error: "+e)}/**
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
 */class k{constructor(t,n){this.bucket=t,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,n){let s;try{s=k.makeFromUrl(t,n)}catch{return new k(t,"")}if(s.path==="")return s;throw Ct(t)}static makeFromUrl(t,n){let s=null;const r="([A-Za-z0-9.\\-_]+)";function o(f){f.path.charAt(f.path.length-1)==="/"&&(f.path_=f.path_.slice(0,-1))}const i="(/(.*))?$",a=new RegExp("^gs://"+r+i,"i"),c={bucket:1,path:3};function l(f){f.path_=decodeURIComponent(f.path)}const h="v[A-Za-z0-9_]+",y=n.replace(/[.]/g,"\\."),g="(/([^?#]*).*)?$",T=new RegExp(`^https?://${y}/${h}/b/${r}/o${g}`,"i"),R={bucket:1,path:3},A=n===Ee?"(?:storage.googleapis.com|storage.cloud.google.com)":n,p="([^?#]*)",x=new RegExp(`^https?://${A}/${r}/${p}`,"i"),w=[{regex:a,indices:c,postModify:o},{regex:T,indices:R,postModify:l},{regex:x,indices:{bucket:1,path:2},postModify:l}];for(let f=0;f<w.length;f++){const _=w[f],E=_.regex.exec(t);if(E){const We=E[_.indices.bucket];let Y=E[_.indices.path];Y||(Y=""),s=new k(We,Y),_.postModify(s);break}}if(s==null)throw Ut(t);return s}}class Dt{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
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
 */function Pt(e,t,n){let s=1,r=null,o=null,i=!1,a=0;function c(){return a===2}let l=!1;function h(...p){l||(l=!0,t.apply(null,p))}function y(p){r=setTimeout(()=>{r=null,e(T,c())},p)}function g(){o&&clearTimeout(o)}function T(p,...x){if(l){g();return}if(p){g(),h.call(null,p,...x);return}if(c()||i){g(),h.call(null,p,...x);return}s<64&&(s*=2);let w;a===1?(a=2,w=0):w=(s+Math.random())*1e3,y(w)}let R=!1;function A(p){R||(R=!0,g(),!l&&(r!==null?(p||(a=2),clearTimeout(r),y(0)):p||(a=1)))}return y(0),o=setTimeout(()=>{i=!0,A(!0)},n),A}function Lt(e){e(!1)}/**
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
 */function St(e){return e!==void 0}function Mt(e){return typeof e=="object"&&!Array.isArray(e)}function oe(e){return typeof e=="string"||e instanceof String}function de(e){return ie()&&e instanceof Blob}function ie(){return typeof Blob<"u"}function he(e,t,n,s){if(s<t)throw ne(`Invalid value for '${e}'. Expected ${t} or greater.`);if(s>n)throw ne(`Invalid value for '${e}'. Expected ${n} or less.`)}/**
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
 */function ae(e,t,n){let s=t;return n==null&&(s=`https://${t}`),`${n}://${s}/v0${e}`}function Ue(e){const t=encodeURIComponent;let n="?";for(const s in e)if(e.hasOwnProperty(s)){const r=t(s)+"="+t(e[s]);n=n+r+"&"}return n=n.slice(0,-1),n}var O;(function(e){e[e.NO_ERROR=0]="NO_ERROR",e[e.NETWORK_ERROR=1]="NETWORK_ERROR",e[e.ABORT=2]="ABORT"})(O||(O={}));/**
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
 */function $t(e,t){const n=e>=500&&e<600,r=[408,429].indexOf(e)!==-1,o=t.indexOf(e)!==-1;return n||r||o}/**
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
 */class Ft{constructor(t,n,s,r,o,i,a,c,l,h,y,g=!0,T=!1){this.url_=t,this.method_=n,this.headers_=s,this.body_=r,this.successCodes_=o,this.additionalRetryCodes_=i,this.callback_=a,this.errorCallback_=c,this.timeout_=l,this.progressCallback_=h,this.connectionFactory_=y,this.retry=g,this.isUsingEmulator=T,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((R,A)=>{this.resolve_=R,this.reject_=A,this.start_()})}start_(){const t=(s,r)=>{if(r){s(!1,new H(!1,null,!0));return}const o=this.connectionFactory_();this.pendingConnection_=o;const i=a=>{const c=a.loaded,l=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,l)};this.progressCallback_!==null&&o.addUploadProgressListener(i),o.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&o.removeUploadProgressListener(i),this.pendingConnection_=null;const a=o.getErrorCode()===O.NO_ERROR,c=o.getStatus();if(!a||$t(c,this.additionalRetryCodes_)&&this.retry){const h=o.getErrorCode()===O.ABORT;s(!1,new H(!1,null,h));return}const l=this.successCodes_.indexOf(c)!==-1;s(!0,new H(l,o))})},n=(s,r)=>{const o=this.resolve_,i=this.reject_,a=r.connection;if(r.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());St(c)?o(c):o()}catch(c){i(c)}else if(a!==null){const c=re();c.serverResponse=a.getErrorText(),this.errorCallback_?i(this.errorCallback_(a,c)):i(c)}else if(r.canceled){const c=this.appDelete_?Ie():It();i(c)}else{const c=At();i(c)}};this.canceled_?n(!1,new H(!1,null,!0)):this.backoffId_=Pt(t,n,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&Lt(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class H{constructor(t,n,s){this.wasSuccessCode=t,this.connection=n,this.canceled=!!s}}function Ht(e,t){t!==null&&t.length>0&&(e.Authorization="Firebase "+t)}function qt(e,t){e["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function zt(e,t){t&&(e["X-Firebase-GMPID"]=t)}function jt(e,t){t!==null&&(e["X-Firebase-AppCheck"]=t)}function Vt(e,t,n,s,r,o,i=!0,a=!1){const c=Ue(e.urlParams),l=e.url+c,h=Object.assign({},e.headers);return zt(h,t),Ht(h,n),qt(h,o),jt(h,s),new Ft(l,e.method,h,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,r,i,a)}/**
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
 */function Wt(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function Kt(...e){const t=Wt();if(t!==void 0){const n=new t;for(let s=0;s<e.length;s++)n.append(e[s]);return n.getBlob()}else{if(ie())return new Blob(e);throw new d(u.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Gt(e,t,n){return e.webkitSlice?e.webkitSlice(t,n):e.mozSlice?e.mozSlice(t,n):e.slice?e.slice(t,n):null}/**
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
 */function Xt(e){if(typeof atob>"u")throw Bt("base-64");return atob(e)}/**
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
 */const v={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class J{constructor(t,n){this.data=t,this.contentType=n||null}}function Yt(e,t){switch(e){case v.RAW:return new J(Ce(t));case v.BASE64:case v.BASE64URL:return new J(ve(e,t));case v.DATA_URL:return new J(Jt(t),Qt(t))}throw re()}function Ce(e){const t=[];for(let n=0;n<e.length;n++){let s=e.charCodeAt(n);if(s<=127)t.push(s);else if(s<=2047)t.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(n<e.length-1&&(e.charCodeAt(n+1)&64512)===56320))t.push(239,191,189);else{const o=s,i=e.charCodeAt(++n);s=65536|(o&1023)<<10|i&1023,t.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?t.push(239,191,189):t.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(t)}function Zt(e){let t;try{t=decodeURIComponent(e)}catch{throw S(v.DATA_URL,"Malformed data URL.")}return Ce(t)}function ve(e,t){switch(e){case v.BASE64:{const r=t.indexOf("-")!==-1,o=t.indexOf("_")!==-1;if(r||o)throw S(e,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case v.BASE64URL:{const r=t.indexOf("+")!==-1,o=t.indexOf("/")!==-1;if(r||o)throw S(e,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=Xt(t)}catch(r){throw r.message.includes("polyfill")?r:S(e,"Invalid character found")}const s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return s}class Ne{constructor(t){this.base64=!1,this.contentType=null;const n=t.match(/^data:([^,]+)?,/);if(n===null)throw S(v.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=n[1]||null;s!=null&&(this.base64=en(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=t.substring(t.indexOf(",")+1)}}function Jt(e){const t=new Ne(e);return t.base64?ve(v.BASE64,t.rest):Zt(t.rest)}function Qt(e){return new Ne(e).contentType}function en(e,t){return e.length>=t.length?e.substring(e.length-t.length)===t:!1}/**
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
 */class B{constructor(t,n){let s=0,r="";de(t)?(this.data_=t,s=t.size,r=t.type):t instanceof ArrayBuffer?(n?this.data_=new Uint8Array(t):(this.data_=new Uint8Array(t.byteLength),this.data_.set(new Uint8Array(t))),s=this.data_.length):t instanceof Uint8Array&&(n?this.data_=t:(this.data_=new Uint8Array(t.length),this.data_.set(t)),s=t.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(t,n){if(de(this.data_)){const s=this.data_,r=Gt(s,t,n);return r===null?null:new B(r)}else{const s=new Uint8Array(this.data_.buffer,t,n-t);return new B(s,!0)}}static getBlob(...t){if(ie()){const n=t.map(s=>s instanceof B?s.data_:s);return new B(Kt.apply(null,n))}else{const n=t.map(i=>oe(i)?Yt(v.RAW,i).data:i.data_);let s=0;n.forEach(i=>{s+=i.byteLength});const r=new Uint8Array(s);let o=0;return n.forEach(i=>{for(let a=0;a<i.length;a++)r[o++]=i[a]}),new B(r,!0)}}uploadData(){return this.data_}}/**
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
 */function xe(e){let t;try{t=JSON.parse(e)}catch{return null}return Mt(t)?t:null}/**
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
 */function tn(e){if(e.length===0)return null;const t=e.lastIndexOf("/");return t===-1?"":e.slice(0,t)}function nn(e,t){const n=t.split("/").filter(s=>s.length>0).join("/");return e.length===0?n:e+"/"+n}function Be(e){const t=e.lastIndexOf("/",e.length-2);return t===-1?e:e.slice(t+1)}/**
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
 */function sn(e,t){return t}class m{constructor(t,n,s,r){this.server=t,this.local=n||t,this.writable=!!s,this.xform=r||sn}}let q=null;function rn(e){return!oe(e)||e.length<2?e:Be(e)}function Oe(){if(q)return q;const e=[];e.push(new m("bucket")),e.push(new m("generation")),e.push(new m("metageneration")),e.push(new m("name","fullPath",!0));function t(o,i){return rn(i)}const n=new m("name");n.xform=t,e.push(n);function s(o,i){return i!==void 0?Number(i):i}const r=new m("size");return r.xform=s,e.push(r),e.push(new m("timeCreated")),e.push(new m("updated")),e.push(new m("md5Hash",null,!0)),e.push(new m("cacheControl",null,!0)),e.push(new m("contentDisposition",null,!0)),e.push(new m("contentEncoding",null,!0)),e.push(new m("contentLanguage",null,!0)),e.push(new m("contentType",null,!0)),e.push(new m("metadata","customMetadata",!0)),q=e,q}function on(e,t){function n(){const s=e.bucket,r=e.fullPath,o=new k(s,r);return t._makeStorageReference(o)}Object.defineProperty(e,"ref",{get:n})}function an(e,t,n){const s={};s.type="file";const r=n.length;for(let o=0;o<r;o++){const i=n[o];s[i.local]=i.xform(s,t[i.server])}return on(s,e),s}function De(e,t,n){const s=xe(t);return s===null?null:an(e,s,n)}function cn(e,t,n,s){const r=xe(t);if(r===null||!oe(r.downloadTokens))return null;const o=r.downloadTokens;if(o.length===0)return null;const i=encodeURIComponent;return o.split(",").map(l=>{const h=e.bucket,y=e.fullPath,g="/b/"+i(h)+"/o/"+i(y),T=ae(g,n,s),R=Ue({alt:"media",token:l});return T+R})[0]}function ln(e,t){const n={},s=t.length;for(let r=0;r<s;r++){const o=t[r];o.writable&&(n[o.server]=e[o.local])}return JSON.stringify(n)}class Pe{constructor(t,n,s,r){this.url=t,this.method=n,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function Le(e){if(!e)throw re()}function un(e,t){function n(s,r){const o=De(e,r,t);return Le(o!==null),o}return n}function dn(e,t){function n(s,r){const o=De(e,r,t);return Le(o!==null),cn(o,r,e.host,e._protocol)}return n}function Se(e){function t(n,s){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=Rt():r=Tt():n.getStatus()===402?r=kt(e.bucket):n.getStatus()===403?r=Et(e.path):r=s,r.status=n.getStatus(),r.serverResponse=s.serverResponse,r}return t}function hn(e){const t=Se(e);function n(s,r){let o=t(s,r);return s.getStatus()===404&&(o=bt(e.path)),o.serverResponse=r.serverResponse,o}return n}function fn(e,t,n){const s=t.fullServerUrl(),r=ae(s,e.host,e._protocol),o="GET",i=e.maxOperationRetryTime,a=new Pe(r,o,dn(e,n),i);return a.errorHandler=hn(t),a}function pn(e,t){return e&&e.contentType||t&&t.type()||"application/octet-stream"}function mn(e,t,n){const s=Object.assign({},n);return s.fullPath=e.path,s.size=t.size(),s.contentType||(s.contentType=pn(null,t)),s}function gn(e,t,n,s,r){const o=t.bucketOnlyServerUrl(),i={"X-Goog-Upload-Protocol":"multipart"};function a(){let w="";for(let f=0;f<2;f++)w=w+Math.random().toString().slice(2);return w}const c=a();i["Content-Type"]="multipart/related; boundary="+c;const l=mn(t,s,r),h=ln(l,n),y="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+h+`\r
--`+c+`\r
Content-Type: `+l.contentType+`\r
\r
`,g=`\r
--`+c+"--",T=B.getBlob(y,s,g);if(T===null)throw Nt();const R={name:l.fullPath},A=ae(o,e.host,e._protocol),p="POST",x=e.maxUploadRetryTime,I=new Pe(A,p,un(e,n),x);return I.urlParams=R,I.headers=i,I.body=T.uploadData(),I.errorHandler=Se(t),I}class _n{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=O.NO_ERROR,this.sendPromise_=new Promise(t=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=O.ABORT,t()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=O.NETWORK_ERROR,t()}),this.xhr_.addEventListener("load",()=>{t()})})}send(t,n,s,r,o){if(this.sent_)throw L("cannot .send() more than once");if(Te(t)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,t,!0),o!==void 0)for(const i in o)o.hasOwnProperty(i)&&this.xhr_.setRequestHeader(i,o[i].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw L("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw L("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw L("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw L("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(t){return this.xhr_.getResponseHeader(t)}addUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",t)}removeUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",t)}}class yn extends _n{initXhr(){this.xhr_.responseType="text"}}function Me(){return new yn}/**
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
 */class D{constructor(t,n){this._service=t,n instanceof k?this._location=n:this._location=k.makeFromUrl(n,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,n){return new D(t,n)}get root(){const t=new k(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Be(this._location.path)}get storage(){return this._service}get parent(){const t=tn(this._location.path);if(t===null)return null;const n=new k(this._location.bucket,t);return new D(this._service,n)}_throwIfRoot(t){if(this._location.path==="")throw Ot(t)}}function wn(e,t,n){e._throwIfRoot("uploadBytes");const s=gn(e.storage,e._location,Oe(),new B(t,!0),n);return e.storage.makeRequestWithTokens(s,Me).then(r=>({metadata:r,ref:e}))}function bn(e){e._throwIfRoot("getDownloadURL");const t=fn(e.storage,e._location,Oe());return e.storage.makeRequestWithTokens(t,Me).then(n=>{if(n===null)throw xt();return n})}function kn(e,t){const n=nn(e._location.path,t),s=new k(e._location.bucket,n);return new D(e.storage,s)}/**
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
 */function Tn(e){return/^[A-Za-z]+:\/\//.test(e)}function Rn(e,t){return new D(e,t)}function $e(e,t){if(e instanceof ce){const n=e;if(n._bucket==null)throw vt();const s=new D(n,n._bucket);return t!=null?$e(s,t):s}else return t!==void 0?kn(e,t):e}function En(e,t){if(t&&Tn(t)){if(e instanceof ce)return Rn(e,t);throw ne("To use ref(service, url), the first argument must be a Storage instance.")}else return $e(e,t)}function fe(e,t){const n=t==null?void 0:t[Ae];return n==null?null:k.makeFromBucketSpec(n,e)}function An(e,t,n,s={}){e.host=`${t}:${n}`;const r=Te(t);r&&(tt(`https://${e.host}/b`),nt("Storage",!0)),e._isUsingEmulator=!0,e._protocol=r?"https":"http";const{mockUserToken:o}=s;o&&(e._overrideAuthToken=typeof o=="string"?o:st(o,e.app.options.projectId))}class ce{constructor(t,n,s,r,o,i=!1){this.app=t,this._authProvider=n,this._appCheckProvider=s,this._url=r,this._firebaseVersion=o,this._isUsingEmulator=i,this._bucket=null,this._host=Ee,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=yt,this._maxUploadRetryTime=wt,this._requests=new Set,r!=null?this._bucket=k.makeFromBucketSpec(r,this._host):this._bucket=fe(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=k.makeFromBucketSpec(this._url,t):this._bucket=fe(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){he("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){he("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const n=await t.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Ye(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new D(this,t)}_makeRequest(t,n,s,r,o=!0){if(this._deleted)return new Dt(Ie());{const i=Vt(t,this._appId,s,r,n,this._firebaseVersion,o,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(t,n){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,n,s,r).getPromise()}}const pe="@firebase/storage",me="0.14.0";/**
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
 */const Fe="storage";function In(e,t,n){return e=G(e),wn(e,t,n)}function Un(e){return e=G(e),bn(e)}function Cn(e,t){return e=G(e),En(e,t)}function vn(e=Je(),t){e=G(e);const s=Qe(e,Fe).getImmediate({identifier:t}),r=et("storage");return r&&Nn(s,...r),s}function Nn(e,t,n,s={}){An(e,t,n,s)}function xn(e,{instanceIdentifier:t}){const n=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return new ce(n,s,r,t,Xe)}function Bn(){Ke(new Ge(Fe,xn,"PUBLIC").setMultipleInstances(!0)),ue(pe,me,""),ue(pe,me,"esm2020")}Bn();const On={apiKey:"AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",authDomain:"wise-catty.cc",projectId:"wisecat-8df8d",storageBucket:"wisecat-8df8d.firebasestorage.app",messagingSenderId:"1078479155773",appId:"1:1078479155773:web:cd62907516951aa47db054",measurementId:"G-30M228G3VP"},le=rt(On),He=ot(le),F=it(le,"reservation"),Dn=vn(le),Pn=new at,Ln=new ct("microsoft.com"),ge=document.getElementById("authCheck"),z=document.getElementById("mainContent"),j=document.getElementById("loginContent"),V=document.getElementById("taskTableBody"),X=document.getElementById("taskModal"),_e=document.getElementById("newTaskBtn"),ye=document.getElementById("cancelBtn"),M=document.getElementById("taskForm"),qe=document.getElementById("titleInput"),ze=document.getElementById("priorityInput"),je=document.getElementById("descInput"),we=document.getElementById("fileInput"),C=document.getElementById("submitBtn"),W=document.querySelector("#taskModal h2");let $=null,N=null,P=[],b={field:"priority",dir:"desc"},U=1;const Q=10;async function Ve(e){const t=document.getElementById("authError");t&&(t.textContent="");try{const s=(await mt(He,e)).user;console.log("Admin login success:",s.uid);const r=`uid_${s.uid}`,o=se(F,"users",r);(await gt(o)).exists()||(await _t(o,{name:s.displayName||"WiseCat User",email:s.email||"N/A",uid:s.uid,picture:s.photoURL||"https://ui-avatars.com/api/?name="+encodeURIComponent(s.email||"User"),credits:1,createdAt:te()}),console.log("New user document created:",r))}catch(n){console.error("Login error:",n),t&&(t.textContent="Login failed: "+n.message)}}const be=document.getElementById("googleLoginBtn"),ke=document.getElementById("microsoftLoginBtn");be&&be.addEventListener("click",()=>Ve(Pn));ke&&ke.addEventListener("click",()=>Ve(Ln));lt(He,e=>{if(ge&&(ge.hidden=!0),e){N=e,z&&(z.hidden=!1),j&&(j.hidden=!0);const t=document.getElementById("userProfileDisplay");if(t){const n=e.displayName||e.email||"Admin",s=e.email||"",r=e.photoURL||`https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=random`;t.className="user-profile",t.innerHTML=`
                <img class="user-avatar" src="${r}" alt="User">
                <div class="user-info">
                    <div class="user-name">${n}</div>
                    <div class="user-email">${s}</div>
                </div>
                <button onclick="(window as any).firebase.auth().signOut()" class="logout-btn">Logout</button>
            `}Sn()}else N=null,z&&(z.hidden=!0),j&&(j.hidden=!1)});function Sn(){const e=ut(Re(F,"dev_task"));dt(e,t=>{P=[],t.forEach(n=>{P.push({id:n.id,...n.data()})}),K()})}function K(){if(!V)return;if(V.innerHTML="",P.length===0){V.innerHTML='<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748b;">No tasks found. Create one!</td></tr>';return}P.sort((r,o)=>{var c,l;let i=r[b.field],a=o[b.field];return b.field==="createdBy"&&(i=((c=r.createdBy)==null?void 0:c.name)||"",a=((l=o.createdBy)==null?void 0:l.name)||""),b.field==="createdAt"&&(i=i!=null&&i.toMillis?i.toMillis():new Date(i).getTime()||0,a=a!=null&&a.toMillis?a.toMillis():new Date(a).getTime()||0),i>a?b.dir==="asc"?1:-1:i<a?b.dir==="asc"?-1:1:0});const e=Math.ceil(P.length/Q);U>e&&(U=e||1);const t=(U-1)*Q,n=t+Q;P.slice(t,n).forEach((r,o)=>{var I,w;const i=document.createElement("tr"),a=t+o+1,c=`p-${r.priority||3}`,l=r.priority||3,h=r.completed===!0,y=h?'<span class="status-badge status-done">● Done</span>':'<span class="status-badge status-pending">○ Pending</span>',g=ee(r.title||"(No Title)"),T=ee(r.content||""),R=ee(((I=r.createdBy)==null?void 0:I.name)||((w=r.createdBy)==null?void 0:w.email)||"Unknown");let A="-";if(r.createdAt){const f=r.createdAt.toDate?r.createdAt.toDate():new Date(r.createdAt);A=f.toLocaleDateString()+" "+f.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}let p="";r.attachment_url&&(p=`<br><a href="${r.attachment_url}" target="_blank" style="font-size: 0.8em; color: var(--accent);">📎 View Attachment</a>`),i.innerHTML=`
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
        `;const x=N&&r.createdBy&&N.uid===r.createdBy.uid;if(!h&&x){const f=i.querySelector(".action-cell");if(f){const _=document.createElement("button");_.textContent="✏️",_.style.background="transparent",_.style.border="none",_.style.cursor="pointer",_.style.fontSize="1.2rem",_.style.marginRight="8px",_.title="Edit Task",_.onclick=()=>Hn(r),f.appendChild(_);const E=document.createElement("button");E.textContent="🗑️",E.style.background="transparent",E.style.border="none",E.style.cursor="pointer",E.style.fontSize="1.2rem",E.title="Delete Task",E.onclick=()=>Fn(r.id),f.appendChild(E)}}V.appendChild(i)}),Mn(e)}function Mn(e){const t=document.getElementById("prevPageBtn"),n=document.getElementById("nextPageBtn"),s=document.getElementById("pageIndicator");s&&(s.textContent=`Page ${U} of ${e||1}`),t&&(t.disabled=U<=1,t.onclick=()=>{U>1&&(U--,K())}),n&&(n.disabled=U>=e,n.onclick=()=>{U<e&&(U++,K())})}document.querySelectorAll("th[data-sort]").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-sort");t&&(b.field===t?b.dir=b.dir==="asc"?"desc":"asc":(b.field=t,b.dir="desc"),K(),$n())})});function $n(){document.querySelectorAll("th[data-sort]").forEach(e=>{var s;const t=e.getAttribute("data-sort");let n=((s=e.textContent)==null?void 0:s.replace(/[↕↑↓]/g,"").trim())||"";b.field===t?(e.textContent=`${n} ${b.dir==="asc"?"↑":"↓"}`,e.style.color="var(--accent)"):(e.textContent=`${n} ↕`,e.style.color="")})}async function Fn(e){if(confirm("Are you sure you want to delete this task? This cannot be undone."))try{await ht(se(F,"dev_task",e))}catch(t){console.error("Error deleting task:",t),alert("Failed to delete task. Check console for details.")}}function ee(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function Hn(e){$=e.id,W&&(W.textContent="Edit Task"),C&&(C.textContent="Update Task"),qe.value=e.title||"",je.value=e.content||"",ze.value=(e.priority||3).toString(),X.showModal()}_e&&_e.addEventListener("click",()=>{$=null,W&&(W.textContent="New Task"),C&&(C.textContent="Create Task"),M.reset(),X.showModal()});ye&&ye.addEventListener("click",()=>{X.close(),M.reset()});M&&M.addEventListener("submit",async e=>{if(e.preventDefault(),!N)return;const t=qe.value.trim(),n=je.value.trim(),s=parseInt(ze.value,10),r=we.files?we.files[0]:null;if(!(!t||!n)){C.disabled=!0;try{let o=null;if(r){C.textContent="Uploading...";const i=Date.now(),a=Cn(Dn,`task_attachments/${i}_${r.name}`),c=await In(a,r);o=await Un(c.ref)}if($){C.textContent="Updating...";const i={title:t,content:n,priority:s,updatedAt:te()};o&&(i.attachment_url=o),await ft(se(F,"dev_task",$),i)}else{C.textContent="Saving...";const i={title:t,content:n,priority:s,attachment_url:o,completed:!1,createdAt:te(),createdBy:{uid:N.uid,email:N.email,name:N.displayName||N.email}};await pt(Re(F,"dev_task"),i)}X.close(),M.reset()}catch(o){console.error("Error saving task:",o),alert("Error: "+o.message)}finally{C.disabled=!1,C.textContent=$?"Update Task":"Create Task"}}});
