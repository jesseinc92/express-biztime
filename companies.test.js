process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('./app');
const db = require('./db');


// test setup
let testCompany;
beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('amz', 'Amazon', 'Products from A to Z') RETURNING *`);
    testCompany = result.rows[0];
});

afterEach(async () => {
    await db.query('DELETE FROM companies')
});

afterAll(async () => {
    await db.end();
});


/** Route Tests */

describe("GET /companies", () => {
    test("Get a list of companies from the database", async () => {
        const response = await request(app).get('/companies');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ companies: [testCompany] });
    });
});

describe('GET /companies/:code', () => {
    test('Get a single company from database', async () => {
        const response = await request(app).get('/companies/amz');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ company: testCompany });
    });

    test('Get 404 if company was not found', async () => {
        const response = await request(app).get('/companies/blah');
        expect(response.statusCode).toEqual(404);
    });
});

describe('POST /companies', () => {
    test('Create a company', async () => {
        const response = await request(app).post('/companies')
            .send({
                code: 'test',
                name: 'test',
                description: 'this is a test'
            });

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({ company: {
                code: 'test',
                name: 'test',
                description: 'this is a test'
        }});
    });
});

describe('PUT /companies/:code', () => {
    test('Update details of a single company', async () => {
        const response = await request(app).put('/companies/amz')
            .send({
                name: 'AMAZON',
                description: 'different description'
            });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ company: {
            code: 'amz',
            name: 'AMAZON',
            description: 'different description'
        }});
    });

    test('Get 404 if company was not found', async () => {
        const response = await request(app).put('/companies/blah');
        expect(response.statusCode).toEqual(404);
    });
});

describe('DELETE /companies/:code', () => {
    test('Delete a company from the database', async () => {
        const response = await request(app).delete('/companies/amz');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({ status: 'deleted'});
    });

    test('Get 404 if company was not found', async () => {
        const response = await request(app).delete('/companies/blah');
        expect(response.statusCode).toEqual(404);
    });
});