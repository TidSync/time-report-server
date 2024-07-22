import { compareSync, hashSync } from 'bcrypt';

const SALT_SIZE = 10;

export const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export const encryptPassword = (password: string) => {
  return hashSync(password, SALT_SIZE);
};

export const isPasswordCorrect = (userPassword: string, dbPassword: string) => {
  return compareSync(userPassword, dbPassword);
};
