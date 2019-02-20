var express = require('express');
var router = express.Router();

var api_resp = require('../../../utils/api_response');

const objModel = 'CRT PREFIX';

const pkiModel = require('../../../models/vpn/pki/ca');
const restrictedCheck = require('../../../middleware/restricted');

/**
 * Create a new crt prefix container.
 */
router.post('/', async (req, res) => {
	try {
    // Verify that we are not creating a prefix that already exists for the same CA.
		if (await pkiModel.existsCrtPrefix(req)) 
			throw (new Error('Prefix name already exists'));

   	// Create the tree node.
		await pkiModel.createCrtPrefix(req);

		// Apply the new CRT prefix container.
		await pkiModel.applyCrtPrefixes(req,req.body.ca);

		api_resp.getJson(null, api_resp.ACR_INSERTED_OK, 'INSERTED OK', objModel, null, jsonResp => res.status(200).json(jsonResp));
  } catch(error) { api_resp.getJson(null, api_resp.ACR_ERROR, 'Error creating prefix container', objModel, error, jsonResp => res.status(200).json(jsonResp)) }
});


/**
 * Modify a CRT prefix container.
 */
router.put('/', async (req, res) => {
	try {
		// Verify that the new prefix name doesn't already exists.
		req.body.ca = req.prefix.ca;
		if (await pkiModel.existsCrtPrefix(req,req.prefix.ca)) 
			throw (new Error('Prefix name already exists'));

   	// Modify the prefix name.
		await pkiModel.modifyCrtPrefix(req);

		// Apply the new CRT prefix container.
		await pkiModel.applyCrtPrefixes(req,req.prefix.ca);

		api_resp.getJson(null, api_resp.ACR_OK, 'UPDATE OK', objModel, null, jsonResp => res.status(200).json(jsonResp));
  } catch(error) { api_resp.getJson(null, api_resp.ACR_ERROR, 'Error modifying prefix container', objModel, error, jsonResp => res.status(200).json(jsonResp)) }
});


/**
 * Delete a CRT prefix container.
 */
router.put('/del', 
restrictedCheck.ca_prefix,
async (req, res) => {
	try {
		// Delete prefix.
		await pkiModel.deleteCrtPrefix(req);

		// Regenerate prefixes.
		await pkiModel.applyCrtPrefixes(req,req.prefix.ca);
	
		api_resp.getJson(null, api_resp.ACR_OK, 'REMOVED OK', objModel, null, jsonResp => res.status(200).json(jsonResp));
  } catch(error) { api_resp.getJson(null, api_resp.ACR_ERROR, 'Error removing prefix container', objModel, error, jsonResp => res.status(200).json(jsonResp)) }
});


// API call for check deleting restrictions.
router.put('/restricted',
	restrictedCheck.ca_prefix,
	(req, res) => api_resp.getJson(null, api_resp.ACR_OK, '', objModel, null, jsonResp => res.status(200).json(jsonResp)));


module.exports = router;