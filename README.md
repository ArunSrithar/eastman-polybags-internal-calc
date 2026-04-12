# Eastman Polybags — Internal Quote Calculator

Internal quote calculator for Eastman Polybags. Generates customer quotes based on daily fluctuating rates.

## Stack

- React 18 + Vite + Tailwind CSS v4
- Node.js + Express + MongoDB (Phase 3)

## Calculators

1. Gravure Rate Calculator
2. Flexo Rate Calculator
3. Job Cost Calculator

## Development

See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for full architecture, coding conventions, and development guide.

```bash
cd client && npm run dev
```

## Recent Implementation Changes

### Flexo Settings Storage Migration

- Flexo settings persistence moved from local JSON file storage to MongoDB collections.
- Added dedicated Flexo models:
	- `server/models/FlexoMaterial.js`
	- `server/models/FlexoConversionRate.js`
	- `server/models/FlexoPrintingRate.js`
	- `server/models/FlexoGussetRate.js`
	- `server/models/FlexoCuttingRate.js`
	- `server/models/FlexoChargeRate.js`
	- `server/models/FlexoRollSizeRate.js`
- Replaced file-based Flexo service logic with MongoDB-backed service operations.
- Updated Flexo controllers to async/await for MongoDB service calls.
- Removed file-based cover-size validation; dynamic resource checks now happen in service layer.
- Deleted obsolete file-storage artifacts:
	- `server/utils/fileStore.js`
	- `server/config/paths.js`
	- `server/data/flexo-settings.json`

### Reset DB Enhancements

- Added scoped reset modes in `server/scripts/resetDb.js`:
	- Gravure only
	- Flexo only
	- Both
- Added npm scripts:
	- `npm run dev:reset-db:gravure`
	- `npm run dev:reset-db:flexo`
	- `npm run dev:reset-db` (both)
- Flexo reset now clears histories and removes row entries for:
	- Printing cover sizes
	- Gusset rows
	- Cutting sizes
	- Roll-size rows
