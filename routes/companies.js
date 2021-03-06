const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
const db = require('../db');
const router = new express.Router();


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM companies');
        return res.json({ companies: results.rows });
    } catch (err) {
        return next(err);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const results = await db.query('SELECT * FROM companies WHERE code = $1', [code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Company with code ${code} was not found`, 404);
        }

        const { name, description } = results.rows[0];

        const resultsInv = await db.query('SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE comp_code = $1', [code]);
        const resultsInd = await db.query(`
            SELECT i.industry
            FROM industries AS i
            JOIN industries_companies
            ON i.code = industries_companies.ind_code
            JOIN companies AS c
            ON c.code = industries_companies.comp_code
            WHERE c.code = $1`, [code]);

        let indArray = [];
        for (let ind of resultsInd.rows) {
            indArray.push(ind.industry)
        }

        return res.json({ company: {
            code: code,
            name: name,
            description: description,
            invoices: resultsInv.rows,
            industries: indArray } 
        });
    } catch (err) {
        return next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const code = slugify(name, { lower: true, strict: true });
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
            [code, name, description]);

        return res.status(201).json({ company: results.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description',
            [name, description, code]);
        
        if (results.rows.length === 0) {
            throw new ExpressError(`Company with code ${code} cannot be found`, 404);
        }

        return res.json({ company: results.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const result1 = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [code]);

        if (result1.rows.length === 0) {
            throw new ExpressError(`Company with code ${code} not found`, 404);
        }
    
        const result2 = db.query('DELETE FROM companies WHERE code = $1', [code]);
        return res.json({ status: 'deleted' });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;