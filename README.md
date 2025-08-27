# GrabMedia
Aplicação web para download de vídeos e áudios do YouTube, desenvolvida com foco em desempenho, modularidade e simplicidade de uso.

🔧 Tecnologias utilizadas:

Frontend: HTML5, CSS3, JavaScript (UI responsiva e intuitiva)

Backend: Node.js + Express (roteamento e processamento das requisições)

Containerização: Docker e Docker Compose (ambiente isolado e padronizado)

Integração: Biblioteca ytdl-core para extração de streams do YouTube

Banco de dados (opcional): Oracle Database / SQLite para registro de histórico de downloads

Arquitetura: Separação em módulos de serviços (microserviços leves), facilitando escalabilidade e manutenção

Principais recursos:

Download de vídeos em múltiplas resoluções (360p, 720p, 1080p…)

Extração de áudio em MP3 de alta qualidade

Suporte a filas de download simultâneas

Estrutura extensível para integração futura com outras plataformas (Vimeo, Instagram, TikTok, etc.)

Deploy:

Compatível com execução local ou em servidores via Docker

Pode ser hospedado em qualquer serviço cloud com suporte a Node.js/Docker
