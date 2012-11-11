var
	url = require('url'),
	request = require('request'),
	cheerio = require('cheerio'),
	uuid = require('node-uuid'),
	config = require('./config');

var Session = function(link, io, callback) {
	link = url.parse(link);
	link.hash = null;
	this.url = url.format(link);
	this.io = io;

	this.id = uuid.v4();
	this.masterId = uuid.v4().substr(0,8);
	this.index = 0;

	this.requestPage(callback);
};

Session.prototype.addClient = function(client) {
	client.join(this.id);
};

Session.prototype.getClients = function() {
	return this.io.sockets.clients(this.id);
};

Session.prototype.broadcast = function(event, data) {
	this.io.sockets.in(this.id).emit(event, data);
};

Session.prototype.requestPage = function(callback) {
	request(this.url, function(err, res, body) {

		if (err) {
			return callback(err);
		}

		var $ = cheerio.load(body);

		// TODO: normalize all relative asset urls

		$('body').append(config.mapped_assets.assets.js.viewer);
		this.page = $.html();

		callback();
		
	}.bind(this));
};

Session.prototype.isMaster = function(id) {
	return (id == this.masterId);
};

exports.Session = Session;