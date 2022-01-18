import React, { FC, useContext } from 'react';
import { Button, Card, Descriptions } from 'antd';
import { ArrowsAltOutlined, UserOutlined } from '@ant-design/icons';
import { cardGradient2, mediumButtonMinWidth, primaryColor, softTextColor } from '~~/styles/styles';
import { Address } from '~~/eth-components/ant';
import { InnerAppContext, LayoutContext } from '~~/MainPage';
import { BaseContract } from 'ethers';
import { asEthersAdaptor } from 'eth-hooks/functions';
import { useEthersContext } from 'eth-hooks/context';
import { useContractReader } from 'eth-hooks';

// TODO actual types
export interface IContractItemProps {
  openContract: any | undefined;
  contract: any | undefined;
}

const ContractItem: FC<IContractItemProps> = ({ openContract, contract }) => {
  // ----------- fetch owner data ---------- //

  // const { injectableAbis } = useContext(InnerAppContext);
  // const abi = injectableAbis?.YourContract;
  // const ethersContext = useEthersContext();

  // const yourContract: any | undefined =
  //   abi && (new BaseContract(contract.address, abi, asEthersAdaptor(ethersContext).provider) as any);

  // const [owner] = useContractReader(yourContract, yourContract?.owner, []);

  // console.log('owner:', owner);
  // const ownerLabel = 'Owner';

  // ----------- mark the owner ---------- //

  // const ownerMark =
  //   owner === ethersContext.account ? (
  //     <UserOutlined
  //       style={{
  //         color: primaryColor,
  //         background: 'hsla(209deg, 100%, 92%, 1)',
  //         borderRadius: '50%',
  //         width: '1rem',
  //         height: '1rem',
  //         display: 'flex',
  //         alignItems: 'center',
  //         justifyContent: 'center',
  //         border: `1px solid ${primaryColor}`,
  //       }}
  //     />
  //   ) : (
  //     ''
  //   );
  // const ownerLabel = (
  //   <div className="flex-center-reg" style={{ gap: '0.25rem' }}>
  //     Owner {ownerMark}
  //   </div>
  // );

  const { widthAboveContractItemFit } = useContext(LayoutContext);

  const cellHeight = '2.5rem';
  const descriptionSpan = widthAboveContractItemFit ? 0 : 3;

  return (
    <Card
      size="small"
      style={{ background: cardGradient2 }}
      className="hoverableLight"
      title={
        <div
          style={{
            padding: '0 0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'space-between',
            fontWeight: 400,
          }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              flex: '66%',
            }}>
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: 400,

                // color: softTextColor,
              }}>
              {contract.name}
            </div>
            <Address fontSize={18} address={contract.address} />
          </div>
          <Button
            className="inline-flex-center-imp"
            size="large"
            style={{
              fontSize: '1rem',

              width: mediumButtonMinWidth,
            }}
            onClick={() => openContract(contract)}>
            Open <ArrowsAltOutlined />
          </Button>
        </div>
      }>
      <div style={{ padding: '0.5rem' }}>
        <Descriptions bordered size="small" labelStyle={{ textAlign: 'center', height: cellHeight }}>
          <Descriptions.Item
            label="Created"
            labelStyle={{ color: softTextColor }}
            contentStyle={{
              padding: '0 1rem',
            }}
            span={descriptionSpan}>
            <div className="mono-nice">{contract.time.toLocaleString()}</div>
          </Descriptions.Item>
          <Descriptions.Item
            label="By"
            labelStyle={{ color: softTextColor }}
            contentStyle={{
              padding: '0 1rem',
              height: cellHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'max-content',
              margin: 'auto',
            }}
            span={descriptionSpan}>
            <Address fontSize={14} address={contract.creator} />
          </Descriptions.Item>
          {/* <Descriptions.Item
            label={ownerLabel}
            labelStyle={{ color: softTextColor }}
            contentStyle={{
              padding: '0 1rem',
              height: cellHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto',
              width: 'max-content',
              position: 'relative',
            }}
            span={descriptionSpan}>
            <Address fontSize={14} address={owner} />
          </Descriptions.Item> */}
        </Descriptions>
      </div>
    </Card>
  );
};

export default ContractItem;
