const express = require('express');
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
        const results = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [code]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Company with code ${code} was not found`, 404);
        }

        return res.json({ company: results.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
            [code, name, description]);

        return res.json({ company: results.rows[0] });
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