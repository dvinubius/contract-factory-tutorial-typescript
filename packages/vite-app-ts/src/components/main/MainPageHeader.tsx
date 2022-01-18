import { Account } from '~~/eth-components/ant';
import { getNetwork } from '@ethersproject/networks';
import { Alert, PageHeader } from 'antd';
import React, { FC, ReactElement } from 'react';
import { FaucetHintButton } from '~~/components/common/FaucetHintButton';
import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { useEthersContext } from 'eth-hooks/context';
import { useGasPrice } from 'eth-hooks';
import { getNetworkInfo } from '~~/functions';
import { breakPointAccountDisplayMinimize, swapGradient } from '~~/styles/styles';

// displays a page header
export interface IMainPageHeaderProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  price: number;
}

/**
 * ✏ Header: Edit the header and change the title to your project name.  Your account is on the right *
 * @param props
 * @returns
 */
export const MainPageHeader: FC<IMainPageHeaderProps> = (props) => {
  const ethersContext = useEthersContext();
  const selectedChainId = ethersContext.chainId;

  // 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast', getNetworkInfo(ethersContext.chainId));

  /**
   * this shows the page header and other informaiton
   */
  const left = (
    <>
      <div
        style={{
          borderRight: '1px solid #efefef',
          borderBottom: '1px solid #efefef',
          background: swapGradient,
        }}>
        <PageHeader
          title="🏗 Scaffold-Eth"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', height: '57px', padding: '1rem' }}
          subTitle={<span> Factory &amp; Contract Manager</span>}
        />
      </div>
      {props.children}
    </>
  );

  /**
   * display the current network on the top left
   */
  let networkDisplay: ReactElement | undefined;
  if (selectedChainId && selectedChainId != props.scaffoldAppProviders.targetNetwork.chainId) {
    const description = (
      <div>
        <p style={{ margin: 0 }}>
          You have <b>{getNetwork(selectedChainId)?.name}</b> selected
        </p>
        <p style={{ margin: 0 }}>
          You need to be on <b>{getNetwork(props.scaffoldAppProviders.targetNetwork)?.name ?? 'UNKNOWN'}</b>
        </p>
      </div>
    );
    networkDisplay = (
      <div
        style={{ zIndex: 2, position: 'absolute', right: 0, top: 60, padding: 16, textAlign: 'left', width: '22rem' }}>
        <Alert message="⚠️ Wrong Network" description={description} type="error" closable={false} />
      </div>
    );
  } else {
    networkDisplay = (
      <div
        style={{
          fontSize: '0.875rem',
          padding: '0.125rem 1rem 0.125rem 0.75rem',
          backgroundColor: 'hsla(0,0%,100%, 0.9)',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          color: 'rgb(24, 144, 255)',
          borderTop: '1px solid #ccc',
          borderLeft: '1px solid #ccc',
          borderBottom: '1px solid #ccc',
        }}>
        {props.scaffoldAppProviders.targetNetwork.name}
      </div>
    );
  }

  /**
   * 👨‍💼 Your account is in the top right with a wallet at connect options
   */
  const right = (
    <div
      className="flex-h-reg"
      style={{
        position: 'fixed',
        textAlign: 'right',
        right: 0,
        top: 0,
        zIndex: 1,
        padding: '0.5rem 1rem',
        height: 58,
      }}>
      <Account
        createLoginConnector={props.scaffoldAppProviders.createLoginConnector}
        ensProvider={props.scaffoldAppProviders.mainnetAdaptor?.provider}
        price={props.price}
        blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
        hasContextConnect={true}
        connectedNetworkDisplay={networkDisplay}
        breakPointCompress={breakPointAccountDisplayMinimize}
      />
      <FaucetHintButton scaffoldAppProviders={props.scaffoldAppProviders} gasPrice={gasPrice} />
      {props.children}
    </div>
  );

  return (
    <>
      {left}
      {right}
    </>
  );
};
