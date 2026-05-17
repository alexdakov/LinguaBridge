'use strict';

/**
 * Oracle DB connection pool (thin mode – no Oracle Instant Client needed).
 * oracledb v6+ defaults to thin mode automatically.
 *
 * A module-level pool is created once per Cloud Function cold-start and
 * reused across subsequent warm invocations.
 */

const oracledb = require('oracledb');

// Thin mode is the default in oracledb v6+; returning dates as JS Date objects.
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [];

let _pool = null;

async function getPool() {
  if (_pool) return _pool;

  _pool = await oracledb.createPool({
    user:          process.env.ORACLE_USER,
    password:      process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
    poolMin:       1,
    poolMax:       4,
    poolIncrement: 1,
    poolTimeout:   60,
  });

  return _pool;
}

/**
 * Run one SQL statement with optional bind variables.
 * autoCommit defaults to true for DML; pass { autoCommit: false } for
 * multi-step transactions you manage yourself.
 *
 * @param {string} sql
 * @param {Array|object} binds  – positional array or named-bind object
 * @param {object} opts         – oracledb execute options override
 * @returns {Promise<object>}   – oracledb result object
 */
async function execute(sql, binds = [], opts = {}) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    return await conn.execute(sql, binds, { autoCommit: true, ...opts });
  } finally {
    await conn.close();
  }
}

/**
 * Run multiple SQL statements inside a single connection with autoCommit off,
 * then commit once all succeed.  Rolls back automatically on any failure.
 *
 * @param {Array<{sql:string, binds:Array|object}>} steps
 * @returns {Promise<Array>}  – array of oracledb result objects, one per step
 */
async function executeTransaction(steps) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    const results = [];
    for (const { sql, binds = [] } of steps) {
      results.push(await conn.execute(sql, binds, { autoCommit: false }));
    }
    await conn.commit();
    return results;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.close();
  }
}

module.exports = { execute, executeTransaction };
