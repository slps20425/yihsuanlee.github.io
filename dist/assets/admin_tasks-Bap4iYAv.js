import{_ as xe,C as Pe,r as se,S as Se,h as Le,F as Fe,i as Me,j as q,k as $e,l as He,m as fe,p as qe,u as je,n as ze,q as Ve,t as We,v as Ke,e as Xe,w as Ge,x as pe,o as Ye,y as Ze,d as Je,z as Qe,a as et}from"./index.esm-Drz8edDF.js";/**
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
 */const me="firebasestorage.googleapis.com",_e="storageBucket",tt=2*60*1e3,nt=10*60*1e3;/**
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
 */class d extends Fe{constructor(t,n,s=0){super(V(t),`Firebase Storage: ${n} (${V(t)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,d.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return V(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var u;(function(e){e.UNKNOWN="unknown",e.OBJECT_NOT_FOUND="object-not-found",e.BUCKET_NOT_FOUND="bucket-not-found",e.PROJECT_NOT_FOUND="project-not-found",e.QUOTA_EXCEEDED="quota-exceeded",e.UNAUTHENTICATED="unauthenticated",e.UNAUTHORIZED="unauthorized",e.UNAUTHORIZED_APP="unauthorized-app",e.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",e.INVALID_CHECKSUM="invalid-checksum",e.CANCELED="canceled",e.INVALID_EVENT_NAME="invalid-event-name",e.INVALID_URL="invalid-url",e.INVALID_DEFAULT_BUCKET="invalid-default-bucket",e.NO_DEFAULT_BUCKET="no-default-bucket",e.CANNOT_SLICE_BLOB="cannot-slice-blob",e.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",e.NO_DOWNLOAD_URL="no-download-url",e.INVALID_ARGUMENT="invalid-argument",e.INVALID_ARGUMENT_COUNT="invalid-argument-count",e.APP_DELETED="app-deleted",e.INVALID_ROOT_OPERATION="invalid-root-operation",e.INVALID_FORMAT="invalid-format",e.INTERNAL_ERROR="internal-error",e.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(u||(u={}));function V(e){return"storage/"+e}function G(){const e="An unknown error occurred, please check the error payload for server response.";return new d(u.UNKNOWN,e)}function st(e){return new d(u.OBJECT_NOT_FOUND,"Object '"+e+"' does not exist.")}function rt(e){return new d(u.QUOTA_EXCEEDED,"Quota for bucket '"+e+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function ot(){const e="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new d(u.UNAUTHENTICATED,e)}function it(){return new d(u.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function at(e){return new d(u.UNAUTHORIZED,"User does not have permission to access '"+e+"'.")}function ct(){return new d(u.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function lt(){return new d(u.CANCELED,"User canceled the upload/download.")}function ut(e){return new d(u.INVALID_URL,"Invalid URL '"+e+"'.")}function dt(e){return new d(u.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+e+"'.")}function ht(){return new d(u.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+_e+"' property when initializing the app?")}function ft(){return new d(u.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function pt(){return new d(u.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function mt(e){return new d(u.UNSUPPORTED_ENVIRONMENT,`${e} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function X(e){return new d(u.INVALID_ARGUMENT,e)}function ge(){return new d(u.APP_DELETED,"The Firebase app was deleted.")}function _t(e){return new d(u.INVALID_ROOT_OPERATION,"The operation '"+e+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function v(e,t){return new d(u.INVALID_FORMAT,"String does not match format '"+e+"': "+t)}function D(e){throw new d(u.INTERNAL_ERROR,"Internal error: "+e)}/**
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
 */class R{constructor(t,n){this.bucket=t,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,n){let s;try{s=R.makeFromUrl(t,n)}catch{return new R(t,"")}if(s.path==="")return s;throw dt(t)}static makeFromUrl(t,n){let s=null;const r="([A-Za-z0-9.\\-_]+)";function o(g){g.path.charAt(g.path.length-1)==="/"&&(g.path_=g.path_.slice(0,-1))}const i="(/(.*))?$",a=new RegExp("^gs://"+r+i,"i"),c={bucket:1,path:3};function l(g){g.path_=decodeURIComponent(g.path)}const h="v[A-Za-z0-9_]+",y=n.replace(/[.]/g,"\\."),p="(/([^?#]*).*)?$",w=new RegExp(`^https?://${y}/${h}/b/${r}/o${p}`,"i"),b={bucket:1,path:3},f=n===me?"(?:storage.googleapis.com|storage.cloud.google.com)":n,_="([^?#]*)",N=new RegExp(`^https?://${f}/${r}/${_}`,"i"),k=[{regex:a,indices:c,postModify:o},{regex:w,indices:b,postModify:l},{regex:N,indices:{bucket:1,path:2},postModify:l}];for(let g=0;g<k.length;g++){const x=k[g],j=x.regex.exec(t);if(j){const Be=j[x.indices.bucket];let z=j[x.indices.path];z||(z=""),s=new R(Be,z),x.postModify(s);break}}if(s==null)throw ut(t);return s}}class gt{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
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
 */function yt(e,t,n){let s=1,r=null,o=null,i=!1,a=0;function c(){return a===2}let l=!1;function h(..._){l||(l=!0,t.apply(null,_))}function y(_){r=setTimeout(()=>{r=null,e(w,c())},_)}function p(){o&&clearTimeout(o)}function w(_,...N){if(l){p();return}if(_){p(),h.call(null,_,...N);return}if(c()||i){p(),h.call(null,_,...N);return}s<64&&(s*=2);let k;a===1?(a=2,k=0):k=(s+Math.random())*1e3,y(k)}let b=!1;function f(_){b||(b=!0,p(),!l&&(r!==null?(_||(a=2),clearTimeout(r),y(0)):_||(a=1)))}return y(0),o=setTimeout(()=>{i=!0,f(!0)},n),f}function wt(e){e(!1)}/**
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
 */function bt(e){return e!==void 0}function Rt(e){return typeof e=="object"&&!Array.isArray(e)}function Y(e){return typeof e=="string"||e instanceof String}function re(e){return Z()&&e instanceof Blob}function Z(){return typeof Blob<"u"}function oe(e,t,n,s){if(s<t)throw X(`Invalid value for '${e}'. Expected ${t} or greater.`);if(s>n)throw X(`Invalid value for '${e}'. Expected ${n} or less.`)}/**
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
 */function J(e,t,n){let s=t;return n==null&&(s=`https://${t}`),`${n}://${s}/v0${e}`}function ye(e){const t=encodeURIComponent;let n="?";for(const s in e)if(e.hasOwnProperty(s)){const r=t(s)+"="+t(e[s]);n=n+r+"&"}return n=n.slice(0,-1),n}var C;(function(e){e[e.NO_ERROR=0]="NO_ERROR",e[e.NETWORK_ERROR=1]="NETWORK_ERROR",e[e.ABORT=2]="ABORT"})(C||(C={}));/**
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
 */function Tt(e,t){const n=e>=500&&e<600,r=[408,429].indexOf(e)!==-1,o=t.indexOf(e)!==-1;return n||r||o}/**
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
 */class kt{constructor(t,n,s,r,o,i,a,c,l,h,y,p=!0,w=!1){this.url_=t,this.method_=n,this.headers_=s,this.body_=r,this.successCodes_=o,this.additionalRetryCodes_=i,this.callback_=a,this.errorCallback_=c,this.timeout_=l,this.progressCallback_=h,this.connectionFactory_=y,this.retry=p,this.isUsingEmulator=w,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((b,f)=>{this.resolve_=b,this.reject_=f,this.start_()})}start_(){const t=(s,r)=>{if(r){s(!1,new P(!1,null,!0));return}const o=this.connectionFactory_();this.pendingConnection_=o;const i=a=>{const c=a.loaded,l=a.lengthComputable?a.total:-1;this.progressCallback_!==null&&this.progressCallback_(c,l)};this.progressCallback_!==null&&o.addUploadProgressListener(i),o.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&o.removeUploadProgressListener(i),this.pendingConnection_=null;const a=o.getErrorCode()===C.NO_ERROR,c=o.getStatus();if(!a||Tt(c,this.additionalRetryCodes_)&&this.retry){const h=o.getErrorCode()===C.ABORT;s(!1,new P(!1,null,h));return}const l=this.successCodes_.indexOf(c)!==-1;s(!0,new P(l,o))})},n=(s,r)=>{const o=this.resolve_,i=this.reject_,a=r.connection;if(r.wasSuccessCode)try{const c=this.callback_(a,a.getResponse());bt(c)?o(c):o()}catch(c){i(c)}else if(a!==null){const c=G();c.serverResponse=a.getErrorText(),this.errorCallback_?i(this.errorCallback_(a,c)):i(c)}else if(r.canceled){const c=this.appDelete_?ge():lt();i(c)}else{const c=ct();i(c)}};this.canceled_?n(!1,new P(!1,null,!0)):this.backoffId_=yt(t,n,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&wt(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class P{constructor(t,n,s){this.wasSuccessCode=t,this.connection=n,this.canceled=!!s}}function Et(e,t){t!==null&&t.length>0&&(e.Authorization="Firebase "+t)}function At(e,t){e["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function It(e,t){t&&(e["X-Firebase-GMPID"]=t)}function Ut(e,t){t!==null&&(e["X-Firebase-AppCheck"]=t)}function Ct(e,t,n,s,r,o,i=!0,a=!1){const c=ye(e.urlParams),l=e.url+c,h=Object.assign({},e.headers);return It(h,t),Et(h,n),At(h,o),Ut(h,s),new kt(l,e.method,h,e.body,e.successCodes,e.additionalRetryCodes,e.handler,e.errorHandler,e.timeout,e.progressCallback,r,i,a)}/**
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
 */function Ot(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function Nt(...e){const t=Ot();if(t!==void 0){const n=new t;for(let s=0;s<e.length;s++)n.append(e[s]);return n.getBlob()}else{if(Z())return new Blob(e);throw new d(u.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function Dt(e,t,n){return e.webkitSlice?e.webkitSlice(t,n):e.mozSlice?e.mozSlice(t,n):e.slice?e.slice(t,n):null}/**
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
 */function vt(e){if(typeof atob>"u")throw mt("base-64");return atob(e)}/**
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
 */const E={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class W{constructor(t,n){this.data=t,this.contentType=n||null}}function Bt(e,t){switch(e){case E.RAW:return new W(we(t));case E.BASE64:case E.BASE64URL:return new W(be(e,t));case E.DATA_URL:return new W(Pt(t),St(t))}throw G()}function we(e){const t=[];for(let n=0;n<e.length;n++){let s=e.charCodeAt(n);if(s<=127)t.push(s);else if(s<=2047)t.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(n<e.length-1&&(e.charCodeAt(n+1)&64512)===56320))t.push(239,191,189);else{const o=s,i=e.charCodeAt(++n);s=65536|(o&1023)<<10|i&1023,t.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?t.push(239,191,189):t.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(t)}function xt(e){let t;try{t=decodeURIComponent(e)}catch{throw v(E.DATA_URL,"Malformed data URL.")}return we(t)}function be(e,t){switch(e){case E.BASE64:{const r=t.indexOf("-")!==-1,o=t.indexOf("_")!==-1;if(r||o)throw v(e,"Invalid character '"+(r?"-":"_")+"' found: is it base64url encoded?");break}case E.BASE64URL:{const r=t.indexOf("+")!==-1,o=t.indexOf("/")!==-1;if(r||o)throw v(e,"Invalid character '"+(r?"+":"/")+"' found: is it base64 encoded?");t=t.replace(/-/g,"+").replace(/_/g,"/");break}}let n;try{n=vt(t)}catch(r){throw r.message.includes("polyfill")?r:v(e,"Invalid character found")}const s=new Uint8Array(n.length);for(let r=0;r<n.length;r++)s[r]=n.charCodeAt(r);return s}class Re{constructor(t){this.base64=!1,this.contentType=null;const n=t.match(/^data:([^,]+)?,/);if(n===null)throw v(E.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=n[1]||null;s!=null&&(this.base64=Lt(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=t.substring(t.indexOf(",")+1)}}function Pt(e){const t=new Re(e);return t.base64?be(E.BASE64,t.rest):xt(t.rest)}function St(e){return new Re(e).contentType}function Lt(e,t){return e.length>=t.length?e.substring(e.length-t.length)===t:!1}/**
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
 */class A{constructor(t,n){let s=0,r="";re(t)?(this.data_=t,s=t.size,r=t.type):t instanceof ArrayBuffer?(n?this.data_=new Uint8Array(t):(this.data_=new Uint8Array(t.byteLength),this.data_.set(new Uint8Array(t))),s=this.data_.length):t instanceof Uint8Array&&(n?this.data_=t:(this.data_=new Uint8Array(t.length),this.data_.set(t)),s=t.length),this.size_=s,this.type_=r}size(){return this.size_}type(){return this.type_}slice(t,n){if(re(this.data_)){const s=this.data_,r=Dt(s,t,n);return r===null?null:new A(r)}else{const s=new Uint8Array(this.data_.buffer,t,n-t);return new A(s,!0)}}static getBlob(...t){if(Z()){const n=t.map(s=>s instanceof A?s.data_:s);return new A(Nt.apply(null,n))}else{const n=t.map(i=>Y(i)?Bt(E.RAW,i).data:i.data_);let s=0;n.forEach(i=>{s+=i.byteLength});const r=new Uint8Array(s);let o=0;return n.forEach(i=>{for(let a=0;a<i.length;a++)r[o++]=i[a]}),new A(r,!0)}}uploadData(){return this.data_}}/**
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
 */function Te(e){let t;try{t=JSON.parse(e)}catch{return null}return Rt(t)?t:null}/**
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
 */function Ft(e){if(e.length===0)return null;const t=e.lastIndexOf("/");return t===-1?"":e.slice(0,t)}function Mt(e,t){const n=t.split("/").filter(s=>s.length>0).join("/");return e.length===0?n:e+"/"+n}function ke(e){const t=e.lastIndexOf("/",e.length-2);return t===-1?e:e.slice(t+1)}/**
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
 */function $t(e,t){return t}class m{constructor(t,n,s,r){this.server=t,this.local=n||t,this.writable=!!s,this.xform=r||$t}}let S=null;function Ht(e){return!Y(e)||e.length<2?e:ke(e)}function Ee(){if(S)return S;const e=[];e.push(new m("bucket")),e.push(new m("generation")),e.push(new m("metageneration")),e.push(new m("name","fullPath",!0));function t(o,i){return Ht(i)}const n=new m("name");n.xform=t,e.push(n);function s(o,i){return i!==void 0?Number(i):i}const r=new m("size");return r.xform=s,e.push(r),e.push(new m("timeCreated")),e.push(new m("updated")),e.push(new m("md5Hash",null,!0)),e.push(new m("cacheControl",null,!0)),e.push(new m("contentDisposition",null,!0)),e.push(new m("contentEncoding",null,!0)),e.push(new m("contentLanguage",null,!0)),e.push(new m("contentType",null,!0)),e.push(new m("metadata","customMetadata",!0)),S=e,S}function qt(e,t){function n(){const s=e.bucket,r=e.fullPath,o=new R(s,r);return t._makeStorageReference(o)}Object.defineProperty(e,"ref",{get:n})}function jt(e,t,n){const s={};s.type="file";const r=n.length;for(let o=0;o<r;o++){const i=n[o];s[i.local]=i.xform(s,t[i.server])}return qt(s,e),s}function Ae(e,t,n){const s=Te(t);return s===null?null:jt(e,s,n)}function zt(e,t,n,s){const r=Te(t);if(r===null||!Y(r.downloadTokens))return null;const o=r.downloadTokens;if(o.length===0)return null;const i=encodeURIComponent;return o.split(",").map(l=>{const h=e.bucket,y=e.fullPath,p="/b/"+i(h)+"/o/"+i(y),w=J(p,n,s),b=ye({alt:"media",token:l});return w+b})[0]}function Vt(e,t){const n={},s=t.length;for(let r=0;r<s;r++){const o=t[r];o.writable&&(n[o.server]=e[o.local])}return JSON.stringify(n)}class Ie{constructor(t,n,s,r){this.url=t,this.method=n,this.handler=s,this.timeout=r,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
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
 */function Ue(e){if(!e)throw G()}function Wt(e,t){function n(s,r){const o=Ae(e,r,t);return Ue(o!==null),o}return n}function Kt(e,t){function n(s,r){const o=Ae(e,r,t);return Ue(o!==null),zt(o,r,e.host,e._protocol)}return n}function Ce(e){function t(n,s){let r;return n.getStatus()===401?n.getErrorText().includes("Firebase App Check token is invalid")?r=it():r=ot():n.getStatus()===402?r=rt(e.bucket):n.getStatus()===403?r=at(e.path):r=s,r.status=n.getStatus(),r.serverResponse=s.serverResponse,r}return t}function Xt(e){const t=Ce(e);function n(s,r){let o=t(s,r);return s.getStatus()===404&&(o=st(e.path)),o.serverResponse=r.serverResponse,o}return n}function Gt(e,t,n){const s=t.fullServerUrl(),r=J(s,e.host,e._protocol),o="GET",i=e.maxOperationRetryTime,a=new Ie(r,o,Kt(e,n),i);return a.errorHandler=Xt(t),a}function Yt(e,t){return e&&e.contentType||t&&t.type()||"application/octet-stream"}function Zt(e,t,n){const s=Object.assign({},n);return s.fullPath=e.path,s.size=t.size(),s.contentType||(s.contentType=Yt(null,t)),s}function Jt(e,t,n,s,r){const o=t.bucketOnlyServerUrl(),i={"X-Goog-Upload-Protocol":"multipart"};function a(){let k="";for(let g=0;g<2;g++)k=k+Math.random().toString().slice(2);return k}const c=a();i["Content-Type"]="multipart/related; boundary="+c;const l=Zt(t,s,r),h=Vt(l,n),y="--"+c+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+h+`\r
--`+c+`\r
Content-Type: `+l.contentType+`\r
\r
`,p=`\r
--`+c+"--",w=A.getBlob(y,s,p);if(w===null)throw ft();const b={name:l.fullPath},f=J(o,e.host,e._protocol),_="POST",N=e.maxUploadRetryTime,U=new Ie(f,_,Wt(e,n),N);return U.urlParams=b,U.headers=i,U.body=w.uploadData(),U.errorHandler=Ce(t),U}class Qt{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=C.NO_ERROR,this.sendPromise_=new Promise(t=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=C.ABORT,t()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=C.NETWORK_ERROR,t()}),this.xhr_.addEventListener("load",()=>{t()})})}send(t,n,s,r,o){if(this.sent_)throw D("cannot .send() more than once");if(fe(t)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(n,t,!0),o!==void 0)for(const i in o)o.hasOwnProperty(i)&&this.xhr_.setRequestHeader(i,o[i].toString());return r!==void 0?this.xhr_.send(r):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw D("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw D("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw D("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw D("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(t){return this.xhr_.getResponseHeader(t)}addUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",t)}removeUploadProgressListener(t){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",t)}}class en extends Qt{initXhr(){this.xhr_.responseType="text"}}function Oe(){return new en}/**
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
 */class O{constructor(t,n){this._service=t,n instanceof R?this._location=n:this._location=R.makeFromUrl(n,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,n){return new O(t,n)}get root(){const t=new R(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return ke(this._location.path)}get storage(){return this._service}get parent(){const t=Ft(this._location.path);if(t===null)return null;const n=new R(this._location.bucket,t);return new O(this._service,n)}_throwIfRoot(t){if(this._location.path==="")throw _t(t)}}function tn(e,t,n){e._throwIfRoot("uploadBytes");const s=Jt(e.storage,e._location,Ee(),new A(t,!0),n);return e.storage.makeRequestWithTokens(s,Oe).then(r=>({metadata:r,ref:e}))}function nn(e){e._throwIfRoot("getDownloadURL");const t=Gt(e.storage,e._location,Ee());return e.storage.makeRequestWithTokens(t,Oe).then(n=>{if(n===null)throw pt();return n})}function sn(e,t){const n=Mt(e._location.path,t),s=new R(e._location.bucket,n);return new O(e.storage,s)}/**
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
 */function rn(e){return/^[A-Za-z]+:\/\//.test(e)}function on(e,t){return new O(e,t)}function Ne(e,t){if(e instanceof Q){const n=e;if(n._bucket==null)throw ht();const s=new O(n,n._bucket);return t!=null?Ne(s,t):s}else return t!==void 0?sn(e,t):e}function an(e,t){if(t&&rn(t)){if(e instanceof Q)return on(e,t);throw X("To use ref(service, url), the first argument must be a Storage instance.")}else return Ne(e,t)}function ie(e,t){const n=t==null?void 0:t[_e];return n==null?null:R.makeFromBucketSpec(n,e)}function cn(e,t,n,s={}){e.host=`${t}:${n}`;const r=fe(t);r&&(qe(`https://${e.host}/b`),je("Storage",!0)),e._isUsingEmulator=!0,e._protocol=r?"https":"http";const{mockUserToken:o}=s;o&&(e._overrideAuthToken=typeof o=="string"?o:ze(o,e.app.options.projectId))}class Q{constructor(t,n,s,r,o,i=!1){this.app=t,this._authProvider=n,this._appCheckProvider=s,this._url=r,this._firebaseVersion=o,this._isUsingEmulator=i,this._bucket=null,this._host=me,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=tt,this._maxUploadRetryTime=nt,this._requests=new Set,r!=null?this._bucket=R.makeFromBucketSpec(r,this._host):this._bucket=ie(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=R.makeFromBucketSpec(this._url,t):this._bucket=ie(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){oe("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){oe("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const n=await t.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Le(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new O(this,t)}_makeRequest(t,n,s,r,o=!0){if(this._deleted)return new gt(ge());{const i=Ct(t,this._appId,s,r,n,this._firebaseVersion,o,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(t,n){const[s,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,n,s,r).getPromise()}}const ae="@firebase/storage",ce="0.14.0";/**
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
 */const De="storage";function ln(e,t,n){return e=q(e),tn(e,t,n)}function un(e){return e=q(e),nn(e)}function dn(e,t){return e=q(e),an(e,t)}function hn(e=Me(),t){e=q(e);const s=$e(e,De).getImmediate({identifier:t}),r=He("storage");return r&&fn(s,...r),s}function fn(e,t,n,s={}){cn(e,t,n,s)}function pn(e,{instanceIdentifier:t}){const n=e.getProvider("app").getImmediate(),s=e.getProvider("auth-internal"),r=e.getProvider("app-check-internal");return new Q(n,s,r,t,Se)}function mn(){xe(new Pe(De,pn,"PUBLIC").setMultipleInstances(!0)),se(ae,ce,""),se(ae,ce,"esm2020")}mn();const _n={apiKey:"AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",authDomain:"wise-catty.cc",projectId:"wisecat-8df8d",storageBucket:"wisecat-8df8d.firebasestorage.app",messagingSenderId:"1078479155773",appId:"1:1078479155773:web:cd62907516951aa47db054",measurementId:"G-30M228G3VP"},ee=Ve(_n),gn=We(ee),te=Ke(ee,"reservation"),yn=hn(ee),le=document.getElementById("authCheck"),L=document.getElementById("mainContent"),F=document.getElementById("loginContent"),M=document.getElementById("taskTableBody"),ne=document.getElementById("taskModal"),ue=document.getElementById("newTaskBtn"),de=document.getElementById("cancelBtn"),H=document.getElementById("taskForm"),wn=document.getElementById("titleInput"),bn=document.getElementById("priorityInput"),Rn=document.getElementById("descInput"),he=document.getElementById("fileInput"),$=document.getElementById("submitBtn");let I=null,B=[],T={field:"priority",dir:"desc"};Xe(gn,e=>{le&&(le.hidden=!0),e?(I=e,L&&(L.hidden=!1),F&&(F.hidden=!0),Tn()):(I=null,L&&(L.hidden=!0),F&&(F.hidden=!1))});function Tn(){const e=Ge(pe(te,"dev_task"));Ye(e,t=>{B=[],t.forEach(n=>{B.push({id:n.id,...n.data()})}),ve()})}function ve(){if(M){if(M.innerHTML="",B.length===0){M.innerHTML='<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #64748b;">No tasks found. Create one!</td></tr>';return}B.sort((e,t)=>{var r,o;let n=e[T.field],s=t[T.field];return T.field==="createdBy"&&(n=((r=e.createdBy)==null?void 0:r.name)||"",s=((o=t.createdBy)==null?void 0:o.name)||""),n<s?T.dir==="asc"?-1:1:n>s?T.dir==="asc"?1:-1:0}),B.forEach(e=>{var p,w,b;const t=document.createElement("tr"),n=`p-${e.priority||3}`,s=e.priority||3,r=e.completed===!0,o=r?'<span class="status-badge status-done">● Done</span>':'<span class="status-badge status-pending">○ Pending</span>',i=K(e.title||"(No Title)"),a=K(e.content||""),c=K(((p=e.createdBy)==null?void 0:p.name)||((w=e.createdBy)==null?void 0:w.email)||"Unknown");let l="-";if(e.createdAt){const f=e.createdAt.toDate?e.createdAt.toDate():new Date(e.createdAt);l=f.toLocaleDateString()+" "+f.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}let h="";e.attachment_url&&(h=`<br><a href="${e.attachment_url}" target="_blank" style="font-size: 0.8em; color: var(--accent);">📎 View Attachment</a>`),t.innerHTML=`
            <td><span class="priority-badge ${n}">P${s}</span></td>
            <td style="font-weight: 500;">
                ${i}
                ${h}
            </td>
            <td style="color: #94a3b8; font-size: 0.9em; max-width: 300px;">
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" 
                     onclick="this.style.whiteSpace=this.style.whiteSpace==='nowrap'?'pre-wrap':'nowrap'"
                     title="Click to expand/collapse">
                    ${a}
                </div>
            </td>
            <td style="font-size: 0.85em; color: #ccc;">${l}</td>
            <td style="font-size: 0.9em;">${c}</td>
            <td>${o}</td>
            <td class="action-cell"></td>
        `;const y=I&&e.createdBy&&I.uid===e.createdBy.uid;if(!r&&y){const f=document.createElement("button");f.textContent="🗑️",f.style.background="transparent",f.style.border="none",f.style.cursor="pointer",f.style.fontSize="1.2rem",f.title="Delete Task",f.onclick=()=>En(e.id),(b=t.querySelector(".action-cell"))==null||b.appendChild(f)}M.appendChild(t)})}}document.querySelectorAll("th[data-sort]").forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-sort");t&&(T.field===t?T.dir=T.dir==="asc"?"desc":"asc":(T.field=t,T.dir="desc"),ve(),kn())})});function kn(){document.querySelectorAll("th[data-sort]").forEach(e=>{var s;const t=e.getAttribute("data-sort");let n=((s=e.textContent)==null?void 0:s.replace(/[↕↑↓]/g,"").trim())||"";T.field===t?(e.textContent=`${n} ${T.dir==="asc"?"↑":"↓"}`,e.style.color="var(--accent)"):(e.textContent=`${n} ↕`,e.style.color="")})}async function En(e){if(confirm("Are you sure you want to delete this task? This cannot be undone."))try{await Ze(Je(te,"dev_task",e))}catch(t){console.error("Error deleting task:",t),alert("Failed to delete task. Check console for details.")}}function K(e){return e?e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}ue&&ue.addEventListener("click",()=>{ne.showModal()});de&&de.addEventListener("click",()=>{ne.close(),H.reset()});H&&H.addEventListener("submit",async e=>{if(e.preventDefault(),!I)return;const t=wn.value.trim(),n=Rn.value.trim(),s=parseInt(bn.value,10),r=he.files?he.files[0]:null;if(!(!t||!n)){$.disabled=!0,$.textContent="Uploading...";try{let o=null;if(r){const i=Date.now(),a=dn(yn,`task_attachments/${i}_${r.name}`),c=await ln(a,r);o=await un(c.ref)}await Qe(pe(te,"dev_task"),{title:t,content:n,priority:s,completed:!1,attachment_url:o,createdAt:et(),createdBy:{uid:I.uid,email:I.email||"Anonymous",name:I.displayName||"Unknown"}}),ne.close(),H.reset()}catch(o){console.error("Error creating task:",o),alert("Failed to create task (Check console for permission details)")}finally{$.disabled=!1,$.textContent="Create Task"}}});
