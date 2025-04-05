let http = require('http');



let user = {
    username: 'JacekPlacek',
    password: '123',
    role: 69
};


let data = JSON.stringify(user);

const options = {
    hostname: 'localhost',
    port: 360,
    path: '/api/user/insert',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
    },
};

let req = http.request(options,
    (res) => {
    
    res.setEncoding('utf8');
    res.on('data', (ch) => console.log(ch));
});

req.write(data);
req.end();
