const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');
const router = new express.Router();


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM invoices');
        return res.json({ invoices: results.rows });
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            throw new ExpressError('Invoice was not found', 404);
        }

        const { amt, paid, paid_date, add_date, comp_code } = result.rows[0];

        const comp_result = await db.query('SELECT * FROM companies WHERE code = $1', [comp_code]);

        return res.json({ invoice: { 
            id: id, 
            amt: amt, 
            paid: paid, 
            add_date: add_date, 
            paid_date: paid_date, 
            company: comp_result.rows[0] } 
        });
    } catch (err) {
        return next(err);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code, amt]);
        return res.json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const { amt } = req.body;
        const result = await db.query('UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING *', [amt, id]);
        return res.json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const result1 = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);

        if (result1.rows.length === 0) {
            throw new ExpressError('Invoice could not be found', 404);
        }

        const result2 = await db.query('DELETE FROM invoices WHERE id = $1', [id]);
        return res.json({ status: 'deleted' });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;