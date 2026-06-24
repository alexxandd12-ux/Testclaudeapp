# Label Match

Barcode part/label verification tool.

## Run locally
npm install
npm run dev

## Build for production
npm run build
# output in dist/, deploy as static site (Vercel/Netlify/any static host)

## How matching works
A scan is a MATCH if the Label barcode is found anywhere inside the Part barcode string (substring check, whitespace-insensitive). Otherwise it's a MISMATCH.

## Data
- Operator name and all scan history are stored in the browser's localStorage (per device/browser).
- History screen: filter by date range/operator, export to CSV, clear log.
