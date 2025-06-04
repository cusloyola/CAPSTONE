const express = require('express');
const router = express.Router();
const {
  getSOWWorkTypes,
  softDeleteSOWWorkType,
  addSOWWorkType,
   getSOWWorkTypeById,
  updateSOWWorkType,   // <-- import the new function
} = require('../../controllers/ScopeofWorkProposal/sowWorkTypesController');

// GET all work types
router.get('/', getSOWWorkTypes);

// POST a new work type
router.post('/', addSOWWorkType);

// DELETE (soft delete) a work type by id
router.delete('/:id', softDeleteSOWWorkType);

router.get('/:id', getSOWWorkTypeById);     // GET single work type
router.put('/:id', updateSOWWorkType);      //  PUT to update

module.exports = router;
