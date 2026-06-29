import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

type PoolScope = {
  pool: Pool;
  dispose: () => Promise<void>;
};

function getHyperdriveConnectionString() {
  try {
    const { env } = getCloudflareContext();
    return (env as { HYPERDRIVE?: { connectionString?: string } }).HYPERDRIVE?.connectionString;
  } catch {
    return undefined;
  }
}

function getConnectionConfig() {
  const hyperdriveUrl = getHyperdriveConnectionString();
  if (hyperdriveUrl) {
    return { connectionString: hyperdriveUrl, hyperdrive: true };
  }

  const connectionString =
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    throw new Error(
      "Falta la cadena de conexion a la base de datos. Define SUPABASE_DB_URL en local o configura el binding HYPERDRIVE en Cloudflare."
    );
  }

  return { connectionString, hyperdrive: false };
}

const globalForPg = globalThis as unknown as { __msTrenzasPgPool?: Pool };

function createPoolScope(): PoolScope {
  const { connectionString, hyperdrive } = getConnectionConfig();

  if (hyperdrive) {
    const pool = new Pool({
      connectionString,
      max: 1,
      maxUses: 1,
      idleTimeoutMillis: 1_000,
      connectionTimeoutMillis: 15_000
    });

    return {
      pool,
      dispose: () => pool.end()
    };
  }

  if (!globalForPg.__msTrenzasPgPool) {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX || 3),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000
    });

    pool.on("error", (error) => {
      console.error("Error inesperado en el pool de Postgres", error);
    });

    globalForPg.__msTrenzasPgPool = pool;
  }

  return {
    pool: globalForPg.__msTrenzasPgPool,
    dispose: async () => undefined
  };
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const { pool, dispose } = createPoolScope();
  try {
    const result = await pool.query<T>(text, params as unknown[]);
    return result.rows;
  } finally {
    await dispose();
  }
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | undefined> {
  const { pool, dispose } = createPoolScope();
  try {
    const result = await pool.query<T>(text, params as unknown[]);
    return result.rows[0];
  } finally {
    await dispose();
  }
}

export async function execute(text: string, params: unknown[] = []): Promise<number> {
  const { pool, dispose } = createPoolScope();
  try {
    const result = await pool.query(text, params as unknown[]);
    return result.rowCount ?? 0;
  } finally {
    await dispose();
  }
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const { pool, dispose } = createPoolScope();
  const client = await pool.connect();
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
    await dispose();
  }
}
