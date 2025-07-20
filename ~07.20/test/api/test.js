const {response, request} = require('express');
const {Pool} = require('pg');
const pg = new Pool({
    user: 'kyarene',
    host: 'localhost',
    database: 'mydb',
    password: 'kr131704!!',
    port: '5432'
})

const gogo = (request, response) => {
    response.send('succeed');
}

module.exports = {
    gogo,
}