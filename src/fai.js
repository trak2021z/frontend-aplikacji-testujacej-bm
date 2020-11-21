import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { faCashRegister } from '@fortawesome/free-solid-svg-icons';
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { faMoneyCheck } from '@fortawesome/free-solid-svg-icons';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import {faChartLine} from "@fortawesome/free-solid-svg-icons";
import {faHourglassHalf} from "@fortawesome/free-solid-svg-icons";
import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";
import {faFileDownload} from "@fortawesome/free-solid-svg-icons";
import {faExchangeAlt} from "@fortawesome/free-solid-svg-icons";

library.add(faUserSecret);
library.add(faSearchPlus);
library.add(faCashRegister);
library.add(faMoneyBill);
library.add(faMoneyCheck);
library.add(faCoins);
library.add(faCheck);
library.add(faTimes);
library.add(faFolderOpen);
library.add(faFolder);
library.add(faChartLine);
library.add(faHourglassHalf);
library.add(faSyncAlt);
library.add(faFileDownload);
library.add(faExchangeAlt);

Vue.component('font-awesome-icon', FontAwesomeIcon);