import React, { FC } from 'react';
import { List, Input, Descriptions } from 'antd';
import { useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useAppContracts } from '../../../config/contractContext';
import { BaseContract } from 'ethers';

/*
  Based on <Events/> from the standard Scaffold-Eth kit

  Width inherited
*/

export interface IEventsDisplayProps {
  contract: BaseContract;
  eventName: string;
  startBlock?: number;
}

export const EventsDisplay: FC<IEventsDisplayProps> = (props) => {
  const [events] = useEventListener(props.contract, props.eventName, props.startBlock ?? 0);

  return (
    <div style={{ width: '100%', margin: 'auto', marginTop: 32, paddingBottom: 32 }}>
      <h2>Events:</h2>
      <List
        style={{ backgroundColor: 'white' }}
        bordered
        dataSource={events}
        renderItem={(item) => {
          const { blockNumber, event, eventSignature, args } = item;
          return (
            <List.Item key={item.blockNumber + '_' + item.args.sender + '_' + item.args.purpose}>
              <Descriptions bordered size="small" title={`${event}`} style={{ margin: 'auto' }}>
                <Descriptions.Item label="block" span={2} style={{ fontSize: '0.85rem' }}>
                  {blockNumber}
                </Descriptions.Item>
                <Descriptions.Item label="signature" span={3} style={{ fontSize: '0.85rem' }}>
                  {eventSignature}
                </Descriptions.Item>
                <Descriptions.Item label="args" span={3}>
                  <List>
                    {args.map((a) => (
                      <List.Item style={{ fontSize: '0.85rem', padding: '0.25rem 2rem' }}>{a.toString()}</List.Item>
                    ))}
                  </List>
                </Descriptions.Item>
              </Descriptions>
            </List.Item>
          );
        }}
      />
    </div>
  );
};
