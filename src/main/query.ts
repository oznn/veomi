import { Database } from 'sqlite3';

export default function f(db: Database, q: string, vals: string[]) {
  const stmt = db.prepare(q);

  return new Promise((resolve, reject) => {
    stmt.all(...vals, (err: Error, res: Response) => {
      if (err) return reject(err.message);
      return resolve(res);
    });
  });
}
