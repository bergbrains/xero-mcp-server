import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Account, AccountType } from "xero-node";
import { getClientHeaders } from "../helpers/get-client-headers.js";

async function createAccount(
  code: string,
  name: string,
  type: AccountType,
  description?: string,
  taxType?: string,
  enablePaymentsToAccount?: boolean,
): Promise<Account | undefined> {
  await xeroClient.authenticate();

  const account: Account = {
    code,
    name,
    type,
    description,
    taxType,
    enablePaymentsToAccount,
  };

  const response = await xeroClient.accountingApi.createAccount(
    xeroClient.tenantId,
    account,
    undefined, // idempotencyKey
    getClientHeaders(),
  );

  return response.body.accounts?.[0];
}

/**
 * Create a new account in Xero
 */
export async function createXeroAccount(
  code: string,
  name: string,
  type: AccountType,
  description?: string,
  taxType?: string,
  enablePaymentsToAccount?: boolean,
): Promise<XeroClientResponse<Account>> {
  try {
    const createdAccount = await createAccount(
      code,
      name,
      type,
      description,
      taxType,
      enablePaymentsToAccount,
    );

    if (!createdAccount) {
      throw new Error("Account creation failed.");
    }

    return {
      result: createdAccount,
      isError: false,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
  }
}
