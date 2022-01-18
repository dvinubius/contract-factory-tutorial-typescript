import { Button, Card, Divider, Spin } from 'antd';
import { transactor } from '~~/eth-components/functions';
import { EthComponentsSettingsContext } from '~~/eth-components/models';
import { useContractLoader, useContractReader, useGasPrice } from 'eth-hooks';
import { contractsContextFactory, useEthersContext } from 'eth-hooks/context';

import React, { FC, useContext, useState } from 'react';
import { LayoutContext } from '~~/MainPage';
import { InnerAppContext } from '../../../MainPage';

import { BaseContract, ethers } from 'ethers';
import { TAppContractTypes } from '~~/config/contractContext';
import { asEthersAdaptor } from 'eth-hooks/functions';
import { cardGradient, mainColWidthLarge, mainColWidthSmall, primaryColor } from '~~/styles/styles';
import { Address } from '~~/eth-components/ant';
import { remToPx } from '~~/helpers/layoutCalc';
import { EventsDisplay } from './EventsDisplay';

// TODO actual types
export interface IYourContractProps {
  contract: any | undefined;
}

const YourContract: FC<IYourContractProps> = ({ contract }) => {
  const ethersContext = useEthersContext();

  const { widthAboveContractItemFit } = useContext(LayoutContext);

  const signer = ethersContext.signer;
  const address = ethersContext.account ?? '';

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const { injectableAbis } = useContext(InnerAppContext);
  const abi = injectableAbis?.YourContract;

  // const yourContractRaw: TAppContractTypes<'YourContract'> | undefined =
  //   abi &&
  //   (new BaseContract(
  //     contract.address,
  //     abi,
  //     asEthersAdaptor(ethersContext).provider
  //   ) as TAppContractTypes<'YourContract'>);
  const yourContractRaw: any | undefined =
    abi && (new BaseContract(contract.address, abi, asEthersAdaptor(ethersContext).provider) as any);
  const yourContract = signer ? yourContractRaw?.connect(signer) : yourContractRaw;

  const [purpose] = useContractReader(
    yourContract,
    yourContract?.purpose,
    [],
    yourContract?.filters.SetPurpose() // our local state "purpose" will be updated after the contract fires the SetPurpose event
  );

  // if you don't want to use events for the update, leave the last position empty.
  // Then it will update on each block:
  // const [purpose] = useContractReader(yourContract, yourContract?.purpose, []);

  const [pendingPurposeChange, setPendingPurposeChange] = useState(false);

  // DISPLAY ONLY WHEN ALL LOADED for consistency

  // besides "purpose" you can put in any UI state that needs to be initialized from on-chain contract state
  const essentialState = [purpose];
  const readyAll = essentialState.map((el) => typeof el !== 'undefined').reduce((acc, el) => acc && el);

  // HACKY HACKY
  // comes in handy if, after certain actions, UI doesn't update automatically
  // use with caution
  const [, updateState] = React.useState<any>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  return (
    <div>
      <Card
        style={{
          width: '100%',
          maxWidth: widthAboveContractItemFit ? mainColWidthLarge : mainColWidthSmall,
          margin: '0 auto',
          background: cardGradient,
        }}
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              alignSelf: 'center',
              width: '100%',
            }}>
            <div style={{ fontSize: '1.25rem' }}>{contract.name}</div>

            <Address fontSize={remToPx(1.25)} address={contract.address} />
          </div>
        }>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Show Spinner until all your essential contract state is loaded */}
          {!readyAll && (
            <div
              style={{
                height: '30vh',
                margin: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Spin size="large" />
            </div>
          )}
          {readyAll && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}>
              <div style={{ fontSize: '1rem' }}>
                Purpose: <span style={{ color: primaryColor }}>{purpose}</span>
              </div>
              {['🧑‍💻 Code 24/7', '🧘‍♀️ Relax'].map((purpose) => (
                <Button
                  key={purpose}
                  size="middle"
                  disabled={!signer}
                  loading={pendingPurposeChange}
                  type="default"
                  onClick={() => {
                    setPendingPurposeChange(true);
                    tx?.(yourContract?.setPurpose(purpose), (update) => {
                      if (update && (update.error || update.reason)) {
                        setPendingPurposeChange(false);
                      }
                      if (update && (update.status === 'confirmed' || update.status === 1)) {
                        setPendingPurposeChange(false);
                        forceUpdate();
                      }
                      if (update && update.code) {
                        // metamask error
                        // may be that user denied transaction, but also actual errors
                        // handle them particularly if you need to
                        // https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
                        setPendingPurposeChange(false);
                      }
                    });
                  }}>
                  {`Change to ${purpose}`}
                </Button>
              ))}
            </div>
          )}
          <Divider />
          {/* <EventsDisplay contract={yourContract} eventName="SetPurpose" /> */}
        </div>
      </Card>
    </div>
  );
};

export default YourContract;
