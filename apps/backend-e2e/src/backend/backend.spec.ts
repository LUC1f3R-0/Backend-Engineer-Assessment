import axios from 'axios';

describe('Backend API (e2e)', () => {
  it('GET /api/health returns ok when database is reachable', async () => {
    if (!process.env.X_API_KEY) {
      throw new Error(
        'Set X_API_KEY in the environment (or apps/backend/.env) so the API key guard allows the request.',
      );
    }

    const res = await axios.get('/api/health');

    expect(res.status).toBe(200);
    expect(res.data).toEqual({
      data: {
        status: 'ok',
        database: 'up',
        timestamp: expect.any(String),
      },
    });
  });
});
