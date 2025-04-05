let http = require('http');
let pg = require('pg');
let fs = require('fs');

let Router = require('./router.js').Router;

async function getBody(req)
{
    return new Promise((resolve, reject) => {
        const chunks = [];
      
        req.on("data", (chunk) => {
            chunks.push(chunk);
        });
      
        req.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
      
        req.on("error", (error) => {
            reject(error);
        });
    });
}

let router = new Router();

router.registerEndpoint('api/@string',
    (req, res, t, a, v) => {

    res.writeHead(400);
    res.write("Your string :)\n");
    res.write(t[0]);
    res.end();
});

router.registerEndpoint('api/user/count',
    async (req, res, t, a, v) => {
    
    let db = getDb();

    await db.connect((err) => { console.log(err); });

    db.query('SELECT COUNT(*) FROM users;', (err, dat) => {
        if (err)
        {
            r = err.message;
                
            res.writeHead(400);
            res.write(r);
            res.end();

            db.end();
            return;
        }

        res.writeHead(200);
            
        let r = {
            count: dat.rows[0].count
        };

        res.write(JSON.stringify(r));
        res.end();

        db.end();
        return;
    });
});

router.registerEndpoint('api/user/get',
    async (req, res, t, a, v) => {

    let db = getDb();

    await db.connect((err) => { console.log(err); });

    let id = Number.parseInt(args[1]);
    
    let query = `SELECT * FROM users;`;

    db.query(query, (err, dat) => {
        if (err)
        {
            r = err.message;
            
            res.writeHead(400);
            res.write(r);
            res.end();

            db.end();
            return;
        }

        res.writeHead(200);
        
        let r = {
            data: dat.rows
        };

        res.write(JSON.stringify(r));
        res.end();

        db.end();
        return;
    });
});

router.registerEndpoint('api/user/get/@int',
    async (req, res, typed_args, a, v) => {
        
    let db = getDb();

    await db.connect((err) => { console.log(err); });

    let id = typed_args[0];

    let query = `SELECT * FROM users WHERE id=${id};`;

    db.query(query, (err, dat) => {
        if (err)
        {
            r = err.message;
            
            res.writeHead(400);
            res.write(r);
            res.end();

            db.end();
            return;
        }

        res.writeHead(200);
        
        let r = {
            data: dat.rows
        };

        res.write(JSON.stringify(r));
        res.end();

        db.end();
        return;
    });
});

router.registerEndpoint('api/user/remove/@int',
    async (req, res, typed_args, a, v) => {

        let db = getDb();

        await db.connect((err) => { console.log(err); });

        let id = typed_args[0];

        db.query(`DELETE * FROM users WHERE id=${id};`, (err, dat) => {
            if (err)
            {
                r = err.message;
                
                res.writeHead(400);
                res.write(r);
                res.end();

                db.end();
                return;
            }

            res.writeHead(200);

            res.write(JSON.stringify(dat));
            res.end();

            db.end();
            return;
        });
});

router.registerEndpoint('api/user/insert',
    /**
     * @param {http.ClientRequest} req
    */
    async (req, res, typed_args, a, v) => {

        let db = getDb();

        await db.connect((err) => { console.log(err); });

        let body = JSON.parse(await getBody(req));

        console.log(body);

        let q = `INSERT INTO users (username, password, role) VALUES ('${body.username}','${body.password}','${body.role}')`;

        db.query(q, (err, dat) => {
            if (err)
            {
                r = err.message;
                
                res.writeHead(400);
                res.write(r);
                res.end();

                db.end();
                return;
            }

            res.writeHead(200);

            res.write(JSON.stringify(dat));
            res.end();

            db.end();
            return;
        });
});


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

let api = {
    vehicle: async function (req, res) {
        ;
    },
    device:  async function (req, res) {
        ;
    },
    sensor: async function (req, res) {
        ;
    },
    measurement: async function (req, res) {
        ;
    },
};

let serv = http.createServer(async (req, res) => {
    router.route(req, res);
    return;
    if (req.url === undefined)
    {
        res.writeHead(400);
        res.write('invalid path');
        res.end();
        return;
    }

    let path = req.url.substr(1);
    
    if (path.startsWith('api'))
    {
        let api_name = path.split('/')[1];
        console.log(api_name);
        let fn = api[api_name];
        fn(req, res)
    }
    else if(fs.existsSync(path))
    {
        let data = fs.readFileSync(path);

        res.writeHead(200);
        res.write(data);
        res.end();
    }
    else
    {
        res.writeHead(418);
        res.write('?');
        res.end();
    }
});

serv.listen(360, 'localhost');