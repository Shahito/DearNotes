(async () => {
  const user = await requireAuth();

  try {
    const stats = await api('/stats');
    const since = stats.since ? new Date(Date.parse(stats.since)).toLocaleDateString('fr-FR') : 'N/A';
    const partnerText = stats.partner || 'personne pour l\'instant';

    document.getElementById('stats').innerHTML = `
      <p>Notes envoyées : <b>${stats.sent}</b></p>
      <p>Notes reçues : <b>${stats.received}</b></p>
      <p>En relation avec <b>${partnerText}</b> depuis le <b>${since}</b></p>
    `;
    document.getElementById('stats').classList.add('loaded');
  } catch (e) {
    document.getElementById('stats').innerText = e.message;
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
    alert('Tous les champs sont obligatoires');
    return;
  }

  try {
    const res = await api('/auth/change-password', {
      method: 'POST',
      body: { oldPassword, newPassword }
    });
    if (res.success) {
      message.textContent = "Mot de passe changé avec succès";
      message.classList.add('visible');
      message.classList.add('success');
    }
  } catch (e) {
    message.textContent = e.message;
    message.textContent = e.message;
    message.classList.remove('success');
    message.classList.add('visible');
    message.classList.remove('shake');
    void message.offsetWidth;
    message.classList.add('shake');
  }
}
