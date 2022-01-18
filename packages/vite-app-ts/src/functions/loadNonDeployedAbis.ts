const nonDeployedContracts = import('../generated/injectable-abis/hardhat_non_deployed_contracts.json');

export const loadNonDeployedContractAbi = async (contractName: string): Promise<Record<string, any>[] | null> => {
  const all = (await nonDeployedContracts) as any;
  return !!all ? (all[contractName] as Record<string, any>[]) : null;
};
