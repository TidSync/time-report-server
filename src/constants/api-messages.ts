export enum ErrorMessage {
  // auth
  USER_ALREADY_EXISTS = 'User already exists',
  USER_NOT_FOUND = 'User does not exist',
  ROLE_NOT_FOUND = 'Roles doesn not exist on this organisation',
  USER_NOT_VERIFIED = 'User not verified',
  VERIFICATION_CODE_INVALID = 'Verification code is invalid or has maybe expired',
  INCORRECT_PASSWORD = 'Incorrect password',
  EMAIL_NOT_SENT = 'Email not sent',
  UNAUTHORIZED = 'Unauthorized',
  //organisation
  ORGANISATION_NOT_FOUND = 'Organisation not found',
  USER_NOT_ORGANISATION = 'User is not part of this organisation',
  // Internal server error
  UNPROCESSABLE_ENTITY = 'Unprocessable entity',
  DATABASE_PROCESS_ERROR = 'Could not execute operation on database',
  SOMETHING_WENT_WRONG = 'Something went wrong.',
}
