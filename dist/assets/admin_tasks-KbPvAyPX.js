import{_ as Pe,C as Be,r as te,S as ve,h as xe,F as Le,i as Se,j as $,k as Fe,l as Me,m as he,p as $e,u as He,n as je,q as qe,t as ze,v as Ve,e as We,w as Ke,x as ne,y as fe,o as Xe,z as Ge,d as Ye,A as Ze,a as Je}from"./index.esm-RnKsCKOo.js";/**
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
 */const pe="firebasestorage.googleapis.com",_e="storageBucket",Qe=2*60*1e3,et=10*60*1e3;/**
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
 */class d extends Le{constructor(t,n,s=0){super(q(t),`Firebase Storage: ${n} (${q(t)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,d.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return q(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var u;(function(e){e.UNKNOWN="unknown",e.OBJECT_NOT_FOUND="object-not-found",e.BUCKET_NOT_FOUND="bucket-not-found",e.PROJECT_NOT_FOUND="project-not-found",e.QUOTA_EXCEEDED="quota-exceeded",e.UNAUTHENTICATED="unauthenticated",e.UNAUTHORIZED="unauthorized",e.UNAUTHORIZED_APP="unauthorized-app",e.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",e.INVALID_CHECKSUM="invalid-checksum",e.CANCELED="canceled",e.INVALID_EVENT_NAME="invalid-event-name",e.INVALID_URL="invalid-url",e.INVALID_DEFAULT_BUCKET="invalid-default-bucket",e.NO_DEFAULT_BUCKET="no-default-bucket",e.CANNOT_SLICE_BLOB="cannot-slice-blob",e.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",e.NO_DOWNLOAD_URL="no-download-url",e.INVALID_ARGUMENT="invalid-argument",e.INVALID_ARGUMENT_COUNT="invalid-argument-count",e.APP_DELETED="app-deleted",e.INVALID_ROOT_OPERATION="invalid-root-operation",e.INVALID_FORMAT="invalid-format",e.INTERNAL_ERROR="internal-error",e.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(u||(u={}));function q(e){return"storage/"+e}function K(){const e="An unknown error occurred, please check the error payload for server response.";return new d(u.UNKNOWN,e)}function tt(e){return new d(u.OBJECT_NOT_FOUND,"Object '"+e+"' does not exist.")}function nt(e){return new d(u.QUOTA_EXCEEDED,"Quota for bucket '"+e+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function st(){const e="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new d(u.UNAUTHENTICATED,e)}function rt(){return new d(u.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function ot(e){return new d(u.UNAUTHORIZED,"User does not have permission to access '"+e+"'.")}function it(){return new d(u.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function at(){return new d(u.CANCELED,"User canceled the upload/download.")}function ct(e){return new d(u.INVALID_URL,"Invalid URL '"+e+"'.")}function lt(e){return new d(u.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}function ut(){return new d(u.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+_e+"' property when initializing the app?")}function dt(){return new d(u.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function ht(){return new d(u.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function ft(e){return new d(u.UNSUPPORTED_ENVIRONMENT,`${e} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function W(e){return new d(u.INVALID_ARGUMENT,e)}function me(){return new d(u.APP_DELETED,"The Firebase app was deleted.")}function pt(e){return new d(u.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function D(e,t){return new d(u.INVALID_FORMAT,"String does not match format '"+e+"': "+t)}function N(e){throw new d(u.INTERNAL_ERROR,"Internal error: "+e)}/**
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
 */class R{constructor(t,n){this.bucket=t,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,n){let s;try{s=R.makeFromUrl(t,n)}catch{return new R(t,"")}if(s.path==="")return s;throw lt(t)}static makeFromUrl(t,n){let s=null;const r="([A-Za-z0-9.\\-_]+)";function o(g){g.path.charAt(g.path.length-1)==="/"&&(g.path_=g.path_.slice(0,-1))}const i="(/(.*))?$",a=new RegExp("^gs://"+r+i,"i"),c={bucket:1,path:3};function l(g){g.path_=decodeURIComponent(g.path)}const h="v[A-Za-z0-9_]+",b=n.replace(/[.]/g,"\\."),p="(/([^?#]*).*)?$",y=new RegExp(`^https?://${b}/${h}/b/${r}/o${p}`,"i"),w={bucket:1,path:3},T=n===pe?"(?:storage.googleapis.com|storage.cloud.google.com)":n,f="([^?#]*)",_=new RegExp(`^https?://${T}/${r}/${f}`,"i"),k=[{regex:a,indices:c,postModify:o},{regex:y,indices:w,postModify:l},{regex:_,indices:{bucket:1,path:2},postModify:l}];for(let g=0;g<k.length;g++){const P=k[g],H=P.regex.exec(t);if(H){const De=H[P.indices.bucket];let j=H[P.indices.path];j||(j=""),s=new R(De,j),P.postModify(s);break}}if(s==null)throw ct(t);return s}}class _t{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
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
 */function mt(e,t,n){let s=1,r=null,o=null,i=!1,a=0;function c(){return a===2}let l=!1;function h(...f){l||(l=!0,t.apply(null,f))}function b(f){r=setTimeout(()=>{r=null,e(y,c())},f)}function p(){o&&clearTimeout(o)}function y(f,..._){if(l){p();return}if(f){p(),h.call(null,f,..._);return}if(c()||i){p(),h.call(null,f,..._);return}s<64&&(s*=2);let k;a===1?(a=2,k=0):k=(s+Math.random())*1e3,b(k)}let w=!1;function T(f){w||(w=!0,p(),!l&&(r!==null?(f||(a=2),clearTimeout(r),b(0)):f||(a=1)))}return b(0),o=setTimeout(()=>{i=!0,T(!0)},n),T}function gt(e){e(!1)}/**
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
 */function bt(e){return e!==void 0}function yt(e){return typeof e=="object"&&!Array.isArray(e)}function X(e){return typeof e=="string"||e instanceof String}function se(e){return G()&&e instanceof Blob}function G(){return typeof Blob<"u"}function re(e,t,n,s){if(s<t)throw W(`Invalid value for '${e}'. Expected ${t} or greater.`);if(s>n)throw W(`Invalid value for '${e}'. Expected ${n} or less.`)}/**
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
 */function Y(e,t,n){let s=t;return n==null&&(s=`https://${t}`),`${n}://${s}/v0${e}`}function ge(e){const t=encodeURIComponent;let n="?";for(const s in e)if(e.hasOwnProperty(s)){const r=t(s)+"="+t(e[s]);n=n+r+"&"}return n=n.slice(0,-1),n}var U;(function(e){e[e.NO_ERROR=0]="NO_ERROR",e[e.NETWORK_ERROR=1]="NETWORK_ERROR",e[e.ABORT=2]="ABORT"})(U||(U={}));/**
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
 */function wt(e,t){const n=e>=500&&e<600,r=[408,429].indexOf(e)!==-1,o=t.indexOf(e)!==-1;return n||r||o}/**
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
 */class Rt{constructor(t,n,s,r,o,i,a,c,l,h,b,p=!0,y=!1){this.url_=t,this.method_=n,this.headers_=s,this.body_=r,this.successCodes_=o,this.additionalRetryCodes_=i,this.callback_=a,this.errorCallback_=c,this.timeout_=l,this.progressCallback_=h,this.connectionFactory_=b,this.retry=p,this.isUsingEmulator=y,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((w,T)=>{this.resolve_=w,this.reject_=T,this.start_()})}start_(){const t=(s,r)=>{if(r){s(!1,new B(!1,null,!0));return}const o=this.connectionFactory_();this.pendingConnection_=o;const i=a=>{const c=a.loaded,l=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,l)};this.progressCallback_!==null&&o.addUploadProgressListener(i),o.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&o.removeUploadProgressListener(i),this.pendingConnection_=null;const a=o.getErrorCode()===U.NO_ERROR,c=o.getStatus();if(!a||wt(c,this.additionalRetryCodes_)&&this.retry){const h=o.getErrorCode()===U.ABORT;s(!1,new B(!1,null,h));return}const l=this.successCodes_.indexOf(c)!==-1;s(!0,new B(l,o))})},n=(s,r)=>{const o=this.resolve_,i=this.reject_,a=r.connection;if(r.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());bt(c)?o(c):o()}catch(c){i(c)}else if(a!==null){const c=K();c.serverResponse=a.getErrorText(),this.errorCallback_?i(this.errorCallback_(a,c)):i(c)}else if(r.canceled){const c=this.appDelete_?me():at();i(c)}else{const c=it();i(c)}};this.canceled_?n(!1,new B(!1,null,!0)):this.backoffId_=mt(t,n,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&gt(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class B{constructor(t,n,s){this.wasSuccessCode=t,this.connection=n,this.canceled=!!s}}function Tt(e,t){t!==null&&t.length>0&&(e.Authorization="Firebase "+t)}function kt(e,t){e["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function Et(e,t){t&&(e["X-Firebase-GMPID"]=t)}function At(e,t){t!==null&&(e["X-Firebase-AppCheck"]=t)}function It(e,t,n,s,r,o,i=!0,a=!1){const c=ge(e.urlParams),l=e.url+c,h=Object.assign({},e.headers);return Et(h,t),Tt(h,n),kt(h,o),At(h,s),new Rt(l,e.method,h,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,r,i,a)}/**
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
 */function Ut(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function Ct(...e){const t=Ut();if(t!==void 0){const n=new t;for(let s=0;s<e.length;s++)n.append(e[s]);return n.getBlob()}else{if(G())return new Blob(e);throw new d(u.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Ot(e,t,n){return e.webkitSlice?e.webkitSlice(t,n):e.mozSlice?e.mozSlice(t,n):e.slice?e.slice(t,n):null}/**
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
 */function Nt(e){if(typeof atob>"u")throw ft("base-64");return atob(e)}/**
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
 */const E={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class z{constructor(t,n){this.data=t,this.contentType=n||null}}function Dt(e,t){switch(e){case E.RAW:return new z(be(t));case E.BASE64:case E.BASE64URL:return new z(ye(e,t));case E.DATA_URL:return new z(Bt(t),vt(t))}throw K()}function be(e){const t=[];for(let n=0;n<e.length;n++){let s=e.charCodeAt(n);if(s<=127)t.push(s);else if(s<=2047)t.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(n<e.length-1&&(e.charCodeAt(n+1)&64512)===56320))t.push(239,191,189);else{const o=s,i=e.charCodeAt(++n);s=65536|(o&1023)<<10|i&1023,t.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?t.push(239,191,189):t.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(t)}function Pt(e){let t;try{t=decodeURIComponent(e)}catch{throw D(E.DATA_URL,"Malformed data URL.")}return be(t)}function ye(e,t){switch(e){case E.BASE64:{const r=t.indexOf("-")!==-1,o=t.indexOf("_")!==-1;if(r||o)throw D(e,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case E.BASE64URL:{const r=t.indexOf("+")!==-1,o=t.indexOf("/")!==-1;if(r||o)throw D(e,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=Nt(t)}catch(r){throw r.message.includes("polyfill")?r:D(e,"Invalid character found")}const s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return s}class we{constructor(t){this.base64=!1,this.contentType=null;const n=t.match(/^data:([^,]+)?,/);if(n===null)throw D(E.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=n[1]||null;s!=null&&(this.base64=xt(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=t.substring(t.indexOf(",")+1)}}function Bt(e){const t=new we(e);return t.base64?ye(E.BASE64,t.rest):Pt(t.rest)}function vt(e){return new we(e).contentType}function xt(e,t){return e.length>=t.length?e.substring(e.length-t.length)===t:!1}/**
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
 */class A{constructor(t,n){let s=0,r="";se(t)?(this.data_=t,s=t.size,r=t.type):t instanceof ArrayBuffer?(n?this.data_=new Uint8Array(t):(this.data_=new Uint8Array(t.byteLength),this.data_.set(new Uint8Array(t))),s=this.data_.length):t instanceof Uint8Array&&(n?this.data_=t:(this.data_=new Uint8Array(t.length),this.data_.set(t)),s=t.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(t,n){if(se(this.data_)){const s=this.data_,r=Ot(s,t,n);return r===null?null:new A(r)}else{const s=new Uint8Array(this.data_.buffer,t,n-t);return new A(s,!0)}}static getBlob(...t){if(G()){const n=t.map(s=>s instanceof A?s.data_:s);return new A(Ct.apply(null,n))}else{const n=t.map(i=>X(i)?Dt(E.RAW,i).data:i.data_);let s=0;n.forEach(i=>{s+=i.byteLength});const r=new Uint8Array(s);let o=0;return n.forEach(i=>{for(let a=0;a<i.length;a++)r[o++]=i[a]}),new A(r,!0)}}uploadData(){return this.data_}}/**
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
 */function Re(e){let t;try{t=JSON.parse(e)}catch{return null}return yt(t)?t:null}/**
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
 */function Lt(e){if(e.length===0)return null;const t=e.lastIndexOf("/");return t===-1?"":e.slice(0,t)}function St(e,t){const n=t.split("/").filter(s=>s.length>0).join("/");return e.length===0?n:e+"/"+n}function Te(e){const t=e.lastIndexOf("/",e.length-2);return t===-1?e:e.slice(t+1)}/**
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
 */function Ft(e,t){return t}class m{constructor(t,n,s,r){this.server=t,this.local=n||t,this.writable=!!s,this.xform=r||Ft}}let v=null;function Mt(e){return!X(e)||e.length<2?e:Te(e)}function ke(){if(v)return v;const e=[];e.push(new m("bucket")),e.push(new m("generation")),e.push(new m("metageneration")),e.push(new m("name","fullPath",!0));function t(o,i){return Mt(i)}const n=new m("name");n.xform=t,e.push(n);function s(o,i){return i!==void 0?Number(i):i}const r=new m("size");return r.xform=s,e.push(r),e.push(new m("timeCreated")),e.push(new m("updated")),e.push(new m("md5Hash",null,!0)),e.push(new m("cacheControl",null,!0)),e.push(new m("contentDisposition",null,!0)),e.push(new m("contentEncoding",null,!0)),e.push(new m("contentLanguage",null,!0)),e.push(new m("contentType",null,!0)),e.push(new m("metadata","customMetadata",!0)),v=e,v}function $t(e,t){function n(){const s=e.bucket,r=e.fullPath,o=new R(s,r);return t._makeStorageReference(o)}Object.defineProperty(e,"ref",{get:n})}function Ht(e,t,n){const s={};s.type="file";const r=n.length;for(let o=0;o<r;o++){const i=n[o];s[i.local]=i.xform(s,t[i.server])}return $t(s,e),s}function Ee(e,t,n){const s=Re(t);return s===null?null:Ht(e,s,n)}function jt(e,t,n,s){const r=Re(t);if(r===null||!X(r.downloadTokens))return null;const o=r.downloadTokens;if(o.length===0)return null;const i=encodeURIComponent;return o.split(",").map(l=>{const h=e.bucket,b=e.fullPath,p="/b/"+i(h)+"/o/"+i(b),y=Y(p,n,s),w=ge({alt:"media",token:l});return y+w})[0]}function qt(e,t){const n={},s=t.length;for(let r=0;r<s;r++){const o=t[r];o.writable&&(n[o.server]=e[o.local])}return JSON.stringify(n)}class Ae{constructor(t,n,s,r){this.url=t,this.method=n,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function Ie(e){if(!e)throw K()}function zt(e,t){function n(s,r){const o=Ee(e,r,t);return Ie(o!==null),o}return n}function Vt(e,t){function n(s,r){const o=Ee(e,r,t);return Ie(o!==null),jt(o,r,e.host,e._protocol)}return n}function Ue(e){function t(n,s){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=rt():r=st():n.getStatus()===402?r=nt(e.bucket):n.getStatus()===403?r=ot(e.path):r=s,r.status=n.getStatus(),r.serverResponse=s.serverResponse,r}return t}function Wt(e){const t=Ue(e);function n(s,r){let o=t(s,r);return s.getStatus()===404&&(o=tt(e.path)),o.serverResponse=r.serverResponse,o}return n}function Kt(e,t,n){const s=t.fullServerUrl(),r=Y(s,e.host,e._protocol),o="GET",i=e.maxOperationRetryTime,a=new Ae(r,o,Vt(e,n),i);return a.errorHandler=Wt(t),a}function Xt(e,t){return e&&e.contentType||t&&t.type()||"application/octet-stream"}function Gt(e,t,n){const s=Object.assign({},n);return s.fullPath=e.path,s.size=t.size(),s.contentType||(s.contentType=Xt(null,t)),s}function Yt(e,t,n,s,r){const o=t.bucketOnlyServerUrl(),i={"X-Goog-Upload-Protocol":"multipart"};function a(){let k="";for(let g=0;g<2;g++)k=k+Math.random().toString().slice(2);return k}const c=a();i["Content-Type"]="multipart/related; boundary="+c;const l=Gt(t,s,r),h=qt(l,n),b="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+h+`\r
--`+c+`\r
Content-Type: `+l.contentType+`\r
\r
`,p=`\r
--`+c+"--",y=A.getBlob(b,s,p);if(y===null)throw dt();const w={name:l.fullPath},T=Y(o,e.host,e._protocol),f="POST",_=e.maxUploadRetryTime,I=new Ae(T,f,zt(e,n),_);return I.urlParams=w,I.headers=i,I.body=y.uploadData(),I.errorHandler=Ue(t),I}class Zt{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=U.NO_ERROR,this.sendPromise_=new Promise(t=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=U.ABORT,t()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=U.NETWORK_ERROR,t()}),this.xhr_.addEventListener("load",()=>{t()})})}send(t,n,s,r,o){if(this.sent_)throw N("cannot .send() more than once");if(he(t)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,t,!0),o!==void 0)for(const i in o)o.hasOwnProperty(i)&&this.xhr_.setRequestHeader(i,o[i].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw N("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw N("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw N("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw N("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(t){return this.xhr_.getResponseHeader(t)}addUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",t)}removeUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",t)}}class Jt extends Zt{initXhr(){this.xhr_.responseType="text"}}function Ce(){return new Jt}/**
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
 */class C{constructor(t,n){this._service=t,n instanceof R?this._location=n:this._location=R.makeFromUrl(n,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,n){return new C(t,n)}get root(){const t=new R(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Te(this._location.path)}get storage(){return this._service}get parent(){const t=Lt(this._location.path);if(t===null)return null;const n=new R(this._location.bucket,t);return new C(this._service,n)}_throwIfRoot(t){if(this._location.path==="")throw pt(t)}}function Qt(e,t,n){e._throwIfRoot("uploadBytes");const s=Yt(e.storage,e._location,ke(),new A(t,!0),n);return e.storage.makeRequestWithTokens(s,Ce).then(r=>({metadata:r,ref:e}))}function en(e){e._throwIfRoot("getDownloadURL");const t=Kt(e.storage,e._location,ke());return e.storage.makeRequestWithTokens(t,Ce).then(n=>{if(n===null)throw ht();return n})}function tn(e,t){const n=St(e._location.path,t),s=new R(e._location.bucket,n);return new C(e.storage,s)}/**
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
 */function nn(e){return/^[A-Za-z]+:\/\//.test(e)}function sn(e,t){return new C(e,t)}function Oe(e,t){if(e instanceof Z){const n=e;if(n._bucket==null)throw ut();const s=new C(n,n._bucket);return t!=null?Oe(s,t):s}else return t!==void 0?tn(e,t):e}function rn(e,t){if(t&&nn(t)){if(e instanceof Z)return sn(e,t);throw W("To use ref(service, url), the first argument must be a Storage instance.")}else return Oe(e,t)}function oe(e,t){const n=t==null?void 0:t[_e];return n==null?null:R.makeFromBucketSpec(n,e)}function on(e,t,n,s={}){e.host=`${t}:${n}`;const r=he(t);r&&($e(`https://${e.host}/b`),He("Storage",!0)),e._isUsingEmulator=!0,e._protocol=r?"https":"http";const{mockUserToken:o}=s;o&&(e._overrideAuthToken=typeof o=="string"?o:je(o,e.app.options.projectId))}class Z{constructor(t,n,s,r,o,i=!1){this.app=t,this._authProvider=n,this._appCheckProvider=s,this._url=r,this._firebaseVersion=o,this._isUsingEmulator=i,this._bucket=null,this._host=pe,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=Qe,this._maxUploadRetryTime=et,this._requests=new Set,r!=null?this._bucket=R.makeFromBucketSpec(r,this._host):this._bucket=oe(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=R.makeFromBucketSpec(this._url,t):this._bucket=oe(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){re("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){re("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const n=await t.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(xe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new C(this,t)}_makeRequest(t,n,s,r,o=!0){if(this._deleted)return new _t(me());{const i=It(t,this._appId,s,r,n,this._firebaseVersion,o,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(t,n){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,n,s,r).getPromise()}}const ie="@firebase/storage",ae="0.14.0";/**
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
 */const Ne="storage";function an(e,t,n){return e=$(e),Qt(e,t,n)}function cn(e){return e=$(e),en(e)}function ln(e,t){return e=$(e),rn(e,t)}function un(e=Se(),t){e=$(e);const s=Fe(e,Ne).getImmediate({identifier:t}),r=Me("storage");return r&&dn(s,...r),s}function dn(e,t,n,s={}){on(e,t,n,s)}function hn(e,{instanceIdentifier:t}){const n=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return new Z(n,s,r,t,ve)}function fn(){Pe(new Be(Ne,hn,"PUBLIC").setMultipleInstances(!0)),te(ie,ae,""),te(ie,ae,"esm2020")}fn();const pn={apiKey:"AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",authDomain:"wise-catty.cc",projectId:"wisecat-8df8d",storageBucket:"wisecat-8df8d.firebasestorage.app",messagingSenderId:"1078479155773",appId:"1:1078479155773:web:cd62907516951aa47db054",measurementId:"G-30M228G3VP"},J=qe(pn),_n=ze(J),Q=Ve(J,"reservation"),mn=un(J),ce=document.getElementById("authCheck"),x=document.getElementById("mainContent"),L=document.getElementById("loginContent"),S=document.getElementById("taskTableBody"),ee=document.getElementById("taskModal"),le=document.getElementById("newTaskBtn"),ue=document.getElementById("cancelBtn"),M=document.getElementById("taskForm"),gn=document.getElementById("titleInput"),bn=document.getElementById("priorityInput"),yn=document.getElementById("descInput"),de=document.getElementById("fileInput"),F=document.getElementById("submitBtn");let O=null;We(_n,e=>{ce&&(ce.hidden=!0),e?(O=e,x&&(x.hidden=!1),L&&(L.hidden=!0),wn()):(O=null,x&&(x.hidden=!0),L&&(L.hidden=!1))});function wn(){const e=Ke(fe(Q,"dev_task"),ne("completed"),ne("priority","desc"));Xe(e,t=>{if(S){if(S.innerHTML="",t.empty){S.innerHTML='<tr><td colspan="6" style="text-align:center; padding: 2rem; color: #64748b;">No tasks found. Create one!</td></tr>';return}t.forEach(n=>{var y,w,T,f;const s=n.data(),r=document.createElement("tr"),o=`p-${s.priority||3}`,i=s.priority||3,a=s.completed===!0,c=a?'<span class="status-badge status-done">● Done</span>':'<span class="status-badge status-pending">○ Pending</span>',l=V(s.title||"(No Title)"),h=V((s.content||"").substring(0,60)+(((y=s.content)==null?void 0:y.length)>60?"...":"")),b=V(((w=s.createdBy)==null?void 0:w.name)||((T=s.createdBy)==null?void 0:T.email)||"Unknown");let p="";if(s.attachment_url&&(p=`<br><a href="${s.attachment_url}" target="_blank" style="font-size: 0.8em; color: var(--accent);">📎 View Attachment</a>`),r.innerHTML=`
                <td><span class="priority-badge ${o}">P${i}</span></td>
                <td style="font-weight: 500;">
                    ${l}
                    ${p}
                </td>
                <td style="color: #94a3b8; font-size: 0.9em;">${h}</td>
                <td style="font-size: 0.9em;">${b}</td>
                <td>${c}</td>
                <td class="action-cell"></td>
            `,!a){const _=document.createElement("button");_.textContent="🗑️",_.style.background="transparent",_.style.border="none",_.style.cursor="pointer",_.style.fontSize="1.2rem",_.title="Delete Task",_.onclick=()=>Rn(n.id),(f=r.querySelector(".action-cell"))==null||f.appendChild(_)}S.appendChild(r)})}})}async function Rn(e){if(confirm("Are you sure you want to delete this task? This cannot be undone."))try{await Ge(Ye(Q,"dev_task",e))}catch(t){console.error("Error deleting task:",t),alert("Failed to delete task. Check console for details.")}}function V(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}le&&le.addEventListener("click",()=>{ee.showModal()});ue&&ue.addEventListener("click",()=>{ee.close(),M.reset()});M&&M.addEventListener("submit",async e=>{if(e.preventDefault(),!O)return;const t=gn.value.trim(),n=yn.value.trim(),s=parseInt(bn.value,10),r=de.files?de.files[0]:null;if(!(!t||!n)){F.disabled=!0,F.textContent="Uploading...";try{let o=null;if(r){const i=Date.now(),a=ln(mn,`task_attachments/${i}_${r.name}`),c=await an(a,r);o=await cn(c.ref)}await Ze(fe(Q,"dev_task"),{title:t,content:n,priority:s,completed:!1,attachment_url:o,createdAt:Je(),createdBy:{uid:O.uid,email:O.email||"Anonymous",name:O.displayName||"Unknown"}}),ee.close(),M.reset()}catch(o){console.error("Error creating task:",o),alert("Failed to create task (Check console for permission details)")}finally{F.disabled=!1,F.textContent="Create Task"}}});
