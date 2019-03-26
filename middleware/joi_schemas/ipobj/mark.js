var schema = {};
module.exports = schema;

const Joi = require('joi');
const sharedSch = require('../shared');

schema.validate = req => {
	return new Promise(async(resolve, reject) => {
		var schema = Joi.object().keys({ fwcloud: sharedSch.id });

		if (req.method==='POST' || (req.method==='PUT' && req.url==='/ipobj/mark')) {
			schema = schema.append({
        mark: sharedSch.id,
				name: sharedSch.name,
        comment: sharedSch.comment
      });
      if (req.method==='POST') schema = schema.append({ node_id: sharedSch.id });
		} else if (req.method === 'PUT') {
      if (req.url==='/ipobj/mark/get' || req.url==='/ipobj/mark/where' || 
          req.url === '/ipobj/mark/del' || req.url === '/ipobj/mark/restricted') {
        schema = schema.append({ mark: sharedSch.id });
      }
		} else return reject(new Error('Request method not accepted'));

		try {
			await Joi.validate(req.body, schema, sharedSch.joiValidationOptions);
			resolve();
		} catch (error) { return reject(error) }
	});
};