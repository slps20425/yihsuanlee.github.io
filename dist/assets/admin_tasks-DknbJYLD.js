import{_ as $e,C as He,r as ie,S as qe,f as ze,F as je,h as Ve,j,i as We,k as Ke,l as be,p as Xe,u as Ge,n as Ye,q as Ze,t as Je,v as Qe,e as et,w as tt,x as we,o as nt,y as st,d as rt,z as ot,a as it}from"./index.esm-DQZRh4L3.js";/**
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
 */const ke="firebasestorage.googleapis.com",Te="storageBucket",at=2*60*1e3,ct=10*60*1e3;/**
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
 */class d extends je{constructor(t,n,s=0){super(K(t),`Firebase Storage: ${n} (${K(t)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,d.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return K(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var u;(function(e){e.UNKNOWN="unknown",e.OBJECT_NOT_FOUND="object-not-found",e.BUCKET_NOT_FOUND="bucket-not-found",e.PROJECT_NOT_FOUND="project-not-found",e.QUOTA_EXCEEDED="quota-exceeded",e.UNAUTHENTICATED="unauthenticated",e.UNAUTHORIZED="unauthorized",e.UNAUTHORIZED_APP="unauthorized-app",e.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",e.INVALID_CHECKSUM="invalid-checksum",e.CANCELED="canceled",e.INVALID_EVENT_NAME="invalid-event-name",e.INVALID_URL="invalid-url",e.INVALID_DEFAULT_BUCKET="invalid-default-bucket",e.NO_DEFAULT_BUCKET="no-default-bucket",e.CANNOT_SLICE_BLOB="cannot-slice-blob",e.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",e.NO_DOWNLOAD_URL="no-download-url",e.INVALID_ARGUMENT="invalid-argument",e.INVALID_ARGUMENT_COUNT="invalid-argument-count",e.APP_DELETED="app-deleted",e.INVALID_ROOT_OPERATION="invalid-root-operation",e.INVALID_FORMAT="invalid-format",e.INTERNAL_ERROR="internal-error",e.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(u||(u={}));function K(e){return"storage/"+e}function J(){const e="An unknown error occurred, please check the error payload for server response.";return new d(u.UNKNOWN,e)}function lt(e){return new d(u.OBJECT_NOT_FOUND,"Object '"+e+"' does not exist.")}function ut(e){return new d(u.QUOTA_EXCEEDED,"Quota for bucket '"+e+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function dt(){const e="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new d(u.UNAUTHENTICATED,e)}function ht(){return new d(u.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function ft(e){return new d(u.UNAUTHORIZED,"User does not have permission to access '"+e+"'.")}function pt(){return new d(u.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function mt(){return new d(u.CANCELED,"User canceled the upload/download.")}function gt(e){return new d(u.INVALID_URL,"Invalid URL '"+e+"'.")}function _t(e){return new d(u.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}function yt(){return new d(u.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+Te+"' property when initializing the app?")}function bt(){return new d(u.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function wt(){return new d(u.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function kt(e){return new d(u.UNSUPPORTED_ENVIRONMENT,`${e} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function Z(e){return new d(u.INVALID_ARGUMENT,e)}function Re(){return new d(u.APP_DELETED,"The Firebase app was deleted.")}function Tt(e){return new d(u.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function P(e,t){return new d(u.INVALID_FORMAT,"String does not match format '"+e+"': "+t)}function v(e){throw new d(u.INTERNAL_ERROR,"Internal error: "+e)}/**
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
 */class w{constructor(t,n){this.bucket=t,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,n){let s;try{s=w.makeFromUrl(t,n)}catch{return new w(t,"")}if(s.path==="")return s;throw _t(t)}static makeFromUrl(t,n){let s=null;const r="([A-Za-z0-9.\\-_]+)";function o(p){p.path.charAt(p.path.length-1)==="/"&&(p.path_=p.path_.slice(0,-1))}const i="(/(.*))?$",a=new RegExp("^gs://"+r+i,"i"),c={bucket:1,path:3};function l(p){p.path_=decodeURIComponent(p.path)}const h="v[A-Za-z0-9_]+",y=n.replace(/[.]/g,"\\."),_="(/([^?#]*).*)?$",k=new RegExp(`^https?://${y}/${h}/b/${r}/o${_}`,"i"),T={bucket:1,path:3},R=n===ke?"(?:storage.googleapis.com|storage.cloud.google.com)":n,f="([^?#]*)",O=new RegExp(`^https?://${R}/${r}/${f}`,"i"),b=[{regex:a,indices:c,postModify:o},{regex:k,indices:T,postModify:l},{regex:O,indices:{bucket:1,path:2},postModify:l}];for(let p=0;p<b.length;p++){const m=b[p],V=m.regex.exec(t);if(V){const Fe=V[m.indices.bucket];let W=V[m.indices.path];W||(W=""),s=new w(Fe,W),m.postModify(s);break}}if(s==null)throw gt(t);return s}}class Rt{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
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
 */function Et(e,t,n){let s=1,r=null,o=null,i=!1,a=0;function c(){return a===2}let l=!1;function h(...f){l||(l=!0,t.apply(null,f))}function y(f){r=setTimeout(()=>{r=null,e(k,c())},f)}function _(){o&&clearTimeout(o)}function k(f,...O){if(l){_();return}if(f){_(),h.call(null,f,...O);return}if(c()||i){_(),h.call(null,f,...O);return}s<64&&(s*=2);let b;a===1?(a=2,b=0):b=(s+Math.random())*1e3,y(b)}let T=!1;function R(f){T||(T=!0,_(),!l&&(r!==null?(f||(a=2),clearTimeout(r),y(0)):f||(a=1)))}return y(0),o=setTimeout(()=>{i=!0,R(!0)},n),R}function At(e){e(!1)}/**
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
 */function It(e){return e!==void 0}function Ut(e){return typeof e=="object"&&!Array.isArray(e)}function Q(e){return typeof e=="string"||e instanceof String}function ae(e){return ee()&&e instanceof Blob}function ee(){return typeof Blob<"u"}function ce(e,t,n,s){if(s<t)throw Z(`Invalid value for '${e}'. Expected ${t} or greater.`);if(s>n)throw Z(`Invalid value for '${e}'. Expected ${n} or less.`)}/**
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
 */function te(e,t,n){let s=t;return n==null&&(s=`https://${t}`),`${n}://${s}/v0${e}`}function Ee(e){const t=encodeURIComponent;let n="?";for(const s in e)if(e.hasOwnProperty(s)){const r=t(s)+"="+t(e[s]);n=n+r+"&"}return n=n.slice(0,-1),n}var B;(function(e){e[e.NO_ERROR=0]="NO_ERROR",e[e.NETWORK_ERROR=1]="NETWORK_ERROR",e[e.ABORT=2]="ABORT"})(B||(B={}));/**
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
 */function Ct(e,t){const n=e>=500&&e<600,r=[408,429].indexOf(e)!==-1,o=t.indexOf(e)!==-1;return n||r||o}/**
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
 */class Ot{constructor(t,n,s,r,o,i,a,c,l,h,y,_=!0,k=!1){this.url_=t,this.method_=n,this.headers_=s,this.body_=r,this.successCodes_=o,this.additionalRetryCodes_=i,this.callback_=a,this.errorCallback_=c,this.timeout_=l,this.progressCallback_=h,this.connectionFactory_=y,this.retry=_,this.isUsingEmulator=k,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((T,R)=>{this.resolve_=T,this.reject_=R,this.start_()})}start_(){const t=(s,r)=>{if(r){s(!1,new S(!1,null,!0));return}const o=this.connectionFactory_();this.pendingConnection_=o;const i=a=>{const c=a.loaded,l=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,l)};this.progressCallback_!==null&&o.addUploadProgressListener(i),o.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&o.removeUploadProgressListener(i),this.pendingConnection_=null;const a=o.getErrorCode()===B.NO_ERROR,c=o.getStatus();if(!a||Ct(c,this.additionalRetryCodes_)&&this.retry){const h=o.getErrorCode()===B.ABORT;s(!1,new S(!1,null,h));return}const l=this.successCodes_.indexOf(c)!==-1;s(!0,new S(l,o))})},n=(s,r)=>{const o=this.resolve_,i=this.reject_,a=r.connection;if(r.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());It(c)?o(c):o()}catch(c){i(c)}else if(a!==null){const c=J();c.serverResponse=a.getErrorText(),this.errorCallback_?i(this.errorCallback_(a,c)):i(c)}else if(r.canceled){const c=this.appDelete_?Re():mt();i(c)}else{const c=pt();i(c)}};this.canceled_?n(!1,new S(!1,null,!0)):this.backoffId_=Et(t,n,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&At(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class S{constructor(t,n,s){this.wasSuccessCode=t,this.connection=n,this.canceled=!!s}}function Nt(e,t){t!==null&&t.length>0&&(e.Authorization="Firebase "+t)}function Bt(e,t){e["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function xt(e,t){t&&(e["X-Firebase-GMPID"]=t)}function Dt(e,t){t!==null&&(e["X-Firebase-AppCheck"]=t)}function vt(e,t,n,s,r,o,i=!0,a=!1){const c=Ee(e.urlParams),l=e.url+c,h=Object.assign({},e.headers);return xt(h,t),Nt(h,n),Bt(h,o),Dt(h,s),new Ot(l,e.method,h,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,r,i,a)}/**
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
 */function Pt(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function St(...e){const t=Pt();if(t!==void 0){const n=new t;for(let s=0;s<e.length;s++)n.append(e[s]);return n.getBlob()}else{if(ee())return new Blob(e);throw new d(u.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Lt(e,t,n){return e.webkitSlice?e.webkitSlice(t,n):e.mozSlice?e.mozSlice(t,n):e.slice?e.slice(t,n):null}/**
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
 */function Mt(e){if(typeof atob>"u")throw kt("base-64");return atob(e)}/**
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
 */const U={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class X{constructor(t,n){this.data=t,this.contentType=n||null}}function Ft(e,t){switch(e){case U.RAW:return new X(Ae(t));case U.BASE64:case U.BASE64URL:return new X(Ie(e,t));case U.DATA_URL:return new X(Ht(t),qt(t))}throw J()}function Ae(e){const t=[];for(let n=0;n<e.length;n++){let s=e.charCodeAt(n);if(s<=127)t.push(s);else if(s<=2047)t.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(n<e.length-1&&(e.charCodeAt(n+1)&64512)===56320))t.push(239,191,189);else{const o=s,i=e.charCodeAt(++n);s=65536|(o&1023)<<10|i&1023,t.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?t.push(239,191,189):t.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(t)}function $t(e){let t;try{t=decodeURIComponent(e)}catch{throw P(U.DATA_URL,"Malformed data URL.")}return Ae(t)}function Ie(e,t){switch(e){case U.BASE64:{const r=t.indexOf("-")!==-1,o=t.indexOf("_")!==-1;if(r||o)throw P(e,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case U.BASE64URL:{const r=t.indexOf("+")!==-1,o=t.indexOf("/")!==-1;if(r||o)throw P(e,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=Mt(t)}catch(r){throw r.message.includes("polyfill")?r:P(e,"Invalid character found")}const s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return s}class Ue{constructor(t){this.base64=!1,this.contentType=null;const n=t.match(/^data:([^,]+)?,/);if(n===null)throw P(U.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=n[1]||null;s!=null&&(this.base64=zt(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=t.substring(t.indexOf(",")+1)}}function Ht(e){const t=new Ue(e);return t.base64?Ie(U.BASE64,t.rest):$t(t.rest)}function qt(e){return new Ue(e).contentType}function zt(e,t){return e.length>=t.length?e.substring(e.length-t.length)===t:!1}/**
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
 */class N{constructor(t,n){let s=0,r="";ae(t)?(this.data_=t,s=t.size,r=t.type):t instanceof ArrayBuffer?(n?this.data_=new Uint8Array(t):(this.data_=new Uint8Array(t.byteLength),this.data_.set(new Uint8Array(t))),s=this.data_.length):t instanceof Uint8Array&&(n?this.data_=t:(this.data_=new Uint8Array(t.length),this.data_.set(t)),s=t.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(t,n){if(ae(this.data_)){const s=this.data_,r=Lt(s,t,n);return r===null?null:new N(r)}else{const s=new Uint8Array(this.data_.buffer,t,n-t);return new N(s,!0)}}static getBlob(...t){if(ee()){const n=t.map(s=>s instanceof N?s.data_:s);return new N(St.apply(null,n))}else{const n=t.map(i=>Q(i)?Ft(U.RAW,i).data:i.data_);let s=0;n.forEach(i=>{s+=i.byteLength});const r=new Uint8Array(s);let o=0;return n.forEach(i=>{for(let a=0;a<i.length;a++)r[o++]=i[a]}),new N(r,!0)}}uploadData(){return this.data_}}/**
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
 */function Ce(e){let t;try{t=JSON.parse(e)}catch{return null}return Ut(t)?t:null}/**
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
 */function jt(e){if(e.length===0)return null;const t=e.lastIndexOf("/");return t===-1?"":e.slice(0,t)}function Vt(e,t){const n=t.split("/").filter(s=>s.length>0).join("/");return e.length===0?n:e+"/"+n}function Oe(e){const t=e.lastIndexOf("/",e.length-2);return t===-1?e:e.slice(t+1)}/**
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
 */function Wt(e,t){return t}class g{constructor(t,n,s,r){this.server=t,this.local=n||t,this.writable=!!s,this.xform=r||Wt}}let L=null;function Kt(e){return!Q(e)||e.length<2?e:Oe(e)}function Ne(){if(L)return L;const e=[];e.push(new g("bucket")),e.push(new g("generation")),e.push(new g("metageneration")),e.push(new g("name","fullPath",!0));function t(o,i){return Kt(i)}const n=new g("name");n.xform=t,e.push(n);function s(o,i){return i!==void 0?Number(i):i}const r=new g("size");return r.xform=s,e.push(r),e.push(new g("timeCreated")),e.push(new g("updated")),e.push(new g("md5Hash",null,!0)),e.push(new g("cacheControl",null,!0)),e.push(new g("contentDisposition",null,!0)),e.push(new g("contentEncoding",null,!0)),e.push(new g("contentLanguage",null,!0)),e.push(new g("contentType",null,!0)),e.push(new g("metadata","customMetadata",!0)),L=e,L}function Xt(e,t){function n(){const s=e.bucket,r=e.fullPath,o=new w(s,r);return t._makeStorageReference(o)}Object.defineProperty(e,"ref",{get:n})}function Gt(e,t,n){const s={};s.type="file";const r=n.length;for(let o=0;o<r;o++){const i=n[o];s[i.local]=i.xform(s,t[i.server])}return Xt(s,e),s}function Be(e,t,n){const s=Ce(t);return s===null?null:Gt(e,s,n)}function Yt(e,t,n,s){const r=Ce(t);if(r===null||!Q(r.downloadTokens))return null;const o=r.downloadTokens;if(o.length===0)return null;const i=encodeURIComponent;return o.split(",").map(l=>{const h=e.bucket,y=e.fullPath,_="/b/"+i(h)+"/o/"+i(y),k=te(_,n,s),T=Ee({alt:"media",token:l});return k+T})[0]}function Zt(e,t){const n={},s=t.length;for(let r=0;r<s;r++){const o=t[r];o.writable&&(n[o.server]=e[o.local])}return JSON.stringify(n)}class xe{constructor(t,n,s,r){this.url=t,this.method=n,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function De(e){if(!e)throw J()}function Jt(e,t){function n(s,r){const o=Be(e,r,t);return De(o!==null),o}return n}function Qt(e,t){function n(s,r){const o=Be(e,r,t);return De(o!==null),Yt(o,r,e.host,e._protocol)}return n}function ve(e){function t(n,s){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=ht():r=dt():n.getStatus()===402?r=ut(e.bucket):n.getStatus()===403?r=ft(e.path):r=s,r.status=n.getStatus(),r.serverResponse=s.serverResponse,r}return t}function en(e){const t=ve(e);function n(s,r){let o=t(s,r);return s.getStatus()===404&&(o=lt(e.path)),o.serverResponse=r.serverResponse,o}return n}function tn(e,t,n){const s=t.fullServerUrl(),r=te(s,e.host,e._protocol),o="GET",i=e.maxOperationRetryTime,a=new xe(r,o,Qt(e,n),i);return a.errorHandler=en(t),a}function nn(e,t){return e&&e.contentType||t&&t.type()||"application/octet-stream"}function sn(e,t,n){const s=Object.assign({},n);return s.fullPath=e.path,s.size=t.size(),s.contentType||(s.contentType=nn(null,t)),s}function rn(e,t,n,s,r){const o=t.bucketOnlyServerUrl(),i={"X-Goog-Upload-Protocol":"multipart"};function a(){let b="";for(let p=0;p<2;p++)b=b+Math.random().toString().slice(2);return b}const c=a();i["Content-Type"]="multipart/related; boundary="+c;const l=sn(t,s,r),h=Zt(l,n),y="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+h+`\r
--`+c+`\r
Content-Type: `+l.contentType+`\r
\r
`,_=`\r
--`+c+"--",k=N.getBlob(y,s,_);if(k===null)throw bt();const T={name:l.fullPath},R=te(o,e.host,e._protocol),f="POST",O=e.maxUploadRetryTime,A=new xe(R,f,Jt(e,n),O);return A.urlParams=T,A.headers=i,A.body=k.uploadData(),A.errorHandler=ve(t),A}class on{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=B.NO_ERROR,this.sendPromise_=new Promise(t=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=B.ABORT,t()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=B.NETWORK_ERROR,t()}),this.xhr_.addEventListener("load",()=>{t()})})}send(t,n,s,r,o){if(this.sent_)throw v("cannot .send() more than once");if(be(t)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,t,!0),o!==void 0)for(const i in o)o.hasOwnProperty(i)&&this.xhr_.setRequestHeader(i,o[i].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw v("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw v("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw v("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw v("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(t){return this.xhr_.getResponseHeader(t)}addUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",t)}removeUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",t)}}class an extends on{initXhr(){this.xhr_.responseType="text"}}function Pe(){return new an}/**
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
 */class x{constructor(t,n){this._service=t,n instanceof w?this._location=n:this._location=w.makeFromUrl(n,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,n){return new x(t,n)}get root(){const t=new w(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Oe(this._location.path)}get storage(){return this._service}get parent(){const t=jt(this._location.path);if(t===null)return null;const n=new w(this._location.bucket,t);return new x(this._service,n)}_throwIfRoot(t){if(this._location.path==="")throw Tt(t)}}function cn(e,t,n){e._throwIfRoot("uploadBytes");const s=rn(e.storage,e._location,Ne(),new N(t,!0),n);return e.storage.makeRequestWithTokens(s,Pe).then(r=>({metadata:r,ref:e}))}function ln(e){e._throwIfRoot("getDownloadURL");const t=tn(e.storage,e._location,Ne());return e.storage.makeRequestWithTokens(t,Pe).then(n=>{if(n===null)throw wt();return n})}function un(e,t){const n=Vt(e._location.path,t),s=new w(e._location.bucket,n);return new x(e.storage,s)}/**
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
 */function dn(e){return/^[A-Za-z]+:\/\//.test(e)}function hn(e,t){return new x(e,t)}function Se(e,t){if(e instanceof ne){const n=e;if(n._bucket==null)throw yt();const s=new x(n,n._bucket);return t!=null?Se(s,t):s}else return t!==void 0?un(e,t):e}function fn(e,t){if(t&&dn(t)){if(e instanceof ne)return hn(e,t);throw Z("To use ref(service, url), the first argument must be a Storage instance.")}else return Se(e,t)}function le(e,t){const n=t==null?void 0:t[Te];return n==null?null:w.makeFromBucketSpec(n,e)}function pn(e,t,n,s={}){e.host=`${t}:${n}`;const r=be(t);r&&(Xe(`https://${e.host}/b`),Ge("Storage",!0)),e._isUsingEmulator=!0,e._protocol=r?"https":"http";const{mockUserToken:o}=s;o&&(e._overrideAuthToken=typeof o=="string"?o:Ye(o,e.app.options.projectId))}class ne{constructor(t,n,s,r,o,i=!1){this.app=t,this._authProvider=n,this._appCheckProvider=s,this._url=r,this._firebaseVersion=o,this._isUsingEmulator=i,this._bucket=null,this._host=ke,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=at,this._maxUploadRetryTime=ct,this._requests=new Set,r!=null?this._bucket=w.makeFromBucketSpec(r,this._host):this._bucket=le(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=w.makeFromBucketSpec(this._url,t):this._bucket=le(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){ce("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){ce("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const n=await t.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(ze(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new x(this,t)}_makeRequest(t,n,s,r,o=!0){if(this._deleted)return new Rt(Re());{const i=vt(t,this._appId,s,r,n,this._firebaseVersion,o,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(t,n){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,n,s,r).getPromise()}}const ue="@firebase/storage",de="0.14.0";/**
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
 */const Le="storage";function mn(e,t,n){return e=j(e),cn(e,t,n)}function gn(e){return e=j(e),ln(e)}function _n(e,t){return e=j(e),fn(e,t)}function yn(e=Ve(),t){e=j(e);const s=We(e,Le).getImmediate({identifier:t}),r=Ke("storage");return r&&bn(s,...r),s}function bn(e,t,n,s={}){pn(e,t,n,s)}function wn(e,{instanceIdentifier:t}){const n=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return new ne(n,s,r,t,qe)}function kn(){$e(new He(Le,wn,"PUBLIC").setMultipleInstances(!0)),ie(ue,de,""),ie(ue,de,"esm2020")}kn();const Tn={apiKey:"AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",authDomain:"wise-catty.cc",projectId:"wisecat-8df8d",storageBucket:"wisecat-8df8d.firebasestorage.app",messagingSenderId:"1078479155773",appId:"1:1078479155773:web:cd62907516951aa47db054",measurementId:"G-30M228G3VP"},se=Ze(Tn),Rn=Je(se),re=Qe(se,"reservation"),En=yn(se),he=document.getElementById("authCheck"),M=document.getElementById("mainContent"),F=document.getElementById("loginContent"),$=document.getElementById("taskTableBody"),oe=document.getElementById("taskModal"),fe=document.getElementById("newTaskBtn"),pe=document.getElementById("cancelBtn"),q=document.getElementById("taskForm"),An=document.getElementById("titleInput"),In=document.getElementById("priorityInput"),Un=document.getElementById("descInput"),me=document.getElementById("fileInput"),H=document.getElementById("submitBtn");let C=null,D=[],E={field:"priority",dir:"desc"},I=1;const G=10;et(Rn,e=>{if(he&&(he.hidden=!0),e){C=e,M&&(M.hidden=!1),F&&(F.hidden=!0);const t=document.getElementById("userProfileDisplay");if(t){const n=e.displayName||e.email||"Admin",s=e.photoURL||`https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=random`;t.innerHTML=`
                <img src="${s}" style="width: 24px; height: 24px; border-radius: 50%;">
                <span style="color: var(--text-secondary);">${n}</span>
                <button onclick="(window as any).firebase.auth().signOut()" style="background:none; border:none; cursor:pointer; font-size:0.8em; color: var(--danger);">✕</button>
            `}On()}else C=null,M&&(M.hidden=!0),F&&(F.hidden=!1)});var _e;const ge=(_e=data.createdBy)==null?void 0:_e.uid,Cn=C&&ge&&C.uid===ge;var ye;if(!isDone&&Cn){const e=document.createElement("button");e.textContent="🗑️",e.style.background="transparent",e.style.border="none",e.style.cursor="pointer",e.style.fontSize="1.2rem",e.title="Delete Task (Only Owner)",e.onclick=()=>Me(data.id),(ye=row.querySelector(".action-cell"))==null||ye.appendChild(e)}function On(){const e=tt(we(re,"dev_task"));nt(e,t=>{D=[],t.forEach(n=>{D.push({id:n.id,...n.data()})}),z()})}function z(){if(!$)return;if($.innerHTML="",D.length===0){$.innerHTML='<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748b;">No tasks found. Create one!</td></tr>';return}D.sort((r,o)=>{var c,l;let i=r[E.field],a=o[E.field];return E.field==="createdBy"&&(i=((c=r.createdBy)==null?void 0:c.name)||"",a=((l=o.createdBy)==null?void 0:l.name)||""),i>a?E.dir==="asc"?1:-1:0});const e=Math.ceil(D.length/G);I>e&&(I=e||1);const t=(I-1)*G,n=t+G;D.slice(t,n).forEach((r,o)=>{var A,b,p;const i=document.createElement("tr"),a=t+o+1,c=`p-${r.priority||3}`,l=r.priority||3,h=r.completed===!0,y=h?'<span class="status-badge status-done">● Done</span>':'<span class="status-badge status-pending">○ Pending</span>',_=Y(r.title||"(No Title)"),k=Y(r.content||""),T=Y(((A=r.createdBy)==null?void 0:A.name)||((b=r.createdBy)==null?void 0:b.email)||"Unknown");let R="-";if(r.createdAt){const m=r.createdAt.toDate?r.createdAt.toDate():new Date(r.createdAt);R=m.toLocaleDateString()+" "+m.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}let f="";r.attachment_url&&(f=`<br><a href="${r.attachment_url}" target="_blank" style="font-size: 0.8em; color: var(--accent);">📎 View Attachment</a>`),i.innerHTML=`
            <td style="color: var(--text-secondary); font-size: 0.8em;">${a}</td>
            <td><span class="priority-badge ${c}">P${l}</span></td>
            <td style="font-weight: 500;">
                ${_}
                ${f}
            </td>
            <td style="color: #94a3b8; font-size: 0.9em; max-width: 300px;">
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" 
                     onclick="this.style.whiteSpace=this.style.whiteSpace==='nowrap'?'pre-wrap':'nowrap'"
                     title="Click to expand/collapse">
                    ${k}
                </div>
            </td>
            <td style="font-size: 0.85em; color: #ccc;">${R}</td>
            <td style="font-size: 0.9em;">${T}</td>
            <td>${y}</td>
            <td class="action-cell"></td>
        `;const O=C&&r.createdBy&&C.uid===r.createdBy.uid;if(!h&&O){const m=document.createElement("button");m.textContent="🗑️",m.style.background="transparent",m.style.border="none",m.style.cursor="pointer",m.style.fontSize="1.2rem",m.title="Delete Task",m.onclick=()=>Me(r.id),(p=i.querySelector(".action-cell"))==null||p.appendChild(m)}$.appendChild(i)}),Nn(e)}function Nn(e){const t=document.getElementById("prevPageBtn"),n=document.getElementById("nextPageBtn"),s=document.getElementById("pageIndicator");s&&(s.textContent=`Page ${I} of ${e||1}`),t&&(t.disabled=I<=1,t.onclick=()=>{I>1&&(I--,z())}),n&&(n.disabled=I>=e,n.onclick=()=>{I<e&&(I++,z())})}document.querySelectorAll("th[data-sort]").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-sort");t&&(E.field===t?E.dir=E.dir==="asc"?"desc":"asc":(E.field=t,E.dir="desc"),z(),Bn())})});function Bn(){document.querySelectorAll("th[data-sort]").forEach(e=>{var s;const t=e.getAttribute("data-sort");let n=((s=e.textContent)==null?void 0:s.replace(/[↕↑↓]/g,"").trim())||"";E.field===t?(e.textContent=`${n} ${E.dir==="asc"?"↑":"↓"}`,e.style.color="var(--accent)"):(e.textContent=`${n} ↕`,e.style.color="")})}async function Me(e){if(confirm("Are you sure you want to delete this task? This cannot be undone."))try{await st(rt(re,"dev_task",e))}catch(t){console.error("Error deleting task:",t),alert("Failed to delete task. Check console for details.")}}function Y(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}fe&&fe.addEventListener("click",()=>{oe.showModal()});pe&&pe.addEventListener("click",()=>{oe.close(),q.reset()});q&&q.addEventListener("submit",async e=>{if(e.preventDefault(),!C)return;const t=An.value.trim(),n=Un.value.trim(),s=parseInt(In.value,10),r=me.files?me.files[0]:null;if(!(!t||!n)){H.disabled=!0,H.textContent="Uploading...";try{let o=null;if(r){const i=Date.now(),a=_n(En,`task_attachments/${i}_${r.name}`),c=await mn(a,r);o=await gn(c.ref)}await ot(we(re,"dev_task"),{title:t,content:n,priority:s,completed:!1,attachment_url:o,createdAt:it(),createdBy:{uid:C.uid,email:C.email||"Anonymous",name:C.displayName||"Unknown"}}),oe.close(),q.reset()}catch(o){console.error("Error creating task:",o),alert("Failed to create task (Check console for permission details)")}finally{H.disabled=!1,H.textContent="Create Task"}}});
