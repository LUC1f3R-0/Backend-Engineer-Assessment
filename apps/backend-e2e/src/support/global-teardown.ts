import { killPort } from '@nx/node/utils';

/* eslint-disable */

module.exports = async function () {
  console.log(globalThis.__TEARDOWN_MESSAGE__);

  const port = process.env.PORT ? Number(process.env.PORT) : 8080;
  await killPort(port);
};
