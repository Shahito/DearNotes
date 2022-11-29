function verify_password(form_id,password_id,confirm_password_id) {
    // recup les forms
    var form=document.querySelector("form#"+form_id);
    var warning_field=form.querySelector("div.warning-field");
    var password=form.querySelector("input#"+password_id);
    var confirm_password=form.querySelector("input#"+confirm_password_id);
    var btn=form.querySelector("input[type='submit']");
    form.addEventListener("keydown",(e) => { (e.key==="Enter")?e.preventDefault():null; });
    form.addEventListener("keyup",(e) => {
        // désactiver le bouton submit avec attr
        btn.setAttribute("invisible","");
        // verif que password soit du bon pattern / longeur
        // verif s'il y a un champ confirm password
        if(verify_password_complexity(password.value,warning_field)) {
            password.removeAttribute("invalid");
            if(!confirm_password) {
            // réactiver le bouton submit avec attr
                btn.removeAttribute("invisible");
                if(e.key==="Enter") { form.submit(); }
                return true;
            } else if(verify_confirm_password(password.value,confirm_password.value)) {
                // réactiver le bouton submit avec attr
                confirm_password.removeAttribute("invalid");
                btn.removeAttribute("invisible");
                if(e.key==="Enter") { form.submit(); }
                return true;
            } else {
                confirm_password.setAttribute("invalid","");
                return true;
            }
        }
        password.setAttribute("invalid","");
    });
}

function verify_password_complexity(password,warning_field) {
    const lower=/[a-z*]/;
    const upper=/[A-Z*]/;
    const num=/[0-9*]/;
    const isLower=lower.test(password);
    const isUpper=upper.test(password);
    const isNum=num.test(password);
    if(warning_field) {
        switch (false) {
            case isLower:
                warning_field.textContent="Le mot de passe doit contenir au moins  une minuscule";
                break;
            case isUpper:
                warning_field.textContent="Le mot de passe doit contenir au moins  une majuscule";
                break;
            case isNum:
                warning_field.textContent="Le mot de passe doit contenir au moins un chiffre";
                break;
            case password.length>=8:
                warning_field.textContent="Le mot de passe doit contenir au moins 8 caractères";
                break;
            default:
                warning_field.textContent="";
        }
    } 
    return isLower && isUpper && isNum && password.length>=8;
}
function verify_confirm_password(password,confirm_password) {
    if(password) {
        if(password===confirm_password) {
            return true;
        }
    }
    return false;
}