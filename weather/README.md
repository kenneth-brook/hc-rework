# Hamilton Weather Cache (PHP + MySQL)

This is a Hamilton-only proof build for caching Tomorrow.io map tiles behind a local PHP endpoint.

## What it does

- Supports `precipitation` and `clouds`
- Restricts requests to a fixed Hamilton County footprint at one zoom level
- Refreshes tiles on-demand when the cached copy is expired
- Serves stale tiles when upstream refresh fails
- Stores PNG files on disk under `/weather/cache/...`
- Tracks freshness metadata in MySQL
- Uses simple file locks to avoid stampedes on expired tiles

## Files

- `tile.php` - main endpoint used by Mapbox/Leaflet
- `info.php` - shows the current Hamilton footprint and tile list
- `refresh.php` - optional manual warm tool for testing only
- `setup.sql` - DB schema
- `config.php` - DB, cache, bounds, layers

## URL shape

```text
/weather/tile.php?layer=precipitation&z={z}&x={x}&y={y}
/weather/tile.php?layer=clouds&z={z}&x={x}&y={y}
```

## Setup

1. Create a MySQL database.
2. Run `setup.sql`.
3. Edit `config.php` with DB credentials.
4. Set environment variable `TOMORROW_API_KEY`.
5. Open `info.php` and confirm the tile footprint is acceptable.
6. Point your map tile source to `tile.php`.

## Notes

- This version does **not** keep history.
- This version does **not** require cron for normal operation.
- `refresh.php` exists only as a manual debug/warm option.
