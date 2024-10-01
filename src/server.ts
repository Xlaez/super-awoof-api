import { DolphFactory, middlewareRegistry } from "@dolphjs/dolph";
import { AccountComponent } from "./components/account/account.component";
import helmet from "helmet";
import { WalletComponent } from "./components/wallet/wallet.component";
import { MnosComponent } from "./components/mnos/mnos.component";
import { SystemComponent } from "./components/system/system.component";
import { MtnMnoComponent } from "./components/mnos/mtn/mtn.mnos.component";

middlewareRegistry.register(helmet());

const dolph = new DolphFactory([
  AccountComponent,
  WalletComponent,
  MnosComponent,
  MtnMnoComponent,
  SystemComponent,
]);

dolph.start();
