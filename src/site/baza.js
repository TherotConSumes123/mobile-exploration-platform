let http = require('http');
let pg = require('pg');
let fs = require('fs');

let db_data = {
    user: 'postgres',
    password: 'B1dC-DdgG433G24g1ca66FAE3d*dFGGD',
    database: 'postgres',
    host: 'monorail.proxy.rlwy.net',
    port: 20023,
    ssl: {
        rejectUnauthorized: false,
    },
};

function getDb()
{
    return new pg.Client(db_data);
}

let baza = {};

let api = {
    get_user_count: async function (req, res) {
        let db = getDb();
        await db.connect((err) => { console.log(err); });

        let r = undefined;

        db.query('SELECT * FROM users;', (err, rdb) => {
            if (err)
            {
                r = err.message;
                
                res.writeHead(300);
                res.write(r);
                res.end();

                db.end();
                return;
            }
            
            r = '' + rdb.rowCount;
            
            res.writeHead(200);
            res.write(r);
            res.end();

            db.end();
        });
    },
};

let serv = http.createServer(async (req, res) => {
    if (req.url === undefined)
    {
        res.write('invalid path');
        res.end();
        return;
    }
    else if (req.url.startsWith('/api'))
    {
        let api_name = req.url.substr(5) + '';
        let fn = api[api_name];
        fn(req, res)
    }
    else
    {
        res.writeHead(418);
        res.end();
    }
});

serv.listen(360, 'localhost');