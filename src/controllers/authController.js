const { register, login, changePassword } = require('../services/authService');
const { sanitizeDisplayName } = require("../utils/username");

async function registerController(req, res) {
  try {
    const { username, password } = req.body;
    const displayUsername = sanitizeDisplayName(username);
    
    if (!displayUsername || !password)
      return res.status(400).json({ error: "Champs manquants" })
    if (displayUsername.length < 3 || displayUsername.length > 24)
      return res.status(400).json({ error: "Le nom d'utilisateur doit faire entre 3 à 24 caractères" })

    const user = await register(displayUsername, password)
    res.json({ success: true })
  } catch (e) {
    res.status(409).json({ error: e.message })
  }
}

async function loginController(req, res) {
  try {
    const { username, password } = req.body
    if (!username || !password)
      return res.status(400).json({ error: "Champs manquants" })

    const { user, token } = await login(username, password)
    
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'Lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,  // 30j
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      path: '/'
    });

    res.json({ success:true })
  } catch(e) {
    await new Promise(r => setTimeout(r, 200)); // anti brute-force minimal
    res.status(401).json({ error:e.message })
  }
}

async function meController(req, res) {
  const { password, ...safe } = req.user;
  res.json({ user: safe });
}

async function changePasswordController(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Champs manquants' });
    }
    await changePassword(req.user.id, oldPassword, newPassword);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
}

async function logoutController(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false
  });
  res.json({ success: true });
}

module.exports = { registerController, loginController, meController, changePasswordController, logoutController };