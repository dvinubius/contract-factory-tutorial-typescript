import { formatEther } from '@ethersproject/units';
import { useBalance } from 'eth-hooks';
import { BigNumber } from 'ethers';
import React, { FC, useState } from 'react';
import './Balance.css';

interface IBalanceProps {
  address: string | undefined;
  price?: number;
  balance?: BigNumber;
  value?: BigNumber;
  dollarMultiplier?: number;
  size?: 'short' | 'long';
  customSymbol?: string;
  fontSize?: number;
  padding?: string | number;
  etherMode?: boolean;
  dollarDecimals?: number;
  ethDecimals?: number;
  noClick?: boolean;
  customColor?: string;
  zeroPadded?: boolean;
}

/**
 * Displays a balance of given address in ether & dollar
 * 
 * 
 * 
 *
  ~ Features ~

  - Provide address={address} and get balance corresponding to given address
  - Provide provider={mainnetProvider} to access balance on mainnet or any other network (ex. localProvider)
  - Provide price={price} of ether and get your balance converted to dollars
 * @param props
 * @returns (FC)
 */
export const Balance: FC<IBalanceProps> = (props) => {
  const [dollarMode, setDollarMode] = useState(!props.etherMode);
  const [resolvedBalance] = useBalance(props.address);

  const dollarDecimals = props.dollarDecimals ?? 2;
  const ethDecimals = props.ethDecimals ?? 4;

  const decimals = dollarMode ? dollarDecimals : ethDecimals;

  // TODO throw if dollarMode but no price/dollarMultiplier available?

  // --- Value to use

  // attempt to use resolved balance
  let balanceToUse = BigNumber.from(resolvedBalance ?? 0);
  // ignore resolved balance if explicit balance or value is provided
  if (props.balance && props.value) {
    throw "Attempting to use Balance component with both a 'value' and a 'balance' prop. Use either, not both.";
  }
  if (props.balance != null || props.value != null) {
    // will still apply to zero values
    balanceToUse = BigNumber.from(props.balance || props.value);
  }

  // Value to display - exit bignumber territory - JS precision should be enough since this component is display-only
  let numeric = balanceToUse ? parseFloat(formatEther(balanceToUse)) : 0;
  if (dollarMode) {
    const priceToUse = props.price || props.dollarMultiplier || 1;
    numeric = numeric * priceToUse;
  }
  // format display
  const numericDisplay = props.zeroPadded ? exactFloatToFixed(numeric, decimals) : numeric.toFixed(decimals);
  const symbol = dollarMode ? '$' : props.customSymbol ?? 'Ξ';
  const display = `${symbol}${numericDisplay}`;

  const handleClick = !props.noClick ? () => setDollarMode(!dollarMode) : undefined;

  const cursorType = !props.noClick ? 'pointer' : '';
  return (
    <span
      className="Balance"
      style={{
        verticalAlign: 'middle',
        fontSize: props.fontSize ?? 24,
        padding: props.padding ?? 8,
        cursor: cursorType,
        color: props.customColor ?? '',
      }}
      onClick={handleClick}>
      {display}
    </span>
  );
};

// TODO flexible padding length - allow for arbitrary number of zeros
export const exactFloatToFixed = (floatLike: number, precision: number) => {
  let ret = floatLike.toString();
  if (ret.indexOf('.') === -1) {
    return ret;
  }
  ret = ret.slice(0, ret.indexOf('.') + precision + 1);
  if (ret.indexOf('.') === -1) {
    ret = ret + '0000';
  } else {
    const decimals = ret.substr(ret.indexOf('.') + 1).length;
    if (decimals === 1) {
      ret = ret + '000';
    } else if (decimals === 2) {
      ret = ret + '00';
    } else if (decimals === 3) {
      ret = ret + '0';
    }
  }
  return ret;
};
