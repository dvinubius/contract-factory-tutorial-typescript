import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { Button, Popover } from 'antd';
import { useSignerAddress } from 'eth-hooks';
import { useEthersContext, useBlockNumberContext } from 'eth-hooks/context';
import { TCreateEthersModalConnector } from 'eth-hooks/models';
import { Signer } from 'ethers';
import React, { FC, ReactElement, useState } from 'react';
import { useThemeSwitcher } from 'react-css-theme-switcher';
import invariant from 'ts-invariant';
import { useDebounce } from 'use-debounce';
import { useIsMounted } from 'usehooks-ts';
import { useWindowWidth } from '@react-hook/window-size';

import { Address, Balance, Wallet } from '.';
import { remToPx } from '../../helpers/layoutCalc';
import { UserOutlined } from '@ant-design/icons';

export interface IAccountProps {
  ensProvider: StaticJsonRpcProvider | undefined;
  localProvider?: StaticJsonRpcProvider | undefined;
  createLoginConnector?: TCreateEthersModalConnector;
  address?: string;
  /**
   * if hasContextConnect is true, it will not use this variable
   */
  signer?: Signer;
  /**
   * if hasContextConnect = false, do not use context or context connect/login/logout.  only used passed in address.  defaults={false}
   */
  hasContextConnect: boolean;
  fontSize?: number;
  blockExplorer: string;
  price: number;
  largeLogInOut?: boolean;
  breakPointCompress?: number;
  connectedNetworkDisplay?: ReactElement;
  hideWallet?: boolean;
}

/**
  Displays an Address, Balance, and Wallet as one Account component,
  also allows users to log in to existing accounts and log out

    ~ Features ~
  - Provide address={address} and get balance corresponding to the given address
  - Provide localProvider={localProvider} to access balance on local network
  - Provide userProvider={userProvider} to display a wallet
  - Provide mainnetProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide web3Modal={web3Modal}, loadWeb3Modal={loadWeb3Modal}, logoutOfWeb3Modal={logoutOfWeb3Modal}
              to be able to log in/log out to/from existing accounts
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
 * @param props
 * @returns (FC)
 */
export const Account: FC<IAccountProps> = (props: IAccountProps) => {
  const blockNumber = useBlockNumberContext();
  const ethersContext = useEthersContext();
  const showLoadModal = !ethersContext.active;
  const [connecting, setConnecting] = useState(false);

  const isMounted = useIsMounted();
  const [loadingButton, loadingButtonDebounce] = useDebounce(connecting, 1000, {
    maxWait: 1500,
  });

  if (loadingButton && connecting) {
    setConnecting(false);
  }

  const [signerAddress] = useSignerAddress(props.signer);
  const address = props.address ?? signerAddress;
  // if hasContextConnect = false, do not use context or context connect/login/logout.  only used passed in address
  const [resolvedAddress] = useDebounce<string | undefined>(
    props.hasContextConnect ? ethersContext.account : address,
    200,
    {
      trailing: true,
    }
  );

  const [resolvedSigner] = useDebounce<Signer | undefined>(
    props.hasContextConnect ? ethersContext.signer : props.signer,
    200,
    {
      trailing: true,
    }
  );

  const handleLoginClick = (): void => {
    if (props.createLoginConnector != null) {
      const connector = props.createLoginConnector?.();
      if (!isMounted()) {
        invariant.log('openModal: no longer mounted');
      } else if (connector) {
        setConnecting(true);
        ethersContext.openModal(connector);
      } else {
        invariant.warn('openModal: A valid EthersModalConnector was not provided');
      }
    }
  };

  const loadModalButton = (
    <>
      {showLoadModal && props.createLoginConnector && (
        <Button
          loading={loadingButtonDebounce.isPending()}
          key="loginbutton"
          shape="round"
          size={props.largeLogInOut ? 'large' : 'middle'}
          onClick={handleLoginClick}>
          connect
        </Button>
      )}
    </>
  );

  const logoutButton = (
    <>
      {!showLoadModal && props.createLoginConnector && (
        <Button
          key="logoutbutton"
          shape="round"
          size={props.largeLogInOut ? 'large' : 'middle'}
          onClick={ethersContext.disconnectModal}>
          logout
        </Button>
      )}
    </>
  );

  const { currentTheme } = useThemeSwitcher();

  const fullDisplay = (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {resolvedAddress != null && (
        <>
          <Address
            address={resolvedAddress}
            fontSize={props.fontSize ?? 18}
            ensProvider={props.ensProvider}
            blockExplorer={props.blockExplorer}
            minimized={false}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}>
            <Balance
              address={resolvedAddress}
              price={props.price}
              fontSize={remToPx(1.125)}
              padding=".25rem 0 .25rem .5rem"
            />
            {resolvedSigner && !props.hideWallet && (
              <Wallet
                fontSize={remToPx(1.5)}
                modalFontSize={remToPx(1.25)}
                signer={resolvedSigner}
                ensProvider={props.ensProvider}
                localProvider={props.localProvider}
                price={props.price}
                color={currentTheme === 'light' ? '#1890ff' : '#2caad9'}
              />
            )}
          </div>
        </>
      )}
    </div>
  );

  const isSmallScreen = useWindowWidth() < (props.breakPointCompress ?? 0);
  const display = isSmallScreen ? (
    <Popover content={fullDisplay} trigger="click">
      <Button style={{ display: 'flex', alignItems: 'center' }}>
        <UserOutlined />
      </Button>
    </Popover>
  ) : (
    fullDisplay
  );

  const currentNetwork = props.connectedNetworkDisplay && (
    <div style={{ marginRight: '-0.5rem' }}>{props.connectedNetworkDisplay}</div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {display}
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
        {currentNetwork}
        {props.hasContextConnect && (
          <>
            {loadModalButton}
            {logoutButton}
          </>
        )}
      </div>
    </div>
  );
};
