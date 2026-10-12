export type AuthScope=
  | 'platform'
  | 'agency';

export interface AuthContextI {
  userId: string;
  sessionId: string;
  membershipId: string;

  scope: AuthScope;
  agencyId: string | null;

  roleKeys: string[];
  permissionKeys: string[];

  centralSuperUser: boolean;
}

export interface AuthLoginI {
  login: string;
  password: string;
}

export interface AuthTokenI {
  accessToken: string;
  expiresIn: number;
  auth: AuthContextI;
}

export interface AuthContactI {
  id: string;
  type: string;
  label: string | null;
  value: string;
  primary: boolean;
  verified: boolean;
  public: boolean;
}

export interface AuthAddressI {
  id: string;
  type: string;
  label: string | null;
  country: string;
  province: string | null;
  city: string;
  commune: string | null;
  district: string | null;
  avenue: string | null;
  number: string | null;
  postalCode: string | null;
  primary: boolean;
}

export interface AuthUserI {
  id: string;
  name: string;

  firstName: string;
  lastName: string;
  surName: string | null;

  keyAccess: string;
  imageUrl: string | null;

  contacts: AuthContactI[];
  addresses: AuthAddressI[];

  language: string;
  timezone: string;

  dataSources: unknown[];

  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthMeI {
  user: AuthUserI;
  auth: AuthContextI;
}