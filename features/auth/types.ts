import { UserSummaryDto } from "@/types/domain/users";

export type AuthCredentialsInput = {
  login: string;
  password: string;
};

export type RegisterInput = {
  firstName: string;
  lastName: string;
  document: string;
  birthDate: string;
  password: string;
  phone?: string;
  email?: string;
};

export type AuthSuccessResponse = {
  accessToken: string;
  user: UserSummaryDto;
};
