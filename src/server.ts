import { DolphFactory, middlewareRegistry } from "@dolphjs/dolph";
import { AccountComponent } from "./components/account/account.component";
import helmet from "helmet";
import { WalletComponent } from "./components/wallet/wallet.component";
import { MnosComponent } from "./components/mnos/mnos.component";

middlewareRegistry.register(helmet());

const dolph = new DolphFactory([
  AccountComponent,
  WalletComponent,
  MnosComponent,
]);
dolph.start();
