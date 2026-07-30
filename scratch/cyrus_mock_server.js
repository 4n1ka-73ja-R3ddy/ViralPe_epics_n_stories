/**
 * Standalone Cyrus Recharge Mock API Server
 * Reference Spec: cyrus_recharge_mock_spec.md
 * Supports: PREPAID, POSTPAID, DTH, FASTAG, UTILITY
 * 2-in-10 Rule: Requests % 10 == 3 or 7 fail with HTTP 400 to test wallet reversal logic.
 * Override Triggers: amount == 99 (PENDING 201), amount == 404 (FAILURE 400), amount == 200 (SUCCESS 200)
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 9090;

let requestCount = 0;
let successCount = 0;
let failureCount = 0;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // A. Bill Fetch Endpoint (POST /api/bill-fetch)
  if (pathname === '/api/bill-fetch' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const accountId = payload.account_id || '1002938481';
        const operatorCode = payload.operator_code || 'BESCOM';
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'SUCCESS',
          response_code: 200,
          data: {
            account_id: accountId,
            customer_name: 'John Doe',
            bill_amount: 1250.00,
            due_date: '2026-08-15',
            bill_number: 'BILL_' + Math.floor(10000 + Math.random() * 90000),
            biller_name: 'State Electricity Board (' + operatorCode + ')'
          }
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'FAILURE', message: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // B. Transaction / Recharge Endpoint (POST & GET /api/recharge)
  if (pathname === '/api/recharge') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let payload = {};
      try {
        if (body) payload = JSON.parse(body);
      } catch (e) {
        payload = parsedUrl.query;
      }

      requestCount++;
      const amount = parseFloat(payload.amount || parsedUrl.query.amount || '299');
      const clientOrderId = payload.client_order_id || parsedUrl.query.client_order_id || 'ORD_' + Date.now();
      const serviceType = (payload.service_type || parsedUrl.query.service_type || 'PREPAID').toUpperCase();

      // Deterministic Override Triggers
      if (amount === 99) {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          status: 'PENDING',
          response_code: 201,
          message: 'Transaction is pending operator confirmation',
          data: { client_order_id: clientOrderId, txnid: 'CYRUS_PENDING_' + Date.now(), service_type: serviceType, amount }
        }));
      }

      if (amount === 404) {
        failureCount++;
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          status: 'FAILURE',
          response_code: 400,
          message: 'Operator Connection Timed Out (Deterministic Override)',
          data: { client_order_id: clientOrderId, txnid: 'CYRUS_FAIL_' + Date.now(), service_type: serviceType, amount, error_code: 'ERR_OPERATOR_DOWN' }
        }));
      }

      if (amount === 200) {
        successCount++;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          status: 'SUCCESS',
          response_code: 200,
          message: 'Transaction Processed Successfully (Deterministic Override)',
          data: { client_order_id: clientOrderId, txnid: 'CYRUS_SUCCESS_' + Date.now(), operator_ref: 'REF' + Date.now(), service_type: serviceType, amount, remaining_balance: 15200.0 }
        }));
      }

      // 2-in-10 Rule Logic: Request count % 10 == 3 or 7 fails with HTTP 400
      const modulo = requestCount % 10;
      if (modulo === 3 || modulo === 7) {
        failureCount++;
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          status: 'FAILURE',
          response_code: 400,
          message: 'Operator Connection Timed Out',
          data: { client_order_id: clientOrderId, txnid: 'CYRUS_FAIL_' + Date.now(), service_type: serviceType, amount, error_code: 'ERR_OPERATOR_DOWN' }
        }));
      }

      // 80% Success Rate
      successCount++;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'SUCCESS',
        response_code: 200,
        message: 'Transaction Processed Successfully',
        data: { client_order_id: clientOrderId, txnid: 'CYRUS_SUCCESS_' + Date.now(), operator_ref: 'REF' + Date.now(), service_type: serviceType, amount, remaining_balance: 15200.0 }
      }));
    });
    return;
  }

  // C. Status Query Endpoint (GET /api/status)
  if (pathname === '/api/status' && method === 'GET') {
    const clientOrderId = parsedUrl.query.client_order_id || parsedUrl.query.txnid || 'ORD_10091';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'SUCCESS',
      response_code: 200,
      message: 'Transaction completed',
      data: { client_order_id: clientOrderId, txnid: 'CYRUS_SUCCESS_9918', status: 'SUCCESS', amount: 299 }
    }));
    return;
  }

  // D. Stats
  if (pathname === '/api/cyrus/mock-stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalRequests: requestCount,
      successCount,
      failureCount,
      currentModulo: requestCount % 10
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found on Cyrus Mock API Server' }));
});

server.listen(PORT, () => {
  console.log(`🚀 Cyrus Recharge Mock API Server running on port ${PORT}`);
});
