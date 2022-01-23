/**
 * {
 *    YourUserCreatedContract1 : abiOfYourUserCreatedContract1,
 *    YourUserCreatedContract2 : abiOfYourUserCreatedContract2,
 *    ...
 * }
 */
export type InjectableAbis = Record<string, Record<string, any>[]>;
