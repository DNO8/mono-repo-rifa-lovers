export const config = {
  runtime: 'edge',
};

const CRAWLERS = [
  'whatsapp',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'telegrambot',
];

const OG_DATA: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'RifaLovers \u2014 Rifas online con impacto social en Chile',
    description: 'Participa en rifas online legales y transparentes en Chile. Gana premios increibles y contribuye a causas solidarias con nuestra comunidad participativa.',
  },
  '/impacto': {
    title: 'Nuestro impacto social | RifaLovers',
    description: 'Descubre el impacto real de RifaLovers. Cada rifa online contribuye a causas solidarias en Chile. Conoce como nuestra comunidad participativa transforma vidas.',
  },
  '/nosotros': {
    title: 'Sobre nosotros | RifaLovers',
    description: 'Conoce a RifaLovers. Somos una empresa SpA legalmente constituida en Chile dedicada a rifas online transparentes con impacto social. Respaldados por KRIM Consultores e Innovaxchain.',
  },
  '/contacto': {
    title: 'Contacto | RifaLovers',
    description: 'Contacta a RifaLovers. Resolvemos tus dudas sobre rifas online, sorteos y nuestra comunidad participativa. Soporte rapido y atencion personalizada.',
  },
  '/bases-legales': {
    title: 'Bases legales | RifaLovers',
    description: 'Bases legales de los sorteos y rifas online de RifaLovers. Sorteos legales y transparentes en Chile con asesoria juridica profesional.',
  },
  '/terminos': {
    title: 'Terminos y condiciones | RifaLovers',
    description: 'Terminos y condiciones de uso de RifaLovers. Lee las condiciones legales para participar en nuestras rifas online.',
  },
  '/privacidad': {
    title: 'Politica de privacidad | RifaLovers',
    description: 'Politica de privacidad de RifaLovers. Conoce como protegemos tus datos personales en nuestra plataforma de rifas online.',
  },
};

const OG_IMAGE = 'https://www.rifalovers.cl/images/logos/logo-v2.webp';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

  const isCrawler = CRAWLERS.some((crawler) => userAgent.includes(crawler));

  if (!isCrawler) {
    return fetch(new URL('/index.html', request.url));
  }

  const data = OG_DATA[url.pathname] || OG_DATA['/'];
  const canonical = 'https://www.rifalovers.cl' + url.pathname;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.title)}</title>
  <meta name="description" content="${escapeHtml(data.description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(data.title)}">
  <meta property="og:description" content="${escapeHtml(data.description)}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_CL">
  <meta property="og:site_name" content="RifaLovers">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(data.title)}">
  <meta name="twitter:description" content="${escapeHtml(data.description)}">
  <meta name="twitter:image" content="${OG_IMAGE}">
  <meta name="robots" content="index, follow">
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
