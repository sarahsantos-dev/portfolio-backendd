
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // permite que o front-end (em outro endereço) chame esse backend
app.use(express.json()); // permite ler JSON no corpo das requisições

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Rota de teste, só pra confirmar que o servidor está no ar
app.get('/', (req, res) => {
  res.send('Backend do portfolio está rodando! 🚀');
});

// Rota que recebe os dados do formulário de contato
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Validação básica no backend (nunca confie só na validação do front-end)
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  // Validação simples de formato de e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'E-mail inválido.' });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      replyTo: email, // assim, quando você responder, vai direto pra quem enviou
      subject: `Nova mensagem do portfolio - ${name}`,
      text: `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`,
      html: `
        <h2>Nova mensagem pelo portfolio</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    console.log('E-mail enviado! Detalhes:', info);
    console.log('Enviado para:', process.env.EMAIL_TO);
    console.log('Enviado de:', process.env.EMAIL_USER);

    res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem. Tente novamente mais tarde.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
