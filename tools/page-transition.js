function goWithTransition(page,bg_type,over_exception) {
    var transition_bg=document.getElementById("transition-bg");
    if(over_exception===true) {
        transition_bg.style.zIndex="102";
    }
    if(bg_type===0) { // same bg, bg1 to bg1
        transition_bg.setAttribute("active-bg0","true");
    } else if(bg_type===1) { // same bg, bg2 to bg2
        transition_bg.setAttribute("active-bg1","true");
    } else if(bg_type===2) { // diff bg, bg1 to bg2
        transition_bg.setAttribute("active-bg2","true");
    } else if(bg_type===3) { // diff bg, bg2 to bg1
        transition_bg.setAttribute("active-bg3","true");
    }
    document.body.className="transition";
    setTimeout(() => {
        location.href=page;
    }, 1000);
}

function submitWithTransition() {
    var forms=document.querySelectorAll("form");
    var transition_bg=document.getElementById("transition-bg");
    forms.forEach(form => {
        let submit_btn=form.querySelector("input[type='submit']");
        if(submit_btn) {
            submit_btn.addEventListener("click",(e) => {
                e.preventDefault();
                let password=form.querySelector("#password");
                let confirm_password=form.querySelector("#confirm_password");
                let inputs=form.querySelectorAll("input");
                let not_filled_flag=false;
                [...inputs].every(input => {
                    if(input.value==="") {
                        input.setCustomValidity("Veuillez remplir tous les champs");
                        input.reportValidity();
                        not_filled_flag=true;
                        return false;
                    }
                    return true;
                });
                if(!not_filled_flag) {
                    if(password && confirm_password) {
                        if(password.value===confirm_password.value) {
                            transition_bg.setAttribute("active-bg1","true");
                            document.body.className="transition";
                            setTimeout(() => {
                                form.submit();
                            }, 500);
                        } else {
                            confirm_password.setCustomValidity("Les mots de passe sont différents");
                            confirm_password.reportValidity();
                        }
                    } else {
                        transition_bg.setAttribute("active-bg1","true");
                        document.body.className="transition";
                        setTimeout(() => {
                            form.submit();
                        }, 500);
                    }
                }
            });
        }
    });
}
// submitWithTransition();