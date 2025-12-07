document.addEventListener('DOMContentLoaded', async () => {
    const loginSwitch = document.getElementById('loginSwitch');
    const registerSwitch = document.getElementById('registerSwitch');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');

    loginSwitch.addEventListener('click', () => {
        registerSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
    });
    loginSwitch.addEventListener("keydown", e => {
        if(e.key === "Enter" || e.key === " ") {
            registerSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
        }
    });

    registerSwitch.addEventListener('click', () => {
        registerSection.classList.remove('hidden');
        loginSection.classList.add('hidden');
    });
    registerSwitch.addEventListener("keydown", e => {
        if(e.key === "Enter" || e.key === " ") {
            registerSection.classList.remove('hidden');
            loginSection.classList.add('hidden');
        }
    });
});
