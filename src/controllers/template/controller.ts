import { FastifyReply, FastifyRequest } from 'fastify';
import cassandra from 'cassandra-driver';
import fs from 'fs';
import Logger from '../../utils/logger';

function defaultRoute(req: FastifyRequest, res: FastifyReply): void {
  res.send('Hello World From template');
}

function helloRoute(
  req: FastifyRequest<{ Params: { name: string } }>,
  res: FastifyReply
): void {
  res.send(`Hello Mr ${req.params.name}`);
}
function StopWatch(timer: any) {
  const t0 = timer.time();
  const t0s = getDecimalSeconds(t0); //?
  return t0s;
}

function getDecimalSeconds(t0: any) {
  return t0.s + t0.ms / 1000 + t0.us / 1000000; //+ t0.ns / 1000000000
}

function getKeyspaceRows(
  req: FastifyRequest<{ Params: { kstable: string } }>,
  res: FastifyReply
): void {
  const auth = new cassandra.auth.PlainTextAuthProvider(
    'keyspaces-integration-at-223862113697',
    '2pCTHCqccQOv80oj39xmVfXxlCO3FJGyvp/PS4advFk='
  );
  const sslOptions1 = {
    ca: [fs.readFileSync('/Users/hwindhoff/sf-class2-root.crt', 'utf-8')],
    host: 'cassandra.us-east-1.amazonaws.com',
    rejectUnauthorized: true,
  };
  const client = new cassandra.Client({
    contactPoints: ['cassandra.us-east-1.amazonaws.com'],
    localDataCenter: 'us-east-1',
    authProvider: auth,
    sslOptions: sslOptions1,
    protocolOptions: { port: 9142 },
  });
  const whereClause = "username = 'eplanning' AND domain = 'pugliain.net'";
  const query = `SELECT requests FROM ${req.params.kstable} WHERE ${whereClause} LIMIT 1000`;

  const NS_PER_SEC = 1e9;
  const time = process.hrtime();

  client
    .execute(query)
    .then((result) => {
      const diff = process.hrtime(time);
      const elapsed = (diff[0] * NS_PER_SEC + diff[1]) / NS_PER_SEC;

      const resultCount = result.rows.length;
      res.send(
        `${result.rows
          .map((row, i) => {
            return row.requests as number;
          })
          .reduce((p, c) => {
            return p + c;
          }, 0)
          .toString()} requests for [${whereClause}], query took  ${elapsed}s for ${resultCount} result rows`
      );
    })
    .catch((e) => {
      console.log(`${e}`);
    })
    .finally(() => {});
}

export default {
  defaultRoute,
  helloRoute,
  getKeyspaceRows,
};
