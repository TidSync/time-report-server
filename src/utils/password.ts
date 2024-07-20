import { compareSync, hashSync } from 'bcrypt';

const SALT_SIZE = 10;

export const encryptPassword = (password: string) => {
  return hashSync(password, SALT_SIZE);
};

export const isPasswordCorrect = (userPassword: string, dbPassword: string) => {
  return compareSync(userPassword, dbPassword);
};
