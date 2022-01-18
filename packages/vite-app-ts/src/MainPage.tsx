import React, { FC, useEffect, useState, createContext } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import '~~/styles/main-page.css';
import { useContractReader, useBalance, useEthersAdaptorFromProviderOrSigners } from 'eth-hooks';
import { useDexEthPrice } from 'eth-hooks/dapps';

import { Hints, Subgraph, ExampleUI } from '~~/components/pages';

import { useEventListener } from 'eth-hooks';
import { MainPageMenu, MainPageContracts, MainPageFooter, MainPageHeader } from './components/main';
import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { useBurnerFallback } from '~~/components/main/hooks/useBurnerFallback';
import { useScaffoldHooksExamples as useScaffoldHooksExamples } from './components/main/hooks/useScaffoldHooksExamples';
import { useEthersContext } from 'eth-hooks/context';
import { NETWORKS } from '~~/models/constants/networks';
import { const_UseBurnerWalletAsFallback, mainnetProvider } from '~~/config/providersConfig';
import {
  useAppContracts,
  useAppContractsActions,
  useConnectAppContracts,
  useLoadAppContracts,
} from '~~/config/contractContext';
import { asEthersAdaptor } from 'eth-hooks/functions';
import { subgraphUri } from '~~/config/subgraphConfig';
import CreatedContractsUI from './components/pages/ContractFactory/CreatedContractsUI';
import { YourContractEntity } from './models/contractFactory/your-contract-entity.model';
import { loadNonDeployedContractAbi } from './functions/loadNonDeployedAbis';
import { InjectableAbis } from './generated/injectable-abis/injectable-abis.type';
import { useWindowWidth } from '@react-hook/window-size';
import { breakPointContractItemFit } from './styles/styles';

export interface InnerAppContext {
  createdContracts: YourContractEntity[] | undefined;
  injectableAbis: InjectableAbis | undefined;
}
export const InnerAppContext = createContext<InnerAppContext>({
  createdContracts: [],
  injectableAbis: {},
});

export interface ILayoutContext {
  windowWidth: number | undefined;
  widthAboveContractItemFit: boolean | undefined;
}

export const LayoutContext = createContext<ILayoutContext>({
  windowWidth: 0,
  widthAboveContractItemFit: false,
});

export const Main: FC = () => {
  // -----------------------------
  // Providers, signers & wallets
  // -----------------------------
  // 🛰 providers
  // see useLoadProviders.ts for everything to do with loading the right providers
  const scaffoldAppProviders = useScaffoldAppProviders();

  // 🦊 Get your web3 ethers context from current providers
  const ethersContext = useEthersContext();

  // if no user is found use a burner wallet on localhost as fallback if enabled
  useBurnerFallback(scaffoldAppProviders, const_UseBurnerWalletAsFallback);

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts();
  // 🏭 connect to contracts for mainnet network & signer
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(mainnetProvider);
  useConnectAppContracts(mainnetAdaptor);
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(ethersContext));

  // -----------------------------
  // examples on how to get contracts
  // -----------------------------
  // init contracts
  const factory = useAppContracts('YourContractFactory', ethersContext.chainId);
  // const yourContract = useAppContracts('YourContract', ethersContext.chainId);
  const mainnetDai = useAppContracts('DAI', NETWORKS.mainnet.chainId);

  // keep track of a variable from the contract in the local React state:
  // const purpose = useContractReader(yourContract, yourContract?.purpose, [], yourContract?.filters.SetPurpose());
  const numberOfCreated = useContractReader(
    factory,
    factory?.numberOfContracts,
    [],
    factory?.filters.CreateYourContract()
  );

  // 📟 Listen for broadcast events`
  // const [setPurposeEvents] = useEventListener(yourContract, 'SetPurpose', 0);
  const [createYourContractEvents] = useEventListener(factory, 'CreateYourContract', 0);
  const [createdContracts, setCreatedContracts] = useState<YourContractEntity[]>();
  const account = ethersContext.account;
  useEffect(() => {
    if (!createdContracts || createdContracts.length !== createYourContractEvents.length) {
      setCreatedContracts(
        createYourContractEvents
          .map((event) => ({
            // 0 - id
            address: event.args[1],
            creator: event.args[2],
            name: event.args[3],
            time: new Date(event.args[4]?.toNumber() * 1000),
            // add any other available args here
          }))
          .reverse() // most recent first
      );
    }
  }, [createYourContractEvents, account]);

  const [injectableAbis, setInjectableAbis] = useState<InjectableAbis>();
  useEffect(() => {
    const load = async () => {
      const YourContract = await loadNonDeployedContractAbi('YourContract');
      if (YourContract) {
        setInjectableAbis({ YourContract });
      } else {
        console.error(`Could not find injectable abi for YourContract`);
      }
    };
    load();
  }, [setInjectableAbis]);

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // 💵 This hook will get the price of ETH from 🦄 Uniswap:
  const [ethPrice] = useDexEthPrice(scaffoldAppProviders.mainnetAdaptor?.provider, scaffoldAppProviders.targetNetwork);

  // 💰 this hook will get your balance
  const [yourCurrentBalance] = useBalance(ethersContext.account);

  // -----------------------------
  // Hooks use and examples
  // -----------------------------
  // 🎉 Console logs & More hook examples:  Check out this to see how to get
  // useScaffoldHooksExamples(scaffoldAppProviders);

  // -----------------------------
  // .... 🎇 End of examples
  // -----------------------------

  const [route, setRoute] = useState<string>('');
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const innerAppContext = {
    createdContracts,
    injectableAbis,
  };
  const windowWidth = useWindowWidth();
  const layoutContext = {
    windowWidth,
    widthAboveContractItemFit: windowWidth >= breakPointContractItemFit,
  };

  return (
    <LayoutContext.Provider value={layoutContext}>
      <InnerAppContext.Provider value={innerAppContext}>
        <div className="App">
          <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />

          {/* Routes should be added between the <Switch> </Switch> as seen below */}
          <BrowserRouter>
            <MainPageMenu route={route} setRoute={setRoute} />
            <div className="AppScroller">
              <Switch>
                <Route exact path="/">
                  <div className="AppCenteredCol">
                    <CreatedContractsUI />
                  </div>
                </Route>
                <Route exact path="/Debug">
                  <div className="AppCenteredCol">
                    <MainPageContracts scaffoldAppProviders={scaffoldAppProviders} />
                  </div>
                </Route>
                {/* you can add routes here like the below examlples */}
                {/* <Route path="/hints">
                  <Hints
                    address={ethersContext?.account ?? ''}
                    yourCurrentBalance={yourCurrentBalance}
                    mainnetProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
                    price={ethPrice}
                  />
                </Route> */}
                {/* <Route path="/exampleui">
                  <ExampleUI
                    mainnetProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
                    yourCurrentBalance={yourCurrentBalance}
                    price={ethPrice}
                  />
                </Route> */}

                {/* Subgraph also disabled in MainPageMenu */}
                {/* 
                <Route path="/subgraph">
                  <Subgraph subgraphUri={subgraphUri} mainnetProvider={scaffoldAppProviders.mainnetAdaptor?.provider} />
                </Route> */}
              </Switch>
            </div>
          </BrowserRouter>

          <MainPageFooter scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
        </div>
      </InnerAppContext.Provider>
    </LayoutContext.Provider>
  );
};
