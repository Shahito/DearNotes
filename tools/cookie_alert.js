function show_cookie_alert() {
    if((document.cookie.match(/^(?:.*;)?\s*COOKIE_CONSENT\s*=\s*([^;]+)(?:.*)?$/)||[,null])[1]!='true') {
        // display cookie alert div
        alert_div=`
        <div class="cookie-alert">
            Ce site utilise des cookies essentiels à la rétention des préférences.
            <button onClick="cookie_validate()">Ok</button>
        </div>`;
        container=document.querySelector("main#login-section");
        container.innerHTML=container.innerHTML+alert_div;
    }
}
function cookie_validate() {
    let cookie_date=new Date();
    cookie_date.setFullYear(cookie_date.getFullYear()+1);
    document.cookie=`COOKIE_CONSENT=true; expires=${cookie_date.toGMTString()};`;
    document.querySelector("div.cookie-alert").setAttribute("hide","true");
}
show_cookie_alert();