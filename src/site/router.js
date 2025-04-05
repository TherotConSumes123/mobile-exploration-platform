

class Router
{
    #endpoints;

    constructor ()
    {
        this.#endpoints = {};
    }

    registerEndpoint(path, endp)
    {
        let elems = path.split('/');

        let ptr = this.#endpoints;

        for (let i = 0; i < elems.length; i += 1)
        {
            if (elems[i] === '@*')
            {
                if (ptr['@any'] === undefined)
                {
                    ptr['@any'] = {};
                }

                ptr = ptr['@any'];
            }
            else if (elems[i] === '@**')
            {
                if (ptr['@args'] === undefined)
                {
                    ptr['@args'] = {
                        '@root': endp,
                    };
                }

                return;
            }
            else if (elems[i].startsWith('@'))
            {
                const known_types = {'int': true, 'float': true, 'string': true};

                let type = elems[i].substr(1);
                if (known_types[type] === undefined) throw new Error('Bad arg type');
                
                if (ptr['@' + type] === undefined)
                {
                    ptr['@' + type] = {};
                }

                ptr = ptr['@' + type];
            }
            else
            {
                if (ptr[elems[i]] === undefined)
                {
                    ptr[elems[i]] = {};
                }

                ptr = ptr[elems[i]];
            }
        }

        ptr['@root'] = endp;
        // console.log(this.#endpoints);
    }

    route(req, res)
    {
        let elems = req.url.substr(1).split('/');

        let ptr = this.#endpoints;

        let typed_args = [];
        let wildcards = [];
        let varargs = [];

        console.log(elems);

        let last_varargs_node = undefined;

        for (let i = 0; i < elems.length; i += 1)
        {
            console.log(elems[i]);
            console.log(ptr);

            if (ptr['@any'] !== undefined) { }
            else if (elems[i].length === 0)
            {
                if (elems.length === i + 1) break;
                
                res.writeHead(404);
                res.end();

                return;
            }

            // if (ptr['@args'] !== undefined)
            // {
            //     varargs_nodes.push(ptr);
            // }

            if (ptr[elems[i]] !== undefined)
            {
                ptr = ptr[elems[i]];
                continue;
            }

            let type = '';
            let v = Number.parseFloat(elems[i]);

            console.log(':| --> ' + v.toString());

            if ((v === undefined || Number.isNaN(v)) && ptr['@string'] !== undefined)
            {
                console.log(':P');
                type = 'string';
                ptr = ptr['@string'];
                typed_args.push(elems[i]);
                continue;
            }
            if (!(v === undefined || Number.isNaN(v)) && (v % 1) === 0 && ptr['@int'] !== undefined)
            {
                type = 'int';
                ptr = ptr['@int'];
                typed_args.push(Math.floor(v));
                continue;
            }
            if (!(v === undefined || Number.isNaN(v)) && ptr['@float'] !== undefined)
            {
                type = 'float';
                ptr = ptr['@float'];
                typed_args.push(v);
                continue;
            }

            if (ptr['@any'] !== undefined)
            {
                wildcards.push(elems[i]);
                ptr = ptr['@any'];
                continue;
            }
            
            if (ptr['@args'] !== undefined)
            {
                varargs = elems.slice(i + 1);
                ptr = ptr['@args'];
                continue;
            }

            res.writeHead(404);
            res.end();
            return;
        }

        return ptr['@root'](req, res, typed_args, wildcards, varargs);
    }
}


exports.Router = Router;