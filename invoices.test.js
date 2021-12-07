process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('./app');
const db = require('./db');


// test setup
let testCompany
let testInvoice;
beforeEach(async () => {
    const compResult = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ('apple', 'Apple', 'Maker of iOS')
        RETURNING *`);
    testCompany = compResult.rows[0];

    const invResult = await db.query(`
        INSERT INTO invoices (id, comp_code, amt, paid) 
        VALUES (1, 'apple', 100, false) 
        RETURNING *`);
    testInvoice = invResult.rows[0];
});

afterEach(async () => {
    await db.query('DELETE FROM companies');
    await db.query('DELETE FROM invoices');
});

afterAll(async () => {
    await db.end();
});


/** Route Tests */

describe('GET /invoices', () => {
    test('Return a list of all invoices', async () => {
        const response = await request(app).get('/invoices');
        expect(response.statusCode).toEqual(200);
        expect(response.body.invoices[0].amt).toEqual(100);
        expect(response.body.invoices[0].comp_code).toEqual('apple');
    });
});

describe('GET /invoices/:id', () => {
    test('Get a single invoice by id', async () => {
        const response = await request(app).get('/invoices/1');
        expect(response.statusCode).toEqual(200);
        expect(response.body.invoice.amt).toEqual(100);
        expect(response.body.invoice.company).toEqual({
            code: 'apple',
            name: 'Apple',
            description: 'Maker of iOS'
        });
    });
    
    test('Return 404 if invoices not found', async () => {
        const response = await request(app).get('/invoices/3');
        expect(response.statusCode).toEqual(404);
    });
});

describe('POST /invoices', () => {
    test('Create a new invoice', async () => {
        const response = await request(app).post('/invoices')
            .send({
                id: 2, 
                comp_code: 'apple',
                amt: 200,
                paid: true
            });

        expect(response.statusCode).toEqual(201);
        expect(response.body.invoice.amt).toEqual(200);
    });
});

describe('PUT /invoices/:id', () => {
    test('Update an invoice', async () => {
        const response = await request(app).put('/invoices/1')
            .send({
                amt: 300
            });

        expect(response.statusCode).toEqual(200);
        expect(response.body.invoice.amt).toEqual(300);
    });
});

describe('DELETE /invoices/:id', () => {
    test('Delete an invoice', async () => {
        const response = await request(app).delete('/invoices/1');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            status: 'deleted'
        });
    });

    test('Return 404 if invoices not found', async () => {
        const response = await request(app).get('/invoices/3');
        expect(response.statusCode).toEqual(404);
    });
});