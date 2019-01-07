/*export async function GET(url) {
    return await fetch(new Request('movies', { method: 'GET' })).then(function(response) { return response.json(); });
}

module.exports = {
    GET: GET
};*/
eval(`export async function GET(url) {
    return await fetch(new Request('movies', { method: 'GET' })).then(function(response) { return response.json(); });
}
`);
async function GET(url) {
    return await fetch(new Request('movies', { method: 'GET' })).then(function(response) { return response.json(); });
}

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
        eval('export var a = GET;');
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        //root.returnExports = factory();
        eval('export var a = GET;');
  }
}(this, function () {

    // Just return a value to define the module export.
    // This example returns an object, but the module
    // can return a function as the exported value.
    return GET;
}));