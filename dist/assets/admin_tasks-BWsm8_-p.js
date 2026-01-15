import{_ as Se,C as Le,r as ie,S as Fe,f as Me,F as $e,h as He,j as z,i as qe,k as je,l as _e,p as ze,u as Ve,n as We,q as Ke,t as Xe,v as Ge,e as Ye,w as Ze,x as ge,o as Je,y as Qe,d as et,z as tt,a as nt}from"./index.esm-DQZRh4L3.js";/**
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
 */const ye="firebasestorage.googleapis.com",be="storageBucket",st=2*60*1e3,rt=10*60*1e3;/**
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
 */class d extends $e{constructor(t,n,s=0){super(K(t),`Firebase Storage: ${n} (${K(t)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,d.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return K(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var u;(function(e){e.UNKNOWN="unknown",e.OBJECT_NOT_FOUND="object-not-found",e.BUCKET_NOT_FOUND="bucket-not-found",e.PROJECT_NOT_FOUND="project-not-found",e.QUOTA_EXCEEDED="quota-exceeded",e.UNAUTHENTICATED="unauthenticated",e.UNAUTHORIZED="unauthorized",e.UNAUTHORIZED_APP="unauthorized-app",e.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",e.INVALID_CHECKSUM="invalid-checksum",e.CANCELED="canceled",e.INVALID_EVENT_NAME="invalid-event-name",e.INVALID_URL="invalid-url",e.INVALID_DEFAULT_BUCKET="invalid-default-bucket",e.NO_DEFAULT_BUCKET="no-default-bucket",e.CANNOT_SLICE_BLOB="cannot-slice-blob",e.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",e.NO_DOWNLOAD_URL="no-download-url",e.INVALID_ARGUMENT="invalid-argument",e.INVALID_ARGUMENT_COUNT="invalid-argument-count",e.APP_DELETED="app-deleted",e.INVALID_ROOT_OPERATION="invalid-root-operation",e.INVALID_FORMAT="invalid-format",e.INTERNAL_ERROR="internal-error",e.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(u||(u={}));function K(e){return"storage/"+e}function J(){const e="An unknown error occurred, please check the error payload for server response.";return new d(u.UNKNOWN,e)}function ot(e){return new d(u.OBJECT_NOT_FOUND,"Object '"+e+"' does not exist.")}function it(e){return new d(u.QUOTA_EXCEEDED,"Quota for bucket '"+e+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function at(){const e="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new d(u.UNAUTHENTICATED,e)}function ct(){return new d(u.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function lt(e){return new d(u.UNAUTHORIZED,"User does not have permission to access '"+e+"'.")}function ut(){return new d(u.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function dt(){return new d(u.CANCELED,"User canceled the upload/download.")}function ht(e){return new d(u.INVALID_URL,"Invalid URL '"+e+"'.")}function ft(e){return new d(u.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}function pt(){return new d(u.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+be+"' property when initializing the app?")}function mt(){return new d(u.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function _t(){return new d(u.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function gt(e){return new d(u.UNSUPPORTED_ENVIRONMENT,`${e} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function Z(e){return new d(u.INVALID_ARGUMENT,e)}function we(){return new d(u.APP_DELETED,"The Firebase app was deleted.")}function yt(e){return new d(u.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function P(e,t){return new d(u.INVALID_FORMAT,"String does not match format '"+e+"': "+t)}function v(e){throw new d(u.INTERNAL_ERROR,"Internal error: "+e)}/**
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
 */class w{constructor(t,n){this.bucket=t,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,n){let s;try{s=w.makeFromUrl(t,n)}catch{return new w(t,"")}if(s.path==="")return s;throw ft(t)}static makeFromUrl(t,n){let s=null;const r="([A-Za-z0-9.\\-_]+)";function o(p){p.path.charAt(p.path.length-1)==="/"&&(p.path_=p.path_.slice(0,-1))}const i="(/(.*))?$",a=new RegExp("^gs://"+r+i,"i"),c={bucket:1,path:3};function l(p){p.path_=decodeURIComponent(p.path)}const h="v[A-Za-z0-9_]+",y=n.replace(/[.]/g,"\\."),g="(/([^?#]*).*)?$",k=new RegExp(`^https?://${y}/${h}/b/${r}/o${g}`,"i"),T={bucket:1,path:3},R=n===ye?"(?:storage.googleapis.com|storage.cloud.google.com)":n,f="([^?#]*)",C=new RegExp(`^https?://${R}/${r}/${f}`,"i"),b=[{regex:a,indices:c,postModify:o},{regex:k,indices:T,postModify:l},{regex:C,indices:{bucket:1,path:2},postModify:l}];for(let p=0;p<b.length;p++){const m=b[p],V=m.regex.exec(t);if(V){const Pe=V[m.indices.bucket];let W=V[m.indices.path];W||(W=""),s=new w(Pe,W),m.postModify(s);break}}if(s==null)throw ht(t);return s}}class bt{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
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
 */function wt(e,t,n){let s=1,r=null,o=null,i=!1,a=0;function c(){return a===2}let l=!1;function h(...f){l||(l=!0,t.apply(null,f))}function y(f){r=setTimeout(()=>{r=null,e(k,c())},f)}function g(){o&&clearTimeout(o)}function k(f,...C){if(l){g();return}if(f){g(),h.call(null,f,...C);return}if(c()||i){g(),h.call(null,f,...C);return}s<64&&(s*=2);let b;a===1?(a=2,b=0):b=(s+Math.random())*1e3,y(b)}let T=!1;function R(f){T||(T=!0,g(),!l&&(r!==null?(f||(a=2),clearTimeout(r),y(0)):f||(a=1)))}return y(0),o=setTimeout(()=>{i=!0,R(!0)},n),R}function kt(e){e(!1)}/**
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
 */function Tt(e){return e!==void 0}function Rt(e){return typeof e=="object"&&!Array.isArray(e)}function Q(e){return typeof e=="string"||e instanceof String}function ae(e){return ee()&&e instanceof Blob}function ee(){return typeof Blob<"u"}function ce(e,t,n,s){if(s<t)throw Z(`Invalid value for '${e}'. Expected ${t} or greater.`);if(s>n)throw Z(`Invalid value for '${e}'. Expected ${n} or less.`)}/**
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
 */function te(e,t,n){let s=t;return n==null&&(s=`https://${t}`),`${n}://${s}/v0${e}`}function ke(e){const t=encodeURIComponent;let n="?";for(const s in e)if(e.hasOwnProperty(s)){const r=t(s)+"="+t(e[s]);n=n+r+"&"}return n=n.slice(0,-1),n}var B;(function(e){e[e.NO_ERROR=0]="NO_ERROR",e[e.NETWORK_ERROR=1]="NETWORK_ERROR",e[e.ABORT=2]="ABORT"})(B||(B={}));/**
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
 */function Et(e,t){const n=e>=500&&e<600,r=[408,429].indexOf(e)!==-1,o=t.indexOf(e)!==-1;return n||r||o}/**
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
 */class At{constructor(t,n,s,r,o,i,a,c,l,h,y,g=!0,k=!1){this.url_=t,this.method_=n,this.headers_=s,this.body_=r,this.successCodes_=o,this.additionalRetryCodes_=i,this.callback_=a,this.errorCallback_=c,this.timeout_=l,this.progressCallback_=h,this.connectionFactory_=y,this.retry=g,this.isUsingEmulator=k,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((T,R)=>{this.resolve_=T,this.reject_=R,this.start_()})}start_(){const t=(s,r)=>{if(r){s(!1,new S(!1,null,!0));return}const o=this.connectionFactory_();this.pendingConnection_=o;const i=a=>{const c=a.loaded,l=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,l)};this.progressCallback_!==null&&o.addUploadProgressListener(i),o.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&o.removeUploadProgressListener(i),this.pendingConnection_=null;const a=o.getErrorCode()===B.NO_ERROR,c=o.getStatus();if(!a||Et(c,this.additionalRetryCodes_)&&this.retry){const h=o.getErrorCode()===B.ABORT;s(!1,new S(!1,null,h));return}const l=this.successCodes_.indexOf(c)!==-1;s(!0,new S(l,o))})},n=(s,r)=>{const o=this.resolve_,i=this.reject_,a=r.connection;if(r.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());Tt(c)?o(c):o()}catch(c){i(c)}else if(a!==null){const c=J();c.serverResponse=a.getErrorText(),this.errorCallback_?i(this.errorCallback_(a,c)):i(c)}else if(r.canceled){const c=this.appDelete_?we():dt();i(c)}else{const c=ut();i(c)}};this.canceled_?n(!1,new S(!1,null,!0)):this.backoffId_=wt(t,n,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&kt(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class S{constructor(t,n,s){this.wasSuccessCode=t,this.connection=n,this.canceled=!!s}}function It(e,t){t!==null&&t.length>0&&(e.Authorization="Firebase "+t)}function Ut(e,t){e["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function Ct(e,t){t&&(e["X-Firebase-GMPID"]=t)}function Ot(e,t){t!==null&&(e["X-Firebase-AppCheck"]=t)}function Nt(e,t,n,s,r,o,i=!0,a=!1){const c=ke(e.urlParams),l=e.url+c,h=Object.assign({},e.headers);return Ct(h,t),It(h,n),Ut(h,o),Ot(h,s),new At(l,e.method,h,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,r,i,a)}/**
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
 */function Bt(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function xt(...e){const t=Bt();if(t!==void 0){const n=new t;for(let s=0;s<e.length;s++)n.append(e[s]);return n.getBlob()}else{if(ee())return new Blob(e);throw new d(u.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Dt(e,t,n){return e.webkitSlice?e.webkitSlice(t,n):e.mozSlice?e.mozSlice(t,n):e.slice?e.slice(t,n):null}/**
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
 */function vt(e){if(typeof atob>"u")throw gt("base-64");return atob(e)}/**
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
 */const U={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class X{constructor(t,n){this.data=t,this.contentType=n||null}}function Pt(e,t){switch(e){case U.RAW:return new X(Te(t));case U.BASE64:case U.BASE64URL:return new X(Re(e,t));case U.DATA_URL:return new X(Lt(t),Ft(t))}throw J()}function Te(e){const t=[];for(let n=0;n<e.length;n++){let s=e.charCodeAt(n);if(s<=127)t.push(s);else if(s<=2047)t.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(n<e.length-1&&(e.charCodeAt(n+1)&64512)===56320))t.push(239,191,189);else{const o=s,i=e.charCodeAt(++n);s=65536|(o&1023)<<10|i&1023,t.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?t.push(239,191,189):t.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(t)}function St(e){let t;try{t=decodeURIComponent(e)}catch{throw P(U.DATA_URL,"Malformed data URL.")}return Te(t)}function Re(e,t){switch(e){case U.BASE64:{const r=t.indexOf("-")!==-1,o=t.indexOf("_")!==-1;if(r||o)throw P(e,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case U.BASE64URL:{const r=t.indexOf("+")!==-1,o=t.indexOf("/")!==-1;if(r||o)throw P(e,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=vt(t)}catch(r){throw r.message.includes("polyfill")?r:P(e,"Invalid character found")}const s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return s}class Ee{constructor(t){this.base64=!1,this.contentType=null;const n=t.match(/^data:([^,]+)?,/);if(n===null)throw P(U.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=n[1]||null;s!=null&&(this.base64=Mt(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=t.substring(t.indexOf(",")+1)}}function Lt(e){const t=new Ee(e);return t.base64?Re(U.BASE64,t.rest):St(t.rest)}function Ft(e){return new Ee(e).contentType}function Mt(e,t){return e.length>=t.length?e.substring(e.length-t.length)===t:!1}/**
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
 */class O{constructor(t,n){let s=0,r="";ae(t)?(this.data_=t,s=t.size,r=t.type):t instanceof ArrayBuffer?(n?this.data_=new Uint8Array(t):(this.data_=new Uint8Array(t.byteLength),this.data_.set(new Uint8Array(t))),s=this.data_.length):t instanceof Uint8Array&&(n?this.data_=t:(this.data_=new Uint8Array(t.length),this.data_.set(t)),s=t.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(t,n){if(ae(this.data_)){const s=this.data_,r=Dt(s,t,n);return r===null?null:new O(r)}else{const s=new Uint8Array(this.data_.buffer,t,n-t);return new O(s,!0)}}static getBlob(...t){if(ee()){const n=t.map(s=>s instanceof O?s.data_:s);return new O(xt.apply(null,n))}else{const n=t.map(i=>Q(i)?Pt(U.RAW,i).data:i.data_);let s=0;n.forEach(i=>{s+=i.byteLength});const r=new Uint8Array(s);let o=0;return n.forEach(i=>{for(let a=0;a<i.length;a++)r[o++]=i[a]}),new O(r,!0)}}uploadData(){return this.data_}}/**
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
 */function Ae(e){let t;try{t=JSON.parse(e)}catch{return null}return Rt(t)?t:null}/**
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
 */function $t(e){if(e.length===0)return null;const t=e.lastIndexOf("/");return t===-1?"":e.slice(0,t)}function Ht(e,t){const n=t.split("/").filter(s=>s.length>0).join("/");return e.length===0?n:e+"/"+n}function Ie(e){const t=e.lastIndexOf("/",e.length-2);return t===-1?e:e.slice(t+1)}/**
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
 */function qt(e,t){return t}class _{constructor(t,n,s,r){this.server=t,this.local=n||t,this.writable=!!s,this.xform=r||qt}}let L=null;function jt(e){return!Q(e)||e.length<2?e:Ie(e)}function Ue(){if(L)return L;const e=[];e.push(new _("bucket")),e.push(new _("generation")),e.push(new _("metageneration")),e.push(new _("name","fullPath",!0));function t(o,i){return jt(i)}const n=new _("name");n.xform=t,e.push(n);function s(o,i){return i!==void 0?Number(i):i}const r=new _("size");return r.xform=s,e.push(r),e.push(new _("timeCreated")),e.push(new _("updated")),e.push(new _("md5Hash",null,!0)),e.push(new _("cacheControl",null,!0)),e.push(new _("contentDisposition",null,!0)),e.push(new _("contentEncoding",null,!0)),e.push(new _("contentLanguage",null,!0)),e.push(new _("contentType",null,!0)),e.push(new _("metadata","customMetadata",!0)),L=e,L}function zt(e,t){function n(){const s=e.bucket,r=e.fullPath,o=new w(s,r);return t._makeStorageReference(o)}Object.defineProperty(e,"ref",{get:n})}function Vt(e,t,n){const s={};s.type="file";const r=n.length;for(let o=0;o<r;o++){const i=n[o];s[i.local]=i.xform(s,t[i.server])}return zt(s,e),s}function Ce(e,t,n){const s=Ae(t);return s===null?null:Vt(e,s,n)}function Wt(e,t,n,s){const r=Ae(t);if(r===null||!Q(r.downloadTokens))return null;const o=r.downloadTokens;if(o.length===0)return null;const i=encodeURIComponent;return o.split(",").map(l=>{const h=e.bucket,y=e.fullPath,g="/b/"+i(h)+"/o/"+i(y),k=te(g,n,s),T=ke({alt:"media",token:l});return k+T})[0]}function Kt(e,t){const n={},s=t.length;for(let r=0;r<s;r++){const o=t[r];o.writable&&(n[o.server]=e[o.local])}return JSON.stringify(n)}class Oe{constructor(t,n,s,r){this.url=t,this.method=n,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function Ne(e){if(!e)throw J()}function Xt(e,t){function n(s,r){const o=Ce(e,r,t);return Ne(o!==null),o}return n}function Gt(e,t){function n(s,r){const o=Ce(e,r,t);return Ne(o!==null),Wt(o,r,e.host,e._protocol)}return n}function Be(e){function t(n,s){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=ct():r=at():n.getStatus()===402?r=it(e.bucket):n.getStatus()===403?r=lt(e.path):r=s,r.status=n.getStatus(),r.serverResponse=s.serverResponse,r}return t}function Yt(e){const t=Be(e);function n(s,r){let o=t(s,r);return s.getStatus()===404&&(o=ot(e.path)),o.serverResponse=r.serverResponse,o}return n}function Zt(e,t,n){const s=t.fullServerUrl(),r=te(s,e.host,e._protocol),o="GET",i=e.maxOperationRetryTime,a=new Oe(r,o,Gt(e,n),i);return a.errorHandler=Yt(t),a}function Jt(e,t){return e&&e.contentType||t&&t.type()||"application/octet-stream"}function Qt(e,t,n){const s=Object.assign({},n);return s.fullPath=e.path,s.size=t.size(),s.contentType||(s.contentType=Jt(null,t)),s}function en(e,t,n,s,r){const o=t.bucketOnlyServerUrl(),i={"X-Goog-Upload-Protocol":"multipart"};function a(){let b="";for(let p=0;p<2;p++)b=b+Math.random().toString().slice(2);return b}const c=a();i["Content-Type"]="multipart/related; boundary="+c;const l=Qt(t,s,r),h=Kt(l,n),y="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+h+`\r
--`+c+`\r
Content-Type: `+l.contentType+`\r
\r
`,g=`\r
--`+c+"--",k=O.getBlob(y,s,g);if(k===null)throw mt();const T={name:l.fullPath},R=te(o,e.host,e._protocol),f="POST",C=e.maxUploadRetryTime,A=new Oe(R,f,Xt(e,n),C);return A.urlParams=T,A.headers=i,A.body=k.uploadData(),A.errorHandler=Be(t),A}class tn{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=B.NO_ERROR,this.sendPromise_=new Promise(t=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=B.ABORT,t()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=B.NETWORK_ERROR,t()}),this.xhr_.addEventListener("load",()=>{t()})})}send(t,n,s,r,o){if(this.sent_)throw v("cannot .send() more than once");if(_e(t)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,t,!0),o!==void 0)for(const i in o)o.hasOwnProperty(i)&&this.xhr_.setRequestHeader(i,o[i].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw v("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw v("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw v("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw v("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(t){return this.xhr_.getResponseHeader(t)}addUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",t)}removeUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",t)}}class nn extends tn{initXhr(){this.xhr_.responseType="text"}}function xe(){return new nn}/**
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
 */class x{constructor(t,n){this._service=t,n instanceof w?this._location=n:this._location=w.makeFromUrl(n,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,n){return new x(t,n)}get root(){const t=new w(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Ie(this._location.path)}get storage(){return this._service}get parent(){const t=$t(this._location.path);if(t===null)return null;const n=new w(this._location.bucket,t);return new x(this._service,n)}_throwIfRoot(t){if(this._location.path==="")throw yt(t)}}function sn(e,t,n){e._throwIfRoot("uploadBytes");const s=en(e.storage,e._location,Ue(),new O(t,!0),n);return e.storage.makeRequestWithTokens(s,xe).then(r=>({metadata:r,ref:e}))}function rn(e){e._throwIfRoot("getDownloadURL");const t=Zt(e.storage,e._location,Ue());return e.storage.makeRequestWithTokens(t,xe).then(n=>{if(n===null)throw _t();return n})}function on(e,t){const n=Ht(e._location.path,t),s=new w(e._location.bucket,n);return new x(e.storage,s)}/**
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
 */function an(e){return/^[A-Za-z]+:\/\//.test(e)}function cn(e,t){return new x(e,t)}function De(e,t){if(e instanceof ne){const n=e;if(n._bucket==null)throw pt();const s=new x(n,n._bucket);return t!=null?De(s,t):s}else return t!==void 0?on(e,t):e}function ln(e,t){if(t&&an(t)){if(e instanceof ne)return cn(e,t);throw Z("To use ref(service, url), the first argument must be a Storage instance.")}else return De(e,t)}function le(e,t){const n=t==null?void 0:t[be];return n==null?null:w.makeFromBucketSpec(n,e)}function un(e,t,n,s={}){e.host=`${t}:${n}`;const r=_e(t);r&&(ze(`https://${e.host}/b`),Ve("Storage",!0)),e._isUsingEmulator=!0,e._protocol=r?"https":"http";const{mockUserToken:o}=s;o&&(e._overrideAuthToken=typeof o=="string"?o:We(o,e.app.options.projectId))}class ne{constructor(t,n,s,r,o,i=!1){this.app=t,this._authProvider=n,this._appCheckProvider=s,this._url=r,this._firebaseVersion=o,this._isUsingEmulator=i,this._bucket=null,this._host=ye,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=st,this._maxUploadRetryTime=rt,this._requests=new Set,r!=null?this._bucket=w.makeFromBucketSpec(r,this._host):this._bucket=le(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=w.makeFromBucketSpec(this._url,t):this._bucket=le(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){ce("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){ce("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const n=await t.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Me(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new x(this,t)}_makeRequest(t,n,s,r,o=!0){if(this._deleted)return new bt(we());{const i=Nt(t,this._appId,s,r,n,this._firebaseVersion,o,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(t,n){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,n,s,r).getPromise()}}const ue="@firebase/storage",de="0.14.0";/**
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
 */const ve="storage";function dn(e,t,n){return e=z(e),sn(e,t,n)}function hn(e){return e=z(e),rn(e)}function fn(e,t){return e=z(e),ln(e,t)}function pn(e=He(),t){e=z(e);const s=qe(e,ve).getImmediate({identifier:t}),r=je("storage");return r&&mn(s,...r),s}function mn(e,t,n,s={}){un(e,t,n,s)}function _n(e,{instanceIdentifier:t}){const n=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return new ne(n,s,r,t,Fe)}function gn(){Se(new Le(ve,_n,"PUBLIC").setMultipleInstances(!0)),ie(ue,de,""),ie(ue,de,"esm2020")}gn();const yn={apiKey:"AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",authDomain:"wise-catty.cc",projectId:"wisecat-8df8d",storageBucket:"wisecat-8df8d.firebasestorage.app",messagingSenderId:"1078479155773",appId:"1:1078479155773:web:cd62907516951aa47db054",measurementId:"G-30M228G3VP"},se=Ke(yn),bn=Xe(se),re=Ge(se,"reservation"),wn=pn(se),he=document.getElementById("authCheck"),F=document.getElementById("mainContent"),M=document.getElementById("loginContent"),$=document.getElementById("taskTableBody"),oe=document.getElementById("taskModal"),fe=document.getElementById("newTaskBtn"),pe=document.getElementById("cancelBtn"),q=document.getElementById("taskForm"),kn=document.getElementById("titleInput"),Tn=document.getElementById("priorityInput"),Rn=document.getElementById("descInput"),me=document.getElementById("fileInput"),H=document.getElementById("submitBtn");let N=null,D=[],E={field:"priority",dir:"desc"},I=1;const G=10;Ye(bn,e=>{he&&(he.hidden=!0),e?(N=e,F&&(F.hidden=!1),M&&(M.hidden=!0),En()):(N=null,F&&(F.hidden=!0),M&&(M.hidden=!1))});function En(){const e=Ze(ge(re,"dev_task"));Je(e,t=>{D=[],t.forEach(n=>{D.push({id:n.id,...n.data()})}),j()})}function j(){if(!$)return;if($.innerHTML="",D.length===0){$.innerHTML='<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748b;">No tasks found. Create one!</td></tr>';return}D.sort((r,o)=>{var c,l;let i=r[E.field],a=o[E.field];return E.field==="createdBy"&&(i=((c=r.createdBy)==null?void 0:c.name)||"",a=((l=o.createdBy)==null?void 0:l.name)||""),i>a?E.dir==="asc"?1:-1:0});const e=Math.ceil(D.length/G);I>e&&(I=e||1);const t=(I-1)*G,n=t+G;D.slice(t,n).forEach((r,o)=>{var A,b,p;const i=document.createElement("tr"),a=t+o+1,c=`p-${r.priority||3}`,l=r.priority||3,h=r.completed===!0,y=h?'<span class="status-badge status-done">● Done</span>':'<span class="status-badge status-pending">○ Pending</span>',g=Y(r.title||"(No Title)"),k=Y(r.content||""),T=Y(((A=r.createdBy)==null?void 0:A.name)||((b=r.createdBy)==null?void 0:b.email)||"Unknown");let R="-";if(r.createdAt){const m=r.createdAt.toDate?r.createdAt.toDate():new Date(r.createdAt);R=m.toLocaleDateString()+" "+m.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}let f="";r.attachment_url&&(f=`<br><a href="${r.attachment_url}" target="_blank" style="font-size: 0.8em; color: var(--accent);">📎 View Attachment</a>`),i.innerHTML=`
            <td style="color: var(--text-secondary); font-size: 0.8em;">${a}</td>
            <td><span class="priority-badge ${c}">P${l}</span></td>
            <td style="font-weight: 500;">
                ${g}
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
        `;const C=N&&r.createdBy&&N.uid===r.createdBy.uid;if(!h&&C){const m=document.createElement("button");m.textContent="🗑️",m.style.background="transparent",m.style.border="none",m.style.cursor="pointer",m.style.fontSize="1.2rem",m.title="Delete Task",m.onclick=()=>Un(r.id),(p=i.querySelector(".action-cell"))==null||p.appendChild(m)}$.appendChild(i)}),An(e)}function An(e){const t=document.getElementById("prevPageBtn"),n=document.getElementById("nextPageBtn"),s=document.getElementById("pageIndicator");s&&(s.textContent=`Page ${I} of ${e||1}`),t&&(t.disabled=I<=1,t.onclick=()=>{I>1&&(I--,j())}),n&&(n.disabled=I>=e,n.onclick=()=>{I<e&&(I++,j())})}document.querySelectorAll("th[data-sort]").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-sort");t&&(E.field===t?E.dir=E.dir==="asc"?"desc":"asc":(E.field=t,E.dir="desc"),j(),In())})});function In(){document.querySelectorAll("th[data-sort]").forEach(e=>{var s;const t=e.getAttribute("data-sort");let n=((s=e.textContent)==null?void 0:s.replace(/[↕↑↓]/g,"").trim())||"";E.field===t?(e.textContent=`${n} ${E.dir==="asc"?"↑":"↓"}`,e.style.color="var(--accent)"):(e.textContent=`${n} ↕`,e.style.color="")})}async function Un(e){if(confirm("Are you sure you want to delete this task? This cannot be undone."))try{await Qe(et(re,"dev_task",e))}catch(t){console.error("Error deleting task:",t),alert("Failed to delete task. Check console for details.")}}function Y(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}fe&&fe.addEventListener("click",()=>{oe.showModal()});pe&&pe.addEventListener("click",()=>{oe.close(),q.reset()});q&&q.addEventListener("submit",async e=>{if(e.preventDefault(),!N)return;const t=kn.value.trim(),n=Rn.value.trim(),s=parseInt(Tn.value,10),r=me.files?me.files[0]:null;if(!(!t||!n)){H.disabled=!0,H.textContent="Uploading...";try{let o=null;if(r){const i=Date.now(),a=fn(wn,`task_attachments/${i}_${r.name}`),c=await dn(a,r);o=await hn(c.ref)}await tt(ge(re,"dev_task"),{title:t,content:n,priority:s,completed:!1,attachment_url:o,createdAt:nt(),createdBy:{uid:N.uid,email:N.email||"Anonymous",name:N.displayName||"Unknown"}}),oe.close(),q.reset()}catch(o){console.error("Error creating task:",o),alert("Failed to create task (Check console for permission details)")}finally{H.disabled=!1,H.textContent="Create Task"}}});
