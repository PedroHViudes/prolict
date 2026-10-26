const nodemailer = require('nodemailer');
const path = require('path');

/**
 * Utilitário para envio de e-mails pelo sistema PROLICIT.
 * Se configurado no .env (SMTP_USER/SMTP_PASS), envia pelo SMTP configurado.
 * Caso contrário, cria uma conta de testes automática (Ethereal Email) e exibe o link do e-mail no console.
 */
async function criarTransporter() {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                // A senha de app do Google aparece com espaços ("abcd efgh ..."); removemos por segurança
                pass: (process.env.SMTP_HOST || 'smtp.gmail.com').includes('gmail') ? process.env.SMTP_PASS.replace(/\s/g, '') : process.env.SMTP_PASS
            }
        });
    }

    // Se não houver credenciais SMTP no .env, cria uma conta de testes gratuita no Ethereal
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
}

/**
 * Envia o e-mail contendo o código PIN de 6 dígitos para o usuário.
 * @param {string} emailDestino - E-mail do administrador
 * @param {string} nomeUsuario - Nome do administrador
 * @param {string} codigoPIN - Código numérico de 6 dígitos
 */
async function enviarEmailCodigoRecuperacao(emailDestino, nomeUsuario, codigoPIN) {
    try {
        const transporter = await criarTransporter();

        const info = await transporter.sendMail({
            // O Gmail só aceita enviar em nome da própria conta autenticada
            from: process.env.SMTP_FROM || `"PROLICIT Suporte" <${process.env.SMTP_USER || 'nao-responda@prolicit.com'}>`,
            to: emailDestino,
            subject: 'Código de Recuperação de Senha - PROLICIT',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">

                    <img src="cid:prolicit-logo" alt="PROLICIT Logo" style="display: block; margin: 0 auto 20px; width: 200px; height: auto;">
                    
                    <h3 style="color: #1e293b; text-align: center;">Recuperação de Senha</h3>
                    <p style="color: #334155;">Olá, <strong>${nomeUsuario}</strong>!</p>
                    <p style="color: #334155;">Recebemos uma solicitação para redefinir a senha da sua conta no PROLICIT.</p>
                    <p style="color: #334155;">Seu código de verificação é:</p>
                    
                    <div style="background-color: #f1f5f9; text-align: center; padding: 18px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; margin: 20px 0;">
                        ${codigoPIN}
                    </div>
                    
                    <p style="margin-top: 20px; font-size: 13px; color: #64748b; text-align: center;">
                        Este código é válido por <strong>15 minutos</strong>. Se você não solicitou a alteração de senha, por favor ignore este e-mail.
                    </p>
                </div>
            `,
            // A logo vai anexada inline e é referenciada no HTML por "cid:prolicit-logo"
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, '..', 'assets', 'logo.png'),
                cid: 'prolicit-logo'
            }]
        });

        console.log(`\n==================================================`);
        console.log(`[E-MAIL ENVIADO] Código PIN ${codigoPIN} enviado para ${emailDestino}`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[TESTE ETHEREAL] Abra o e-mail no navegador através do link:\n${previewUrl}`);
        }
        console.log(`==================================================\n`);

        return { sucesso: true, previewUrl };

    } catch (erro) {
        console.error("Erro ao enviar e-mail com Nodemailer:", erro);
        return { sucesso: false, erro: erro.message };
    }
}

module.exports = { enviarEmailCodigoRecuperacao };
