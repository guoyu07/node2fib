'use strict';

function base64ByteLength(str, bytes) {
    // Handle padding
    if (str.charCodeAt(bytes - 1) === 0x3D)
        bytes--;
    if (bytes > 1 && str.charCodeAt(bytes - 1) === 0x3D)
        bytes--;

    // Base64 ratio: 3/4
    return (bytes * 3) >>> 2;
}

function checkOffset(offset, ext, length) {
    if (offset + ext > length)
        throw new RangeError('Index out of range');
}

function checkInt(buffer, value, offset, ext, max, min) {
    if (!(buffer instanceof Buffer))
        throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min)
        throw new TypeError('"value" argument is out of bounds');
    if (offset + ext > buffer.length)
        throw new RangeError('Index out of range');
}

function byteLength(string, encoding) {
    if (string instanceof Buffer)
        return string.length;

    if (typeof string !== 'string')
        string = '' + string;

    var len = string.length;
    if (len === 0)
        return 0;

    // Use a for loop to avoid recursion
    var loweredCase = false;
    for (; ;) {
        switch (encoding) {
            case 'ascii':
            case 'binary':
                return len;

            case 'utf8':
            case 'utf-8':
            case undefined:
                return new Buffer(string, 'utf8').length;

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
                return len * 2;

            case 'hex':
                return len >>> 1;

            case 'base64':
                return base64ByteLength(string, len);

            default:
                // The C++ binding defaulted to UTF8, we should too.
                if (loweredCase)
                    return new Buffer(string, 'utf8').length;

                encoding = ('' + encoding).toLowerCase();
                loweredCase = true;
        }
    }
}

Buffer.kMaxLength = Math.pow(2, 31) - 1;                    //TODO judge by system 64|32 bit

Buffer.byteLength = byteLength;

Buffer.compare = function(a, b) {

    if (!(a instanceof Buffer) || !(b instanceof Buffer)) {
        throw new TypeError('Arguments must be Buffers');
    }

    if (a === b) {
        return 0;
    }

    return new Buffer(a).compare(b);
};

Buffer.isEncoding = function(encoding) {                   //TODO fibjs 需要支持更多encoding
    var loweredCase = false;
    for (; ;) {
        switch (encoding) {
            case 'hex':
            case 'utf8':
            case 'utf-8':
            case 'ascii':
            case 'binary':
            case 'base64':
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
                return true;

            default:
                if (loweredCase)
                    return false;
                encoding = ('' + encoding).toLowerCase();
                loweredCase = true;
        }
    }
};

Buffer.prototype.INSPECT_MAX_BYTES = 50;

Buffer.prototype.entries = function() {
    return this.toJSON().entries();
};

Buffer.prototype.keys = function() {
    return this.toJSON().keys();
};

Buffer.prototype.values = function() {
    return this.toJSON();
};

Buffer.prototype.includes = function includes(val, _byteOffset, _encoding = 'utf8') {
    return new Buffer(this.toString(_encoding)).indexOf(val, _byteOffset) !== -1;
};

module.exports = Buffer;