const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
const db = require('../db');
const router = new express.Router();


router.post('/', async (req, res, next) => {
    try {
        const { comp_code, ind_code } = req.body;
        const result = db.query('INSERT INTO industries_companies (comp_code, ind_code) VALUES ($1, $2)', [comp_code, ind_code]);
        return res.status(201).json({ association: 'added' });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;