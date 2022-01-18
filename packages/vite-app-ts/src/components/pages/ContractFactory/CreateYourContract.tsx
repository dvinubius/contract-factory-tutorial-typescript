import { CheckCircleOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Spin } from 'antd';
import { transactor } from '~~/eth-components/functions';
import { EthComponentsSettingsContext } from '~~/eth-components/models';
import { useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { IEthersContext } from 'eth-hooks/models';
import { FC, useContext, useState } from 'react';
import { useAppContracts } from '~~/config/contractContext';
import {
  dialogOverlayGradient,
  errorColor,
  mainColWidthSmall,
  mediumButtonMinWidth,
  primaryColor,
} from '~~/styles/styles';

const CreateYourContract: FC = () => {
  const ethersContext: IEthersContext = useEthersContext();
  const yourContractFactory = useAppContracts('YourContractFactory', ethersContext.chainId);

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const [visibleModal, setVisibleModal] = useState(false);
  const [pendingCreate, setPendingCreate] = useState(false);
  const [txSent, setTxSent] = useState(false);
  const [txError, setTxError] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  const resetMeself = () => {
    setPendingCreate(false);
    setTxSent(false);
    setTxError(false);
    setTxSuccess(false);
    form.resetFields();
  };

  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setPendingCreate(true);
      const name = form.getFieldValue('name');
      const purpose = form.getFieldValue('purpose');
      const transaction = yourContractFactory?.createYourContract(name, purpose);
      setTxError(false);
      tx?.(transaction, (update) => {
        if (update && (update.error || update.reason)) {
          setPendingCreate(false);
          setTxError(true);
        }
        if (update && (update.status === 'confirmed' || update.status === 1)) {
          setPendingCreate(false);
          setTxSuccess(true);
        }
        if (update && update.code) {
          // metamask error
          // may be that user denied transaction, but also actual errors
          // handle them particularly if you need to
          // https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
          setPendingCreate(false);
          setTxSent(false);
        }
      });
      setTxSent(true);
    } catch (e) {
      // error messages will appear in form
      console.log('SUBMIT FAILED: ', e);
    }
  };

  const handleCancel = () => {
    setVisibleModal(false);
    resetMeself();
  };

  const handleRetry = () => {
    setTxError(false);
    setTxSent(false);
  };

  const formSize = 'middle';
  // const labelFontSize = formSize === 'large' ? '1rem' : '0.875rem';
  const labelFontSize = '0.875rem';
  const formWidthRem = 25;
  const colSpanLabel = 6;
  const colSpanInput = 19;

  return (
    <div>
      <Button type="primary" size="large" onClick={() => setVisibleModal(true)} className="flex-center-imp">
        <PlusOutlined />
        New Contract
      </Button>

      <Modal
        title="Create a New Contract"
        style={{ top: 120 }}
        visible={visibleModal}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={mainColWidthSmall}
        footer={
          txSent
            ? [
                <Button key={1} type="default" style={{ minWidth: mediumButtonMinWidth }} onClick={handleCancel}>
                  {txSuccess ? 'Thanks' : 'Close'}
                </Button>,
                txError && (
                  <Button key={2} type="primary" style={{ minWidth: mediumButtonMinWidth }} onClick={handleRetry}>
                    Retry
                  </Button>
                ),
              ]
            : [
                <Button key={1} type="default" style={{ minWidth: mediumButtonMinWidth }} onClick={handleCancel}>
                  Cancel
                </Button>,
                <Button
                  key={2}
                  type="primary"
                  style={{ minWidth: mediumButtonMinWidth }}
                  loading={pendingCreate}
                  onClick={handleSubmit}>
                  Create
                </Button>,
              ]
        }>
        {txSent && (
          <div
            style={{
              position: 'absolute',
              zIndex: 10,
              top: 55,
              bottom: 53,
              left: 0,
              width: '100%',
              pointerEvents: 'none',
              background: dialogOverlayGradient,
              backdropFilter: 'blur(2px)',

              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
            }}>
            {txError && (
              <>
                <div style={{ fontSize: '1.5rem' }}>{'Transaction failed'}</div>
                <StopOutlined style={{ color: errorColor, fontSize: '4rem' }} />
              </>
            )}
            {txSuccess && (
              <>
                <div style={{ fontSize: '1.5rem' }}>{'Contract Created!'}</div>
                <CheckCircleOutlined style={{ color: primaryColor, fontSize: '4rem' }} />
              </>
            )}
            {!txError && !txSuccess && (
              <>
                <div style={{ fontSize: '1.5rem' }}>{'Creating Contract'}</div>
                <div style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Spin size="large" style={{ transform: 'scale(1.5)' }} />
                </div>
              </>
            )}
          </div>
        )}
        <Form
          form={form}
          style={{
            width: `${formWidthRem}rem`,
            margin: '1.5rem auto 0 2.5rem',
            pointerEvents: txSent ? 'none' : 'all',
          }}
          size={formSize}
          initialValues={{
            durationUnit: 'days',
          }}>
          <Form.Item
            style={{ justifyContent: 'center' }}
            label={<span style={{ fontSize: labelFontSize }}>Name</span>}
            name="name"
            required
            labelCol={{ span: colSpanLabel }}
            wrapperCol={{ span: colSpanInput }}
            rules={[{ required: true, message: 'Please input a name' }]}>
            <Input type="text" placeholder="Name your contract" />
          </Form.Item>

          <Form.Item
            style={{ justifyContent: 'center' }}
            label={<span style={{ fontSize: labelFontSize }}>Purpose</span>}
            name="purpose"
            required
            labelCol={{ span: colSpanLabel }}
            wrapperCol={{ span: colSpanInput }}
            rules={[{ required: true, message: 'Please set a purpose' }]}>
            <Input type="text" placeholder="Give it a purpose" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateYourContract;
