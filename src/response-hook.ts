import { Response } from 'express';

const FIELDS_TO_EXCLUDE = [
  //user
  'password',
  'is_verified',
  'is_deleted',
  // organisation
  'customer_billing_id',
  'subscription_billing_id',
  //generic
  'created_at',
  'updated_at',
];
const isObject = (item: any) => typeof item === 'object' && item !== null;

const processData = (data: any) => {
  const objectKeys = Object.keys(data);

  for (let i = objectKeys.length - 1; i >= 0; i--) {
    const key = objectKeys[i];

    if (Array.isArray(data[key])) {
      data[key].forEach((item) => (isObject(item) ? processData(item) : null));
    } else if (isObject(data[key])) {
      processData(data[key]);
    }
  }

  FIELDS_TO_EXCLUDE.forEach((fieldToRemove) => {
    delete data[fieldToRemove];
  });
};

export const sendResponse = (res: Response, data?: object) => {
  if (data) {
    processData(data);
  }

  res.json(data);
};
