const puppeteerExtra = require('puppeteer-extra');
const puppeteerExtraPluginStealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteerExtra.use(puppeteerExtraPluginStealth());

(async () => {
    const browser = await puppeteerExtra.launch({
        headless: true, // Modo headless, sem interface gráfica
        executablePath: '/usr/bin/google-chrome', // Caminho para o Chrome
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--proxy-server=http://147.93.33.92:3128', // Adicione o proxy, se necessário
            '--remote-debugging-port=9222', // Adicionando para rodar sem depender de X server
            '--headless', // Certifique-se de que o modo headless está ativado
            '--disable-software-rasterizer', // Desativar o uso de software para renderização
            '--no-xshm', // Evitar a necessidade de um servidor X compartilhado
        ],
    });

    const page = await browser.newPage();

    // Configurar User-Agent para simular um navegador real
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.204 Safari/537.36'
    );

    // Navegar até o YouTube (onde o login é necessário)
    await page.goto('https://www.youtube.com', {
        waitUntil: 'networkidle2',
    });

    // Tentar encontrar e aceitar o aviso de cookies
    try {
        // Aguardar o botão de cookies usando XPath
        await page.waitForXPath('//*[contains(text(), "Aceitar") or contains(text(), "Accept")]', { visible: true });

        // Obter todos os botões que correspondem ao XPath
        const buttons = await page.$x('//*[contains(text(), "Aceitar") or contains(text(), "Accept")]');

        if (buttons.length > 0) {
            // Clicar no primeiro botão encontrado
            await buttons[0].click();
            console.log("Botão de cookies aceito com sucesso!");
        } else {
            console.log("Botão de cookies não encontrado.");
        }
    } catch (err) {
        console.log("Aviso de cookies não encontrado ou já aceito.");
    }

    // Aguardar o botão de login
    await page.waitForSelector('ytd-button-renderer.style-scope.ytd-masthead', { visible: true });

    // Clicar no botão de login
    await page.click('ytd-button-renderer.style-scope.ytd-masthead');

    // Esperar pela tela de login do Google
    await page.waitForSelector('input[type="email"]', { visible: true });

    // Preencher o email
    await page.type('input[type="email"]', 'grabmediame@gmail.com');
    await page.click('#identifierNext');
    await page.waitForTimeout(1000); // Espera para carregar a próxima tela

    // Esperar pela senha
    await page.waitForSelector('input[type="password"]', { visible: true });

    // Preencher a senha
    await page.type('input[type="password"]', '28461937grabmedia');
    await page.click('#passwordNext');
    await page.waitForTimeout(3000); // Espera para completar o login

    // Se o login for bem-sucedido, você estará na página principal do YouTube
    console.log('Login feito com sucesso!');

    // Tirar uma captura de tela após o login para confirmar
    await page.screenshot({ path: 'youtube-login-screenshot.png' });

    // Obter as cookies após o login para evitar login repetido
    const cookies = await page.cookies();
    fs.writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2));

    console.log('Cookies salvos com sucesso!');

    // Fechar o navegador
    await browser.close();
})();
