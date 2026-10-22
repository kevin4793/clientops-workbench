/** 云端存储允许的字段（无手机/身份证/账号） */
export interface SecureClient {
  id: string;
  displayName: string;
  clientCode: string;
  birthdayMmDd: string;
  productName: string;
  expiryDate: string;
  amount: number;
  notes: string;
  updatedAt: string;
}

export type SecureClientInput = Omit<SecureClient, "id" | "updatedAt"> & {
  id?: string;
};
