(async () => {
  const user = await requireAuth(); // login check, otherwise redirect to login page
  
  document.getElementById(i18nCurrentLang()).classList.remove('not-selected');

  try {
    const stats = await api('/stats');
    const since = stats.since ? new Date(Date.parse(stats.since)).toLocaleDateString(i18nCurrentLang() === 'fr' ? 'fr-FR' : 'en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) : 'N/A';
    const partnerText = stats.partner || t("settings.no_partner");

    document.getElementById('stats').innerHTML = `
      <p>${t("stats.sent")} : <b>${stats.sent}</b></p>
      <p>${t("stats.received")} : <b>${stats.received}</b></p>
      <p>${t("stats.relation", { partner: partnerText, since })}</p>
    ` + document.getElementById('stats').innerHTML;
    document.getElementById('stats').classList.add('loaded');
  } catch (e) {
    document.getElementById('stats').innerText = t("error." + e.message) || t("error.UNKNOWN");
  }

  document.getElementById('changePasswordBtn').addEventListener('click', (e) => {
      e.preventDefault();
      changePassword();
  });
})();

async function changePassword() {
  const message = document.querySelector('#changePasswordForm .message');
  const oldPassword = document.getElementById('oldPassword').value;
  const newPassword = document.getElementById('newPassword').value;

  if (!oldPassword || !newPassword) {
    alert(t("settings.required_fields"));
    return;
  }

  try {
    const res = await api('/auth/change-password', {
      method: 'POST',
      body: { oldPassword, newPassword }
    });
    if (res.success) {
      message.textContent = t("settings.password_success");
      message.classList.add('visible');
      message.classList.add('success');
    }
  } catch (e) {
    message.textContent = t("error." + e.message) || t("error.UNKNOWN");
    message.classList.remove('success');
    message.classList.add('visible');
    message.classList.remove('shake');
    void message.offsetWidth;
    message.classList.add('shake');
  }
}
