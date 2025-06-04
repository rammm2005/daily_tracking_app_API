const express = require('express');
const router = express.Router();

const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.connection?.remoteAddress || req.socket?.remoteAddress || req.ip || 'Unknown IP';
};

const renderRouteInfo = (ip) => `
  <div style="font-family:sans-serif; padding:1rem; line-height:1.5;">
    <h2>📡 Your IP Address:</h2>
    <p><strong>${ip}</strong></p>
    <br/>
    <h3>📘 Postman documentation here:</h3>
    <ul>
      <li>GET /api/auth/login — login user</li>
      <li>POST /api/auth/register — register user</li>
      <li>GET /api/auth/logout — logout user</li>

      <li>GET /api/tips — list tips</li>
      <li>POST /api/tips — create tip</li>
      <li>GET /api/tips/{id} — show tip</li>
      <li>PUT /api/tips/{id} — update tip</li>
      <li>DELETE /api/tips/{id} — delete tip</li>

      <li>GET /api/meals — list meals</li>
      <li>POST /api/meals — create meal</li>
      <li>GET /api/meals/{id} — show meal</li>
      <li>PUT /api/meals/{id} — update meal</li>
      <li>DELETE /api/meals/{id} — delete meal</li>

      <li>GET /api/users — list users</li>
      <li>POST /api/users — create user</li>
      <li>GET /api/users/{id} — show user</li>
      <li>PUT /api/users/{id} — update user</li>
      <li>DELETE /api/users/{id} — delete user</li>

      <li>GET /hello — test hello route</li>
    </ul>
  </div>
`;

router.get('/', (req, res) => {
    const ip = getClientIp(req);
    res.status(200).send(renderRouteInfo(ip));
});

module.exports = router;
