import React, { FC, useContext } from 'react';
import { LeftOutlined } from '@ant-design/icons';
import { Button, Divider } from 'antd';
import { useState } from 'react';
import CreateYourContract from './CreateYourContract';
import YourContract from './YourContract';
import { mainColWidthSmall, mainColWidthLarge, mediumButtonMinWidth } from '../../../styles/styles';
import StackGrid from 'react-stack-grid';
import ContractItem from './ContractItem';
import { InnerAppContext, LayoutContext } from '~~/MainPage';
import { YourContractEntity } from '~~/models/contractFactory/your-contract-entity.model';

const CreatedContractsUI: FC = () => {
  const { injectableAbis, createdContracts } = useContext(InnerAppContext);

  const { widthAboveContractItemFit } = useContext(LayoutContext);

  const [openedContract, setOpenedContract] = useState<YourContractEntity>();
  const handleOpenContract = (c: YourContractEntity) => setOpenedContract(c);
  const handleBack = () => setOpenedContract(undefined);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: mainColWidthLarge,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '50vh',
        margin: 'auto',
        padding: '2rem 2rem 0',
      }}>
      {/* NAVI */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {!openedContract && (
          <div style={{ marginLeft: 'auto' }}>
            <CreateYourContract />
          </div>
        )}
        {openedContract && (
          <div style={{ marginRight: 'auto' }}>
            <Button
              className="flex-center-imp"
              onClick={handleBack}
              size="large"
              style={{ minWidth: mediumButtonMinWidth }}>
              <LeftOutlined /> Back
            </Button>
          </div>
        )}
      </div>
      {!openedContract && <Divider style={{ margin: '2rem 0' }}>Your Contracts</Divider>}
      {openedContract && <Divider style={{ margin: '44px 0' }} />}
      {/* CONTENT */}
      {!openedContract && createdContracts && createdContracts.length > 0 && injectableAbis && (
        <div style={{ alignSelf: 'stretch' }}>
          <div
            style={{
              maxWidth: widthAboveContractItemFit ? mainColWidthLarge : mainColWidthSmall,
              margin: '0 auto 8rem',
            }}>
            <StackGrid columnWidth="100%" gutterHeight={16}>
              {createdContracts.map((c) => (
                <div key={c.address}>
                  <ContractItem openContract={handleOpenContract} contract={c} />
                </div>
              ))}
            </StackGrid>
          </div>
        </div>
      )}
      {openedContract && injectableAbis && (
        <div style={{ alignSelf: 'stretch' }}>
          <YourContract contract={openedContract} />
        </div>
      )}
    </div>
  );
};

export default CreatedContractsUI;
