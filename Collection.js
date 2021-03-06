var _ = require('./util');
var Cursor = require('./Cursor');
function noop() {
}

function Collection(initialArray) {
	this._data = initialArray.slice();
	this._mutableData = initialArray.slice();
}

Collection.prototype._restore = function () {
	this._mutableData = this._data.slice();
};

Collection.prototype.find = function (query, fields, options) {
	query = query || {};
	//source, query, fields, options
	var cursor = new Cursor(this._mutableData.slice(), query, fields, options);
	return cursor;
};

Collection.prototype.save = function (doc, options, callback) {
	if (!callback) {
		callback = options;
	}
	if (doc._id) {
		this.update({_id: doc._id}, doc, { upsert: true }, callback);
	} else {
		this.insert(doc, callback);
	}
};

Collection.prototype.findOne = function (query, callback) {
	callback(null, _(this._data).findOne(query));
};

Collection.prototype.count = function (query, options, callback) {
	if ('function' === typeof options) {
		callback = options, options = {};
	}
	if (options === null) {
		options = {};
	}

	if ('function' !== typeof callback) {
		callback = null;
	}

	var count = _(this._data).find(query, options).length;
	callback(null, count);
};

Collection.prototype.toArray = function (callback) {
	if (callback) {
		callback(null, this._mutableData.slice());
	}
};

Collection.prototype.insert = function (doc, options, callback) {
	if ('function' === typeof options) {
		callback = options, options = {};
	}

	if (options === null) {
		options = {};
	}

	if ('function' !== typeof callback) {
		callback = null;
	}

	_(this._data).insert(doc);
	this._restore();
	callback(null, doc);
};

Collection.prototype.create = function (doc, options) {

	if (options === null) {
		options = {};
	}
	
	_(this._data).insert(doc);
	this._restore();

	return Promise.resolve(doc)
};

Collection.prototype.update = function (query, modifier, options, callback) {
	if ('function' === typeof options) {
		callback = options, options = {};
	}

	if (options === null) {
		options = {};
	}

	if ('function' !== typeof callback) {
		callback = null;
	}

	if (modifier.$set && modifier.$set._id) {
		delete modifier.$set._id;
	}

	var counter = _(this._data).update(query, modifier, options);
	this._restore();

	callback(null, counter);
};

Collection.prototype.remove = function (query, callback) {
	callback = callback || noop;
	_(this._data).remove(query);
	this._restore();
	callback();
};

Collection.prototype.findAndModify = function (query, sort, modifier, options, callback) {
	if ('function' === typeof options) {
		callback = options, options = {};
	}

	if (options === null) {
		options = {};
	}

	if ('function' !== typeof callback) {
		callback = null;
	}

	if (modifier.$set && modifier.$set._id) {
		delete modifier.$set._id;
	}

	var doc = _(this._data).findAndModify(query, modifier, options);
	this._restore();
	callback(null, doc);
};

module.exports = Collection;