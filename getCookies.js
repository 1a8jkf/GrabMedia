const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const puppeteerExtraPluginStealth = require('puppeteer-extra-plugin-stealth');

puppeteer.use(puppeteerExtraPluginStealth());

(async () => {
    const browser = await puppeteer.launch({
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    try {
        console.log('Acessando página de login...');
        await page.goto('https://accounts.google.com/signin', { waitUntil: 'networkidle2' });

        console.log('Inserindo e-mail...');
        await page.type('#identifierId', 'grabmediame@gmail.com');
        await page.click('#identifierNext');

        console.log('Esperando a transição para a página de senha...');
        await page.waitForSelector('input[name="Passwd"]', { visible: true, timeout: 120000 });

        console.log('Inserindo senha...');
        await page.type('input[name="Passwd"]', '28461937grabmedia');
        await page.click('#passwordNext');

        console.log('Esperando redirecionamento para o YouTube...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
        await page.goto('https://www.youtube.com', { waitUntil: 'networkidle2' });

        console.log('Extraindo cookies...');
        const cookies = await page.cookies();
        const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
        fs.writeFileSync('cookies.txt', cookieString);

        console.log('Cookies atualizados com sucesso!');
    } catch (error) {
        console.error('Erro ao atualizar os cookies:', error);

        await page.screenshot({ path: 'screenshot.png' });
        console.log('Captura de tela salva como screenshot.png');
    } finally {
        await browser.close();
    }
})();
