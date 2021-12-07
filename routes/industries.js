const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
const db = require('../db');
const router = new express.Router();


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
            SELECT c.code, i.industry
            FROM companies AS c
            JOIN industries_companies
            ON c.code = industries_companies.comp_code
            RIGHT JOIN industries AS i
            ON i.code = industries_companies.ind_code`);

        return res.json({ industries: results.rows })
    } catch (err) {
        return next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { industry } = req.body;
        const code = slugify(industry, { lower: true, strict: true });

        const result = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *', [code, industry]);
        return res.status(201).json({ industry: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;