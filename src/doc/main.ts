import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DocModule } from './doc.module';

// if(process.env.ENV === 'production')
// {
//     enableProdMode();
// }

platformBrowserDynamic().bootstrapModule(DocModule).catch((err:any) => console.log(err));
