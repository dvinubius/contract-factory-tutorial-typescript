import React, { FC } from 'react';
import { Row, Col, Button } from 'antd';
import { Ramp, ThemeSwitcher } from '~~/components/common';
import { Faucet, GasGauge } from '~~/eth-components/ant';
import { NETWORKS } from '~~/models/constants/networks';
import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { getNetworkInfo } from '~~/functions/getNetworkInfo';
import { useEthersContext } from 'eth-hooks/context';
import { getFaucetAvailable } from '~~/components/common/FaucetHintButton';

export interface IMainPageFooterProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  price: number;
}

/**
 * 🗺 Footer: Extra UI like gas price, eth price, faucet, and support:
 * @param props
 * @returns
 */
export const MainPageFooter: FC<IMainPageFooterProps> = (props) => {
  const ethersContext = useEthersContext();

  // Faucet Tx can be used to send funds from the faucet
  let faucetAvailable = getFaucetAvailable(props.scaffoldAppProviders, ethersContext);

  const hasLocalProviderSigner =
    faucetAvailable && props.scaffoldAppProviders?.mainnetAdaptor && props.scaffoldAppProviders?.localAdaptor;

  const left = (
    <div
      className="hud hudBottom"
      style={{
        position: 'fixed',
        textAlign: 'left',
        left: 0,
        bottom: 20,
        padding: 10,
      }}>
      <div style={{ display: 'flex', gap: '.25rem' }}>
        <div>
          <Ramp price={props.price} address={ethersContext?.account ?? ''} networks={NETWORKS} />
        </div>

        <div
          style={{
            textAlign: 'center',
            opacity: 0.8,
          }}>
          <GasGauge
            chainId={props.scaffoldAppProviders.targetNetwork.chainId}
            currentNetwork={getNetworkInfo(ethersContext.chainId)}
            provider={ethersContext.provider}
            speed="average"
          />
        </div>
        <div
          style={{
            textAlign: 'center',
            opacity: 1,
          }}>
          <Button
            onClick={() => {
              window.open('https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA');
            }}
            size="large"
            shape="round">
            <span
              style={{
                marginRight: 8,
              }}
              role="img"
              aria-label="support">
              💬
            </span>
            Support
          </Button>
        </div>
      </div>

      <div style={{ marginTop: '0.25rem' }}>
        {
          /*  if the local provider has a signer, let's show the faucet:  */
          hasLocalProviderSigner ? (
            <Faucet
              localAdaptor={props.scaffoldAppProviders.localAdaptor}
              price={props.price}
              mainnetAdaptor={props.scaffoldAppProviders.mainnetAdaptor}
            />
          ) : (
            <></>
          )
        }
      </div>
    </div>
  );

  const right = <ThemeSwitcher />;

  return (
    <>
      {left}
      {right}
    </>
  );
};
