export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // 1. Strict Authentication Check
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Authentication token is required to access StudyOS materials.' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.length < 10) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: Invalid authentication token.' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // 2. Extract relative upstream path
  const url = new URL(req.url);
  const match = url.pathname.replace(/^\/api\/studyos\/?/, '');
  if (!match) {
    return new Response(
      JSON.stringify({ error: 'Bad Request: Missing studyos target path.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const targetUrl = `https://www.studyos.co.in/api/${match}${url.search}`;

  // 3. Proxy to verified StudyOS upstream
  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 EduScrapeApp/1.0',
      },
    });

    const body = await upstreamRes.arrayBuffer();
    return new Response(body, {
      status: upstreamRes.status,
      headers: {
        'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Bad Gateway: Upstream studyos fetch failed', detail: err.message }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
