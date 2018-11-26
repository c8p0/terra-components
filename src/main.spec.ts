import 'core-js'; // ES6 + reflect-metadata

// zone.js
import 'zone.js/dist/zone';
(window as any)['__zone_symbol__fakeAsyncPatchLock'] = true;
import 'zone.js/dist/zone-testing';

// TestBed initialization
import { TestBed } from '@angular/core/testing';

import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);

// load all specs in ./src
const context:any = (require as any).context('./', true, /\.spec\.ts$/);
context.keys().map(context);
