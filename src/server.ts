import { DolphFactory, middlewareRegistry } from "@dolphjs/dolph";
import { AccountComponent } from "./components/account/account.component";
import helmet from "helmet";

middlewareRegistry.register(helmet());

const dolph = new DolphFactory([AccountComponent]);
dolph.start();
