(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(a){if(a.ep)return;a.ep=!0;const o=t(a);fetch(a.href,o)}})();var Q,b,Ue,D,be,De,Le,qe,ue,ie,oe,$={},Oe=[],sn=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,J=Array.isArray;function F(e,n){for(var t in n)e[t]=n[t];return e}function fe(e){e&&e.parentNode&&e.parentNode.removeChild(e)}function ln(e,n,t){var r,a,o,s={};for(o in n)o=="key"?r=n[o]:o=="ref"?a=n[o]:s[o]=n[o];if(arguments.length>2&&(s.children=arguments.length>3?Q.call(arguments,2):t),typeof e=="function"&&e.defaultProps!=null)for(o in e.defaultProps)s[o]===void 0&&(s[o]=e.defaultProps[o]);return Y(e,s,r,a,null)}function Y(e,n,t,r,a){var o={type:e,props:n,key:t,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:a??++Ue,__i:-1,__u:0};return a==null&&b.vnode!=null&&b.vnode(o),o}function O(e){return e.children}function V(e,n){this.props=e,this.context=n}function q(e,n){if(n==null)return e.__?q(e.__,e.__i+1):null;for(var t;n<e.__k.length;n++)if((t=e.__k[n])!=null&&t.__e!=null)return t.__e;return typeof e.type=="function"?q(e):null}function Be(e){var n,t;if((e=e.__)!=null&&e.__c!=null){for(e.__e=e.__c.base=null,n=0;n<e.__k.length;n++)if((t=e.__k[n])!=null&&t.__e!=null){e.__e=e.__c.base=t.__e;break}return Be(e)}}function we(e){(!e.__d&&(e.__d=!0)&&D.push(e)&&!j.__r++||be!=b.debounceRendering)&&((be=b.debounceRendering)||De)(j)}function j(){for(var e,n,t,r,a,o,s,u=1;D.length;)D.length>u&&D.sort(Le),e=D.shift(),u=D.length,e.__d&&(t=void 0,r=void 0,a=(r=(n=e).__v).__e,o=[],s=[],n.__P&&((t=F({},r)).__v=r.__v+1,b.vnode&&b.vnode(t),_e(n.__P,t,r,n.__n,n.__P.namespaceURI,32&r.__u?[a]:null,o,a??q(r),!!(32&r.__u),s),t.__v=r.__v,t.__.__k[t.__i]=t,We(o,t,s),r.__e=r.__=null,t.__e!=a&&Be(t)));j.__r=0}function $e(e,n,t,r,a,o,s,u,f,c,d){var i,_,h,v,m,g,p,y=r&&r.__k||Oe,k=n.length;for(f=cn(t,n,y,f,k),i=0;i<k;i++)(h=t.__k[i])!=null&&(_=h.__i==-1?$:y[h.__i]||$,h.__i=i,g=_e(e,h,_,a,o,s,u,f,c,d),v=h.__e,h.ref&&_.ref!=h.ref&&(_.ref&&he(_.ref,null,h),d.push(h.ref,h.__c||v,h)),m==null&&v!=null&&(m=v),(p=!!(4&h.__u))||_.__k===h.__k?f=Ke(h,f,e,p):typeof h.type=="function"&&g!==void 0?f=g:v&&(f=v.nextSibling),h.__u&=-7);return t.__e=m,f}function cn(e,n,t,r,a){var o,s,u,f,c,d=t.length,i=d,_=0;for(e.__k=new Array(a),o=0;o<a;o++)(s=n[o])!=null&&typeof s!="boolean"&&typeof s!="function"?(typeof s=="string"||typeof s=="number"||typeof s=="bigint"||s.constructor==String?s=e.__k[o]=Y(null,s,null,null,null):J(s)?s=e.__k[o]=Y(O,{children:s},null,null,null):s.constructor===void 0&&s.__b>0?s=e.__k[o]=Y(s.type,s.props,s.key,s.ref?s.ref:null,s.__v):e.__k[o]=s,f=o+_,s.__=e,s.__b=e.__b+1,u=null,(c=s.__i=dn(s,t,f,i))!=-1&&(i--,(u=t[c])&&(u.__u|=2)),u==null||u.__v==null?(c==-1&&(a>d?_--:a<d&&_++),typeof s.type!="function"&&(s.__u|=4)):c!=f&&(c==f-1?_--:c==f+1?_++:(c>f?_--:_++,s.__u|=4))):e.__k[o]=null;if(i)for(o=0;o<d;o++)(u=t[o])!=null&&(2&u.__u)==0&&(u.__e==r&&(r=q(u)),Ye(u,u));return r}function Ke(e,n,t,r){var a,o;if(typeof e.type=="function"){for(a=e.__k,o=0;a&&o<a.length;o++)a[o]&&(a[o].__=e,n=Ke(a[o],n,t,r));return n}e.__e!=n&&(r&&(n&&e.type&&!n.parentNode&&(n=q(e)),t.insertBefore(e.__e,n||null)),n=e.__e);do n=n&&n.nextSibling;while(n!=null&&n.nodeType==8);return n}function dn(e,n,t,r){var a,o,s,u=e.key,f=e.type,c=n[t],d=c!=null&&(2&c.__u)==0;if(c===null&&u==null||d&&u==c.key&&f==c.type)return t;if(r>(d?1:0)){for(a=t-1,o=t+1;a>=0||o<n.length;)if((c=n[s=a>=0?a--:o++])!=null&&(2&c.__u)==0&&u==c.key&&f==c.type)return s}return-1}function xe(e,n,t){n[0]=="-"?e.setProperty(n,t??""):e[n]=t==null?"":typeof t!="number"||sn.test(n)?t:t+"px"}function G(e,n,t,r,a){var o,s;e:if(n=="style")if(typeof t=="string")e.style.cssText=t;else{if(typeof r=="string"&&(e.style.cssText=r=""),r)for(n in r)t&&n in t||xe(e.style,n,"");if(t)for(n in t)r&&t[n]==r[n]||xe(e.style,n,t[n])}else if(n[0]=="o"&&n[1]=="n")o=n!=(n=n.replace(qe,"$1")),s=n.toLowerCase(),n=s in e||n=="onFocusOut"||n=="onFocusIn"?s.slice(2):n.slice(2),e.l||(e.l={}),e.l[n+o]=t,t?r?t.u=r.u:(t.u=ue,e.addEventListener(n,o?oe:ie,o)):e.removeEventListener(n,o?oe:ie,o);else{if(a=="http://www.w3.org/2000/svg")n=n.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(n!="width"&&n!="height"&&n!="href"&&n!="list"&&n!="form"&&n!="tabIndex"&&n!="download"&&n!="rowSpan"&&n!="colSpan"&&n!="role"&&n!="popover"&&n in e)try{e[n]=t??"";break e}catch{}typeof t=="function"||(t==null||t===!1&&n[4]!="-"?e.removeAttribute(n):e.setAttribute(n,n=="popover"&&t==1?"":t))}}function Se(e){return function(n){if(this.l){var t=this.l[n.type+e];if(n.t==null)n.t=ue++;else if(n.t<t.u)return;return t(b.event?b.event(n):n)}}}function _e(e,n,t,r,a,o,s,u,f,c){var d,i,_,h,v,m,g,p,y,k,C,M,w,P,E,U,B,z=n.type;if(n.constructor!==void 0)return null;128&t.__u&&(f=!!(32&t.__u),o=[u=n.__e=t.__e]),(d=b.__b)&&d(n);e:if(typeof z=="function")try{if(p=n.props,y="prototype"in z&&z.prototype.render,k=(d=z.contextType)&&r[d.__c],C=d?k?k.props.value:d.__:r,t.__c?g=(i=n.__c=t.__c).__=i.__E:(y?n.__c=i=new z(p,C):(n.__c=i=new V(p,C),i.constructor=z,i.render=fn),k&&k.sub(i),i.state||(i.state={}),i.__n=r,_=i.__d=!0,i.__h=[],i._sb=[]),y&&i.__s==null&&(i.__s=i.state),y&&z.getDerivedStateFromProps!=null&&(i.__s==i.state&&(i.__s=F({},i.__s)),F(i.__s,z.getDerivedStateFromProps(p,i.__s))),h=i.props,v=i.state,i.__v=n,_)y&&z.getDerivedStateFromProps==null&&i.componentWillMount!=null&&i.componentWillMount(),y&&i.componentDidMount!=null&&i.__h.push(i.componentDidMount);else{if(y&&z.getDerivedStateFromProps==null&&p!==h&&i.componentWillReceiveProps!=null&&i.componentWillReceiveProps(p,C),n.__v==t.__v||!i.__e&&i.shouldComponentUpdate!=null&&i.shouldComponentUpdate(p,i.__s,C)===!1){for(n.__v!=t.__v&&(i.props=p,i.state=i.__s,i.__d=!1),n.__e=t.__e,n.__k=t.__k,n.__k.some(function(T){T&&(T.__=n)}),M=0;M<i._sb.length;M++)i.__h.push(i._sb[M]);i._sb=[],i.__h.length&&s.push(i);break e}i.componentWillUpdate!=null&&i.componentWillUpdate(p,i.__s,C),y&&i.componentDidUpdate!=null&&i.__h.push(function(){i.componentDidUpdate(h,v,m)})}if(i.context=C,i.props=p,i.__P=e,i.__e=!1,w=b.__r,P=0,y){for(i.state=i.__s,i.__d=!1,w&&w(n),d=i.render(i.props,i.state,i.context),E=0;E<i._sb.length;E++)i.__h.push(i._sb[E]);i._sb=[]}else do i.__d=!1,w&&w(n),d=i.render(i.props,i.state,i.context),i.state=i.__s;while(i.__d&&++P<25);i.state=i.__s,i.getChildContext!=null&&(r=F(F({},r),i.getChildContext())),y&&!_&&i.getSnapshotBeforeUpdate!=null&&(m=i.getSnapshotBeforeUpdate(h,v)),U=d,d!=null&&d.type===O&&d.key==null&&(U=Ge(d.props.children)),u=$e(e,J(U)?U:[U],n,t,r,a,o,s,u,f,c),i.base=n.__e,n.__u&=-161,i.__h.length&&s.push(i),g&&(i.__E=i.__=null)}catch(T){if(n.__v=null,f||o!=null)if(T.then){for(n.__u|=f?160:128;u&&u.nodeType==8&&u.nextSibling;)u=u.nextSibling;o[o.indexOf(u)]=null,n.__e=u}else{for(B=o.length;B--;)fe(o[B]);ae(n)}else n.__e=t.__e,n.__k=t.__k,T.then||ae(n);b.__e(T,n,t)}else o==null&&n.__v==t.__v?(n.__k=t.__k,n.__e=t.__e):u=n.__e=un(t.__e,n,t,r,a,o,s,f,c);return(d=b.diffed)&&d(n),128&n.__u?void 0:u}function ae(e){e&&e.__c&&(e.__c.__e=!0),e&&e.__k&&e.__k.forEach(ae)}function We(e,n,t){for(var r=0;r<t.length;r++)he(t[r],t[++r],t[++r]);b.__c&&b.__c(n,e),e.some(function(a){try{e=a.__h,a.__h=[],e.some(function(o){o.call(a)})}catch(o){b.__e(o,a.__v)}})}function Ge(e){return typeof e!="object"||e==null||e.__b&&e.__b>0?e:J(e)?e.map(Ge):F({},e)}function un(e,n,t,r,a,o,s,u,f){var c,d,i,_,h,v,m,g=t.props||$,p=n.props,y=n.type;if(y=="svg"?a="http://www.w3.org/2000/svg":y=="math"?a="http://www.w3.org/1998/Math/MathML":a||(a="http://www.w3.org/1999/xhtml"),o!=null){for(c=0;c<o.length;c++)if((h=o[c])&&"setAttribute"in h==!!y&&(y?h.localName==y:h.nodeType==3)){e=h,o[c]=null;break}}if(e==null){if(y==null)return document.createTextNode(p);e=document.createElementNS(a,y,p.is&&p),u&&(b.__m&&b.__m(n,o),u=!1),o=null}if(y==null)g===p||u&&e.data==p||(e.data=p);else{if(o=o&&Q.call(e.childNodes),!u&&o!=null)for(g={},c=0;c<e.attributes.length;c++)g[(h=e.attributes[c]).name]=h.value;for(c in g)if(h=g[c],c!="children"){if(c=="dangerouslySetInnerHTML")i=h;else if(!(c in p)){if(c=="value"&&"defaultValue"in p||c=="checked"&&"defaultChecked"in p)continue;G(e,c,null,h,a)}}for(c in p)h=p[c],c=="children"?_=h:c=="dangerouslySetInnerHTML"?d=h:c=="value"?v=h:c=="checked"?m=h:u&&typeof h!="function"||g[c]===h||G(e,c,h,g[c],a);if(d)u||i&&(d.__html==i.__html||d.__html==e.innerHTML)||(e.innerHTML=d.__html),n.__k=[];else if(i&&(e.innerHTML=""),$e(n.type=="template"?e.content:e,J(_)?_:[_],n,t,r,y=="foreignObject"?"http://www.w3.org/1999/xhtml":a,o,s,o?o[0]:t.__k&&q(t,0),u,f),o!=null)for(c=o.length;c--;)fe(o[c]);u||(c="value",y=="progress"&&v==null?e.removeAttribute("value"):v!=null&&(v!==e[c]||y=="progress"&&!v||y=="option"&&v!=g[c])&&G(e,c,v,g[c],a),c="checked",m!=null&&m!=e[c]&&G(e,c,m,g[c],a))}return e}function he(e,n,t){try{if(typeof e=="function"){var r=typeof e.__u=="function";r&&e.__u(),r&&n==null||(e.__u=e(n))}else e.current=n}catch(a){b.__e(a,t)}}function Ye(e,n,t){var r,a;if(b.unmount&&b.unmount(e),(r=e.ref)&&(r.current&&r.current!=e.__e||he(r,null,n)),(r=e.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(o){b.__e(o,n)}r.base=r.__P=null}if(r=e.__k)for(a=0;a<r.length;a++)r[a]&&Ye(r[a],n,t||typeof e.type!="function");t||fe(e.__e),e.__c=e.__=e.__e=void 0}function fn(e,n,t){return this.constructor(e,t)}function _n(e,n,t){var r,a,o,s;n==document&&(n=document.documentElement),b.__&&b.__(e,n),a=(r=!1)?null:n.__k,o=[],s=[],_e(n,e=n.__k=ln(O,null,[e]),a||$,$,n.namespaceURI,a?null:n.firstChild?Q.call(n.childNodes):null,o,a?a.__e:n.firstChild,r,s),We(o,e,s)}Q=Oe.slice,b={__e:function(e,n,t,r){for(var a,o,s;n=n.__;)if((a=n.__c)&&!a.__)try{if((o=a.constructor)&&o.getDerivedStateFromError!=null&&(a.setState(o.getDerivedStateFromError(e)),s=a.__d),a.componentDidCatch!=null&&(a.componentDidCatch(e,r||{}),s=a.__d),s)return a.__E=a}catch(u){e=u}throw e}},Ue=0,V.prototype.setState=function(e,n){var t;t=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=F({},this.state),typeof e=="function"&&(e=e(F({},t),this.props)),e&&F(t,e),e!=null&&this.__v&&(n&&this._sb.push(n),we(this))},V.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),we(this))},V.prototype.render=O,D=[],De=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Le=function(e,n){return e.__v.__b-n.__v.__b},j.__r=0,qe=/(PointerCapture)$|Capture$/i,ue=0,ie=Se(!1),oe=Se(!0);var hn=0;function l(e,n,t,r,a,o){n||(n={});var s,u,f=n;if("ref"in f)for(u in f={},n)u=="ref"?s=n[u]:f[u]=n[u];var c={type:e,props:f,key:t,ref:s,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--hn,__i:-1,__u:0,__source:a,__self:o};if(typeof e=="function"&&(s=e.defaultProps))for(u in s)f[u]===void 0&&(f[u]=s[u]);return b.vnode&&b.vnode(c),c}var K,x,re,ke,Z=0,Ve=[],S=b,Ce=S.__b,ze=S.__r,Re=S.diffed,Pe=S.__c,Me=S.unmount,Ee=S.__;function pe(e,n){S.__h&&S.__h(x,e,Z||n),Z=0;var t=x.__H||(x.__H={__:[],__h:[]});return e>=t.__.length&&t.__.push({}),t.__[e]}function H(e){return Z=1,pn(je,e)}function pn(e,n,t){var r=pe(K++,2);if(r.t=e,!r.__c&&(r.__=[je(void 0,n),function(u){var f=r.__N?r.__N[0]:r.__[0],c=r.t(f,u);f!==c&&(r.__N=[c,r.__[1]],r.__c.setState({}))}],r.__c=x,!x.__f)){var a=function(u,f,c){if(!r.__c.__H)return!0;var d=r.__c.__H.__.filter(function(_){return!!_.__c});if(d.every(function(_){return!_.__N}))return!o||o.call(this,u,f,c);var i=r.__c.props!==u;return d.forEach(function(_){if(_.__N){var h=_.__[0];_.__=_.__N,_.__N=void 0,h!==_.__[0]&&(i=!0)}}),o&&o.call(this,u,f,c)||i};x.__f=!0;var o=x.shouldComponentUpdate,s=x.componentWillUpdate;x.componentWillUpdate=function(u,f,c){if(this.__e){var d=o;o=void 0,a(u,f,c),o=d}s&&s.call(this,u,f,c)},x.shouldComponentUpdate=a}return r.__N||r.__}function A(e,n){var t=pe(K++,3);!S.__s&&Xe(t.__H,n)&&(t.__=e,t.u=n,x.__H.__h.push(t))}function Te(e){return Z=5,mn(function(){return{current:e}},[])}function mn(e,n){var t=pe(K++,7);return Xe(t.__H,n)&&(t.__=e(),t.__H=n,t.__h=e),t.__}function vn(){for(var e;e=Ve.shift();)if(e.__P&&e.__H)try{e.__H.__h.forEach(X),e.__H.__h.forEach(se),e.__H.__h=[]}catch(n){e.__H.__h=[],S.__e(n,e.__v)}}S.__b=function(e){x=null,Ce&&Ce(e)},S.__=function(e,n){e&&n.__k&&n.__k.__m&&(e.__m=n.__k.__m),Ee&&Ee(e,n)},S.__r=function(e){ze&&ze(e),K=0;var n=(x=e.__c).__H;n&&(re===x?(n.__h=[],x.__h=[],n.__.forEach(function(t){t.__N&&(t.__=t.__N),t.u=t.__N=void 0})):(n.__h.forEach(X),n.__h.forEach(se),n.__h=[],K=0)),re=x},S.diffed=function(e){Re&&Re(e);var n=e.__c;n&&n.__H&&(n.__H.__h.length&&(Ve.push(n)!==1&&ke===S.requestAnimationFrame||((ke=S.requestAnimationFrame)||gn)(vn)),n.__H.__.forEach(function(t){t.u&&(t.__H=t.u),t.u=void 0})),re=x=null},S.__c=function(e,n){n.some(function(t){try{t.__h.forEach(X),t.__h=t.__h.filter(function(r){return!r.__||se(r)})}catch(r){n.some(function(a){a.__h&&(a.__h=[])}),n=[],S.__e(r,t.__v)}}),Pe&&Pe(e,n)},S.unmount=function(e){Me&&Me(e);var n,t=e.__c;t&&t.__H&&(t.__H.__.forEach(function(r){try{X(r)}catch(a){n=a}}),t.__H=void 0,n&&S.__e(n,t.__v))};var He=typeof requestAnimationFrame=="function";function gn(e){var n,t=function(){clearTimeout(r),He&&cancelAnimationFrame(n),setTimeout(e)},r=setTimeout(t,35);He&&(n=requestAnimationFrame(t))}function X(e){var n=x,t=e.__c;typeof t=="function"&&(e.__c=void 0,t()),x=n}function se(e){var n=x;e.__c=e.__(),x=n}function Xe(e,n){return!e||e.length!==n.length||n.some(function(t,r){return t!==e[r]})}function je(e,n){return typeof n=="function"?n(e):n}const le=(e,n,t)=>Math.min(Math.max(e,n),t),Ne=e=>e*Math.PI/180;let ce=1;function yn(e){ce=le(e,.25,1)}function Fe(e){const n=Math.max(1,window.devicePixelRatio||1),t=Math.round(e.clientWidth*n*ce),r=Math.round(e.clientHeight*n*ce);return(e.width!==t||e.height!==r)&&(e.width=t,e.height=r),{width:t,height:r}}function bn(e){const n={yaw:0,pitch:Ne(4.5),radius:18,fovY:Math.PI/3,roll:0,update:s=>{}},t={q:!1,e:!1};window.addEventListener("keydown",s=>{s.key.toLowerCase()==="q"&&(t.q=!0),s.key.toLowerCase()==="e"&&(t.e=!0)}),window.addEventListener("keyup",s=>{s.key.toLowerCase()==="q"&&(t.q=!1),s.key.toLowerCase()==="e"&&(t.e=!1)});let r=!1,a=0,o=0;return e.addEventListener("mousedown",s=>{r=!0,a=s.clientX,o=s.clientY}),window.addEventListener("mouseup",()=>{r=!1}),window.addEventListener("mousemove",s=>{if(!r)return;const u=s.clientX-a,f=s.clientY-o;a=s.clientX,o=s.clientY;const c=.005;n.yaw+=u*c,n.pitch+=f*c;const d=Ne(89.5);n.pitch=le(n.pitch,-d,d)}),e.addEventListener("wheel",s=>{s.preventDefault(),n.radius*=Math.exp(s.deltaY*.001),n.radius=le(n.radius,2.5,100)},{passive:!1}),n.update=s=>{t.q&&(n.roll-=1*s),t.e&&(n.roll+=1*s)},n}function wn(e){const n=Math.cos(e.yaw),t=Math.sin(e.yaw),r=Math.cos(e.pitch),a=Math.sin(e.pitch),o=e.radius,s=[0,0,0],u=[o*t*r,o*a,o*n*r];let f=[s[0]-u[0],s[1]-u[1],s[2]-u[2]];{const _=Math.hypot(f[0],f[1],f[2])||1;f=[f[0]/_,f[1]/_,f[2]/_]}const c=[0,1,0];let d=[c[1]*f[2]-c[2]*f[1],c[2]*f[0]-c[0]*f[2],c[0]*f[1]-c[1]*f[0]];{const _=Math.hypot(d[0],d[1],d[2])||1;d=[d[0]/_,d[1]/_,d[2]/_]}let i=[f[1]*d[2]-f[2]*d[1],f[2]*d[0]-f[0]*d[2],f[0]*d[1]-f[1]*d[0]];{const _=Math.hypot(i[0],i[1],i[2])||1;i=[i[0]/_,i[1]/_,i[2]/_]}if(e.roll!==0){const _=Math.cos(e.roll),h=Math.sin(e.roll),v=[d[0]*_+i[0]*h,d[1]*_+i[1]*h,d[2]*_+i[2]*h],m=[-d[0]*h+i[0]*_,-d[1]*h+i[1]*_,-d[2]*h+i[2]*_];d=v,i=m}return{camPos:u,camFwd:f,camRight:d,camUp:i}}const xn=`struct VSOut {
  @builtin(position) position : vec4f
};

const MAX_STEPS : i32 = 2500;
const RS : f32 = 2.0;       // Schwarzschild radius
const R_INNER : f32 = 6.0;  // Accretion disk inner radius (ISCO)
const R_OUTER : f32 = 14.0; // Accretion disk outer radius

// Fullscreen triangle (no vertex buffers)
@vertex
fn vs_main(@builtin(vertex_index) vertexIndex : u32) -> VSOut {
  var pos = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f( 3.0, -1.0),
    vec2f(-1.0,  3.0)
  );
  let xy = pos[vertexIndex];

  var out : VSOut;
  out.position = vec4f(xy, 0.0, 1.0);
  return out;
}

// ---- Uniforms ----
struct Uniforms {
  resolution : vec2f,
  time       : f32,
  fovY       : f32,

  camPos     : vec3f,
  showEventHorizon : f32,

  camFwd     : vec3f,
  maxSteps   : f32,

  camRight   : vec3f,
  stepScale  : f32,

  camUp      : vec3f,
  useNoiseTexture : f32, // 1.0 = texture, 0.0 = procedural

  metricType : f32, // 0.0 = Schwarzschild, 1.0 = Kerr
  spin       : f32, // a, default 0.9 for Kerr
  useRedshift: f32, // 1.0 = on, 0.0 = off
};

@group(0) @binding(0)
var<uniform> uniforms : Uniforms;

@group(0) @binding(1) var noiseTex : texture_2d<f32>;
@group(0) @binding(2) var noiseSampler : sampler;

fn saturate(x : f32) -> f32 {
  return clamp(x, 0.0, 1.0);
}

// --- Noise helpers ---
fn hash1(p : vec2f) -> f32 {
  let h = dot(p, vec2f(127.1, 311.7));
  return fract(sin(h) * 43758.5453123);
}

fn valueNoise2(p : vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  let a = hash1(i);
  let b = hash1(i + vec2f(1.0, 0.0));
  let c = hash1(i + vec2f(0.0, 1.0));
  let d = hash1(i + vec2f(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

fn fbm2(p : vec2f) -> f32 {
  var sum : f32 = 0.0;
  var amp : f32 = 0.5;
  var freq : f32 = 1.0;
  for (var i : i32 = 0; i < 3; i = i + 1) {
    sum = sum + amp * valueNoise2(p * freq);
    freq = freq * 2.0;
    amp  = amp * 0.5;
  }
  return sum;
}

struct RingResult {
  brightness : f32,
  baseColor  : vec3f,
}

fn applyHotInnerRing(r : f32, rInner : f32, brightness : f32, baseColor : vec3f) -> RingResult {
  // --- Hot inner ring centered at rInner ---
  let ringWidth : f32 = 0.4; 
  let ringX = (r - rInner) / ringWidth;        
  let ringProfile = exp(-ringX * ringX);      

  let ringStrength : f32 = 2.5;               
  let newBrightness = brightness + ringStrength * ringProfile;

  let ringColorBoost = vec3f(1.0, 1.0, 0.98);
  let newBaseColor = mix(baseColor, ringColorBoost, saturate(ringProfile));

  var result : RingResult;
  result.brightness = newBrightness;
  result.baseColor = newBaseColor;
  return result;
}

// --- Flow Noise / Advection-Regeneration ---
// Solves the "infinite winding" problem where streaks get too thin over time.
// We blend two noise layers that reset periodically.

fn getDiskNoise(hit : vec3f, r : f32, time : f32) -> f32 {
    // "Flow Noise" or Advection-Regeneration technique.
    
    let period = 20.0; 
    let omega = 2.0 * pow(max(r, R_INNER), -0.5); 
    
    let baseAngle = 3.0 * log(r);

    // --- Layer 1 ---
    let phase1 = fract(time / period);
    let weight1 = 1.0 - abs(2.0 * phase1 - 1.0); 
    let age1 = (phase1 - 0.5) * period; 
    let theta1 = -omega * age1 + baseAngle;
    
    let c1 = cos(theta1); let s1 = sin(theta1);
    
    var n1 : f32;
    if (uniforms.useNoiseTexture > 0.5) {
        let uv1 = vec2f(hit.x * c1 - hit.z * s1, hit.x * s1 + hit.z * c1) * 0.1;
        n1 = textureSampleLevel(noiseTex, noiseSampler, uv1, 0.0).r;
    } else {
        let rot1 = vec2f(hit.x * c1 - hit.z * s1, hit.x * s1 + hit.z * c1);
        n1 = fbm2(rot1 * 0.5);
    }

    // --- Layer 2 ---
    let phase2 = fract((time / period) + 0.5);
    let weight2 = 1.0 - abs(2.0 * phase2 - 1.0);
    let age2 = (phase2 - 0.5) * period;
    let theta2 = -omega * age2 + baseAngle;

    let c2 = cos(theta2); let s2 = sin(theta2);
    
    var n2 : f32;
    if (uniforms.useNoiseTexture > 0.5) {
        let uv2 = vec2f(hit.x * c2 - hit.z * s2, hit.x * s2 + hit.z * c2) * 0.1;
        n2 = textureSampleLevel(noiseTex, noiseSampler, uv2, 0.0).r;
    } else {
        let rot2 = vec2f(hit.x * c2 - hit.z * s2, hit.x * s2 + hit.z * c2);
        n2 = fbm2(rot2 * 0.5);
    }

    let wTotal = weight1 + weight2;
    return (n1 * weight1 + n2 * weight2) / wTotal;
}

fn getDiskColor(hit : vec3f, r : f32, photonMom : vec4f) -> vec4f {
    let rNorm = (r - R_INNER) / (R_OUTER - R_INNER);
    let rNormClamped = saturate(rNorm);

    // Inner bright, outer dim
    var brightness = pow(1.0 - rNormClamped, 1.0);

    let innerCol = vec3f(1.0, 0.98, 0.95);
    let midCol   = vec3f(1.0, 0.8, 0.5);
    let outerCol = vec3f(0.9, 0.4, 0.2);

    let t1 = saturate(rNormClamped * 2.0);
    let t2 = saturate((rNormClamped - 0.5) * 2.0);
    let colorInnerMid = mix(innerCol, midCol, t1);
    var baseColor     = mix(colorInnerMid, outerCol, t2);

    // Apply hot inner ring effect
    let ringResult = applyHotInnerRing(r, R_INNER, brightness, baseColor);
    brightness = ringResult.brightness;
    baseColor = ringResult.baseColor;

    // --- Coherent turbulent streaks (Flow Noise) ---
    let turb = getDiskNoise(hit, r, uniforms.time);
    let turbShaped = pow(turb, 1.2);

    brightness = brightness * (0.6 + 0.7 * turbShaped);

    // Re-introduce noiseUV for edge distortion (rigid rotation to avoid winding)
    let omegaEdge = 2.0 * pow(R_OUTER, -0.5);
    let thetaEdge = -omegaEdge * uniforms.time * 0.5;
    let ce = cos(thetaEdge);
    let se = sin(thetaEdge);
    let rotX = hit.x * ce - hit.z * se;
    let rotZ = hit.x * se + hit.z * ce;
    let noiseUV = vec2f(rotX, rotZ) * 0.5;

    // --- Edge Treatment ---
    // 1. Perturb the radius for the fade calculation using noise
    // We only want to distort the OUTER edge. The inner edge should remain stable
    // to avoid "detached rings" spawning inside the hole.
    
    // Use a lower frequency noise for the shape distortion so it looks like "lobes"
    // We can just sample the texture again with a different scale
    let shapeNoise = textureSampleLevel(noiseTex, noiseSampler, noiseUV * 0.05, 0.0).r; 
    
    // Ramp up noise influence from 0 at inner edge to full at outer edge
    let noiseStrength = smoothstep(0.2, 0.8, rNorm); 
    let distortion = (shapeNoise - 0.5) * 0.5 * noiseStrength; // Increased distortion amp
    
    let rPerturbed = rNorm + distortion;

    // 2. Soft alpha fade with plateau
    // Inner edge: smoothstep(0.0, 0.2, ...) -> softer start
    // Outer edge: smoothstep(1.0, 0.8, ...) -> softer end
    let edgeFade = smoothstep(0.0, 0.2, rPerturbed) * smoothstep(1.0, 0.8, rPerturbed);
    
    // Power curve to keep main body opaque
    let opacityCurve = pow(edgeFade, 0.2);
    
    let alpha = opacityCurve * 0.95; 

    // Boost brightness slightly (uncoupled from fade)
    brightness = max(brightness, 0.05) * 1.5;
    
    // --- Redshift / Doppler ---
    if (uniforms.useRedshift > 0.5) {
        var u_emit : vec4f;
        if (uniforms.metricType > 0.5) {
            u_emit = getKerrOrbitVelocity(hit, r, uniforms.spin);
        } else {
            u_emit = getSchwarzschildOrbitVelocity(hit, r);
        }
        
        let g = calculateRedshift(u_emit, photonMom, uniforms.metricType);
        
        // Doppler Beaming (L ~ g^4 for intensity, plus frequency shift)
        // Visually, g^4 is very strong. We use 3.5 as a compromise between physics and dynamic range.
        let beaming = pow(g, 3.5);
        
        // Color shift: Blue light is hotter. Red light is cooler.
        // Simple simplified model:
        // if g > 1 (blue shift) -> shift towards white/blue
        // if g < 1 (red shift)  -> shift towards red/dim
        
        brightness = brightness * beaming;
        
        // Temperature shift approximation
        // Mix with blue for g > 1, Red for g < 1
        let shiftColor = select(vec3f(1.0, 0.3, 0.1), vec3f(0.8, 0.9, 1.0), g > 1.0);
        let shiftAmt = saturate(abs(g - 1.0) * 0.8);
        baseColor = mix(baseColor, shiftColor * baseColor, shiftAmt);
    }

    return vec4f(baseColor * brightness, alpha);
}

fn getSkyColor(dir : vec3f) -> vec3f {
   let tSky = 0.5 * (dir.y + 1.0);
   let skyTop    = vec3f(0.02, 0.05, 0.10);  // dark blue
   let skyBottom = vec3f(0.0, 0.0, 0.0);     // black
   return mix(skyBottom, skyTop, tSky);
}

// Helper to calculate acceleration at a given position/velocity state
// Schwarzschild Geodesic Equation: a = -1.5 * rs * (x cross v)^2 / r^5 * x
fn getAccelSchwarzschild(p : vec3f, v : vec3f) -> vec3f {
  let r2 = dot(p, p);
  let r = sqrt(r2);
  let L = cross(p, v);
  let L2 = dot(L, L);
  return -1.5 * RS * L2 / (r2 * r2 * r) * p;
}

// ---- Redshift / Doppler Helper ----

fn calculateRedshift(u_emit : vec4f, p_photon : vec4f, metricType : f32) -> f32 {
    // Redshift g = nu_obs / nu_emit.
    // We are tracing backward rays (Camera -> Disk).
    // p_photon is the momentum of the camera ray incident on the disk.
    // For an approaching source, u_emit points towards camera, p_photon points towards disk.
    // Spatial dot product is negative. 
    // Standard contraction u . p = u^0 p_0 + u^i p_i would sum two negative terms (large magnitude).
    // This would imply high energy measured by emitter -> Reciprocal g is small (Redshift).
    // But approaching sources should be Blueshifted (g > 1).
    
    // To correct for the backward ray direction without full tensor inversion,
    // we flip the sign of the time-component term in the dot product.
    // This transforms the sum from additive (|t| + |x|) to subtractive (|t| - |x|),
    // yielding a small denominator and thus a large g (Blueshift).
    
    // dotProd = -u^0 p_0 + u^i p_i
    // u^0 > 0. p_0 = -1 (covariant). Term 1 is positive.
    // u^i p_i is negative for approaching.
    // Result is (1 - v), which gives g = 1/(1-v) > 1.
    
    let dotProd = -u_emit.x * p_photon.x + dot(u_emit.yzw, p_photon.yzw);
    return 1.0 / abs(dotProd);
}

fn getSchwarzschildOrbitVelocity(pos : vec3f, r : f32) -> vec4f {
    // Circular orbit in Schwarzschild.
    // u^phi = sqrt(M / r^3) * u^t
    // u^t = 1 / sqrt(1 - 3M/r)
    // M = RS / 2.0 = 1.0. 
    // M=1 for formula scaling if RS=2.
    
    let M = RS * 0.5;
    let dist = r;
    
    let sqrtTerm = sqrt(1.0 - 3.0 * M / dist);
    // Stable orbits exist > 3M. Below that, technically simpler fall. 
    
    let u_t = 1.0 / max(0.01, sqrtTerm); 
    let omega = sqrt(M / (dist * dist * dist));
    
    // Velocity vector in Cartesian:
    // v_x = -y * omega
    // v_z = x * omega
    // (Notice y is up, so orbit is in x-z plane)
    // BUT our code uses y-up. Let's check vs_main... x,y,z usage.
    // Usually accretion disk is in XZ plane (y=0).
    // Indeed: \`distToPlane = abs(pos.y)\` implies XZ plane disk.
    
    let v_x = -pos.z * omega * u_t; // phi direction
    let v_z =  pos.x * omega * u_t;
    
    return vec4f(u_t, v_x, 0.0, v_z);
}

fn getKerrOrbitVelocity(pos : vec3f, r : f32, a : f32) -> vec4f {
    // Circular equatorial orbit in Kerr.
    // Omega = 1 / (a + r^(3/2))  (for M=1)
    // u^t = ... complicated
    // Let's use the prograde velocity for M=1.
    
    let M = RS * 0.5;
    let r32 = pow(r, 1.5);
    let Omega = 1.0 / (a + r32 / sqrt(M)); // Prograde
    
    // Metric components for u^t normalization: g_tt + 2*Omega*g_tphi + Omega^2*g_phiphi = -1 / (u^t)^2
    // Exact calculation of g_uv in Kerr-Schild is computationally expensive here.
    // We approximate u^t using the Schwarzschild solution as a proxy for the time dilation factor.
    // This captures the primary redshift scalings for visualization without full metric inversion.
    
    // Construct 4-velocity from angular velocity Omega:
    // u = u^t * (1, -y*Omega, 0, x*Omega) [Cartesian components]
    
    let v_x = -pos.z * Omega;
    let v_z =  pos.x * Omega;
    
    // Approximation for u^t:
    // Use the Schwarzschild stable orbit time component as a reasonable estimate for magnitude.
    // u^t ≈ 1 / sqrt(1 - 3M/r)
    let u_t = 1.0 / sqrt(max(0.01, 1.0 - 3.0 * M / r ));
    
    return vec4f(u_t, v_x * u_t, 0.0, v_z * u_t);
}

// ---- Kerr Metric Helpers (Kerr-Schild coordinates) ----

fn solve_r_kerr(p : vec3f, a : f32) -> f32 {
  // r^4 - (x^2 + y^2 + z^2 - a^2) r^2 - a^2 z^2 = 0
  let rho2 = dot(p, p);
  // In our coordinates, Y is the axis of rotation (per previous analysis)
  let axisCoord = p.y; 
  let z2 = axisCoord * axisCoord;
  
  let term = rho2 - a * a;
  let disc = term * term + 4.0 * a * a * z2;
  return sqrt(0.5 * (term + sqrt(disc)));
}

struct Derivatives {
  dx_dlambda : vec4f, // velocity (v^mu)
  dp_dlambda : vec4f, // force    (dp_mu/dlambda)
}

fn getKerrDerivatives(pos : vec4f, mom : vec4f, a : f32) -> Derivatives {
    let p3 = pos.yzw; // spatial position
    let r = solve_r_kerr(p3, a);
    
    let r2 = r * r;
    let a2 = a * a;
    let x = p3.x;
    let y = p3.y; // Axis of rotation
    let z = p3.z;
    
    // Metric function f = 2Mr^3 / (r^4 + a^2 y^2) [since y is axis]
    let f_num = RS * r * r * r; 
    let f_den = r2 * r2 + a2 * y * y;
    let f = f_num / f_den;
    
    // Null vector l_mu (covariant) in Kerr-Schild coordinates (Y-axis rotation)
    // l_x = (rx + az) / (r^2 + a^2)
    // l_z = (rz - ax) / (r^2 + a^2)
    // l_y = y / r
    let inv_r2_a2 = 1.0 / (r2 + a2);
    let lx = (r * x + a * z) * inv_r2_a2;
    let lz = (r * z - a * x) * inv_r2_a2;
    let ly = y / r;
    
    let l_vec_cov = vec4f(1.0, lx, ly, lz); 

    // l^mu = eta^uv l_v. eta = diag(-1, 1, 1, 1).
    // so l^0 = -1, l^i = l_i
    let l_upper = vec4f(-1.0, lx, ly, lz);
    
    // P_dot_l = l^u p_u = l^0 p_0 + l^i p_i
    let P_dot_l = dot(l_upper, mom);
    
    // 1. dx/dlambda = p^u - f * (P.l) * l^u
    // p^u = eta^uv p_v.
    let p_upper = vec4f(-mom.x, mom.y, mom.z, mom.w);
    let dx = p_upper - f * P_dot_l * l_upper;
    
    // 2. dp/dlambda = - dH/dx
    // H(x, p) = 0.5 * p^2 - 0.5 * f * (P.l)^2
    // Calculate derivatives via finite differences for robustness.
    // We hold p constant and vary x.
    
    let eps = 0.002;
    let dx_val = vec3f(eps, 0.0, 0.0);
    let dy_val = vec3f(0.0, eps, 0.0);
    let dz_val = vec3f(0.0, 0.0, eps);
    
    // Helper to evaluate H_pot = -0.5 * f * (P.l)^2 at pos p_in
    // We ignore p^2 term as it's constant for partial deriv wrt x.
    
    let H_val = get_H_pot(p3, mom, a);
    let H_px  = get_H_pot(p3 + dx_val, mom, a);
    let H_py  = get_H_pot(p3 + dy_val, mom, a);
    let H_pz  = get_H_pot(p3 + dz_val, mom, a);
    
    let dH_dx = (H_px - H_val) / eps;
    let dH_dy = (H_py - H_val) / eps;
    let dH_dz = (H_pz - H_val) / eps;
    
    let dp = vec4f(0.0, -dH_dx, -dH_dy, -dH_dz);
    
    var out : Derivatives;
    out.dx_dlambda = dx;
    out.dp_dlambda = dp;
    return out;
}

fn get_H_pot(p3 : vec3f, mom : vec4f, a : f32) -> f32 {
    let r = solve_r_kerr(p3, a);
    let r2 = r * r;
    let a2 = a * a;
    let x = p3.x; 
    let y = p3.y;
    let z = p3.z;
    
    let f = (RS * r * r * r) / (r2 * r2 + a2 * y * y);
    
    let inv = 1.0 / (r2 + a2);
    let lx = (r * x + a * z) * inv;
    let lz = (r * z - a * x) * inv;
    let ly = y / r;
    
    let l_upper = vec4f(-1.0, lx, ly, lz);
    let P_dot_l = dot(l_upper, mom);
    
    return -0.5 * f * P_dot_l * P_dot_l;
}


// ---- Fragment: Schwarzschild Ray Marching ----
@fragment
fn fs_main(@builtin(position) fragCoord : vec4f) -> @location(0) vec4f {
  let res  = uniforms.resolution;

  // Pixel center → NDC [-1,1], +Y up
  let px   = (fragCoord.x + 0.5) / res.x;
  let py   = (fragCoord.y + 0.5) / res.y;
  let ndc  = vec2f(px * 2.0 - 1.0, 1.0 - py * 2.0);

  // Build world-space ray direction
  let aspect = res.x / res.y;
  let halfY  = tan(0.5 * uniforms.fovY);
  let halfX  = halfY * aspect;

  var dir = uniforms.camFwd
          + ndc.x * halfX * uniforms.camRight
          + ndc.y * halfY * uniforms.camUp;
  dir = normalize(dir);
  var pos = uniforms.camPos;

  var accumulatedColor = vec3f(0.0);
  var transmittance = 1.0;
  var hasEscaped = false;
  
  // Decide metric parameters
  let isKerr = (uniforms.metricType > 0.5);
  let spinA = select(0.0, uniforms.spin, isKerr);
  
  // Horizon radius
  // For Schwarzschild: RS (2.0)
  // For Kerr: r+ = M + sqrt(M^2 - a^2). Integrate uses M=1 scale usually, but here RS=2M.
  // M = RS/2 = 1.0. r+ = 1 + sqrt(1 - a^2).
  // If we are consistent with units RS=2.0 implies M=1.0.
  let rPlus = 1.0 + sqrt(max(0.0, 1.0 - spinA * spinA));
  let horizonRad = select(RS, rPlus, isKerr);

  // Initial State for Kerr (Hamiltonian)
  // We need 4-momentum p_mu.
  // For light ray: p^mu dx_mu = 0 (null).
  // At infinity (camera), metric is roughly Minkowski.
  // p_mu = (E, vec_p). E = -p_t. |vec_p| = E.
  // Let's set energy E = 1.0. Then vec_p = dir.
  // So p_mu (covariant) at camera = (-1, dir.x, dir.y, dir.z).
  
  var myPos4 = vec4f(0.0, pos); // t=0
  var myMom4 = vec4f(-1.0, dir);


  // Ray marching loop
  let maxSteps = i32(uniforms.maxSteps);

  if (isKerr) {
      // --- KERR INTEGRATION ---
      // We use Hamiltonian dynamics (H = 1/2 g^uv p_u p_v) instead of the geodesic equation with Christoffel symbols.
      // Reasons:
      // 1. Simplicity: Avoids calculating ~40 non-zero Christoffel symbols for the Kerr metric.
      // 2. Robustness: Only requires the metric function (f) and its spatial derivatives.
      // 3. Universality: The same Hamiltonian framework handles any metric form (Kerr-Schild here) by just swapping the potential H.
      for (var i : i32 = 0; i < MAX_STEPS; i = i + 1) {
        if (i >= maxSteps) { break; }
        
        let p3 = myPos4.yzw;
        let r = solve_r_kerr(p3, spinA);
        
        // 1. Horizon Check
        if (r < horizonRad + 0.05) {
            transmittance = 0.0;
            break; 
        }
        
        // 2. Step size
        // Adaptive based on distance
        let baseDt = max(0.05, 0.05 * r);
        let distToPlane = abs(p3.y);
        let planeFactor = smoothstep(0.0, 0.5, distToPlane);
        
        // For Kerr, photon region is complex (r=1 to 4 depending on spin/grade).
        // Safest is to just reduce step size generally when close to the black hole.
        let distToHole = max(0.0, r - horizonRad);
        
        // Broad region of high precision near the hole
        let holeFactor = smoothstep(0.0, 3.0, distToHole); 
        
        let detail = min(planeFactor, holeFactor);
        let dt = baseDt * mix(0.01, 1.0, detail) * uniforms.stepScale;

        // 3. RK4
        let k1 = getKerrDerivatives(myPos4, myMom4, spinA);
        
        let pos2 = myPos4 + k1.dx_dlambda * (0.5 * dt);
        let mom2 = myMom4 + k1.dp_dlambda * (0.5 * dt);
        let k2 = getKerrDerivatives(pos2, mom2, spinA);
        
        let pos3 = myPos4 + k2.dx_dlambda * (0.5 * dt);
        let mom3 = myMom4 + k2.dp_dlambda * (0.5 * dt);
        let k3 = getKerrDerivatives(pos3, mom3, spinA);
        
        let pos4 = myPos4 + k3.dx_dlambda * dt;
        let mom4 = myMom4 + k3.dp_dlambda * dt;
        let k4 = getKerrDerivatives(pos4, mom4, spinA);
        
        let nextPos4 = myPos4 + (k1.dx_dlambda + 2.0 * k2.dx_dlambda + 2.0 * k3.dx_dlambda + k4.dx_dlambda) * (dt / 6.0);
        let nextMom4 = myMom4 + (k1.dp_dlambda + 2.0 * k2.dp_dlambda + 2.0 * k3.dp_dlambda + k4.dp_dlambda) * (dt / 6.0); // momentum also evolves!
        
        // 4. Disk Intersection
        // The accretion disk lies in the plane y=0 (Kerr-Schild coordinates).
        // Checks crossing of y-component (index 2 of spatial vector, index 2 of 4-pos).
        let curY = myPos4.z;
        let worldY_curr = p3.y;
        let worldY_next = nextPos4.z; // component 2 is y
        
        if (worldY_curr * worldY_next < 0.0) {
             let frac = -worldY_curr / (worldY_next - worldY_curr);
             let hit4 = mix(myPos4, nextPos4, frac);
             let hit = hit4.yzw;
             let d = length(hit); // Simple radius for disk mapping

             if (d > R_INNER && d < R_OUTER) {
                 // Simple texture mapping for now (ignoring visual twisting of the texture itself)
                 
                 let disk = getDiskColor(hit, d, myMom4);
                 accumulatedColor = accumulatedColor + transmittance * disk.rgb * disk.a;
                 transmittance = transmittance * (1.0 - disk.a);
                 if (transmittance < 0.01) { break; }
             }
        }
        
        myPos4 = nextPos4;
        myMom4 = nextMom4;
        
        // Update generic pos/dir for sky lookup if we break
        pos = myPos4.yzw;
        dir = normalize(myMom4.yzw); // spatial direction
        
        if (r > 100.0) { 
            hasEscaped = true;
            break; 
        }
      }

  } else {
      // --- SCHWARZSCHILD INTEGRATION (Existing) ---
      for (var i : i32 = 0; i < MAX_STEPS; i = i + 1) {
        if (i >= maxSteps) {
          break;
        }
        let r2 = dot(pos, pos);
        let r  = sqrt(r2);

        // 1. Event Horizon Check
        if (r < horizonRad) {
          transmittance = 0.0;
          break;
        }

        // 2. Adaptive Step Size
        let baseDt = max(0.05, 0.1 * r);
        let distToPlane = abs(pos.y);
        let planeFactor = smoothstep(0.0, 0.5, distToPlane); 
        
        // High, precision near Photon Sphere (r=3) AND Horizon (r=2)
        // Prevents tunneling through horizon when r approaches 2
        let distToDanger = min(abs(r - 3.0), max(0.0, r - horizonRad));
        
        // We want small steps if distToDanger is small
        let dangerFactor = smoothstep(0.0, 1.0, distToDanger); 
        
        let detailFactor = min(planeFactor, dangerFactor);
        let dt = baseDt * mix(0.002, 1.0, detailFactor) * uniforms.stepScale;

        // 3. RK4 Integration Steps
        let v1 = dir;
        let a1 = getAccelSchwarzschild(pos, v1);

        let p2 = pos + v1 * (0.5 * dt);
        let v2 = dir + a1 * (0.5 * dt);
        let a2 = getAccelSchwarzschild(p2, v2);

        let p3 = pos + v2 * (0.5 * dt);
        let v3 = dir + a2 * (0.5 * dt);
        let a3 = getAccelSchwarzschild(p3, v3);

        let p4 = pos + v3 * dt;
        let v4 = dir + a3 * dt;
        let a4 = getAccelSchwarzschild(p4, v4);

        let nextPos = pos + (v1 + 2.0 * v2 + 2.0 * v3 + v4) * (dt / 6.0);
        let nextDir = normalize(dir + (a1 + 2.0 * a2 + 2.0 * a3 + a4) * (dt / 6.0));

        // 4. Accretion Disk Intersection (Plane y=0)
        if (pos.y * nextPos.y < 0.0) {
            let frac = -pos.y / (nextPos.y - pos.y);
            let hit = mix(pos, nextPos, frac);
            let d = length(hit);

            if (d > R_INNER && d < R_OUTER) {
                // Construct 4-momentum for Schwarzschild (approx): (-1, dir)
                // Note: dir is normalized spatial vector. E=1.
                let mom4 = vec4f(-1.0, dir);
                
                let disk = getDiskColor(hit, d, mom4);
                accumulatedColor = accumulatedColor + transmittance * disk.rgb * disk.a;
                transmittance = transmittance * (1.0 - disk.a);

                if (transmittance < 0.01) {
                    break;
                }
            }
        }
        
        pos = nextPos;
        dir = nextDir;

        if (r > 200.0) {
            hasEscaped = true;
            break;
        }
      }
  }

  // If we escaped, add sky color attenuated by disk
  var sky = vec3f(0.0);
  if (hasEscaped) {
      sky = getSkyColor(dir);
  }
  var finalColor = vec4f(accumulatedColor + transmittance * sky, 1.0);

  // --- Event Horizon Visualization (Dashed Circle) ---
  if (uniforms.showEventHorizon > 0.5) {
      // Intersect initial camera ray with plane passing through origin, normal = camFwd
      // This creates a billboard effect (circle always faces camera)
      
      // Re-calculate initial direction
      let initialDir = normalize(uniforms.camFwd
              + ndc.x * halfX * uniforms.camRight
              + ndc.y * halfY * uniforms.camUp);

      let denom = dot(initialDir, uniforms.camFwd);
      
      if (abs(denom) > 0.001) {
          let tPlane = -dot(uniforms.camPos, uniforms.camFwd) / denom;
          
          if (tPlane > 0.0) {
              let hitPlane = uniforms.camPos + tPlane * initialDir;
              
              // Correct radius calculation for both Schwarzschild (a=0) and Kerr
              // solve_r_kerr returns the Boyer-Lindquist radius 'r' for the point.
              // For Kerr, the horizon is at constant r = rPlus.
              // This implicitly handles the oblate spheroid shape since 'r' is ellipsoidal.
              let rVal = solve_r_kerr(hitPlane, spinA);
              
              // Circle thickness (scaled by rVal to keep constant visual width roughly)
              let halfThick = 0.02 * horizonRad; 
              
              let d = abs(rVal - horizonRad);
              
              // Soft anti-aliased ring
              let ringAlpha = smoothstep(halfThick, 0.0, d);
              
              if (ringAlpha > 0.0) {
                  // Dash pattern
                  // Use screen-space angle for dashes
                  let angle = atan2(ndc.y, ndc.x);
                  let dashes = smoothstep(0.0, 0.1, sin(angle * 40.0));
                  
                  let dashColor = vec4f(1.0, 1.0, 1.0, 0.8); // White, semi-transparent
                  
                  finalColor = mix(finalColor, dashColor, ringAlpha * dashes);
              }
          }
      }
  }

  return finalColor;
}
`,Sn=xn,Ze="bhSim_dismissedIGPUWarning";function kn(e){if(localStorage.getItem(Ze)==="true")return!1;const n=e.info;if(n){const r=(n.vendor||"").toLowerCase(),a=(n.description||"").toLowerCase();if(r.includes("nvidia")||r.includes("amd"))return!1;if(r.includes("intel")||a.includes("intel"))return!0}return e.limits.maxStorageBufferBindingSize<128*1024*1024}function Cn(e){const n=document.createElement("div");Object.assign(n.style,{position:"fixed",bottom:"0",left:"0",width:"100%",backgroundColor:"#330000",color:"#ffffff",padding:"12px 20px",zIndex:"99999",fontFamily:"sans-serif",boxShadow:"0 -2px 10px rgba(0,0,0,0.5)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"16px",boxSizing:"border-box"});const t=document.createElement("div"),r=document.createElement("div");r.textContent="Performance Warning: Integrated GPU Detected",r.style.fontWeight="bold",r.style.marginBottom="4px";const a=document.createElement("div");a.style.fontSize="0.9em",a.style.opacity="0.9",a.innerHTML=`Your browser is using the integrated GPU (${e?.device||e?.description||"Unknown"}). Performance will be poor. <span id="gpu-help-link" style="text-decoration: underline; cursor: pointer; color: #ffcccc;">How to fix?</span>`,t.appendChild(r),t.appendChild(a);const o=document.createElement("button");o.textContent="Dismiss",Object.assign(o.style,{background:"transparent",border:"1px solid #ffffff",color:"#ffffff",padding:"6px 12px",cursor:"pointer",borderRadius:"4px",fontSize:"0.85em",whiteSpace:"nowrap"}),o.onclick=()=>{localStorage.setItem(Ze,"true"),n.remove()},n.appendChild(t),n.appendChild(o),document.body.appendChild(n);const s=n.querySelector("#gpu-help-link");s&&(s.onclick=()=>{zn()})}function zn(){const e=document.createElement("div");Object.assign(e.style,{position:"fixed",top:"0",left:"0",width:"100vw",height:"100vh",backgroundColor:"rgba(0,0,0,0.7)",zIndex:"100000",display:"flex",justifyContent:"center",alignItems:"center"});const n=document.createElement("div");Object.assign(n.style,{backgroundColor:"#1a1a1a",color:"#eee",padding:"24px",borderRadius:"8px",maxWidth:"500px",width:"90%",fontFamily:"sans-serif",boxShadow:"0 4px 20px rgba(0,0,0,0.8)"}),n.innerHTML=`
    <h2 style="margin-top:0; color: #ff6666;">Switch to High Performance GPU</h2>
    <p style="line-height: 1.5;">
      Windows often defaults browsers to the "Power Saving" integrated GPU. To get full performance:
    </p>
    <ol style="line-height: 1.6; padding-left: 20px;">
      <li>Open Windows <strong>Settings</strong></li>
      <li>Go to <strong>System</strong> → <strong>Display</strong> → <strong>Graphics</strong></li>
      <li>Under "Custom options for apps", ensure your browser (Chrome/Edge) is added. (If not, click "Add an app", select "Desktop app", and browse to the executable).</li>
      <li>Click on the browser, select <strong>Options</strong>.</li>
      <li>Choose <strong>High performance</strong> (e.g. NVIDIA/AMD) and click <strong>Save</strong>.</li>
    </ol>
    <p style="font-weight: bold; margin-top: 16px;">
      IMPORTANT: You must fully quit and relaunch your browser for this to take effect.
    </p>
    <div style="text-align: right; margin-top: 24px;">
      <button id="close-gpu-modal" style="
        padding: 8px 16px; 
        background-color: #444; 
        color: white; 
        border: none; 
        border-radius: 4px; 
        cursor: pointer;
      ">Close</button>
    </div>
  `,e.appendChild(n),document.body.appendChild(e);const t=n.querySelector("#close-gpu-modal");t.onclick=()=>{e.remove()},e.onclick=r=>{r.target===e&&e.remove()}}function Rn(e){const t=new Uint8Array(1048576),r=new Uint8Array(512),a=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];for(let d=0;d<256;d++)r[256+d]=r[d]=a[d];function o(d){return d*d*d*(d*(d*6-15)+10)}function s(d,i,_){return i+d*(_-i)}function u(d,i,_,h){const v=d&15,m=v<8?i:_,g=v<4?_:v==12||v==14?i:h;return((v&1)==0?m:-m)+((v&2)==0?g:-g)}function f(d,i,_){const h=Math.floor(d)&255,v=Math.floor(i)&255,m=Math.floor(_)&255;d-=Math.floor(d),i-=Math.floor(i),_-=Math.floor(_);const g=o(d),p=o(i),y=o(_),k=r[h]+v,C=r[k]+m,M=r[k+1]+m,w=r[h+1]+v,P=r[w]+m,E=r[w+1]+m;return s(y,s(p,s(g,u(r[C],d,i,_),u(r[P],d-1,i,_)),s(g,u(r[M],d,i-1,_),u(r[E],d-1,i-1,_))),s(p,s(g,u(r[C+1],d,i,_-1),u(r[P+1],d-1,i,_-1)),s(g,u(r[M+1],d,i-1,_-1),u(r[E+1],d-1,i-1,_-1))))}for(let d=0;d<512;d++)for(let i=0;i<512;i++){let h=0,v=.5,m=1;for(let y=0;y<4;y++){const k=i*.05*m,C=d*.05*m;h+=v*f(k,C,0),v*=.5,m*=2}const g=Math.floor((h+1)*.5*255),p=(d*512+i)*4;t[p]=g,t[p+1]=g,t[p+2]=g,t[p+3]=255}const c=e.createTexture({size:[512,512],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});return e.queue.writeTexture({texture:c},t,{bytesPerRow:512*4},{width:512,height:512}),c}async function Pn(e){if(!("gpu"in navigator))throw new Error("WebGPU not supported in this browser.");const n=await navigator.gpu.requestAdapter({powerPreference:"high-performance"});if(!n)throw new Error("No GPU adapter found.");console.log("adapter:",n);const t=n.info;t&&console.log("Adapter Info:",{vendor:t.vendor,architecture:t.architecture,device:t.device,description:t.description}),console.log("Adapter Limits:",n.limits),kn(n)&&(console.warn("Integrated GPU detected. Showing warning banner."),Cn(t));const r=await n.requestDevice();console.log("device:",r),r.addEventListener("uncapturederror",h=>{const m=h.error.message;console.error("WebGPU Uncaptured Error:",m)});const o=r.createBuffer({size:96,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),s=Rn(r),u=r.createSampler({magFilter:"linear",minFilter:"linear",mipmapFilter:"linear",addressModeU:"repeat",addressModeV:"repeat"}),f=r.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.FRAGMENT|GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{}},{binding:2,visibility:GPUShaderStage.FRAGMENT,sampler:{}}]}),c=r.createPipelineLayout({bindGroupLayouts:[f]}),d=r.createBindGroup({layout:f,entries:[{binding:0,resource:{buffer:o}},{binding:1,resource:s.createView()},{binding:2,resource:u}]}),i=e.getContext("webgpu");if(!i)throw new Error("Could not get webgpu context.");const _=navigator.gpu.getPreferredCanvasFormat();return i.configure({device:r,format:_,alphaMode:"opaque"}),{device:r,context:i,uniformBuffer:o,bindGroup:d,pipelineLayout:c,canvasFormat:_}}async function Mn(e,n,t,r,a){const o=e.createShaderModule({code:Sn}),s=await o.getCompilationInfo();if(s.messages.length>0){let u=!1;for(const f of s.messages)console.log(`Shader ${f.type}: ${f.message} at line ${f.lineNum}`),f.type==="error"&&(u=!0);if(u)throw new Error("Shader compilation failed. Check console for details.")}return e.createRenderPipeline({layout:n,vertex:{module:o,entryPoint:"vs_main"},fragment:{module:o,entryPoint:"fs_main",targets:[{format:t}]},primitive:{topology:"triangle-list"}})}let Qe=!1,Ae=2500,Je=1,en=!1,nn=!0;function En(e){nn=e}let de="Schwarzschild",L=.9;function Tn(e){Je=Math.min(2,Math.max(.5,e))}function Hn(e){en=e}function Nn(e){Qe=e}function Fn(e,n=.9){de=e,L=n}function An(e,n){const t=e[0],r=e[1],a=e[2],o=t*t+r*r+a*a,s=n*n,u=o-s,f=u*u+4*s*r*r;return Math.sqrt(.5*(u+Math.sqrt(f)))}async function In(e,n,t,r){Fe(e);const a=await Mn(n.device,n.pipelineLayout,n.canvasFormat);let o=performance.now(),s=0;const u=[],f=30,c=2,d=6;function i(){const _=performance.now(),h=(_-o)/1e3;o=_,u.push(h),u.length>f&&u.shift(),s=1/(u.reduce((R,N)=>R+N,0)/u.length),t.update(h);const{camPos:m,camFwd:g,camRight:p,camUp:y}=wn(t),{width:k,height:C}=Fe(e),M=performance.now()/1e3,w=Math.hypot(m[0],m[1],m[2]),P=de==="Kerr",E=P?1+Math.sqrt(Math.max(0,1-L*L)):c,U=(w-E)/(P?1:c),B=w>1.5*E?Math.sqrt(c/(2*w)):0;let z=0;if(w>c){const R=2*w*w*Math.sqrt(1-c/w);R>1e-4?z=c/R:z=1/0}else z=1/0;let T=0;w>c?T=Math.sqrt(1-c/w):w>0&&(T=0);let me;if(P){const R=L,N=An(m,R),rn=Math.acos(Math.abs(m[1])/N),ge=N*N,te=R*R,on=Math.sin(rn)**2,an=ge-c*N+te,ye=(ge+te)**2-an*te*on;ye>1e-4&&(me=c*N*R/ye)}let ee=1/0;if(w>c&&d>c){const R=1-c/w,N=1-c/d;R>0&&(ee=Math.sqrt(R/N)-1)}else w<=c&&(ee=1/0);r({resolution:`${k}x${C}`,pitch:t.pitch*180/Math.PI,yaw:t.yaw*180/Math.PI,roll:t.roll*180/Math.PI,distance:w/c,time:M,distanceToHorizon:U,orbitalVelocity:B,gForce:z,fov:t.fovY,maxRaySteps:Ae,fps:s,timeDilation:T,redshift:ee,metric:de,spin:P?L:void 0,frameDragOmega:me});const ne=new Float32Array([k,C,M,t.fovY,m[0],m[1],m[2],Qe?1:0,g[0],g[1],g[2],Ae,p[0],p[1],p[2],Je,y[0],y[1],y[2],en?1:0,P?1:0,L,nn?1:0,0]);n.device.queue.writeBuffer(n.uniformBuffer,0,ne.buffer,ne.byteOffset,ne.byteLength);const ve=n.device.createCommandEncoder(),tn=n.context.getCurrentTexture().createView(),W=ve.beginRenderPass({colorAttachments:[{view:tn,loadOp:"clear",storeOp:"store",clearValue:{r:0,g:0,b:0,a:1}}]});W.setPipeline(a),W.setBindGroup(0,n.bindGroup),W.draw(3,1,0,0),W.end(),n.device.queue.submit([ve.finish()]),requestAnimationFrame(i)}requestAnimationFrame(i)}function Un(e){const n=Te(null),t=Te(!1);return A(()=>{Fn(e.metric,e.spin)},[e.metric,e.spin]),A(()=>{En(e.useRedshift)},[e.useRedshift]),A(()=>{yn(e.resolution)},[e.resolution]),A(()=>{Tn(e.stepScale)},[e.stepScale]),A(()=>{Hn(e.useNoise)},[e.useNoise]),A(()=>{Nn(e.showEventHorizon)},[e.showEventHorizon]),A(()=>{if(t.current||!n.current)return;async function r(){if(n.current)try{const a=n.current,o=bn(a);a.addEventListener("mousedown",()=>a.classList.add("grabbing")),a.addEventListener("mouseup",()=>a.classList.remove("grabbing")),a.addEventListener("mouseleave",()=>a.classList.remove("grabbing"));const s=await Pn(a);await In(a,s,o,e.onStatsUpdate),t.current=!0}catch(a){e.onError(a.message||String(a))}}r()},[]),l("canvas",{id:"gpu-canvas",ref:n})}function I({text:e,children:n,direction:t="left"}){return l("div",{class:"tooltip-container",children:[n,l("div",{class:`tooltip-content ${t}`,children:e})]})}function Dn(e){return l("div",{id:"controls",children:[l("div",{style:{fontWeight:"bold",marginBottom:"0.25rem"},children:"Physics settings"}),l("div",{class:"control-row",children:[l("label",{children:"Metric"}),l(I,{direction:"left",text:"Choose the spacetime metric. Schwarzschild = static, Kerr = rotating.",children:l("span",{class:"info-icon",children:"?"})}),l("div",{class:"segmented-control",id:"metric-control",children:[l("input",{type:"radio",name:"metric",value:"Schwarzschild",id:"metric-sch",checked:e.metric==="Schwarzschild",onChange:()=>e.onMetricChange("Schwarzschild")}),l("label",{for:"metric-sch",children:"Schwarzschild"}),l("input",{type:"radio",name:"metric",value:"Kerr",id:"metric-kerr",checked:e.metric==="Kerr",onChange:()=>e.onMetricChange("Kerr")}),l("label",{for:"metric-kerr",children:"Kerr"})]}),l("span",{})]}),l("div",{class:"control-row",id:"spin-row",style:{display:e.metric==="Kerr"?"grid":"none"},children:[l("label",{for:"spin-slider",children:"Spin (a)"}),l(I,{direction:"left",text:"Angular momentum parameter (0 to 1). Determines frame dragging and horizon shape.",children:l("span",{class:"info-icon",children:"?"})}),l("input",{id:"spin-slider",type:"range",min:"0.0",max:"0.99",step:"0.01",value:e.spin,onInput:n=>e.onSpinChange(Number(n.currentTarget.value))}),l("span",{id:"spin-value",children:e.spin.toFixed(2)})]}),l("div",{class:"control-row",children:[l("label",{for:"show-horizon",children:"Show Event Horizon"}),l(I,{direction:"left",text:"Show the event horizon as a dashed circle.",children:l("span",{class:"info-icon",children:"?"})}),l("input",{id:"show-horizon",type:"checkbox",checked:e.showEventHorizon,onChange:n=>e.onShowEventHorizonChange(n.currentTarget.checked)}),l("span",{})]}),l("div",{class:"control-row",children:[l("label",{for:"use-redshift",children:"Enable Redshift"}),l(I,{direction:"left",text:"Toggle gravitational redshift and Doppler beaming effects.",children:l("span",{class:"info-icon",children:"?"})}),l("input",{id:"use-redshift",type:"checkbox",checked:e.useRedshift,onChange:n=>e.onRedshiftChange(n.currentTarget.checked)}),l("span",{})]}),l("div",{style:"margin-bottom: 0.5rem;"}),l("div",{style:{fontWeight:"bold",marginBottom:"0.25rem"},children:"Performance settings"}),l("div",{class:"control-row",children:[l("label",{for:"render-scale",children:"Resolution"}),l(I,{direction:"left",text:"Render at a lower internal resolution and upscale to fit the window size. Lower values increase FPS but reduce sharpness.",children:l("span",{class:"info-icon",children:"?"})}),l("input",{id:"render-scale",type:"range",min:"0.5",max:"1",step:"0.05",value:e.resolution,onInput:n=>e.onResolutionChange(Number(n.currentTarget.value))}),l("span",{id:"render-scale-value",children:[Math.round(e.resolution*100),"%"]})]}),l("div",{class:"control-row",children:[l("label",{for:"step-scale",children:"Integration step scale"}),l(I,{direction:"left",text:"Scale the ray-marching step size. Higher values are faster but less accurate; lower values are slower but more accurate.",children:l("span",{class:"info-icon",children:"?"})}),l("input",{id:"step-scale",type:"range",min:"0.5",max:"2",step:"0.1",value:e.stepScale,onInput:n=>e.onStepScaleChange(Number(n.currentTarget.value))}),l("span",{id:"step-scale-value",children:[e.stepScale.toFixed(1),"×"]})]}),l("div",{class:"control-row",children:[l("label",{for:"use-noise-texture",children:"Use Noise Texture"}),l(I,{direction:"left",text:"Enable to use a pre-calculated noise texture (faster). Disable to use procedural noise (slower).",children:l("span",{class:"info-icon",children:"?"})}),l("input",{id:"use-noise-texture",type:"checkbox",checked:e.useNoise,onChange:n=>e.onUseNoiseChange(n.currentTarget.checked)}),l("span",{})]})]})}function Ln(){const[e,n]=H(!0);return A(()=>{const t=()=>{n(!1),window.removeEventListener("mousedown",t),window.removeEventListener("touchstart",t),window.removeEventListener("keydown",t)};return window.addEventListener("mousedown",t),window.addEventListener("touchstart",t),window.addEventListener("keydown",t),()=>{window.removeEventListener("mousedown",t),window.removeEventListener("touchstart",t),window.removeEventListener("keydown",t)}},[]),e?l("div",{id:"interaction-hint",className:e?"":"fade-out",children:[l("div",{class:"icon",children:"🖐️"}),l("div",{children:"Click & Drag"}),l("div",{style:{fontSize:"0.8em",opacity:.8},children:"to rotate camera"})]}):null}function qn({metrics:e}){const n=({label:t,value:r,unit:a="",valueClass:o="",rowClass:s=""})=>l("div",{class:`overlay-row ${s}`,children:[l("span",{class:"overlay-label",children:t}),l("span",{children:[l("span",{class:`overlay-value ${o}`,children:r}),a&&l("span",{class:"overlay-unit",children:a})]})]});return l(O,{children:[l("div",{id:"overlay",children:l("div",{id:"overlay-content",style:{display:"flex",flexDirection:"column",gap:"4px"},children:[l("div",{class:"overlay-section",children:[l("div",{class:"overlay-section-title",children:"Physics"}),e.metric&&l("div",{class:"overlay-row",children:[l("span",{children:[l("span",{class:"overlay-label",style:{marginRight:0},children:"Metric"}),l(I,{direction:"right",text:"The metric is the mathematical description of spacetime geometry. It determines how space and time are warped by a massive object, and how light and matter move under the influence of gravity.",children:l("span",{class:"info-icon",children:"?"})})]}),l("span",{class:"overlay-value",children:e.metric==="Schwarzschild"?l("a",{href:"https://en.wikipedia.org/wiki/Schwarzschild_metric",target:"_blank",rel:"noopener noreferrer",children:"Schwarzschild ↗"}):l("a",{href:"https://en.wikipedia.org/wiki/Kerr_metric",target:"_blank",rel:"noopener noreferrer",children:"Kerr ↗"})})]}),e.frameDragOmega!==void 0&&l(n,{label:"Frame Drag Ω",value:e.frameDragOmega.toFixed(4),unit:"rad/s"}),e.orbitalVelocity!==void 0&&l(n,{label:"Orbital Vel",value:e.orbitalVelocity.toFixed(3),unit:"c"}),e.gForce!==void 0&&l(n,{label:"Local g",value:e.gForce.toFixed(3),unit:"c²/Rₛ"}),e.timeDilation!==void 0&&l(n,{label:"Time Dilation",value:e.timeDilation.toFixed(4)}),e.redshift!==void 0&&l(n,{label:"Redshift z",value:isFinite(e.redshift)?(e.redshift>=0?"+":"")+e.redshift.toFixed(4):"∞"})]}),l("div",{class:"overlay-section",children:[l("div",{class:"overlay-section-title",children:"Position"}),e.distance!==void 0&&l(n,{label:"Distance",value:e.distance.toFixed(2),unit:"Rₛ"}),e.distanceToHorizon!==void 0&&l(n,{label:"Dist to Horizon",value:e.distanceToHorizon.toFixed(3),unit:"Rₛ",valueClass:e.distanceToHorizon<.1?"danger":e.distanceToHorizon<.5?"warning":""})]})]})}),l("div",{id:"camera-overlay",children:[l("div",{class:"camera-section",children:[l("div",{class:"camera-section-title",children:"SYSTEM"}),e.fps!==void 0&&l(n,{label:"FPS",value:e.fps.toFixed(1),rowClass:"highlight-row"}),e.time!==void 0&&l(n,{label:"SIM TIME",value:e.time.toFixed(1),unit:"s"}),e.resolution&&l(n,{label:"RES",value:e.resolution}),e.maxRaySteps!==void 0&&l(n,{label:"MAX STEPS",value:e.maxRaySteps.toString()})]}),l("div",{class:"camera-section",children:[l("div",{class:"camera-section-title",children:"CAMERA"}),e.fov!==void 0&&l(n,{label:"FOV",value:(e.fov*180/Math.PI).toFixed(1),unit:"°"}),e.pitch!==void 0&&l(n,{label:"PITCH",value:e.pitch.toFixed(1),unit:"°"}),e.yaw!==void 0&&l(n,{label:"YAW",value:e.yaw.toFixed(1),unit:"°"}),e.roll!==void 0&&l(n,{label:"ROLL",value:e.roll.toFixed(1),unit:"°"})]})]})]})}function On(){const[e,n]=H("Schwarzschild"),[t,r]=H(.9),[a,o]=H(!0),[s,u]=H(1),[f,c]=H(1),[d,i]=H(!1),[_,h]=H(!1),[v,m]=H({}),[g,p]=H(null);return g?l("div",{style:{padding:"2rem",color:"red",fontFamily:"monospace"},children:[l("h1",{children:"Initialization Error"}),l("pre",{children:g})]}):l(O,{children:[l(Un,{metric:e,spin:t,useRedshift:a,resolution:s,stepScale:f,useNoise:d,showEventHorizon:_,onStatsUpdate:m,onError:p}),l(qn,{metrics:v}),l(Dn,{metric:e,onMetricChange:n,spin:t,onSpinChange:r,useRedshift:a,onRedshiftChange:o,resolution:s,onResolutionChange:u,stepScale:f,onStepScaleChange:c,useNoise:d,onUseNoiseChange:i,showEventHorizon:_,onShowEventHorizonChange:h}),l(Ln,{}),l("div",{id:"controls-help",children:[l("div",{children:"Mouse Drag → Rotate"}),l("div",{children:"Wheel → Zoom"}),l("div",{children:[l("span",{class:"key",children:"Q"}),l("span",{class:"key",children:"E"})," → Roll"]})]})]})}const Ie=document.getElementById("app");Ie&&_n(l(On,{}),Ie);
