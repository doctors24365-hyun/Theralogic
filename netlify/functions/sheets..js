exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { url } = event.queryStringParameters || {};
  if (!url) {
    return { statusCode: 400, body: JSON.stringify({ error: 'URL 파라미터 필요' }) };
  }

  try {
    // pub?output=csv URL 직접 fetch (서버에서는 CORS 없음)
    const response = await fetch(decodeURIComponent(url), {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow'
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Google Sheets 접근 실패: HTTP ' + response.status })
      };
    }

    const text = await response.text();

    if (!text || text.trim().startsWith('<!')) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: '시트를 "웹에 게시" → CSV 형식으로 게시했는지 확인하세요' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: text
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
