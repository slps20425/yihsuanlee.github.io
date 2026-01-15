import{_ as Pe,C as Be,r as ee,S as ve,h as xe,F as Le,i as Se,j as $,k as Me,l as Fe,m as de,p as $e,u as He,n as je,q as qe,t as Ve,v as ze,e as We,w as Ke,x as te,y as he,o as Xe,z as Ge,a as Ye}from"./index.esm-WQ5rLf1p.js";/**
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
 */const fe="firebasestorage.googleapis.com",pe="storageBucket",Ze=2*60*1e3,Je=10*60*1e3;/**
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
${this.customData.serverResponse}`:this.message=this._baseMessage}}var u;(function(e){e.UNKNOWN="unknown",e.OBJECT_NOT_FOUND="object-not-found",e.BUCKET_NOT_FOUND="bucket-not-found",e.PROJECT_NOT_FOUND="project-not-found",e.QUOTA_EXCEEDED="quota-exceeded",e.UNAUTHENTICATED="unauthenticated",e.UNAUTHORIZED="unauthorized",e.UNAUTHORIZED_APP="unauthorized-app",e.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",e.INVALID_CHECKSUM="invalid-checksum",e.CANCELED="canceled",e.INVALID_EVENT_NAME="invalid-event-name",e.INVALID_URL="invalid-url",e.INVALID_DEFAULT_BUCKET="invalid-default-bucket",e.NO_DEFAULT_BUCKET="no-default-bucket",e.CANNOT_SLICE_BLOB="cannot-slice-blob",e.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",e.NO_DOWNLOAD_URL="no-download-url",e.INVALID_ARGUMENT="invalid-argument",e.INVALID_ARGUMENT_COUNT="invalid-argument-count",e.APP_DELETED="app-deleted",e.INVALID_ROOT_OPERATION="invalid-root-operation",e.INVALID_FORMAT="invalid-format",e.INTERNAL_ERROR="internal-error",e.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(u||(u={}));function q(e){return"storage/"+e}function K(){const e="An unknown error occurred, please check the error payload for server response.";return new d(u.UNKNOWN,e)}function Qe(e){return new d(u.OBJECT_NOT_FOUND,"Object '"+e+"' does not exist.")}function et(e){return new d(u.QUOTA_EXCEEDED,"Quota for bucket '"+e+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function tt(){const e="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new d(u.UNAUTHENTICATED,e)}function nt(){return new d(u.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function st(e){return new d(u.UNAUTHORIZED,"User does not have permission to access '"+e+"'.")}function rt(){return new d(u.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function ot(){return new d(u.CANCELED,"User canceled the upload/download.")}function it(e){return new d(u.INVALID_URL,"Invalid URL '"+e+"'.")}function at(e){return new d(u.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}function ct(){return new d(u.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+pe+"' property when initializing the app?")}function lt(){return new d(u.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function ut(){return new d(u.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function dt(e){return new d(u.UNSUPPORTED_ENVIRONMENT,`${e} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function W(e){return new d(u.INVALID_ARGUMENT,e)}function _e(){return new d(u.APP_DELETED,"The Firebase app was deleted.")}function ht(e){return new d(u.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function D(e,t){return new d(u.INVALID_FORMAT,"String does not match format '"+e+"': "+t)}function N(e){throw new d(u.INTERNAL_ERROR,"Internal error: "+e)}/**
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
 */class y{constructor(t,n){this.bucket=t,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,n){let s;try{s=y.makeFromUrl(t,n)}catch{return new y(t,"")}if(s.path==="")return s;throw at(t)}static makeFromUrl(t,n){let s=null;const r="([A-Za-z0-9.\\-_]+)";function o(m){m.path.charAt(m.path.length-1)==="/"&&(m.path_=m.path_.slice(0,-1))}const i="(/(.*))?$",a=new RegExp("^gs://"+r+i,"i"),c={bucket:1,path:3};function l(m){m.path_=decodeURIComponent(m.path)}const h="v[A-Za-z0-9_]+",g=n.replace(/[.]/g,"\\."),f="(/([^?#]*).*)?$",b=new RegExp(`^https?://${g}/${h}/b/${r}/o${f}`,"i"),w={bucket:1,path:3},R=n===fe?"(?:storage.googleapis.com|storage.cloud.google.com)":n,_="([^?#]*)",C=new RegExp(`^https?://${R}/${r}/${_}`,"i"),T=[{regex:a,indices:c,postModify:o},{regex:b,indices:w,postModify:l},{regex:C,indices:{bucket:1,path:2},postModify:l}];for(let m=0;m<T.length;m++){const P=T[m],H=P.regex.exec(t);if(H){const De=H[P.indices.bucket];let j=H[P.indices.path];j||(j=""),s=new y(De,j),P.postModify(s);break}}if(s==null)throw it(t);return s}}class ft{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
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
 */function pt(e,t,n){let s=1,r=null,o=null,i=!1,a=0;function c(){return a===2}let l=!1;function h(..._){l||(l=!0,t.apply(null,_))}function g(_){r=setTimeout(()=>{r=null,e(b,c())},_)}function f(){o&&clearTimeout(o)}function b(_,...C){if(l){f();return}if(_){f(),h.call(null,_,...C);return}if(c()||i){f(),h.call(null,_,...C);return}s<64&&(s*=2);let T;a===1?(a=2,T=0):T=(s+Math.random())*1e3,g(T)}let w=!1;function R(_){w||(w=!0,f(),!l&&(r!==null?(_||(a=2),clearTimeout(r),g(0)):_||(a=1)))}return g(0),o=setTimeout(()=>{i=!0,R(!0)},n),R}function _t(e){e(!1)}/**
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
 */function mt(e){return e!==void 0}function gt(e){return typeof e=="object"&&!Array.isArray(e)}function X(e){return typeof e=="string"||e instanceof String}function ne(e){return G()&&e instanceof Blob}function G(){return typeof Blob<"u"}function se(e,t,n,s){if(s<t)throw W(`Invalid value for '${e}'. Expected ${t} or greater.`);if(s>n)throw W(`Invalid value for '${e}'. Expected ${n} or less.`)}/**
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
 */function Y(e,t,n){let s=t;return n==null&&(s=`https://${t}`),`${n}://${s}/v0${e}`}function me(e){const t=encodeURIComponent;let n="?";for(const s in e)if(e.hasOwnProperty(s)){const r=t(s)+"="+t(e[s]);n=n+r+"&"}return n=n.slice(0,-1),n}var I;(function(e){e[e.NO_ERROR=0]="NO_ERROR",e[e.NETWORK_ERROR=1]="NETWORK_ERROR",e[e.ABORT=2]="ABORT"})(I||(I={}));/**
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
 */function bt(e,t){const n=e>=500&&e<600,r=[408,429].indexOf(e)!==-1,o=t.indexOf(e)!==-1;return n||r||o}/**
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
 */class wt{constructor(t,n,s,r,o,i,a,c,l,h,g,f=!0,b=!1){this.url_=t,this.method_=n,this.headers_=s,this.body_=r,this.successCodes_=o,this.additionalRetryCodes_=i,this.callback_=a,this.errorCallback_=c,this.timeout_=l,this.progressCallback_=h,this.connectionFactory_=g,this.retry=f,this.isUsingEmulator=b,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((w,R)=>{this.resolve_=w,this.reject_=R,this.start_()})}start_(){const t=(s,r)=>{if(r){s(!1,new B(!1,null,!0));return}const o=this.connectionFactory_();this.pendingConnection_=o;const i=a=>{const c=a.loaded,l=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,l)};this.progressCallback_!==null&&o.addUploadProgressListener(i),o.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&o.removeUploadProgressListener(i),this.pendingConnection_=null;const a=o.getErrorCode()===I.NO_ERROR,c=o.getStatus();if(!a||bt(c,this.additionalRetryCodes_)&&this.retry){const h=o.getErrorCode()===I.ABORT;s(!1,new B(!1,null,h));return}const l=this.successCodes_.indexOf(c)!==-1;s(!0,new B(l,o))})},n=(s,r)=>{const o=this.resolve_,i=this.reject_,a=r.connection;if(r.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());mt(c)?o(c):o()}catch(c){i(c)}else if(a!==null){const c=K();c.serverResponse=a.getErrorText(),this.errorCallback_?i(this.errorCallback_(a,c)):i(c)}else if(r.canceled){const c=this.appDelete_?_e():ot();i(c)}else{const c=rt();i(c)}};this.canceled_?n(!1,new B(!1,null,!0)):this.backoffId_=pt(t,n,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&_t(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class B{constructor(t,n,s){this.wasSuccessCode=t,this.connection=n,this.canceled=!!s}}function yt(e,t){t!==null&&t.length>0&&(e.Authorization="Firebase "+t)}function Rt(e,t){e["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function Tt(e,t){t&&(e["X-Firebase-GMPID"]=t)}function kt(e,t){t!==null&&(e["X-Firebase-AppCheck"]=t)}function Et(e,t,n,s,r,o,i=!0,a=!1){const c=me(e.urlParams),l=e.url+c,h=Object.assign({},e.headers);return Tt(h,t),yt(h,n),Rt(h,o),kt(h,s),new wt(l,e.method,h,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,r,i,a)}/**
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
 */function At(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function It(...e){const t=At();if(t!==void 0){const n=new t;for(let s=0;s<e.length;s++)n.append(e[s]);return n.getBlob()}else{if(G())return new Blob(e);throw new d(u.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Ut(e,t,n){return e.webkitSlice?e.webkitSlice(t,n):e.mozSlice?e.mozSlice(t,n):e.slice?e.slice(t,n):null}/**
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
 */function Ct(e){if(typeof atob>"u")throw dt("base-64");return atob(e)}/**
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
 */const k={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class V{constructor(t,n){this.data=t,this.contentType=n||null}}function Ot(e,t){switch(e){case k.RAW:return new V(ge(t));case k.BASE64:case k.BASE64URL:return new V(be(e,t));case k.DATA_URL:return new V(Dt(t),Pt(t))}throw K()}function ge(e){const t=[];for(let n=0;n<e.length;n++){let s=e.charCodeAt(n);if(s<=127)t.push(s);else if(s<=2047)t.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(n<e.length-1&&(e.charCodeAt(n+1)&64512)===56320))t.push(239,191,189);else{const o=s,i=e.charCodeAt(++n);s=65536|(o&1023)<<10|i&1023,t.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?t.push(239,191,189):t.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(t)}function Nt(e){let t;try{t=decodeURIComponent(e)}catch{throw D(k.DATA_URL,"Malformed data URL.")}return ge(t)}function be(e,t){switch(e){case k.BASE64:{const r=t.indexOf("-")!==-1,o=t.indexOf("_")!==-1;if(r||o)throw D(e,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case k.BASE64URL:{const r=t.indexOf("+")!==-1,o=t.indexOf("/")!==-1;if(r||o)throw D(e,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=Ct(t)}catch(r){throw r.message.includes("polyfill")?r:D(e,"Invalid character found")}const s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return s}class we{constructor(t){this.base64=!1,this.contentType=null;const n=t.match(/^data:([^,]+)?,/);if(n===null)throw D(k.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=n[1]||null;s!=null&&(this.base64=Bt(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=t.substring(t.indexOf(",")+1)}}function Dt(e){const t=new we(e);return t.base64?be(k.BASE64,t.rest):Nt(t.rest)}function Pt(e){return new we(e).contentType}function Bt(e,t){return e.length>=t.length?e.substring(e.length-t.length)===t:!1}/**
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
 */class E{constructor(t,n){let s=0,r="";ne(t)?(this.data_=t,s=t.size,r=t.type):t instanceof ArrayBuffer?(n?this.data_=new Uint8Array(t):(this.data_=new Uint8Array(t.byteLength),this.data_.set(new Uint8Array(t))),s=this.data_.length):t instanceof Uint8Array&&(n?this.data_=t:(this.data_=new Uint8Array(t.length),this.data_.set(t)),s=t.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(t,n){if(ne(this.data_)){const s=this.data_,r=Ut(s,t,n);return r===null?null:new E(r)}else{const s=new Uint8Array(this.data_.buffer,t,n-t);return new E(s,!0)}}static getBlob(...t){if(G()){const n=t.map(s=>s instanceof E?s.data_:s);return new E(It.apply(null,n))}else{const n=t.map(i=>X(i)?Ot(k.RAW,i).data:i.data_);let s=0;n.forEach(i=>{s+=i.byteLength});const r=new Uint8Array(s);let o=0;return n.forEach(i=>{for(let a=0;a<i.length;a++)r[o++]=i[a]}),new E(r,!0)}}uploadData(){return this.data_}}/**
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
 */function ye(e){let t;try{t=JSON.parse(e)}catch{return null}return gt(t)?t:null}/**
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
 */function vt(e){if(e.length===0)return null;const t=e.lastIndexOf("/");return t===-1?"":e.slice(0,t)}function xt(e,t){const n=t.split("/").filter(s=>s.length>0).join("/");return e.length===0?n:e+"/"+n}function Re(e){const t=e.lastIndexOf("/",e.length-2);return t===-1?e:e.slice(t+1)}/**
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
 */function Lt(e,t){return t}class p{constructor(t,n,s,r){this.server=t,this.local=n||t,this.writable=!!s,this.xform=r||Lt}}let v=null;function St(e){return!X(e)||e.length<2?e:Re(e)}function Te(){if(v)return v;const e=[];e.push(new p("bucket")),e.push(new p("generation")),e.push(new p("metageneration")),e.push(new p("name","fullPath",!0));function t(o,i){return St(i)}const n=new p("name");n.xform=t,e.push(n);function s(o,i){return i!==void 0?Number(i):i}const r=new p("size");return r.xform=s,e.push(r),e.push(new p("timeCreated")),e.push(new p("updated")),e.push(new p("md5Hash",null,!0)),e.push(new p("cacheControl",null,!0)),e.push(new p("contentDisposition",null,!0)),e.push(new p("contentEncoding",null,!0)),e.push(new p("contentLanguage",null,!0)),e.push(new p("contentType",null,!0)),e.push(new p("metadata","customMetadata",!0)),v=e,v}function Mt(e,t){function n(){const s=e.bucket,r=e.fullPath,o=new y(s,r);return t._makeStorageReference(o)}Object.defineProperty(e,"ref",{get:n})}function Ft(e,t,n){const s={};s.type="file";const r=n.length;for(let o=0;o<r;o++){const i=n[o];s[i.local]=i.xform(s,t[i.server])}return Mt(s,e),s}function ke(e,t,n){const s=ye(t);return s===null?null:Ft(e,s,n)}function $t(e,t,n,s){const r=ye(t);if(r===null||!X(r.downloadTokens))return null;const o=r.downloadTokens;if(o.length===0)return null;const i=encodeURIComponent;return o.split(",").map(l=>{const h=e.bucket,g=e.fullPath,f="/b/"+i(h)+"/o/"+i(g),b=Y(f,n,s),w=me({alt:"media",token:l});return b+w})[0]}function Ht(e,t){const n={},s=t.length;for(let r=0;r<s;r++){const o=t[r];o.writable&&(n[o.server]=e[o.local])}return JSON.stringify(n)}class Ee{constructor(t,n,s,r){this.url=t,this.method=n,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function Ae(e){if(!e)throw K()}function jt(e,t){function n(s,r){const o=ke(e,r,t);return Ae(o!==null),o}return n}function qt(e,t){function n(s,r){const o=ke(e,r,t);return Ae(o!==null),$t(o,r,e.host,e._protocol)}return n}function Ie(e){function t(n,s){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=nt():r=tt():n.getStatus()===402?r=et(e.bucket):n.getStatus()===403?r=st(e.path):r=s,r.status=n.getStatus(),r.serverResponse=s.serverResponse,r}return t}function Vt(e){const t=Ie(e);function n(s,r){let o=t(s,r);return s.getStatus()===404&&(o=Qe(e.path)),o.serverResponse=r.serverResponse,o}return n}function zt(e,t,n){const s=t.fullServerUrl(),r=Y(s,e.host,e._protocol),o="GET",i=e.maxOperationRetryTime,a=new Ee(r,o,qt(e,n),i);return a.errorHandler=Vt(t),a}function Wt(e,t){return e&&e.contentType||t&&t.type()||"application/octet-stream"}function Kt(e,t,n){const s=Object.assign({},n);return s.fullPath=e.path,s.size=t.size(),s.contentType||(s.contentType=Wt(null,t)),s}function Xt(e,t,n,s,r){const o=t.bucketOnlyServerUrl(),i={"X-Goog-Upload-Protocol":"multipart"};function a(){let T="";for(let m=0;m<2;m++)T=T+Math.random().toString().slice(2);return T}const c=a();i["Content-Type"]="multipart/related; boundary="+c;const l=Kt(t,s,r),h=Ht(l,n),g="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+h+`\r
--`+c+`\r
Content-Type: `+l.contentType+`\r
\r
`,f=`\r
--`+c+"--",b=E.getBlob(g,s,f);if(b===null)throw lt();const w={name:l.fullPath},R=Y(o,e.host,e._protocol),_="POST",C=e.maxUploadRetryTime,A=new Ee(R,_,jt(e,n),C);return A.urlParams=w,A.headers=i,A.body=b.uploadData(),A.errorHandler=Ie(t),A}class Gt{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=I.NO_ERROR,this.sendPromise_=new Promise(t=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=I.ABORT,t()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=I.NETWORK_ERROR,t()}),this.xhr_.addEventListener("load",()=>{t()})})}send(t,n,s,r,o){if(this.sent_)throw N("cannot .send() more than once");if(de(t)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,t,!0),o!==void 0)for(const i in o)o.hasOwnProperty(i)&&this.xhr_.setRequestHeader(i,o[i].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw N("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw N("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw N("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw N("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(t){return this.xhr_.getResponseHeader(t)}addUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",t)}removeUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",t)}}class Yt extends Gt{initXhr(){this.xhr_.responseType="text"}}function Ue(){return new Yt}/**
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
 */class U{constructor(t,n){this._service=t,n instanceof y?this._location=n:this._location=y.makeFromUrl(n,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,n){return new U(t,n)}get root(){const t=new y(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Re(this._location.path)}get storage(){return this._service}get parent(){const t=vt(this._location.path);if(t===null)return null;const n=new y(this._location.bucket,t);return new U(this._service,n)}_throwIfRoot(t){if(this._location.path==="")throw ht(t)}}function Zt(e,t,n){e._throwIfRoot("uploadBytes");const s=Xt(e.storage,e._location,Te(),new E(t,!0),n);return e.storage.makeRequestWithTokens(s,Ue).then(r=>({metadata:r,ref:e}))}function Jt(e){e._throwIfRoot("getDownloadURL");const t=zt(e.storage,e._location,Te());return e.storage.makeRequestWithTokens(t,Ue).then(n=>{if(n===null)throw ut();return n})}function Qt(e,t){const n=xt(e._location.path,t),s=new y(e._location.bucket,n);return new U(e.storage,s)}/**
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
 */function en(e){return/^[A-Za-z]+:\/\//.test(e)}function tn(e,t){return new U(e,t)}function Ce(e,t){if(e instanceof Z){const n=e;if(n._bucket==null)throw ct();const s=new U(n,n._bucket);return t!=null?Ce(s,t):s}else return t!==void 0?Qt(e,t):e}function nn(e,t){if(t&&en(t)){if(e instanceof Z)return tn(e,t);throw W("To use ref(service, url), the first argument must be a Storage instance.")}else return Ce(e,t)}function re(e,t){const n=t==null?void 0:t[pe];return n==null?null:y.makeFromBucketSpec(n,e)}function sn(e,t,n,s={}){e.host=`${t}:${n}`;const r=de(t);r&&($e(`https://${e.host}/b`),He("Storage",!0)),e._isUsingEmulator=!0,e._protocol=r?"https":"http";const{mockUserToken:o}=s;o&&(e._overrideAuthToken=typeof o=="string"?o:je(o,e.app.options.projectId))}class Z{constructor(t,n,s,r,o,i=!1){this.app=t,this._authProvider=n,this._appCheckProvider=s,this._url=r,this._firebaseVersion=o,this._isUsingEmulator=i,this._bucket=null,this._host=fe,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=Ze,this._maxUploadRetryTime=Je,this._requests=new Set,r!=null?this._bucket=y.makeFromBucketSpec(r,this._host):this._bucket=re(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=y.makeFromBucketSpec(this._url,t):this._bucket=re(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){se("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){se("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const n=await t.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(xe(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new U(this,t)}_makeRequest(t,n,s,r,o=!0){if(this._deleted)return new ft(_e());{const i=Et(t,this._appId,s,r,n,this._firebaseVersion,o,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(t,n){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,n,s,r).getPromise()}}const oe="@firebase/storage",ie="0.14.0";/**
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
 */const Oe="storage";function rn(e,t,n){return e=$(e),Zt(e,t,n)}function on(e){return e=$(e),Jt(e)}function an(e,t){return e=$(e),nn(e,t)}function cn(e=Se(),t){e=$(e);const s=Me(e,Oe).getImmediate({identifier:t}),r=Fe("storage");return r&&ln(s,...r),s}function ln(e,t,n,s={}){sn(e,t,n,s)}function un(e,{instanceIdentifier:t}){const n=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return new Z(n,s,r,t,ve)}function dn(){Pe(new Be(Oe,un,"PUBLIC").setMultipleInstances(!0)),ee(oe,ie,""),ee(oe,ie,"esm2020")}dn();const hn={apiKey:"AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",authDomain:"wise-catty.cc",projectId:"wisecat-8df8d",storageBucket:"wisecat-8df8d.firebasestorage.app",messagingSenderId:"1078479155773",appId:"1:1078479155773:web:cd62907516951aa47db054",measurementId:"G-30M228G3VP"},J=qe(hn),fn=Ve(J),Ne=ze(J,"reservation"),pn=cn(J),ae=document.getElementById("authCheck"),x=document.getElementById("mainContent"),L=document.getElementById("loginContent"),S=document.getElementById("taskTableBody"),Q=document.getElementById("taskModal"),ce=document.getElementById("newTaskBtn"),le=document.getElementById("cancelBtn"),F=document.getElementById("taskForm"),_n=document.getElementById("titleInput"),mn=document.getElementById("priorityInput"),gn=document.getElementById("descInput"),ue=document.getElementById("fileInput"),M=document.getElementById("submitBtn");let O=null;We(fn,e=>{ae&&(ae.hidden=!0),e?(O=e,x&&(x.hidden=!1),L&&(L.hidden=!0),bn()):(O=null,x&&(x.hidden=!0),L&&(L.hidden=!1))});function bn(){const e=Ke(he(Ne,"dev_task"),te("completed"),te("priority","desc"));Xe(e,t=>{if(S){if(S.innerHTML="",t.empty){S.innerHTML='<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #64748b;">No tasks found. Create one!</td></tr>';return}t.forEach(n=>{var b,w,R;const s=n.data(),r=document.createElement("tr"),o=`p-${s.priority||3}`,i=s.priority||3,c=s.completed===!0?'<span class="status-badge status-done">● Done</span>':'<span class="status-badge status-pending">○ Pending</span>',l=z(s.title||"(No Title)"),h=z((s.content||"").substring(0,60)+(((b=s.content)==null?void 0:b.length)>60?"...":"")),g=z(((w=s.createdBy)==null?void 0:w.name)||((R=s.createdBy)==null?void 0:R.email)||"Unknown");let f="";s.attachment_url&&(f=`<br><a href="${s.attachment_url}" target="_blank" style="font-size: 0.8em; color: var(--accent);">📎 View Attachment</a>`),r.innerHTML=`
                <td><span class="priority-badge ${o}">P${i}</span></td>
                <td style="font-weight: 500;">
                    ${l}
                    ${f}
                </td>
                <td style="color: #94a3b8; font-size: 0.9em;">${h}</td>
                <td style="font-size: 0.9em;">${g}</td>
                <td>${c}</td>
            `,S.appendChild(r)})}})}function z(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}ce&&ce.addEventListener("click",()=>{Q.showModal()});le&&le.addEventListener("click",()=>{Q.close(),F.reset()});F&&F.addEventListener("submit",async e=>{if(e.preventDefault(),!O)return;const t=_n.value.trim(),n=gn.value.trim(),s=parseInt(mn.value,10),r=ue.files?ue.files[0]:null;if(!(!t||!n)){M.disabled=!0,M.textContent="Uploading...";try{let o=null;if(r){const i=Date.now(),a=an(pn,`task_attachments/${i}_${r.name}`),c=await rn(a,r);o=await on(c.ref)}await Ge(he(Ne,"dev_task"),{title:t,content:n,priority:s,completed:!1,attachment_url:o,createdAt:Ye(),createdBy:{uid:O.uid,email:O.email||"Anonymous",name:O.displayName||"Unknown"}}),Q.close(),F.reset()}catch(o){console.error("Error creating task:",o),alert("Failed to create task (Check console for permission details)")}finally{M.disabled=!1,M.textContent="Create Task"}}});
