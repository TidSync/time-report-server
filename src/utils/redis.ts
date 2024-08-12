import { createClient } from 'redis';

export const redisClient = createClient({
  socket: { reconnectStrategy: () => 15000 },
})
  .on('connect', () => console.log('Redis Client connect', new Date().toJSON()))
  .on('ready', () => console.log('Redis Client ready', new Date().toJSON()))
  .on('error', (err) => console.error('Redis Client error', err, new Date().toJSON()));

const DEFAULT_EXPIRE_TIME = 60 * 15;

const isClientConnected = () => {
  if (!redisClient.isReady) {
    return false;
  }

  return true;
};

const getDataByString = async <T>(key: string, callback: () => Promise<T>) => {
  const stringifiedData = await redisClient.get(key);

  if (stringifiedData !== null) {
    return JSON.parse(stringifiedData) as T;
  }

  const data = await callback();

  redisClient.setEx(key, DEFAULT_EXPIRE_TIME, JSON.stringify(data));

  return data;
};

const getDataByObjectKeys = async <T>(
  keyData: { [key: string]: string },
  callback: () => Promise<T>,
) => {
  const objectEntries = Object.entries(keyData);

  const promises = await Promise.all(objectEntries.map((item) => redisClient.get(item[1])));

  const result = new Map();

  for (let i = 0; i < promises.length; i++) {
    const item = promises[i];

    if (item === null) {
      const data = (await callback()) as any;

      await Promise.all(
        objectEntries.map(async (entry) => {
          if (entry[0] in data) {
            await redisClient.setEx(entry[1], DEFAULT_EXPIRE_TIME, JSON.stringify(data[entry[0]]));
          }

          return Promise.resolve();
        }),
      );

      return data as T;
    }

    result.set(objectEntries[i][0], JSON.parse(item));
  }

  return Object.fromEntries(result.entries()) as T;
};

export const getOrSetRedisData = async <T>(
  keyData: string | { [key: string]: string },
  callback: () => Promise<T>,
) => {
  if (!isClientConnected()) {
    return callback();
  }

  if (typeof keyData === 'string') {
    return getDataByString(keyData, callback);
  }

  return getDataByObjectKeys(keyData, callback);
};

const parseKeyList = (list: string[], data: any) => {
  return list.reduce((acc, cV) => {
    if (acc.length > 0) {
      acc += ':';
    }

    if (cV.startsWith('$')) {
      return `${acc}${data[cV.substring(1)]}`;
    }

    return `${acc}${cV}`;
  }, '');
};

export const setRedisData = async <T>(keyList: string[], callback: () => Promise<T>) => {
  const data = await callback();

  if (data && isClientConnected()) {
    const key = parseKeyList(keyList, data);

    await redisClient.setEx(key, DEFAULT_EXPIRE_TIME, JSON.stringify(data));
  }

  return data;
};

export const deleteRedisData = async (key: string | string[]) => {
  if (isClientConnected()) {
    return redisClient.del(Array.isArray(key) ? key : [key]);
  }

  return null;
};

export const addRedisArrayData = async <T>(redisKey: string, data: T) => {
  if (!isClientConnected()) {
    return;
  }

  const redisData = await redisClient.get(redisKey);

  if (!redisData) {
    return;
  }

  const parsedData = JSON.parse(redisData) as any[];

  redisClient.setEx(redisKey, DEFAULT_EXPIRE_TIME, JSON.stringify([data, ...parsedData]));
};

export const addBulkRedisArrayData = async <T>(redisKey: string, data: T[]) => {
  if (!isClientConnected()) {
    return;
  }

  const redisData = await redisClient.get(redisKey);

  if (!redisData) {
    return;
  }

  const parsedData = JSON.parse(redisData) as any[];

  await redisClient.setEx(redisKey, DEFAULT_EXPIRE_TIME, JSON.stringify([...data, ...parsedData]));
};

export const updateRedisArrayData = async <T>(
  redisKey: string,
  criteria: { [key: string]: any },
  callback: () => Promise<T>,
) => {
  const updateData = await callback();

  if (!isClientConnected()) {
    return updateData;
  }

  const redisData = await redisClient.get(redisKey);

  if (!redisData) {
    return updateData;
  }

  const parsedData = JSON.parse(redisData) as any[];

  redisClient.setEx(
    redisKey,
    DEFAULT_EXPIRE_TIME,
    JSON.stringify(
      parsedData.map((item) =>
        item[Object.keys(criteria)[0]] === Object.values(criteria)[0] ? updateData : item,
      ),
    ),
  );

  return updateData;
};

export const updateBulkRedisArrayData = async <T>(
  redisKey: string,
  criteriaKey: string,
  dataList: T[],
) => {
  if (!isClientConnected()) {
    return dataList;
  }

  const redisData = await redisClient.get(redisKey);

  if (!redisData) {
    return dataList;
  }

  const parsedData = JSON.parse(redisData) as any[];
  const updatedData = parsedData.map((item) => {
    const dataListItem = dataList.find((dlItem: any) => item[criteriaKey] === dlItem[criteriaKey]);

    return dataListItem ?? item;
  });

  redisClient.setEx(redisKey, DEFAULT_EXPIRE_TIME, JSON.stringify(updatedData));
};

export const deleteRedisArrayData = async (
  redisKey: string,
  criteria: { [key: string]: any[] },
) => {
  if (!isClientConnected()) {
    return;
  }

  const redisData = await redisClient.get(redisKey);

  if (!redisData) {
    return;
  }

  const parsedData = JSON.parse(redisData) as any[];
  const filteredData = parsedData.filter((item) => {
    return !Object.values(criteria)[0].includes(item[Object.keys(criteria)[0]]);
  });

  return redisClient.setEx(redisKey, DEFAULT_EXPIRE_TIME, JSON.stringify(filteredData));
};
