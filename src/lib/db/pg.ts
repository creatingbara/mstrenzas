import { Pool, type PoolClient, type QueryResultRow } from "pg";

/**
 * Conexión Postgres a Supabase.
 *
 * En producción (Vercel/serverless) usa el connection pooler de Supabase
 * (Supavisor, puerto 6543, modo "transaction"). La cadena de conexión se toma
 * de SUPABASE_DB_URL (o DATABASE_URL / POSTGRES_URL como respaldo).
 *
 * Todo el acceso a datos ocurre en el servidor (route handlers y server
 * components), por lo que esta conexión privilegiada nunca llega al cliente.
 */

function getConnectionString() {
  const url =
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!url) {
    throw new Error(
      "Falta la cadena de conexión a la base de datos. Define SUPABASE_DB_URL (connection pooler de Supabase) en las variables de entorno."
    );
  }

  return url;
}

// Reutiliza el pool entre invocaciones del mismo proceso/lambda.
const globalForPg = globalThis as unknown as { __msTrenzasPgPool?: Pool };

function getPool(): Pool {
  if (globalForPg.__msTrenzasPgPool) return globalForPg.__msTrenzasPgPool;

  const pool = new Pool({
    connectionString: getConnectionString(),
    // Supabase requiere SSL; el pooler usa un certificado que no validamos a fondo.
    ssl: { rejectUnauthorized: false },
    // En serverless conviene un pool pequeño y conexiones que se reciclan rápido.
    max: Number(process.env.PG_POOL_MAX || 3),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000
  });

  pool.on("error", (error) => {
    console.error("Error inesperado en el pool de Postgres", error);
  });

  globalForPg.__msTrenzasPgPool = pool;
  return pool;
}

/** Ejecuta una consulta y devuelve todas las filas. */
export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query<T>(text, params as unknown[]);
  return result.rows;
}

/** Ejecuta una consulta y devuelve la primera fila (o undefined). */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const result = await getPool().query<T>(text, params as unknown[]);
  return result.rows[0];
}

/** Ejecuta una consulta sin necesidad de resultado; devuelve el número de filas afectadas. */
export async function execute(text: string, params: unknown[] = []): Promise<number> {
  const result = await getPool().query(text, params as unknown[]);
  return result.rowCount ?? 0;
}

/**
 * Ejecuta un bloque de operaciones dentro de una transacción.
 * El callback recibe un cliente dedicado; usa client.query(...).
 */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
