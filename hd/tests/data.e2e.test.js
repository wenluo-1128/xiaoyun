jest.mock('../src/db/pool', () => ({ query: jest.fn() }))
const pool = require('../src/db/pool')
const request = require('supertest')
const app = require('../src/index')

describe('API /api/data', () => {
  test('rejects missing query_keyword', async () => {
    const res = await request(app).get('/api/data')
    expect(res.status).toBe(400)
  })

  test('GET returns rows', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, plan_data: { trip_title: 't' }, query_keyword: 'abc' }] })
    const res = await request(app).get('/api/data').query({ query_keyword: 'abc' })
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  test('POST validates plan_data', async () => {
    const bad = await request(app).post('/api/data').query({ query_keyword: 'abc' }).send({ plan_data: {} })
    expect(bad.status).toBe(400)
  })

  test('POST inserts and returns row', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, plan_data: { trip_title: 'x' }, query_keyword: 'abc' }] })
    const res = await request(app)
      .post('/api/data')
      .query({ query_keyword: 'abc' })
      .send({ plan_data: { trip_title: 'x', days: [], trip_info: { location: 'l', total_days: 0, total_attractions: 0, description: 'd' } } })
    expect(res.status).toBe(201)
    expect(res.body.id).toBe(2)
  })

  test('PUT not found returns 404', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })
    const res = await request(app)
      .put('/api/data/999')
      .query({ query_keyword: 'abc' })
      .send({ plan_data: { trip_title: 'x', days: [], trip_info: { location: 'l', total_days: 0, total_attractions: 0, description: 'd' } } })
    expect(res.status).toBe(404)
  })

  test('DELETE returns deleted id', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 3 }] })
    const res = await request(app).delete('/api/data/3').query({ query_keyword: 'abc' })
    expect(res.status).toBe(200)
    expect(res.body.deleted).toBe(3)
  })
})
